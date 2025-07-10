import path from 'node:path';
import type { PlopTypes } from '@turbo/gen';

interface PackageResponse {
  type: 'ts-package';
  name: string;
}

function validateNonEmptyString(field: string) {
  return (value: string) => {
    if (/\S+/.test(value)) {
      return true;
    }
    return `${field} is required`;
  };
}

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator('package', {
    description: 'Create a new package in the monorepo',
    prompts: [
      {
        type: 'list',
        name: 'type',
        choices: [
          {
            name: 'ts-package - A general purpose TypeScript package',
            value: 'ts-package',
          },
        ],
      },
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of the new package?',
        validate: validateNonEmptyString('package name'),
      },
    ],
    actions: (answers) => {
      const { type, name } = answers as PackageResponse;
      const basePath = plop.getDestBasePath();
      const templatePath = path.join(basePath, 'templates', type);

      return [
        {
          type: 'addMany',
          templateFiles: path.join(templatePath, '**/*'),
          base: templatePath,
          destination: `{{ turbo.paths.root }}/packages/${name}`,
        },
      ];
    },
  });
}
