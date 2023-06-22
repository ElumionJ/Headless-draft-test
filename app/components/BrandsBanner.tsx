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

export function BrandsBanner({data}: Props) {
  return (
    <div
      className="flex gt-m:flex-col w-[100%] justify-center pl-[40px] pr-[40px] gt-l:pl-[0px] gt-l:pr-[0px] gt-m:p-0"
      style={{marginBottom: `${data.margin.value}px`}}
    >
      <Link
        to={'/products'}
        className="w-2/5 ltr:mr-[20px] rtl:ml-[20px] relative flex flex-col-reverse gt-m:w-full gt-m:h-[165px] brandBlock"
      >
        <Image
          className={`w-[100%] h-[100%] object-cover`}
          sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
          data={{url: data.image_1.value}}
          alt={data.title_1.value}
          loading={'lazy'}
        />
        <div
          className="bg-gradient-to-t from-transparent to-black w-full h-full absolute"
          style={{
            background: `linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000000 100%)`,
            opacity: `0.6`,
          }}
        ></div>
        <span className="absolute ltr:left-[32px] rtl:right-[32px] bottom-[32px] font-normal text-[#fff] text-[30px] flex justify-center font-bebas tracking-wider leading-[120%]">
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
        </span>
      </Link>

      <Link
        to={'/products'}
        className="w-3/5 relative flex flex-col-reverse gt-m:w-full gt-m:h-[165px] brandBlock"
      >
        <Image
          className={`w-[100%] h-[100%] object-cover`}
          sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
          data={{url: data.image_2.value}}
          alt={data.title_2.value}
          loading={'lazy'}
        />
        <div
          className="bg-gradient-to-t from-transparent to-black w-full h-full absolute"
          style={{
            background: `linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000000 100%)`,
            opacity: `0.6`,
          }}
        ></div>
        <span className="absolute ltr:left-[32px] rtl:right-[32px] bottom-[32px] font-normal text-[#fff] text-[30px] flex justify-center font-bebas tracking-wider leading-[120%]">
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
        </span>
      </Link>
    </div>
  );
}
