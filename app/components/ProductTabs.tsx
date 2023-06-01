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
  attributes: Attribute[];
  description: string;
  title: string;
}

export const ProductTabs = ({attributes, title, description}: Props) => {
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
      <div className="border-y-[1px] border-[#000]">
        {activeTab === 'description' && (
          <Description
            attributes={attributes}
            description={description}
            title={title}
          />
        )}
      </div>
    </div>
  );
};

function Description({
  attributes,
  description,
  title,
}: {
  attributes: Attribute[];
  description: string;
  title: string;
}) {
  return (
    <div>
      <ul>
        {attributes.map((el) => (
          <li key={el.key.value}>
            <h4>{el.title.value}</h4>
            <p>{el.meaning.value}</p>
          </li>
        ))}
      </ul>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}
