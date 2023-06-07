import React, {useRef, useState} from 'react';

import useOutsideClick from '~/hooks/useOutsideClick';

interface Props {
  vendors: {
    [key: string]: {
      title: string;
      quantity: number;
    };
  };
}

export const VendorsFilter = ({vendors}: Props) => {
  const [open, setOpen] = useState(false);
  const brandsFilterRef = useRef(null);
  useOutsideClick(brandsFilterRef, setOpen);
  return (
    <div ref={brandsFilterRef}>
      <button
        className="uppercase"
        onClick={() => {
          setOpen((prevState) => !prevState);
        }}
      >
        Brands
      </button>
      <ul  className={`${open ? 'block' : 'hidden'}`}>
        <li>AAA</li>
        <li>AAA</li>
        <li>AAA</li>
        <li>AAA</li>
      </ul>
    </div>
  );
};
