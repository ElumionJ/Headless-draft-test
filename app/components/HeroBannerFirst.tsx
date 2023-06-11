import {Button} from './Button';

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
    marginBottom: `${data.margin.value}px`,
    padding: `${data.padding.value}px`,
  };

  return (
    <>
      <div className="bannerFirst" style={backgroundStyle}>
        <div className="flex flex-col">
          <h1 className="font-bebas text-white text-[92px]">
            {data.title.value}
          </h1>

          <Button
            as="span"
            width="full"
            className="text-white mb-4 uppercase flex items-center justify-center gap-x-2 px-3 py-4  bg-[#D80F16] rounded-[100px] w-full hover:opacity-80"
          >
            Shop now
            <svg
              width="11"
              height="10"
              viewBox="0 0 11 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.45672 2.20542L3.44174 7.9394"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.38001 2.79731L7.55799 2.06044L8.29492 6.23877"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </div>
      </div>
    </>
  );
}
