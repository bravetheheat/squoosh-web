import { canvasEncode } from 'src/client/util/canvas';
import WorkerBridge from 'src/client/worker-bridge';
import { mimeType, EncodeOptions } from '../shared/meta';

export const encode = (
  signal: AbortSignal,
  workerBridge: WorkerBridge,
  imageData: ImageData,
  options: EncodeOptions
) => canvasEncode(imageData, mimeType, options.quality);
