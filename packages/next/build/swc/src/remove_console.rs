use serde::Deserialize;
use swc_common::collections::AHashSet;
use swc_common::DUMMY_SP;
use swc_ecmascript::ast::*;
use swc_ecmascript::utils::Id;
use swc_ecmascript::visit::{noop_fold_type, Fold, FoldWith};

use crate::top_level_binding_collector::collect_top_level_decls;

#[derive(Clone, Debug, Deserialize)]
#[serde(untagged)]
pub enum Config {
    All(bool),
    WithOptions(Options),
}

impl Config {
    pub fn truthy(&self) -> bool {
        match self {
            Config::All(b) => *b,
            Config::WithOptions(_) => true,
        }
    }
}

#[derive(Clone, Debug, Deserialize)]
pub struct Options {
    #[serde(default)]
    pub exclude: Vec<String>,
}

struct RemoveConsole {
    exclude: Vec<String>,
    bindings: Vec<AHashSet<Id>>,
    in_function_params: bool,
}

impl RemoveConsole {
    fn is_global_console(&self, ident: &Ident) -> bool {
        ident.sym.as_ref() == "console"
            && self
                .bindings
                .iter()
                .find(|x| x.contains(&(ident.sym.clone(), ident.span.ctxt)))
                .is_none()
    }

    fn should_remove_call(&mut self, n: &CallExpr) -> bool {
        let callee = &n.callee;
        let member_expr = match callee {
            ExprOrSuper::Expr(e) => match &**e {
                Expr::Member(m) => m,
                _ => return false,
            },
            _ => return false,
        };

        // Don't attempt to evaluate computed properties.
        if member_expr.computed {
            return false;
        }

        // Only proceed if the object is the global `console` object.
        match &member_expr.obj {
            ExprOrSuper::Expr(e) => match &**e {
                Expr::Ident(i) if self.is_global_console(i) => {}
                _ => return false,
            },
            _ => return false,
        }

        // Check if the property is requested to be excluded.
        // Here we do an O(n) search on the list of excluded properties because the size
        // should be small.
        match &*member_expr.prop {
            Expr::Ident(i)
                if self
                    .exclude
                    .iter()
                    .find(|x| x.as_str() == i.sym.as_ref())
                    .is_none() => {}
            _ => return false,
        }

        true
    }
}

impl Fold for RemoveConsole {
    noop_fold_type!();

    fn fold_stmt(&mut self, stmt: Stmt) -> Stmt {
        match &stmt {
            Stmt::Expr(e) => match &*e.expr {
                Expr::Call(c) => {
                    if self.should_remove_call(c) {
                        return Stmt::Empty(EmptyStmt { span: DUMMY_SP });
                    }
                }
                _ => {}
            },
            _ => {}
        }
        stmt.fold_children_with(self)
    }

    fn fold_function(&mut self, mut func: Function) -> Function {
        self.in_function_params = true;
        let mut new_params: AHashSet<Id> = AHashSet::default();
        for param in &func.params {
            let s = collect_top_level_decls(param);
            for x in s {
                new_params.insert(x);
            }
        }
        self.in_function_params = false;

        self.bindings.push(new_params);
        self.bindings.push(collect_top_level_decls(&func));
        func.body = func.body.fold_with(self);
        self.bindings.pop().unwrap();
        self.bindings.pop().unwrap();
        func
    }

    fn fold_module(&mut self, module: Module) -> Module {
        self.bindings.push(collect_top_level_decls(&module));
        let m = module.fold_children_with(self);
        self.bindings.pop().unwrap();
        m
    }

    fn fold_script(&mut self, script: Script) -> Script {
        self.bindings.push(collect_top_level_decls(&script));
        let s = script.fold_with(self);
        self.bindings.pop().unwrap();
        s
    }
}

pub fn remove_console(config: Config) -> impl Fold {
    let exclude = match config {
        Config::WithOptions(x) => x.exclude,
        _ => vec![],
    };
    let remover = RemoveConsole {
        exclude,
        bindings: Default::default(),
        in_function_params: false,
    };
    remover
}
