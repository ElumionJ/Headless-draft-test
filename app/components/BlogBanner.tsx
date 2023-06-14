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

export function BlogBanner({data}: Props) {
  // const desc = data.description.value;
  // if (desc) {
  //   return <span className="font-noto text-base text-[#333333]">{desc}</span>;
  // } else {
  //   null;
  // }

  return (
    <>
      <div
        className={`flex ${
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
            className="object-cover w-full h-full gt-m:aspect-[3/4] gt-m:object-cover"
          />
        </div>

        <div
          className={`flex flex-col gt-m:mt-0 w-1/3 gt-m:w-full bg-[#F3F3F3] p-[92px] gt-m:p-[15px] ${
            data.revert.value === 'true' ? 'gt-m:mt-[24px]' : 'gt-m:mb-[24px]'
          }`}
        >
          <span className="font-bebas mb-[16px] text-[32px] leading-[100%] font-normal gt-l:text-[48px] gt-m:text-[20px]">
            {data.title.value}
          </span>
          {data.description.value && (
            <span className="font-noto text-base text-[#333333] mb-[24px]">
              {data.description.value}
            </span>
          )}

          <div className="relative w-[fit-content] gt-m:mb-[20px]">
            <a
              className="font-noto font-bold text-[12px] flex items-center tracking-widest text-[#D80F16]"
              href="/products"
            >
              SEE ALL PRODUCTS
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
                    stroke="#D80F16"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2.95279 2.12583L7.19526 2.12565L7.19543 6.36847"
                    stroke="#D80F16"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </a>
            <div className="absolute bottom-[-4px] left-0 w-full h-[2px] bg-[#D80F16]"></div>
          </div>
        </div>
      </div>
    </>
  );
}
