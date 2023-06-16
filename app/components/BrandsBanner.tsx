import React from 'react';

import {Link} from './Link';

interface Props {
  data: {
    [key: string]: {
      value: string;
      key: string;
      type: string;
    };
  };
}

export function BrandsBanner({data}: Props) {
  return (
    <div
      className="flex gt-m:flex-col h-[500px] w-[100%] justify-center p-[40px] gt-m:p-0"
      style={{marginBottom: `${data.margin.value}px`}}
    >
      <div
        className="w-2/5 ltr:mr-[20px] rtl:ml-[20px] relative flex bg-center bg-no-repeat flex-col-reverse gt-m:w-full gt-m:h-[165px]"
        style={{
          border: `1px solid #000000`,
          boxShadow: `0px 4px 4px rgba(0, 0, 0, 0.25)`,
          borderRadius: `2px`,
        }}
      >
        <img
          className="w-[100%] h-[100%] object-cover"
          src={data.image_1.value}
          alt={data.image_1.value}
        />
        <div
          className="bg-gradient-to-t from-transparent to-black w-full h-full absolute"
          style={{
            background: `linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000000 100%)`,
            opacity: `0.6`,
          }}
        ></div>
        <Link
          to={'/products'}
          className="absolute ltr:left-[32px] rtl:right-[32px] bottom-[32px] font-normal text-[#fff] text-[30px] flex justify-center font-bebas tracking-wider leading-[120%]"
        >
          {data.title_1.value}
          <span className="ltr:ml-[8px] rtl:mr-[8px] rtl:scale-x-[-1]">
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.07025 2.25054L2.12057 7.20022"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2.95279 2.12583L7.19526 2.12565L7.19543 6.36847"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </Link>
      </div>
      <div
        className="w-3/5 relative flex bg-center bg-no-repeat flex-col-reverse gt-m:w-full gt-m:h-[165px]"
        style={{
          border: `1px solid #000000`,
          boxShadow: `0px 4px 4px rgba(0, 0, 0, 0.25)`,
          borderRadius: `2px`,
        }}
      >
        <img
          className="w-[100%] h-[100%] object-cover"
          src={data.image_2.value}
          alt={data.image_2.value}
        />
        <div
          className="bg-gradient-to-t from-transparent to-black w-full h-full absolute"
          style={{
            background: `linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000000 100%)`,
            opacity: `0.6`,
          }}
        ></div>
        <Link
          to={'/products'}
          className="absolute ltr:left-[32px] rtl:right-[32px] bottom-[32px] font-normal text-[#fff] text-[30px] flex justify-center font-bebas tracking-wider leading-[120%]"
        >
          {data.title_2.value}
          <span className="ltr:ml-[8px] rtl:mr-[8px] rtl:scale-x-[-1]">
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.07025 2.25054L2.12057 7.20022"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2.95279 2.12583L7.19526 2.12565L7.19543 6.36847"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </Link>
      </div>
      {/* <div className="w-3/5 relative flex flex-col gt-m:w-full gt-m:h-[165px]">
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
      </div> */}
    </div>
  );
}
