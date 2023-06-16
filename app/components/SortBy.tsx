import {Link} from '@remix-run/react';
import {HiArrowSmDown} from 'react-icons/hi';
import {useRef, useState} from 'react';

import useOutsideClick from '~/hooks/useOutsideClick';

interface Props {
  dataLinks: {value: string; name: string}[];
  linkStr: string;
  activeSort: string;
}

export const SortBy = ({dataLinks, linkStr, activeSort}: Props) => {
  const [open, setOpen] = useState(false);
  const filterRef = useRef(null);
  useOutsideClick(filterRef, setOpen);
  return (
    <div
      ref={filterRef}
      className="relative  z-20 font-bebas tracking-wider gt-sm:w-full"
    >
      <button
        className="bg-c-gray py-[13px] px-[24px] rounded-[100px] flex justify-between items-center gap-1 w-[180px] gt-sm:w-full uppercase text-[20px]"
        onClick={() => setOpen((prevState) => !prevState)}
      >
        {activeSort || 'SORT BY'}
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
              className="w-full block py-[13px] px-[24px] bg-c-gray hover:bg-slate-200"
              to={`${linkStr}&sortKey=${el.value}`}
            >
              {el.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
