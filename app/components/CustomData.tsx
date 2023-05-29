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
  return (
    <div
      className={`flex gap-4 ${
        data.revert.value === 'true' ? 'flex-row' : 'flex-row-reverse'
      }`}
    >
      <div>
        <img src={data.image.value} alt={data.name.value} />
      </div>

      <div className="flex flex-col gap-3">
        <span>{data.name.value}</span>
        <span>{data.description.value}</span>
      </div>
    </div>
  );
}
