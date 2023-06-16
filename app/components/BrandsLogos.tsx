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
    <div className="grid grid-cols-4 gap-5 m-[40px] mb-[80px] gt-m:grid-cols-2 gt-m:gap-2">
      {[1, 2, 3, 4].map((index) => (
        <div
          key={index}
          className="h-[120px] bg-[#F3F3F3] flex justify-center p-[10px]"
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
