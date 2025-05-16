import { TypedFlatConfigItem } from '@antfu/eslint-config'
import 'eslint-plugin-boundaries'
import 'eslint-plugin-import'


export const feautureSlice: TypedFlatConfigItem = {
  plugins: {
    boundaries: 'boundaries/recommended',
    importTypescript: 'import/typescript',
    importErrors: 'import/errors'
  },
  settings: {
    "import/resolver": {
      "typescript": {
        "alwaysTryTypes": true
      }
    },
    "boundaries/include": ["src/**/*"],
    "boundaries/elements": [
      {
        "type": "app",
        "pattern": "app"
      },
      {
        "type": "pages",
        "pattern": "pages/*",
        "capture": ["page"]
      },
      {
        "type": "widgets",
        "pattern": "widgets/*",
        "capture": ["widget"]
      },
      {
        "type": "features",
        "pattern": "features/*",
        "capture": ["feature"]
      },
      {
        "type": "entities",
        "pattern": "entities/*",
        "capture": ["entity"]
      },
      {
        "type": "shared",
        "pattern": "shared/*",
        "capture": ["segment"]
      }
    ]
  },
  rules: {
    "import/order": [
      "error",
      {
        "pathGroups": [
          { "group": "internal", "position": "after", "pattern": "~/processes/**" },
          { "group": "internal", "position": "after", "pattern": "~/pages/**" },
          { "group": "internal", "position": "after", "pattern": "~/widgets/**" },
          { "group": "internal", "position": "after", "pattern": "~/features/**" },
          { "group": "internal", "position": "after", "pattern": "~/entities/**" },
          { "group": "internal", "position": "after", "pattern": "~/shared/**" }
        ],
        "pathGroupsExcludedImportTypes": ["builtin"],
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ]
      }
    ],
    "boundaries/entry-point": [
      "error",
      {
        "default": "disallow",
        "rules": [
          {
            "target": ["shared"],
            "allow": "**"
          },
          {
            "target": ["app", "pages", "widgets", "features", "entities"],
            "allow": "index.{ts,vue}"
          }
        ]
      }
    ],
    "boundaries/element-types": [
      "error",
      {
        "default": "allow",
        "message": "${file.type} is not allowed to import (${dependency.type})",
        "rules": [
          {
            "from": ["shared"],
            "disallow": ["app", "pages", "widgets", "features", "entities"],
            "message":
              "Shared module must not import upper layers (${dependency.type})"
          },
          {
            "from": ["entities"],
            "message": "Entity must not import upper layers (${dependency.type})",
            "disallow": ["app", "pages", "widgets", "features"]
          },
          {
            "from": ["entities"],
            "message": "Entity must not import other entity",
            "disallow": [
              [
                "entities",
                {
                  "entity": "!${entity}"
                }
              ]
            ]
          },
          {
            "from": ["features"],
            "message":
              "Feature must not import upper layers (${dependency.type})",
            "disallow": ["app", "pages", "widgets"]
          },
          {
            "from": ["features"],
            "message": "Feature must not import other feature",
            "disallow": [
              [
                "features",
                {
                  "feature": "!${feature}"
                }
              ]
            ]
          },
          {
            "from": ["widgets"],
            "message":
              "Feature must not import upper layers (${dependency.type})",
            "disallow": ["app", "pages"]
          },
          {
            "from": ["widgets"],
            "message": "Widget must not import other widget",
            "disallow": [
              [
                "widgets",
                {
                  "widget": "!${widget}"
                }
              ]
            ]
          },
          {
            "from": ["pages"],
            "message": "Page must not import upper layers (${dependency.type})",
            "disallow": ["app"]
          },
          {
            "from": ["pages"],
            "message": "Page must not import other page",
            "disallow": [
              [
                "pages",
                {
                  "page": "!${page}"
                }
              ]
            ]
          }
        ]
      }
    ]
  }
}