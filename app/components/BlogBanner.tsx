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

export function BlogBanner({data}: Props) {
  return (
    <>
      <div
        className={`flex ${
          data.revert.value === 'true'
            ? 'flex-row gt-l:flex-col'
            : 'flex-row-reverse gt-l:flex-col-reverse'
        } `}
        style={{marginBottom: `${data.margin.value}px`}}
      >
        <div className="w-2/3 gt-l:w-full relative">
          <Image
            className={`object-cover w-full h-full gt-l:aspect-[3/4] gt-l:object-cover`}
            sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
            data={{url: data.image.value}}
            alt={data.title.value}
            loading={'lazy'}
          />
        </div>

        <div
          className={`flex flex-col gt-l:mt-0 w-1/3 gt-l:w-full bg-[#F3F3F3] p-[40px] sm-maximum:p-[16px] sm-maximum-md:p-[32px] xl:p-[92px]`}
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
            <Link
              className="font-noto font-bold text-[12px] flex items-center tracking-widest text-feature-link-color rtl:tracking-normal"
              to={'/products'}
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
                    stroke="#000"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2.95279 2.12583L7.19526 2.12565L7.19543 6.36847"
                    stroke="#000"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
            <div className="absolute bottom-[-4px] left-0 w-full h-[2px] bg-c-red"></div>
          </div>
        </div>
      </div>
    </>
  );
}
