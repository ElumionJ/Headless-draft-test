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
        className=" border-t-[1px] border-[#000] border-solid "
      >
        <button
          data-name="description"
          onClick={handleClick}
          className={`${
            activeTab === 'description'
              ? 'block bg-[#4d4d4d] text-[#f2f2f2]'
              : 'none'
          } w-[280px] text-center py-3 inline-block text-[20px] uppercase`}
        >
          DESCRIPTION
        </button>
        <button
          data-name="shipping"
          onClick={handleClick}
          className={`${
            activeTab === 'shipping'
              ? 'block bg-[#4d4d4d] text-[#f2f2f2]'
              : 'none'
          } w-[280px] text-center py-3 inline-block text-[20px] uppercase`}
        >
          SHIPPING INFORMATION
        </button>
        <button
          data-name="payments"
          onClick={handleClick}
          className={`${
            activeTab === 'payments'
              ? 'block bg-[#4d4d4d] text-[#f2f2f2]'
              : 'none'
          } w-[280px] text-center py-3 inline-block text-[20px] uppercase`}
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
    <div className="flex  gap-[170px] ">
      {attributes?.length > 0 && (
        <div className="min-w-[500px]">
          <h3 className=" text-[24px] uppercase mb-[24px]">
            {attributesTitle}
          </h3>
          <ul className="w-full">
            {attributes?.map((el) => (
              <li
                key={el.key.value}
                className="flex gap-[30px] w-full border-b-[#D0D0D0] border-b-[1px] py-[24px] last:border-b-0"
              >
                <h4 className="min-w-[180px] text-[16px] font-bold leading-[150%]">
                  {el.title.value}
                </h4>
                <p className=" w-full text-[16px] leading-[150%]">
                  {el.meaning.value}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="">
        <h3 className="text-[24px] pb-[24px] uppercase">About {title}</h3>
        <p className="text-[16px] leading-[150%]">{description}</p>
      </div>
    </div>
  );
}

function ShippingInfo({text}: {text: string}) {
  return (
    <div>
      <h3 className="text-[24px] uppercase mb-[24px]">Shipping Info</h3>
      <p className=" text-[16px] leading-[150%]">{text}</p>
    </div>
  );
}
function Payments() {
  return (
    <div>
      <h3 className="text-[24px] uppercase mb-[24px]">Payments</h3>
    </div>
  );
}
