---
"@siluat/color-contrast-cli": patch
---

Fix broken npm install: replace workspace:* with ^1.0.0 in dependencies

The 1.0.0 release included bun's `workspace:*` protocol in the published
package.json, which npm cannot resolve. This patch replaces it with a
standard semver range.
