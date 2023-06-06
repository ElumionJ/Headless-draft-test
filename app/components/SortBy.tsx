import {Link} from '@remix-run/react';
import React, {useEffect, useRef, useState} from 'react';

interface Props {
  dataLinks: {value: string; name: string}[];
  linkStr: string;
  activeSort: string;
}

export const SortBy = ({dataLinks, linkStr, activeSort}: Props) => {
  const [open, setOpen] = useState(false);
  const filterRef = useRef(null);
  useOutsideAlerter(filterRef, setOpen);
  return (
    <div ref={filterRef} className="relative">
      <button onClick={() => setOpen(true)}>{activeSort || 'SORT BY'}</button>
      <ul className={`${open ? 'block' : 'hidden'} absolute top-[100%] left-0`}>
        {dataLinks.map((el, i) => (
          <li key={el.value}>
            <Link reloadDocument to={`${linkStr}&sortKey=${el.value}`}>
              {el.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

function useOutsideAlerter(
  ref: React.MutableRefObject<HTMLElement | null>,
  setState: (bool: boolean) => void,
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLButtonElement;
      if (ref.current && !ref.current.contains(target)) {
        setState(false);
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);
}
