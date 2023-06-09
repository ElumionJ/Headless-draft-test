import {useNavigate, useNavigation} from '@remix-run/react';
import React, {useEffect, useRef, useState} from 'react';
import {HiArrowSmDown} from 'react-icons/hi';

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
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const brandsFilterRef = useRef(null);
  useOutsideClick(brandsFilterRef, setOpen);

  return (
    <div ref={brandsFilterRef} className="relative z-20">
      <button
        className={`${
          open ? 'bg-c-red text-[#fff]' : 'bg-c-gray text-[#000]'
        } uppercase px-[24px] py-[13px] rounded-[100px] flex justify-between font-bebas text-[20px] leading-[110%] tracking-wider gap-1 w-[180px]`}
        onClick={() => {
          setOpen((prevState) => !prevState);
        }}
      >
        Brands
        <HiArrowSmDown className={`${open && 'rotate-180'} `} />
      </button>
      <ul
        className={`${
          open ? 'block' : 'hidden'
        } absolute top-full left-0 bg-[#fff] w-fit p-[24px] font-noto shadow-darkPopUp mt-[13px]`}
      >
        {vendors &&
          Object.entries(vendors).map((el) => (
            <li key={el[0]} className="">
              <label
                htmlFor={el[1].title}
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
                  id={el[1].title}
                />
              </label>
            </li>
          ))}
      </ul>
    </div>
  );
};

// const handleCheckboxClick = () => {
//   // Clear the existing timer if there is one

// };
