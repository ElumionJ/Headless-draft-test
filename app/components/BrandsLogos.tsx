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
    <div className="grid grid-cols-4 gap-[15px] m-[40px] gt-l:m-[0px] mb-[80px] gt-l:grid-cols-none swimlane gt-l:pb-8 gt-l:scroll-px-0 gt-l:px-12 gt-l:w-[100%] gt-l:pl-[15px] gt-l:pr-[15px] mr-0 ml-0">
      {[1, 2, 3, 4].map((index) => (
        <div
          key={index}
          className="h-[120px] bg-[#F3F3F3] flex justify-center p-[10px] gt-l:snap-start gt-l:w-[378px] gt-m:w-[205px] gt-m:h-[80px] gt-m:p-[20px]"
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
