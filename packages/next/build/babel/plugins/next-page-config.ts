import { PluginObj } from '@babel/core'
import { NodePath } from '@babel/traverse'
import * as BabelTypes from '@babel/types'
import { PageConfig } from 'next-server/types'

const configKeys = new Set(['amp', 'experimentalPrerender'])
export const inlineGipIdentifier = '__NEXT_GIP_INLINE__'
export const dropBundleIdentifier = '__NEXT_DROP_CLIENT_FILE__'

// replace progam path with just a variable with the drop identifier
function replaceBundle(path: any, t: typeof BabelTypes) {
  path.parentPath.replaceWith(
    t.program(
      [
        t.variableDeclaration('const', [
          t.variableDeclarator(
            t.identifier('config'),
            t.assignmentExpression(
              '=',
              t.identifier(dropBundleIdentifier),
              t.stringLiteral(`${dropBundleIdentifier} ${Date.now()}`)
            )
          ),
        ]),
      ],
      []
    )
  )
}

interface ConfigState {
  setupInlining?: boolean
  bundleDropped?: boolean
}

export default function nextPageConfig({
  types: t,
}: {
  types: typeof BabelTypes
}): PluginObj {
  return {
    visitor: {
      Program: {
        enter(path, state: ConfigState) {
          path.traverse(
            {
              ExportNamedDeclaration(
                path: NodePath<BabelTypes.ExportNamedDeclaration>,
                state: any
              ) {
                if (
                  state.bundleDropped ||
                  !path.node.declaration ||
                  !(path.node.declaration as any).declarations
                )
                  return
                const { declarations } = path.node.declaration as any
                const config: PageConfig = {}

                for (const declaration of declarations) {
                  if (declaration.id.name !== 'config') continue

                  for (const prop of declaration.init.properties) {
                    const { name } = prop.key
                    if (configKeys.has(name)) {
                      // @ts-ignore
                      config[name] = prop.value.value
                    }
                  }
                }

                if (config.amp === true) {
                  replaceBundle(path, t)
                  state.bundleDropped = true
                  return
                }

                if (
                  config.experimentalPrerender === true ||
                  config.experimentalPrerender === 'inline'
                ) {
                  state.setupInlining = true
                }
              },
            },
            state
          )
        },
      },
      // handles Page.getInitialProps = () => {}
      AssignmentExpression(path, state: ConfigState) {
        if (!state.setupInlining) return
        const { property } = (path.node.left || {}) as any
        const { name } = property
        if (name !== 'getInitialProps') return
        // replace the getInitialProps function with an identifier for replacing
        path.node.right = t.functionExpression(
          null,
          [],
          t.blockStatement([
            t.returnStatement(t.stringLiteral(inlineGipIdentifier)),
          ])
        )
      },
      // handles class { static async getInitialProps() {} }
      FunctionDeclaration(path, state: ConfigState) {
        if (!state.setupInlining) return
        if ((path.node.id && path.node.id.name) !== 'getInitialProps') return
        path.node.body = t.blockStatement([
          t.returnStatement(t.stringLiteral(inlineGipIdentifier)),
        ])
      },
      // handles class { static async getInitialProps() {} }
      ClassMethod(path, state: ConfigState) {
        if (!state.setupInlining) return
        if (
          (path.node.key && (path.node.key as BabelTypes.Identifier).name) !==
          'getInitialProps'
        )
          return

        path.node.body = t.blockStatement([
          t.returnStatement(t.stringLiteral(inlineGipIdentifier)),
        ])
      },
    },
  }
}
