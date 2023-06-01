import React, {useEffect} from 'react';
import Swiper from 'swiper';
import {Image} from '@shopify/hydrogen';

interface Props {
  media: any[];
}

export const SwiperImages = ({media}: Props) => {
  useEffect(() => {
    const swiper = new Swiper('.swiper', {
      slidesPerView: 1, // Number of slides per view
      loop: true,
      autoHeight: true,
      
      pagination: {
        el: '.swiper-pagination', // Pagination dots selector
        clickable: true, // Enable navigation through pagination dots
      },
    });
    // swiper.destroy(true);
    return () => {
      swiper.destroy(true);
    };
  }, [media]);

  return (
    <>
      <div className="min-h-[300px]">
        <div className="swiper w-full">
          <div className="swiper-wrapper">
            {media.map((el) => (
              <div key={el.id} className="swiper-slide">
                {/* <img src={el.image.url} alt="" /> */}
                <Image
                  loading={'eager'}
                  data={el.image!}
                  className="object-cover h-full fadeIn"
                />
              </div>
            ))}
          </div>
          <div className="swiper-pagination">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </div>
        </div>
      </div>
    </>
  );
};
