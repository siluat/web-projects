# @siluat/typescript-config

Collection of internal typescript configurations.

Based on [Turborepo example](https://github.com/vercel/turborepo/tree/main/examples/basic/packages/typescript-config).

## Usage

### package.json

```json
{
  "devDependencies": {
    "@siluat/typescript-config": "workspace:*"
  }
}
```

### tsconfig.json

```json
{
  "extends": "@siluat/typescript-config/nextjs.json"
}
```

## List of configurations

- `nextjs.json`: Configuration for Next.js.
- `react-library.json`: Configuration for React libraries.
