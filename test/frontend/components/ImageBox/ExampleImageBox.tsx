import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const ImageBox = dynamic(() => import('.'), { ssr: false });

const ConvertedImageBox = dynamic(() => import('./ConvertedImageBox'), {
  ssr: false,
});

const ExampleImageBox = () => {
  const [imgFile, setImgFile] = useState<File>();

  useEffect(() => {
    const fetchImgBlob = async () => {
      const res = await fetch('/red-panda.jpg');

      const blob = await res.blob();

      setImgFile(new File([blob], 'red-panda.jpg'));
    };
    fetchImgBlob();
  }, []);
  if (!imgFile) return null;
  return (
    <>
      <div className='grid grid-cols-2 h-full w-full'>
        <ImageBox img={imgFile} />
        <ConvertedImageBox source={imgFile} />
      </div>
    </>
  );
};

export default ExampleImageBox;
