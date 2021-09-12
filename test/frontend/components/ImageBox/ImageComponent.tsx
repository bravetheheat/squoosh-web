import { useCallback } from 'react';

const ImageComponent = ({
  img,
  className,
}: {
  img: File;
  className?: string;
}) => {
  const loadBlob = useCallback((node) => {
    if (!node) return;

    const imgURL = URL.createObjectURL(img);
    node.src = imgURL;
  }, []);

  return <img id={`img-${img.name}`} className={className} ref={loadBlob} />;
};

export default ImageComponent;
