import {useEffect} from 'react';
import ImageZoom from 'react-image-zooom';
import {Pagination} from 'swiper';
import {Swiper, SwiperSlide} from 'swiper/react';

interface Props {
  media: any[];
}

export const SwiperImages = ({media}: Props) => {
  return (
    <>
      <div className="min-h-[300px] m-auto">
        <Swiper
          modules={[Pagination]}
          spaceBetween={50}
          slidesPerView={1}
          pagination={{clickable: true, el: '.pagination'}}
        >
          {media.map((el) => (
            <SwiperSlide key={el.id}>
              <div className="aspect-[3/4]">
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
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="pagination flex mt-[24px] justify-center"></div>
      </div>
    </>
  );
};
