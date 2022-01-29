use once_cell::sync::Lazy;
use regex::Regex;
use serde::Deserialize;
use std::path::{Path, PathBuf};
use swc_atoms::JsWord;
use swc_common::errors::HANDLER;
use swc_common::FileName;
use swc_ecmascript::ast::*;
use swc_ecmascript::utils::{quote_ident, ExprFactory};
use swc_ecmascript::visit::{Fold, FoldWith};

#[derive(Copy, Clone, Debug, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum RelayLanguageConfig {
    TypeScript,
    Flow,
}

impl Default for RelayLanguageConfig {
    fn default() -> Self {
        Self::Flow
    }
}

struct Relay<'a> {
    root_dir: PathBuf,
    file_name: FileName,
    config: &'a Config,
}

/// A simplified version of Relay's SingleProjectConfig file.
#[derive(Deserialize, Debug, Default, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    pub src: PathBuf,
    pub artifacts_directory: Option<PathBuf>,
    #[serde(default)]
    pub language: RelayLanguageConfig,
}

fn pull_first_operation_name_from_tpl(tpl: &TaggedTpl) -> Option<String> {
    tpl.tpl.quasis.iter().find_map(|quasis| {
        static OPERATION_REGEX: Lazy<Regex> =
            Lazy::new(|| Regex::new(r"(fragment|mutation|query|subscription) (\w+)").unwrap());

        let capture_group = OPERATION_REGEX.captures_iter(&quasis.raw.value).next();

        capture_group.map(|capture_group| capture_group[2].to_string())
    })
}

fn build_require_expr_from_path(path: &str) -> Expr {
    Expr::Call(CallExpr {
        span: Default::default(),
        callee: quote_ident!("require").as_callee(),
        args: vec![
            Lit::Str(Str {
                span: Default::default(),
                value: JsWord::from(path),
                has_escape: false,
                kind: Default::default(),
            })
            .as_arg(),
        ],
        type_args: None,
    })
}

impl<'a> Fold for Relay<'a> {
    fn fold_expr(&mut self, expr: Expr) -> Expr {
        let expr = expr.fold_children_with(self);

        match &expr {
            Expr::TaggedTpl(tpl) => {
                if let Some(built_expr) = self.build_call_expr_from_tpl(tpl) {
                    built_expr
                } else {
                    expr
                }
            }
            _ => expr,
        }
    }
}

#[derive(Debug)]
enum BuildRequirePathError {
    FileNameNotReal,
}

fn path_for_artifact(
    root_dir: &Path,
    source_path: &Path,
    config: &Config,
    definition_name: &str,
) -> PathBuf {
    let filename = match &config.language {
        RelayLanguageConfig::Flow => format!("{}.graphql.js", definition_name),
        RelayLanguageConfig::TypeScript => {
            format!("{}.graphql.ts", definition_name)
        }
    };

    let output_path = if let Some(artifacts_directory) = &config.artifacts_directory {
        root_dir.join(artifacts_directory).join(filename)
    } else {
        root_dir
            .join(source_path)
            .parent()
            .unwrap()
            .join("__generated__")
            .join(filename)
    };

    output_path
}

impl<'a> Relay<'a> {
    fn build_require_path(
        &mut self,
        operation_name: &str,
    ) -> Result<PathBuf, BuildRequirePathError> {
        match &self.file_name {
            FileName::Real(real_file_name) => Ok(path_for_artifact(
                &self.root_dir,
                real_file_name,
                self.config,
                operation_name,
            )),
            _ => Err(BuildRequirePathError::FileNameNotReal),
        }
    }

    fn build_call_expr_from_tpl(&mut self, tpl: &TaggedTpl) -> Option<Expr> {
        if let Expr::Ident(ident) = &*tpl.tag {
            if &*ident.sym != "graphql" {
                return None;
            }
        }

        let operation_name = pull_first_operation_name_from_tpl(tpl);

        match operation_name {
            None => None,
            Some(operation_name) => match self.build_require_path(operation_name.as_str()) {
                Ok(final_path) => Some(build_require_expr_from_path(final_path.to_str().unwrap())),
                Err(err) => {
                    let base_error = "Could not transform GraphQL template to a Relay import.";
                    let error_message = match err {
                        BuildRequirePathError::FileNameNotReal => "Source file was not a real \
                                                                   file. This is likely a bug and \
                                                                   should be reported to Next.js"
                            .to_string(),
                    };

                    HANDLER.with(|handler| {
                        handler.span_err(
                            tpl.span,
                            format!("{} {}", base_error, error_message).as_str(),
                        );
                    });

                    None
                }
            },
        }
    }
}

pub fn relay<'a>(config: &'a Config, file_name: FileName) -> impl Fold + '_ {
    Relay {
        root_dir: std::env::current_dir().unwrap(),
        file_name,
        config,
    }
}
