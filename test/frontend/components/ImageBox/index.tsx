import ImageComponent from './ImageComponent';
import ImageInfo from './ImageInfo';

const ImageBox = ({ img }: { img: File }): JSX.Element => {
  return (
    <>
      <div className='relative h-full w-full'>
        <ImageComponent img={img} className='object-cover h-full w-full' />
        <ImageInfo img={img} />
      </div>
    </>
  );
};

export default ImageBox;
