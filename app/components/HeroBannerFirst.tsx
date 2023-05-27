interface Props {
  data: {
    [key: string]: {
      value: string;
      key: string;
      type: string;
    };
  };
}

export function HeroBannerFirst({data}: Props) {
  const backgroundStyle = {
    backgroundImage: `url(${data.image.value})`,
    // marginBottom: `${data.margin.value}px`,
    padding: `${data.padding.value}px`,
  };

  return (
    <div className="bannerFirst" style={backgroundStyle}>
      <div className="bannerFirst-block">
        <h1 className="bannerFirst-block-title">{data.title.value}</h1>
        <p className="bannerFirst-block-description">
          {data.description.value}
        </p>
      </div>
    </div>
  );
}
