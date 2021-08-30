import type WorkerBridge from 'src/client/worker-bridge';
import { EncodeOptions } from '../shared/meta';

export function encode(
  signal: AbortSignal,
  workerBridge: WorkerBridge,
  imageData: ImageData,
  options: EncodeOptions
) {
  return workerBridge.mozjpegEncode(signal, imageData, options);
}
