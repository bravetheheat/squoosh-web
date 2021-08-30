import type WorkerBridge from 'src/client/worker-bridge';
import { EncodeOptions } from '../shared/meta';

export const encode = (
  signal: AbortSignal,
  workerBridge: WorkerBridge,
  imageData: ImageData,
  options: EncodeOptions
) => workerBridge.wp2Encode(signal, imageData, options);
