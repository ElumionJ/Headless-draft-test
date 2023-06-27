import {Image} from '@shopify/hydrogen';
import ImageZoom from 'react-image-zooom';

interface Props {
  media: any[];
}

export const SwiperImages = ({media}: Props) => {
  return (
    <>
      <div className="min-h-[300px] m-auto">
        <div className="w-full">
          <div>
            {media.map((el) => (
              <div key={el.id} className="aspect-[3/4]">
                <div
                  className="object-cover h-full relative"
                  style={{
                    backgroundColor: `#a5a5a5`,
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${el?.image?.url})`,
                    backgroundSize: 'cover !important',
                    transform: 'scale(1) !important',
                    scale: '1',
                  }}
                >
                  <ImageZoom
                    src={el?.image?.url || ''}
                    alt=""
                    zoom="250"
                    scale="1"
                    preload
                    className={`object-cover image-zoom !w-full scale-[1] z-50 after:!opacity-0`}
                  />
                  {/* <Image
                    aspectRatio="3/4"
                    loading={'eager'}
                    data={el.image!}
                    className="object-cover h-full fadeIn absolute top-0 left-0 z-50 "
                  /> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
