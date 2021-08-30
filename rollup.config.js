/**
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import OMT from '@surma/rollup-plugin-off-main-thread';
import del from 'del';
import { promises as fsp } from 'fs';
import * as path from 'path';
import { terser } from 'rollup-plugin-terser';
import featurePlugin from './lib/feature-plugin';
import nodeExternalPlugin from './lib/node-external-plugin';
import resolveDirsPlugin from './lib/resolve-dirs-plugin';
import simpleTS from './lib/simple-ts';

const dir = '.tmp/build';
const staticPath = 'static/c/[name]-[hash][extname]';

export default async function ({ watch }) {
  const omtLoaderPromise = fsp.readFile(
    path.join(__dirname, 'lib', 'omt.ejs'),
    'utf-8'
  );

  await del('.tmp/build');

  const isProduction = !watch;

  const tsPluginInstance = simpleTS('.', {
    watch,
  });
  const commonPlugins = () => [
    tsPluginInstance,
    resolveDirsPlugin([
      'src/features',
      'src/features-worker',
      'src/client',
      'src/sw',
      'codecs',
    ]),
  ];

  return {
    input: 'src/client/index.ts',
    external: ['worker_threads'],
    output: [
      {
        dir,
        format: 'esm',
        assetFileNames: staticPath,
        // This is needed because emscripten's workers use 'this', so they trigger all kinds of interop things,
        // such as double-wrapping objects in { default }.
        interop: false,
      },
    ],
    watch: {
      clearScreen: false,
      // Don't watch the ts files. Instead we watch the output from the ts compiler.
      exclude: ['**/*.ts', '**/*.tsx'],
      // Sometimes TypeScript does its thing a little slowly, which causes
      // Rollup to build twice on each change. This delay seems to fix it,
      // although we may need to change this number over time.
      buildDelay: 250,
    },
    plugins: [
      OMT({ loader: await omtLoaderPromise }),
      ...commonPlugins(),
      commonjs(),
      resolve(),
      replace({ __PRERENDER__: false, __PRODUCTION__: isProduction }),
      isProduction ? terser({ module: true }) : {},
      ...commonPlugins(),
      nodeExternalPlugin(),
      featurePlugin(),
    ],
  };
}
