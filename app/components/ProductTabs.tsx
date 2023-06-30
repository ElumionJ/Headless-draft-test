import React, {useState} from 'react';

type ProObj = {
  key: string;
  value: string;
};
interface Attribute {
  key: ProObj;
  meaning: ProObj;
  title: ProObj;
}

interface Props {
  attributes?: Attribute[];
  attributesTitle?: string;
  description: string;
  title: string;
  shippingInfoText: string;
}

export const ProductTabs = ({
  attributes,
  title,
  description,
  attributesTitle,
  shippingInfoText,
}: Props) => {
  type Tabs = 'description' | 'shipping' | 'payments';
  const [activeTab, setActiveTab] = useState<Tabs>('description');
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const activeTab = (e.target as HTMLButtonElement).dataset.name as Tabs;
    setActiveTab(activeTab);
  };
  return (
    <div data-tabs-container>
      <div
        data-tabs-btns
        className=" border-t-[1px] border-[#000] border-solid gt-l:flex-col gt-l:flex"
      >
        <button
          aria-label="Description"
          data-name="description"
          onClick={handleClick}
          className={`${
            activeTab === 'description'
              ? 'block bg-c-red text-[#f2f2f2]'
              : 'none'
          } w-[280px] text-center py-3 inline-block text-[20px] uppercase gt-l:w-full gt-l:text-center gt-l:border-y-[1px] gt-l:border-y-[#00000063] font-bebas tracking-wider leading-[22px]`}
        >
          DESCRIPTION
        </button>
        <button
          aria-label="Shipping information"
          data-name="shipping"
          onClick={handleClick}
          className={`${
            activeTab === 'shipping' ? 'block bg-c-red text-[#f2f2f2]' : 'none'
          } w-[280px] text-center py-3 inline-block text-[20px] uppercase gt-l:w-full gt-l:text-center gt-l:border-y-[1px] gt-l:border-y-[#00000063] font-bebas tracking-wider leading-[22px]`}
        >
          SHIPPING INFORMATION
        </button>
        <button
          aria-label="Payments"
          data-name="payments"
          onClick={handleClick}
          className={`${
            activeTab === 'payments' ? 'block bg-c-red text-[#f2f2f2]' : 'none'
          } w-[280px] text-center py-3 inline-block text-[20px] uppercase gt-l:w-full gt-l:text-center gt-l:border-y-[1px] gt-l:border-y-[#00000063] font-bebas tracking-wider leading-[22px]`}
        >
          Payments
        </button>
      </div>
      <div className="border-y-[1px] border-[#000] min-h-[360px] py-[50px]">
        {activeTab === 'description' && (
          <Description
            attributes={attributes}
            description={description}
            title={title}
            attributesTitle={attributesTitle}
          />
        )}
        {activeTab === 'shipping' && <ShippingInfo text={shippingInfoText} />}
        {activeTab === 'payments' && <Payments />}
      </div>
    </div>
  );
};

function Description({
  attributes = [],
  description,
  title,
  attributesTitle,
}: {
  attributes?: Attribute[];
  attributesTitle?: string;
  description: string;
  title: string;
}) {
  return (
    <div className="flex  gap-[170px] gt-l:flex-col gt-l:gap-[40px]">
      {attributes?.length > 0 && (
        <div className="min-w-[500px] gt-l:w-full gt-l:min-w-0">
          <h2 className=" text-[24px] uppercase mb-[24px] font-bebas">
            {attributesTitle}
          </h2>
          <ul className="w-full">
            {attributes?.map((el) => (
              <li
                key={el.key.value}
                className="flex gap-[30px] w-full border-b-[#D0D0D0] border-b-[1px] py-[24px] last:border-b-0 gt-m:grid gt-m:grid-cols-2"
              >
                <h3 className="min-w-[180px] gt-l:w-full gt-l:text-[14px] gt-l:min-w-0 text-[16px] font-bold leading-[150%] font-noto">
                  {el.title.value}
                </h3>
                <p className=" w-full text-[16px] gt-l:text-[14px] leading-[150%] font-noto">
                  {el.meaning.value}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="">
        <h2 className="text-[24px] pb-[24px] uppercase font-bebas">
          About {title}
        </h2>
        <p className="text-[16px] leading-[150%] font-noto">{description}</p>
      </div>
    </div>
  );
}

function ShippingInfo({text}: {text: string}) {
  return (
    <div className=" gt-l:w-full">
      <h3 className="text-[24px] uppercase mb-[24px] font-bebas">
        Shipping Info
      </h3>
      <p className=" text-[16px] leading-[150%] gt-l:text-[14px] font-noto">
        {text}
      </p>
    </div>
  );
}
function Payments() {
  return (
    <div>
      <h3 className="text-[24px] uppercase mb-[24px] font-bebas">Payments</h3>
    </div>
  );
}
