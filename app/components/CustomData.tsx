interface Props {
  data: {
    [key: string]: {
      value: string;
      key: string;
      type: string;
    };
  };
}

export function CustomData({data}: Props) {
  // const desc = data.description.value;
  // if (desc) {
  //   return <span className="font-noto text-base text-[#333333]">{desc}</span>;
  // } else {
  //   null;
  // }

  return (
    <div
      className={`flex gap-4 px-9 ${
        data.revert.value === 'true' ? 'flex-row' : 'flex-row-reverse'
      }`}
      style={{marginBottom: `${data.margin_bottom.value}px`}}
    >
      <div>
        <img src={data.image.value} alt={data.name.value} />
      </div>

      <div className="flex flex-col gap-3 px-6">
        <span className="font-bebas text-[52px]">{data.name.value}</span>
        <span className="font-noto text-base text-[#333333]">
          {data.description.value}
        </span>
        {/* {desc} */}
      </div>
    </div>
  );
}
