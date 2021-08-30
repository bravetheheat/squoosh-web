import { abortable, blobToArrayBuffer } from 'src/client/util';
import { canvasEncode } from 'src/client/util/canvas';
import type WorkerBridge from 'src/client/worker-bridge';
import { EncodeOptions } from '../shared/meta';

export async function encode(
  signal: AbortSignal,
  workerBridge: WorkerBridge,
  imageData: ImageData,
  options: EncodeOptions
) {
  const pngBlob = await abortable(signal, canvasEncode(imageData, 'image/png'));
  const pngBuffer = await abortable(signal, blobToArrayBuffer(pngBlob));
  return workerBridge.oxipngEncode(signal, pngBuffer, options);
}
