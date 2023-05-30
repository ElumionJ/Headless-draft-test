import React from 'react';

interface Props {
  quantity: number;
  changeQuantity: (action: 'plus' | 'minus') => void;
}

export function ProductQuantity({quantity, changeQuantity}: Props) {
  return (
    <div className="flex w-fit items-center gap-2 border-[1px] border-[#000]">
      <button
        type="button"
        data-minus
        className="relative p-4 after:absolute after:top-1/2 after:left-1/2 after:bg-[#000] after:w-3 after:translate-x-[-50%] after:translate-y-[-50%] after:h-0.5 after:rounded"
        onClick={() => {
          changeQuantity('minus');
        }}
      ></button>

      <span data-quantity className="">
        {quantity}
      </span>
      <button
        type="button"
        data-plus
        className="relative p-4 after:absolute after:top-1/2 after:left-1/2 after:bg-[#000] after:w-3 after:translate-x-[-50%] after:translate-y-[-50%] after:h-0.5 after:rounded before:absolute before:top-1/2 before:left-1/2 before:bg-[#000] before:h-0.5 before:w-3 before:translate-x-[-50%] before:translate-y-[-50%] before:rounded before:rotate-90"
        onClick={() => {
          changeQuantity('plus');
        }}
      ></button>
    </div>
  );
}
