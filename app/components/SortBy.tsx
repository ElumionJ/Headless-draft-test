import {Link, useParams} from '@remix-run/react';
import {HiArrowSmDown} from 'react-icons/hi';
import {useRef, useState} from 'react';

import useOutsideClick from '~/hooks/useOutsideClick';

interface Props {
  dataLinks: {value: string; name: string}[];
  linkStr: string;
  activeSort: string;
  isCategoriesPage?: boolean;
}

export const SortBy = ({
  dataLinks,
  linkStr,
  activeSort,
  isCategoriesPage = false,
}: Props) => {
  const [open, setOpen] = useState(false);
  const filterRef = useRef(null);
  useOutsideClick(filterRef, setOpen);
  return (
    <div
      ref={filterRef}
      className="relative  z-30 font-bebas tracking-wider gt-sm:w-full"
    >
      <button
        aria-label="button"
        className={`${
          open ? 'bg-c-red text-[#fff]' : 'bg-c-gray'
        } py-[13px] px-[24px] flex justify-between items-center gap-1 w-[180px] gt-sm:w-full uppercase text-[20px]`}
        onClick={() => setOpen((prevState) => !prevState)}
      >
        {dataLinks.find((el) => el.value === activeSort)?.name || 'SORT BY'}
        <HiArrowSmDown className={`${open && 'rotate-180'} `} />
      </button>
      <ul
        className={`${
          open ? 'block' : 'hidden'
        } absolute top-[100%] left-0 w-full mt-1 shadow`}
      >
        {dataLinks.map((el, i) => (
          <li key={el.value}>
            <Link
              className="w-full block py-[13px] px-[24px] bg-c-gray  hover:bg-slate-200"
              onClick={() => {
                setOpen(false);
              }}
              prefetch="intent"
              to={`${linkStr}${isCategoriesPage ? '&sort' : '&sortKey'}=${
                el.value
              }`}
            >
              {el.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
