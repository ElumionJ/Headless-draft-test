import type {Product} from '@shopify/hydrogen/storefront-api-types';

import {ProductCard} from '~/components';
import {Link} from './Link';

interface Data {
  [key: string]: {
    value: string;
    key: string;
    type: string;
  };
}

const mockProducts = new Array(12).fill('');

export function ProductSwimlane({
  title = 'TRY something NEW',
  products = mockProducts,
  count = 12,
  data,
  marginLeftMobile,
  marginLeftDesktop,
  ...props
}: {
  title?: string;
  products?: Product[];
  count?: number;
  data?: Data;
  marginLeftMobile?: number | string;
  marginLeftDesktop?: number | string;
}) {
  const mlMob = marginLeftMobile || '24';
  const mlDesk = marginLeftDesktop || '40';
  return (
    <div
      heading={title}
      // padding="y"
      {...props}
      className=" gt-m:flex-col flex justify-between"
    >
      <div>
        <h2 className="font-bebas leading-[72px] text-[72px] rtl:tracking-normal tracking-widest mb-[64px] mt-[64px] gt-m:mb-[20px] gt-m:mt-[0px] gt-l:text-[48px]">
          {title}
        </h2>
        <div className="relative w-[fit-content] gt-m:mb-[20px]">
          <Link
            className="font-noto font-bold text-[12px] flex items-center tracking-widest rtl:tracking-normal"
            to={'/products'}
          >
            See all products
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
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2.95279 2.12583L7.19526 2.12565L7.19543 6.36847"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
          <div className="absolute bottom-[-4px] left-0 w-full h-[2px] bg-black"></div>
        </div>
      </div>

      <div className="grid w-full snap-x snap-mandatory  grid-flow-col justify-start gap-4 overflow-x-scroll pb-4 hiddenScroll md:pb-8 scroll-px-[10px] md:scroll-px-0 lg:scroll-px-0 md:px-8 lg:px-12  gt-m:w-[100%] gt-m:mb-[60px]">
        {products.map((product) => (
          <ProductCard
            product={product}
            key={product.id}
            className="snap-start w-80"
          />
        ))}
      </div>
    </div>
  );
}
