import {
  abortable,
  assertSignal,
  builtinDecode,
  canDecodeImageType,
  ImageMimeTypes,
  sniffMimeType,
} from './util';
import WorkerBridge from './worker-bridge';
import {
  encoderMap,
  EncoderState,
  PreprocessorState,
  ProcessorState,
} from './feature-meta';
import { resize } from '../features/processors/resize/client';

async function decodeImage(
  signal: AbortSignal,
  blob: Blob,
  workerBridge: WorkerBridge
): Promise<ImageData> {
  // TODO: Add SVG processing
  assertSignal(signal);
  const mimeType = await abortable(signal, sniffMimeType(blob));
  const canDecode = await abortable(signal, canDecodeImageType(mimeType));

  try {
    if (!canDecode) {
      if (mimeType === 'image/avif') {
        return await workerBridge.avifDecode(signal, blob);
      }
      if (mimeType === 'image/webp') {
        return await workerBridge.webpDecode(signal, blob);
      }
      if (mimeType === 'image/jxl') {
        return await workerBridge.jxlDecode(signal, blob);
      }
      if (mimeType === 'image/webp2') {
        return await workerBridge.wp2Decode(signal, blob);
      }
    }
    // Otherwise fall through and try built-in decoding for a laugh.
    return await builtinDecode(signal, blob, mimeType);
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
    console.log(err);
    throw Error("Couldn't decode image");
  }
}

async function preprocessImage(
  signal: AbortSignal,
  data: ImageData,
  preprocessorState: PreprocessorState,
  workerBridge: WorkerBridge
): Promise<ImageData> {
  assertSignal(signal);
  let processedData = data;

  if (preprocessorState.rotate.rotate !== 0) {
    processedData = await workerBridge.rotate(
      signal,
      processedData,
      preprocessorState.rotate
    );
  }

  return processedData;
}

async function processImage(
  signal: AbortSignal,
  source: SourceImage,
  processorState: ProcessorState,
  workerBridge: WorkerBridge
): Promise<ImageData> {
  assertSignal(signal);
  let result = source.preprocessed;

  if (processorState.resize.enabled) {
    result = await resize(signal, source, processorState.resize, workerBridge);
  }
  if (processorState.quantize.enabled) {
    result = await workerBridge.quantize(
      signal,
      result,
      processorState.quantize
    );
  }
  return result;
}

async function compressImage(
  signal: AbortSignal,
  image: ImageData,
  encodeData: EncoderState,
  sourceFilename: string,
  workerBridge: WorkerBridge
): Promise<File> {
  assertSignal(signal);

  const encoder = encoderMap[encodeData.type];
  const compressedData = await encoder.encode(
    signal,
    workerBridge,
    image,
    // The type of encodeData.options is enforced via the previous line
    encodeData.options as any
  );

  // This type ensures the image mimetype is consistent with our mimetype sniffer
  const type: ImageMimeTypes = encoder.meta.mimeType;

  return new File(
    [compressedData],
    sourceFilename.replace(/.[^.]*$/, `.${encoder.meta.extension}`),
    { type }
  );
}

async function convertImage(
  file: File,
  options: {
    preprocessor: PreprocessorState;
    processor: ProcessorState;
    encoder: EncoderState;
  }
) {
  const abortController = new AbortController();
  const signal = abortController.signal;

  const workerBridges = [new WorkerBridge(), new WorkerBridge()];

  let decoded: ImageData;
  let vectorImage: HTMLImageElement | undefined;

  decoded = await decodeImage(signal, file, workerBridges[0]);

  let source: SourceImage;
  const preprocessed = await preprocessImage(
    signal,
    decoded,
    options.preprocessor,
    // Either worker is good enough here.
    workerBridges[0]
  );

  source = {
    decoded,
    vectorImage,
    preprocessed,
    file,
  };

  // Encoding step

  let outputFile: File;
  let data: ImageData;
  let processed: ImageData | undefined = undefined;
  if (preprocessed) data = preprocessed;

  processed = await processImage(
    signal,
    source,
    options.processor,
    workerBridges[0]
  );

  outputFile = await compressImage(
    signal,
    processed,
    options.encoder,
    file.name,
    workerBridges[0]
  );
}

export default convertImage;
