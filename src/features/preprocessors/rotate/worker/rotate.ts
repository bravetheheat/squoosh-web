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

// @ts-ignore TODO: Fix typing
import rotateWasm from 'codecs/rotate/rotate.wasm';
import { Options } from '../shared/meta';

export interface RotateModuleInstance {
  exports: {
    memory: WebAssembly.Memory;
    rotate(width: number, height: number, rotate: 0 | 90 | 180 | 270): void;
  };
}

export default async function rotate(
  data: ImageData,
  opts: Options
): Promise<ImageData> {
  const instance = rotateWasm() as RotateModuleInstance;

  // Number of wasm memory pages (á 64KiB) needed to store the image twice.
  const bytesPerImage = data.width * data.height * 4;
  const numPagesNeeded = Math.ceil((bytesPerImage * 2 + 8) / (64 * 1024));
  // Only count full pages, just to be safe.
  const numPagesAvailable = Math.floor(
    instance.exports.memory.buffer.byteLength / (64 * 1024)
  );
  const additionalPagesToAllocate = numPagesNeeded - numPagesAvailable;

  if (additionalPagesToAllocate > 0) {
    instance.exports.memory.grow(additionalPagesToAllocate);
  }
  const view = new Uint8ClampedArray(instance.exports.memory.buffer);
  view.set(data.data, 8);

  instance.exports.rotate(data.width, data.height, opts.rotate);

  const flipDimensions = opts.rotate % 180 !== 0;
  return new ImageData(
    view.slice(bytesPerImage + 8, bytesPerImage * 2 + 8),
    flipDimensions ? data.height : data.width,
    flipDimensions ? data.width : data.height
  );
}
