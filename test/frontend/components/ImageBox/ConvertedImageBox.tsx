import ImageBox from '.';
import useConvertImage from '../../hooks/useConvertImage';

const ConvertedImageBox = ({ source }: { source: File }) => {
  const convertedImage = useConvertImage(source);
  if (!convertedImage) return null;
  return <ImageBox img={convertedImage} />;
};

export default ConvertedImageBox;
