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

export function HeroBanner({data}: Props) {
  // console.log(data);
  return (
    <div
      className="flex h-[500px] w-[100%] justify-center"
      style={{marginBottom: `${data.margin_bottom.value}px`}}
    >
      <div className="w-[100%] relative flex flex-col ">
        <img
          className="w-[100%] h-[100%] object-cover"
          src={data.image_1.value}
          alt={data.image_1.value}
          width={300}
        />
        <div
          className={`absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]
            bg-[#72727275]`}
          style={{padding: `${+data.text_padding.value || 15}px`}}
        >
          <h3 className=" font-bold text-[#fff] text-[30px]">
            {data.title_1.value}
          </h3>
          <p className=" text-[#fff] ">{data.subtitle_1.value}</p>
        </div>
      </div>
      <div className="w-[100%] relative flex flex-col ">
        <img
          className="w-[100%] h-[100%]  object-cover"
          src={data.image_2.value}
          alt={data.image_2.value}
          width={300}
        />
        <div
          className={`absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]  bg-[#72727275] `}
          style={{padding: `${+data.text_padding.value || 15}px`}}
        >
          <h3 className="text-[#fff]   font-bold text-[30px]">
            {data.title_2.value}
          </h3>
          <p className=" text-[#fff] ">{data.subtitle_2.value}</p>
        </div>
      </div>
    </div>
  );
}
