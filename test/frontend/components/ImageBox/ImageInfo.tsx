import { useEffect, useState } from 'react';

const ImageInfo = ({ img }: { img: File }): JSX.Element => {
  const [downloadURL, setDownloadURL] = useState<string>();

  useEffect(() => {
    const url = URL.createObjectURL(img);
    setDownloadURL(url);
  }, [img]);

  return (
    <div className='absolute bottom-0 right-0 left-0 flex justify-center'>
      <div className='mb-4'>
        <table className='text-white'>
          <tr>
            <td>File:</td>
            <td>{img.name}</td>
          </tr>
          <tr>
            <td>Size:</td>
            <td>{img.size}</td>
          </tr>
        </table>
        <a
          className='px-2 py-1 bg-white rounded'
          href={downloadURL}
          download={img.name}
        >
          Download
        </a>
      </div>
    </div>
  );
};

export default ImageInfo;
