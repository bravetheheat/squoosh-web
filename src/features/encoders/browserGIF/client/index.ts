import { canvasEncodeTest, canvasEncode } from 'src/client/util/canvas';
import WorkerBridge from 'src/client/worker-bridge';
import { EncodeOptions, mimeType } from '../shared/meta';

export const featureTest = () => canvasEncodeTest(mimeType);
export const encode = (
  signal: AbortSignal,
  workerBridge: WorkerBridge,
  imageData: ImageData,
  options: EncodeOptions
) => canvasEncode(imageData, mimeType);
