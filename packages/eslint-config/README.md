# @siluat/eslint-config

Collection of internal eslint configurations.

Based on [Turborepo example](https://github.com/vercel/turborepo/tree/main/examples/basic/packages/eslint-config).

## Usage

### package.json

```json
{
  "devDependencies": {
    "@siluat/eslint-config": "workspace:*"
  }
}
```

### eslint.config.js

```js
import { config } from '@siluat/eslint-config/next.js';

/** @type {import("eslint").Linter.Config} */
export default config;
```

## List of configurations

- `next.js`: Configuration for Next.js.
- `react-internal.js`: Configuration for React libraries.
