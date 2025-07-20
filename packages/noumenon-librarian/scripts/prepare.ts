import { FileSystem } from '@effect/platform';
import { NodeContext, NodeRuntime } from '@effect/platform-node';
import { Console, Effect, pipe } from 'effect';

const ENV_FILE_NAME = '.env.local';
const ENV_FILE_TEMPLATE = `# Fill in the paths to the raw data and output directory
RAW_DATA_FILE_PATH=
OUTPUT_DIRECTORY_PATH=
`;

const checkFileExists = (path: string) =>
  pipe(
    FileSystem.FileSystem,
    Effect.flatMap((fs) => fs.exists(path)),
  );

const createEnvFile = (path: string, data: string) =>
  pipe(
    FileSystem.FileSystem,
    Effect.flatMap((fs) => fs.writeFileString(path, data)),
  );

const skipCreation = () =>
  Console.info('Environment file already exists. Skipping creation.');

const program = Effect.orElse(
  Effect.if(checkFileExists(ENV_FILE_NAME), {
    onFalse: () => createEnvFile(ENV_FILE_NAME, ENV_FILE_TEMPLATE),
    onTrue: () => skipCreation(),
  }),
  () =>
    Console.warn(
      'Failed to check environment file. You may need to manually check it.',
    ),
);

NodeRuntime.runMain(program.pipe(Effect.provide(NodeContext.layer)));
