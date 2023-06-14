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

export function PersonalizeBanner({data}: Props) {
  // const desc = data.description.value;
  // if (desc) {
  //   return <span className="font-noto text-base text-[#333333]">{desc}</span>;
  // } else {
  //   null;
  // }

  return (
    <div
      className={`flex mr-[40px] ml-[40px] gt-m:mr-[15px] gt-m:ml-[15px] ${
        data.revert.value === 'true'
          ? 'flex-row gt-m:flex-col'
          : 'flex-row-reverse gt-m:flex-col-reverse'
      } `}
      style={{marginBottom: `${data.margin.value}px`}}
    >
      <div className="w-2/3 gt-m:w-full relative">
        <img
          src={data.image.value}
          alt={data.title.value}
          className="gt-m:aspect-[3/4] gt-m:object-cover"
        />
        <a
          href="/products"
          className="absolute left-[32px] bottom-[32px] font-normal text-[#fff] text-[30px] flex justify-center font-bebas tracking-wider leading-[120%]"
        >
          I WANT THIS
          <span className="ml-[8px]">
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
        </a>
      </div>

      <div
        className={`flex flex-col mr-[20px] mt-[32px] gt-m:mt-0 w-1/3 gt-m:w-full  ${
          data.revert.value === 'true'
            ? 'ml-[20px] gt-m:mt-[24px]'
            : 'mr-[20px] gt-m:mb-[24px]'
        }`}
      >
        <span className="font-bebas text-[72px] leading-[100%] font-normal gt-l:text-[48px]">
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
