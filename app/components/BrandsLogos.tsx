import React from 'react';

import {Image} from '@shopify/hydrogen';

interface Props {
  data: {
    [key: string]: {
      value: string;
      key: string;
      type: string;
    };
  };
}

export function BrandsLogos({data}: Props) {
  return (
    <div className="grid grid-cols-4 gap-[15px] m-[40px] gt-l:m-[0px] mb-[80px] gt-l:grid-cols-none swimlane gt-l:pb-8 gt-l:scroll-px-0  gt-l:w-[100%] mr-0 ml-0 lg:pl-[40px] lg:pr-[40px] gt-lg:pr-[0px] gt-lg:pl-[0px]">
      {[1, 2, 3, 4].map((index) => (
        <div
          key={index}
          className="h-[120px] bg-[#F3F3F3] flex justify-center p-[30px] gt-l:snap-start gt-l:w-[310px] gt-m:w-[170px] gt-m:h-[80px] gt-m:p-[20px]"
        >
          <Image
            width={200}
            height={200}
            className={`h-full object-scale-down`}
            sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
            data={{url: data[`image_${index}`].value}}
            alt={'Brand'}
            loading={'lazy'}
          />
        </div>
      ))}
    </div>
  );
}
