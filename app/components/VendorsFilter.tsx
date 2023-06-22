import {useMatches, useNavigate} from '@remix-run/react';
import {useRef, useState} from 'react';
import {HiArrowSmDown} from 'react-icons/hi';
import {TfiClose} from 'react-icons/tfi';
import {ImArrowUpRight2} from 'react-icons/im';

import useOutsideClick from '~/hooks/useOutsideClick';

interface Props {
  vendors: {
    [key: string]: {
      title: string;
      quantity: number;
    };
  };
  url: string;
  click: (value: string, action: string) => void;
}

export const VendorsFilter = ({vendors, click, url}: Props) => {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const brandsFilterRef = useRef(null);
  const mobileBrandsFilterRef = useRef(null);
  useOutsideClick(brandsFilterRef, setOpen);
  useOutsideClick(mobileBrandsFilterRef, setMobileOpen);

  return (
    <>
      <div ref={brandsFilterRef} className="relative z-30 gt-sm:w-full">
        <button
          className={`${
            open ? 'bg-c-red text-[#fff]' : 'bg-c-gray text-[#000]'
          } uppercase px-[24px] py-[13px] rounded-[100px] flex justify-between font-bebas text-[20px] leading-[110%] tracking-wider gap-1 w-[180px] gt-sm:w-full`}
          onClick={() => {
            setOpen((prevState) => !prevState);
            setMobileOpen((prevState) => !prevState);
          }}
        >
          Brands
          <HiArrowSmDown className={`${open && 'rotate-180'} `} />
        </button>
        <ul
          className={`${
            open ? 'block' : 'hidden'
          } absolute top-full rtl:right-0 left-0 bg-[#fff] w-fit p-[24px] font-noto shadow-darkPopUp mt-[13px] z-30 gt-l:hidden`}
        >
          {vendors &&
            Object.entries(vendors).map((el) => (
              <li key={el[0]} className=" z-30">
                <label
                  htmlFor={`${el[1].title}-desktop`}
                  className=" flex items-center justify-between gap-[60px] py-[8px]"
                >
                  <span className="min-w-[180px] font-noto leading-[150%]">
                    {el[1].title} ({el[1].quantity})
                  </span>
                  <input
                    onChange={(e) => {
                      click(e.target.value, e.target.checked);
                    }}
                    checked={url.includes(el[0])}
                    className="text-[#D80F16]"
                    type="checkbox"
                    value={el[0]}
                    id={`${el[1].title}-desktop`}
                  />
                </label>
              </li>
            ))}
        </ul>
      </div>
      <div
        className={`${
          mobileOpen ? 'gt-l:block' : ' gt-l:hidden'
        } hidden fixed w-full h-full top-0 left-0 bg-[#00000073]  z-40`}
      >
        <div
          ref={mobileBrandsFilterRef}
          className="bg-[#fff] h-full w-[320px] z-40 fixed"
        >
          <div className="flex justify-between items-center py-[24px] px-[15px] text-[20px] font-bebas tracking-wider leading-[130%] border-b-[1px] border-[#E0E0E0]">
            <span>Filter</span>
            <button
              onClick={() => {
                setMobileOpen(false);
              }}
            >
              <TfiClose />
            </button>
          </div>
          <div className="h-[84vh] overflow-y-scroll">
            <h3 className=" uppercase text-[12px] px-[15px]  pt-[24px] font-noto font-bold leading-[150%]">
              Brands
            </h3>
            <ul className="">
              {vendors &&
                Object.entries(vendors).map((el) => (
                  <li key={el[0]} className="">
                    <label
                      htmlFor={`${el[1].title}-mobile`}
                      className=" flex items-center justify-between px-[15px] py-[9px]"
                    >
                      <span className="min-w-[180px] font-noto leading-[150%] text-[14px]">
                        {el[1].title} ({el[1].quantity})
                      </span>
                      <input
                        onChange={(e) => {
                          click(e.target.value, e.target.checked);
                        }}
                        checked={url.includes(el[0])}
                        className="text-[#D80F16]"
                        type="checkbox"
                        value={el[0]}
                        id={`${el[1].title}-mobile`}
                      />
                    </label>
                  </li>
                ))}
            </ul>
          </div>

          <div className="absolute w-full bottom-0 left-0 bg-[#fff] py-[24px] px-[15px] border-t-[1px] border-[#E0E0E0]">
            <button
              onClick={() => {
                setMobileOpen(false);
              }}
              className="flex justify-center items-center gap-2 w-[95%] mx-auto text-[#fff] bg-c-red rounded-[100px] py-[12px]"
            >
              <span className="font-noto font-bold tracking-widest text-[12px] leading-4 ">
                SHOW RESULTS
              </span>
              <ImArrowUpRight2 className="text-[10px] rtl:rotate-[-90deg]" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// const handleCheckboxClick = () => {
//   // Clear the existing timer if there is one

// };
