import React from 'react';
import {Image} from '@shopify/hydrogen';

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

export function PersonalizeBanner({data}: Props) {
  return (
    <div
      className={`flex  gt-m:mr-[15px] gt-m:ml-[15px] ml-[40px] mr-[40px] sm-maximum:ml-[16px] sm-maximum:mr-[16px] sm-maximum-md:ml-[32px] sm-maximum-md:mr-[32px] ${
        data.revert.value === 'true'
          ? 'flex-row gt-m:flex-col'
          : 'flex-row-reverse gt-m:flex-col-reverse'
      } `}
      style={{marginBottom: `${data.margin.value}px`}}
    >
      <div className="w-2/3 gt-m:w-full relative">
        <Image
          className={`gt-m:aspect-[3/4] gt-m:object-cover w-full`}
          sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
          data={{url: data.image.value}}
          alt={data.title.value}
          loading={'lazy'}
        />
        <Link
          to={'/products'}
          className="absolute ltr:left-[32px] rtl:right-[32px] bottom-[32px] font-normal text-[#fff] text-[30px] flex justify-center font-bebas tracking-wider leading-[120%]"
        >
          {data.button.value}
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
        className={`flex flex-col mr-[20px] rtl:ml-[20px] rtl:mr-[0px] mt-[32px] gt-m:mt-0 w-1/3 gt-m:w-full  ${
          data.revert.value === 'true'
            ? 'ml-[20px] gt-m:mt-[24px]'
            : 'mr-[20px] gt-m:mb-[24px]'
        }`}
      >
        <span className="font-bebas text-[72px] leading-[100%] font-normal gt-xl:text-[48px] ">
          {data.title.value}
        </span>
        {/* {data.description.value && (
          <span className="font-noto text-base text-[#333333]">
            {data.description.value}
          </span>
        )} */}

        {/* {desc} */}
      </div>
    </div>
  );
}
