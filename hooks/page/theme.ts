/**
 * Islands Dark, the colour theme by bwya77 (https://github.com/bwya77/vscode-dark-islands, MIT),
 * themes/islands-dark.json at commit 02ac4f3: its syntax colours whole, and of its editor colours the ones the code block uses.
 */
export const ISLANDS_DARK = {
  "name": "Islands Dark",
  "type": "dark",
  "colors": {
    "editor.background": "#181a1d",
    "editor.foreground": "#bcbec4",
    "editorLineNumber.foreground": "#4e5157",
    "editorWidget.border": "#25262a",
    "tab.inactiveForeground": "#7a7e85",
    "diffEditor.insertedLineBackground": "#73b00a15",
    "diffEditor.removedLineBackground": "#f7546415",
    "editorGutter.addedBackground": "#73b00a",
    "editorGutter.deletedBackground": "#f75464",
    "editor.selectionBackground": "#373b39"
  },
  "tokenColors": [
    {
      "name": "Comments",
      "scope": [
        "comment",
        "punctuation.definition.comment"
      ],
      "settings": {
        "foreground": "#7a7e85",
        "fontStyle": "italic"
      }
    },
    {
      "name": "Documentation comments",
      "scope": [
        "comment.block.documentation",
        "comment.block.javadoc"
      ],
      "settings": {
        "foreground": "#7a7e85",
        "fontStyle": "italic"
      }
    },
    {
      "name": "Strings",
      "scope": [
        "string",
        "string.quoted",
        "string.template",
        "string.quoted.single",
        "string.quoted.double",
        "string.quoted.triple"
      ],
      "settings": {
        "foreground": "#6aab73"
      }
    },
    {
      "name": "String interpolation",
      "scope": [
        "punctuation.definition.template-expression.begin",
        "punctuation.definition.template-expression.end",
        "punctuation.section.embedded"
      ],
      "settings": {
        "foreground": "#cf8e6d"
      }
    },
    {
      "name": "Keywords",
      "scope": [
        "keyword",
        "keyword.control",
        "keyword.control.flow",
        "keyword.control.import",
        "keyword.control.export",
        "keyword.control.from",
        "keyword.control.conditional",
        "keyword.control.loop",
        "keyword.control.trycatch",
        "keyword.operator.new",
        "keyword.operator.expression",
        "keyword.operator.expression.typeof",
        "keyword.operator.expression.instanceof",
        "keyword.operator.expression.of",
        "keyword.operator.expression.in",
        "keyword.operator.expression.void",
        "keyword.operator.expression.delete"
      ],
      "settings": {
        "foreground": "#cf8e6d"
      }
    },
    {
      "name": "Storage keywords (var, let, const, function, class, etc.)",
      "scope": [
        "storage",
        "storage.type",
        "storage.modifier",
        "storage.type.function",
        "storage.type.class",
        "storage.type.interface",
        "storage.type.enum",
        "storage.type.type"
      ],
      "settings": {
        "foreground": "#cf8e6d"
      }
    },
    {
      "name": "Functions",
      "scope": [
        "entity.name.function",
        "meta.function-call entity.name.function",
        "support.function",
        "meta.function-call"
      ],
      "settings": {
        "foreground": "#56a8f5"
      }
    },
    {
      "name": "Function parameters",
      "scope": [
        "variable.parameter",
        "meta.parameter"
      ],
      "settings": {
        "foreground": "#bcbec4"
      }
    },
    {
      "name": "Types and Classes",
      "scope": [
        "entity.name.type",
        "entity.name.type.class",
        "entity.name.type.interface",
        "entity.name.type.enum",
        "entity.name.type.struct",
        "entity.name.type.type",
        "support.type",
        "support.class",
        "entity.other.inherited-class"
      ],
      "settings": {
        "foreground": "#c77dbb"
      }
    },
    {
      "name": "Type parameters / Generics",
      "scope": [
        "entity.name.type.parameter"
      ],
      "settings": {
        "foreground": "#c77dbb"
      }
    },
    {
      "name": "Numbers",
      "scope": [
        "constant.numeric",
        "constant.numeric.integer",
        "constant.numeric.float",
        "constant.numeric.hex",
        "constant.numeric.octal",
        "constant.numeric.binary"
      ],
      "settings": {
        "foreground": "#2aacb8"
      }
    },
    {
      "name": "Built-in constants",
      "scope": [
        "constant.language",
        "constant.language.boolean",
        "constant.language.null",
        "constant.language.undefined"
      ],
      "settings": {
        "foreground": "#cf8e6d"
      }
    },
    {
      "name": "User constants",
      "scope": [
        "variable.other.constant",
        "variable.other.enummember"
      ],
      "settings": {
        "foreground": "#c77dbb"
      }
    },
    {
      "name": "Variables",
      "scope": [
        "variable",
        "variable.other",
        "variable.other.readwrite",
        "variable.other.object"
      ],
      "settings": {
        "foreground": "#bcbec4"
      }
    },
    {
      "name": "Language variables (this, self, super)",
      "scope": [
        "variable.language",
        "variable.language.this",
        "variable.language.self",
        "variable.language.super"
      ],
      "settings": {
        "foreground": "#cf8e6d",
        "fontStyle": "italic"
      }
    },
    {
      "name": "Properties",
      "scope": [
        "variable.other.property",
        "support.variable.property",
        "variable.other.object.property"
      ],
      "settings": {
        "foreground": "#c77dbb"
      }
    },
    {
      "name": "Operators",
      "scope": [
        "keyword.operator",
        "keyword.operator.assignment",
        "keyword.operator.arithmetic",
        "keyword.operator.comparison",
        "keyword.operator.logical",
        "keyword.operator.ternary",
        "keyword.operator.spread",
        "keyword.operator.rest",
        "keyword.operator.type"
      ],
      "settings": {
        "foreground": "#bcbec4"
      }
    },
    {
      "name": "Punctuation",
      "scope": [
        "punctuation",
        "punctuation.definition.block",
        "punctuation.definition.parameters",
        "punctuation.definition.arguments",
        "punctuation.separator",
        "punctuation.terminator",
        "punctuation.accessor",
        "meta.brace.round",
        "meta.brace.square",
        "meta.brace.curly"
      ],
      "settings": {
        "foreground": "#bcbec4"
      }
    },
    {
      "name": "HTML Tags",
      "scope": [
        "entity.name.tag",
        "entity.name.tag.html",
        "punctuation.definition.tag",
        "punctuation.definition.tag.html",
        "punctuation.definition.tag.begin",
        "punctuation.definition.tag.end"
      ],
      "settings": {
        "foreground": "#cf8e6d"
      }
    },
    {
      "name": "HTML/JSX Attributes",
      "scope": [
        "entity.other.attribute-name",
        "entity.other.attribute-name.html"
      ],
      "settings": {
        "foreground": "#bababa"
      }
    },
    {
      "name": "JSX component tags",
      "scope": [
        "support.class.component",
        "entity.name.tag support.class.component"
      ],
      "settings": {
        "foreground": "#56a8f5"
      }
    },
    {
      "name": "CSS selectors (tag, class, id)",
      "scope": [
        "entity.name.tag.css",
        "entity.other.attribute-name.class.css",
        "entity.other.attribute-name.id.css",
        "entity.other.attribute-name.pseudo-class.css",
        "entity.other.attribute-name.pseudo-element.css"
      ],
      "settings": {
        "foreground": "#cf8e6d"
      }
    },
    {
      "name": "CSS properties",
      "scope": [
        "support.type.property-name.css",
        "support.type.vendored.property-name.css",
        "meta.property-name.css"
      ],
      "settings": {
        "foreground": "#bcbec4"
      }
    },
    {
      "name": "CSS property values",
      "scope": [
        "support.constant.property-value.css",
        "support.constant.font-name.css",
        "support.constant.media.css"
      ],
      "settings": {
        "foreground": "#bcbec4"
      }
    },
    {
      "name": "CSS units and colors",
      "scope": [
        "keyword.other.unit.css",
        "constant.other.color.rgb-value.css",
        "support.constant.color.css"
      ],
      "settings": {
        "foreground": "#2aacb8"
      }
    },
    {
      "name": "CSS at-rules",
      "scope": [
        "keyword.control.at-rule.css",
        "keyword.control.at-rule.media.css",
        "keyword.control.at-rule.import.css"
      ],
      "settings": {
        "foreground": "#cf8e6d"
      }
    },
    {
      "name": "SCSS/LESS variables",
      "scope": [
        "variable.scss",
        "variable.other.less"
      ],
      "settings": {
        "foreground": "#bcbec4"
      }
    },
    {
      "name": "Regex",
      "scope": [
        "string.regexp",
        "constant.other.character-class.regexp",
        "keyword.operator.quantifier.regexp",
        "keyword.operator.or.regexp",
        "punctuation.definition.group.regexp",
        "punctuation.definition.character-class.regexp"
      ],
      "settings": {
        "foreground": "#2aacb8"
      }
    },
    {
      "name": "Escape characters",
      "scope": [
        "constant.character.escape",
        "constant.character.escape.backslash"
      ],
      "settings": {
        "foreground": "#cf8e6d"
      }
    },
    {
      "name": "Decorators / Annotations",
      "scope": [
        "meta.decorator",
        "meta.decorator entity.name.function",
        "punctuation.decorator",
        "meta.annotation",
        "storage.type.annotation"
      ],
      "settings": {
        "foreground": "#bbb529"
      }
    },
    {
      "name": "JSON property names",
      "scope": [
        "support.type.property-name.json",
        "string.json support.type.property-name"
      ],
      "settings": {
        "foreground": "#c77dbb"
      }
    },
    {
      "name": "JSON string values",
      "scope": [
        "string.quoted.double.json"
      ],
      "settings": {
        "foreground": "#6aab73"
      }
    },
    {
      "name": "YAML keys",
      "scope": [
        "entity.name.tag.yaml",
        "support.type.property-name.yaml"
      ],
      "settings": {
        "foreground": "#cf8e6d"
      }
    },
    {
      "name": "YAML values",
      "scope": [
        "string.unquoted.plain.out.yaml"
      ],
      "settings": {
        "foreground": "#bcbec4"
      }
    },
    {
      "name": "YAML anchors and aliases",
      "scope": [
        "entity.name.type.anchor.yaml",
        "variable.other.alias.yaml",
        "keyword.control.flow.block-scalar.yaml"
      ],
      "settings": {
        "foreground": "#2aacb8"
      }
    },
    {
      "name": "Markdown headings",
      "scope": [
        "heading.1.markdown entity.name",
        "heading.2.markdown entity.name",
        "heading.3.markdown entity.name",
        "heading.4.markdown entity.name",
        "heading.5.markdown entity.name",
        "heading.6.markdown entity.name",
        "markup.heading",
        "markup.heading.setext"
      ],
      "settings": {
        "foreground": "#cf8e6d",
        "fontStyle": "bold"
      }
    },
    {
      "name": "Markdown heading punctuation",
      "scope": [
        "punctuation.definition.heading.markdown"
      ],
      "settings": {
        "foreground": "#cf8e6d"
      }
    },
    {
      "name": "Markdown bold",
      "scope": [
        "markup.bold"
      ],
      "settings": {
        "foreground": "#bcbec4",
        "fontStyle": "bold"
      }
    },
    {
      "name": "Markdown italic",
      "scope": [
        "markup.italic"
      ],
      "settings": {
        "foreground": "#bcbec4",
        "fontStyle": "italic"
      }
    },
    {
      "name": "Markdown inline code",
      "scope": [
        "markup.inline.raw",
        "markup.fenced_code.block"
      ],
      "settings": {
        "foreground": "#6aab73"
      }
    },
    {
      "name": "Markdown links",
      "scope": [
        "markup.underline.link",
        "markup.underline.link.markdown"
      ],
      "settings": {
        "foreground": "#548af7"
      }
    },
    {
      "name": "Markdown link text",
      "scope": [
        "string.other.link.title.markdown",
        "string.other.link.description.markdown"
      ],
      "settings": {
        "foreground": "#56a8f5"
      }
    },
    {
      "name": "Markdown list markers",
      "scope": [
        "punctuation.definition.list.begin.markdown",
        "markup.list.numbered.markdown",
        "markup.list.unnumbered.markdown"
      ],
      "settings": {
        "foreground": "#cf8e6d"
      }
    },
    {
      "name": "Markdown blockquote",
      "scope": [
        "markup.quote.markdown"
      ],
      "settings": {
        "foreground": "#7a7e85",
        "fontStyle": "italic"
      }
    },
    {
      "name": "Python function decorators",
      "scope": [
        "meta.function.decorator.python",
        "entity.name.function.decorator.python"
      ],
      "settings": {
        "foreground": "#bbb529"
      }
    },
    {
      "name": "Python magic methods",
      "scope": [
        "support.function.magic.python"
      ],
      "settings": {
        "foreground": "#56a8f5"
      }
    },
    {
      "name": "Python f-string braces",
      "scope": [
        "constant.character.format.placeholder.other.python"
      ],
      "settings": {
        "foreground": "#cf8e6d"
      }
    },
    {
      "name": "Go package name",
      "scope": [
        "entity.name.package.go"
      ],
      "settings": {
        "foreground": "#bcbec4"
      }
    },
    {
      "name": "Go imports",
      "scope": [
        "entity.name.import.go"
      ],
      "settings": {
        "foreground": "#6aab73"
      }
    },
    {
      "name": "Rust lifetimes",
      "scope": [
        "entity.name.type.lifetime.rust",
        "storage.modifier.lifetime.rust",
        "punctuation.definition.lifetime.rust"
      ],
      "settings": {
        "foreground": "#2aacb8"
      }
    },
    {
      "name": "Rust macros",
      "scope": [
        "entity.name.function.macro.rust",
        "support.macro.rust"
      ],
      "settings": {
        "foreground": "#56a8f5",
        "fontStyle": "bold"
      }
    },
    {
      "name": "Rust attributes",
      "scope": [
        "meta.attribute.rust"
      ],
      "settings": {
        "foreground": "#bbb529"
      }
    },
    {
      "name": "Shell variables",
      "scope": [
        "variable.other.normal.shell",
        "variable.other.positional.shell",
        "variable.other.bracket.shell",
        "variable.other.special.shell"
      ],
      "settings": {
        "foreground": "#bcbec4"
      }
    },
    {
      "name": "Namespace / Module",
      "scope": [
        "entity.name.namespace",
        "entity.name.module",
        "entity.name.type.module"
      ],
      "settings": {
        "foreground": "#c77dbb"
      }
    },
    {
      "name": "Support constants",
      "scope": [
        "support.constant",
        "support.variable"
      ],
      "settings": {
        "foreground": "#c77dbb"
      }
    },
    {
      "name": "Markup inserted (diff)",
      "scope": [
        "markup.inserted"
      ],
      "settings": {
        "foreground": "#73b00a"
      }
    },
    {
      "name": "Markup deleted (diff)",
      "scope": [
        "markup.deleted"
      ],
      "settings": {
        "foreground": "#f75464"
      }
    },
    {
      "name": "Markup changed (diff)",
      "scope": [
        "markup.changed"
      ],
      "settings": {
        "foreground": "#548af7"
      }
    },
    {
      "name": "Invalid / Illegal",
      "scope": [
        "invalid",
        "invalid.illegal"
      ],
      "settings": {
        "foreground": "#f75464"
      }
    },
    {
      "name": "Deprecated",
      "scope": [
        "invalid.deprecated"
      ],
      "settings": {
        "foreground": "#e8a33e",
        "fontStyle": "strikethrough"
      }
    }
  ]
} as const
