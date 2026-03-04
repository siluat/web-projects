import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const workspaceDirs = ['apps', 'packages', 'playgrounds'];

for (const workspaceDir of workspaceDirs) {
  if (!existsSync(workspaceDir)) continue;

  const dirs = readdirSync(workspaceDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const dir of dirs) {
    const pkgPath = join(workspaceDir, dir, 'package.json');
    const jsrPath = join(workspaceDir, dir, 'jsr.json');

    if (!existsSync(pkgPath) || !existsSync(jsrPath)) continue;

    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const jsr = JSON.parse(readFileSync(jsrPath, 'utf-8'));

    if (jsr.version !== pkg.version) {
      jsr.version = pkg.version;
      writeFileSync(jsrPath, `${JSON.stringify(jsr, null, 2)}\n`);
      console.log(`Synced ${jsrPath} → ${pkg.version}`);
    }
  }
}
