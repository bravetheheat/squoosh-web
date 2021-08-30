interface SourceImage {
  file: File;
  decoded: ImageData;
  preprocessed: ImageData;
  vectorImage?: HTMLImageElement;
}

declare module 'client-bundle:*' {
  const url: string;
  export default url;
  export const imports: string[];
  /** Source for this script and all its dependencies */
  export const allSrc: string;
}
