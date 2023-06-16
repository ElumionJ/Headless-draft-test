import React from 'react';

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
          <img
            src={data[`image_${index}`].value}
            className="h-full object-none"
            alt=""
          />
        </div>
      ))}
    </div>
  );
}
