import {Button} from './Button';
import {Link} from './Link';

import {Text} from './Text';

interface Props {
  data: {
    [key: string]: {
      value: string;
      key: string;
      type: string;
    };
  };
}

export function HomePageBanner({data}: Props) {
  const backgroundStyle = {
    backgroundImage: `url(${data.image.value})`,
    marginBottom: `${data.margin.value}px`,
    padding: `${data.padding.value}px`,
  };

  return (
    <>
      <div
        className="min-h-[714px] bg-center bg-no-repeat flex flex-col-reverse w-full bg-cover"
        style={backgroundStyle}
      >
        <div className="flex flex-col items-start">
          <h1 className="font-bebas text-white text-[92px] sm-max:text-[56px]">
            {data.title.value}
          </h1>

          <Link
            to={'/products'}
            className="text-white w-[158px] h-[48px] mb-4 uppercase flex items-center justify-center gap-x-2 px-3 py-4  bg-[#D80F16] rounded-[100px] hover:opacity-80 font-noto tracking-widest font-bold  text-[12px] rtl:tracking-normal"
          >
            {data.button.value}
            <span className="rtl:scale-x-[-1]">
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.07025 2.25054L2.12057 7.20022"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2.95279 2.12583L7.19526 2.12565L7.19543 6.36847"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}
