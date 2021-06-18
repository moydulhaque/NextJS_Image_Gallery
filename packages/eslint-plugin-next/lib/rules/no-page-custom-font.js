const NodeAttributes = require('../utils/nodeAttributes.js')

module.exports = {
  meta: {
    docs: {
      description:
        'Recommend adding custom font in a custom document and not in a specific page',
      recommended: true,
    },
  },
  create: function (context) {
    let documentImportName = null
    return {
      ImportDeclaration(node) {
        if (node.source.value === 'next/document') {
          const defaultImportNode = node.specifiers.filter(
            ({ type }) => type === 'ImportDefaultSpecifier'
          )[0]
          if (defaultImportNode) {
            documentImportName = defaultImportNode.local.name
          }
        }
      },
      JSXOpeningElement(node) {
        const documentClass = context
          .getAncestors()
          .find(
            (ancestorNode) =>
              ancestorNode.type === 'ClassDeclaration' &&
              ancestorNode.superClass &&
              ancestorNode.superClass.name === documentImportName
          )

        if (
          (documentImportName && documentClass) ||
          node.name.name !== 'link'
        ) {
          return
        }

        const attributes = new NodeAttributes(node)
        if (!attributes.has('href') || !attributes.hasValue('href')) {
          return
        }

        const hrefValue = attributes.value('href')
        const isGoogleFont =
          typeof hrefValue === 'string' &&
          hrefValue.startsWith('https://fonts.googleapis.com/css')

        if (isGoogleFont) {
          context.report({
            node,
            message:
              'Custom fonts not added at the document level will only load for a single page. This is discouraged. See https://nextjs.org/docs/messages/no-page-custom-font.',
          })
        }
      },
    }
  },
}
