import { Command } from '@effect/platform';
import { NodeContext, NodeRuntime } from '@effect/platform-node';
import {
  Config,
  Effect,
  Equal,
  pipe,
  Stream,
  String as StringEffect,
} from 'effect';

export const runString = <E, R>(
  stream: Stream.Stream<Uint8Array, E, R>,
): Effect.Effect<string, E, R> =>
  stream.pipe(
    Stream.decodeText(),
    Stream.runFold(StringEffect.empty, StringEffect.concat),
  );

const program = pipe(
  Config.all([
    Config.nonEmptyString('RAW_DATA_FILE_PATH'),
    Config.nonEmptyString('OUTPUT_DIRECTORY_PATH'),
  ]),
  Effect.andThen(([rawDataPath, outputPath]) =>
    pipe(
      Command.make('noumenon-gleaner', '-i', rawDataPath, '-o', outputPath),
      Command.start,
    ),
  ),
  Effect.flatMap((process) =>
    Effect.all(
      [process.exitCode, runString(process.stdout), runString(process.stderr)],
      { concurrency: 3 },
    ),
  ),
  Effect.flatMap(([exitCode, stdout, stderr]) =>
    Effect.if(Equal.equals(exitCode, 0), {
      onTrue: () => Effect.log(stdout),
      onFalse: () => Effect.logError(stderr),
    }),
  ),
);

NodeRuntime.runMain(
  Effect.scoped(program.pipe(Effect.provide(NodeContext.layer))),
);
