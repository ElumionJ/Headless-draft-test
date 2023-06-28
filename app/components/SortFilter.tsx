import type {SyntheticEvent} from 'react';
import {useEffect, useMemo, useRef, useState} from 'react';
import type {Location} from '@remix-run/react';
import {
  Link,
  useLocation,
  useSearchParams,
  useNavigate,
} from '@remix-run/react';
import {useDebounce} from 'react-use';
import type {
  FilterType,
  Filter,
  Collection,
} from '@shopify/hydrogen/storefront-api-types';
import {HiArrowNarrowUp, HiArrowSmDown} from 'react-icons/hi';
import {TfiClose} from 'react-icons/tfi';
import {HiArrowLongDown} from 'react-icons/hi2';
import {ImArrowUpRight2} from 'react-icons/im';

import {Text, SortBy} from '~/components';
import useOutsideClick from '~/hooks/useOutsideClick';

export type AppliedFilter = {
  label: string;
  urlParam: {
    key: string;
    value: string;
  };
};

export type SortParam = 'price' | 'best-selling' | 'newest' | 'featured';

type Props = {
  filters: Filter[];
  appliedFilters?: AppliedFilter[];
  children: React.ReactNode;
  collections?: Collection[];
};

export function SortFilter({
  filters,
  appliedFilters = [],
  children,
  collections = [],
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const itemsCount = children?.props.collection.products.nodes.length;
  const sortByRef = useRef(null);
  useOutsideClick(sortByRef, setIsOpen);
  const location = useLocation();
  const [params] = useSearchParams();
  const [rotate, setRotate] = useState<'180deg' | '0deg'>('0deg');

  useEffect(() => {
    setRotate(params.get('reverse') === 'true' ? '0deg' : '180deg');
  }, [params]);

  const getLinkReverseSort = (location: Location, params: URLSearchParams) => {
    const clonedParams = new URLSearchParams(params);
    const reverse = clonedParams.get('reverse') || 'false';
    clonedParams.delete('reverse');
    clonedParams.append('reverse', reverse === 'true' ? 'false' : 'true');
    return `${location.pathname}?${clonedParams.toString()}`;
  };
  return (
    <>
      <div className="flex flex-col w-full gap-3">
        <div className="sm-maximum:grid sm-maximum:grid-cols-2 flex items-center justify-between w-full">
          <div className="flex items-center sm:gap-[40px]">
            <div
              className="relative sm-maximum:static sm-maximum:w-full"
              ref={sortByRef}
            >
              <button
                className={`${
                  isOpen ? 'bg-c-red text-[#fff]' : 'bg-c-gray'
                } py-[13px] px-[24px] rounded-[100px] flex justify-between font-bebas items-center gap-1 w-[180px] gt-sm:w-full uppercase text-[20px] `}
                onClick={() => {
                  setIsOpen((prev) => !prev);
                }}
              >
                Filter by
                <HiArrowSmDown className={`${isOpen && 'rotate-180'} `} />
              </button>
              <div
                className={`${
                  isOpen ? 'block' : 'hidden'
                } absolute top-full rtl:right-0 left-0 bg-[#fff] w-full p-[24px] font-noto shadow-darkPopUp mt-[13px] z-30 sm-maximum:fixed sm-maximum:z-50 sm-maximum:w-[320px] sm-maximum:left-0 sm-maximum:h-full sm-maximum:mt-auto sm-maximum:top-0 sm-maximum:p-0`}
              >
                <FiltersDrawer
                  collections={collections}
                  filters={filters}
                  appliedFilters={appliedFilters}
                  setOpen={setIsOpen}
                />
              </div>
            </div>
            <div className="sm-maximum:hidden">
              <AppliedFilters filters={appliedFilters} />
            </div>
          </div>
          <div className="flex gap-[16px] items-center sm-maximum:w-full ">
            <Link
              to={getLinkReverseSort(location, params)}
              prefetch="intent"
              className="gt-sm:hidden flex gap-0"
              style={{
                rotate,
              }}
            >
              <HiArrowLongDown className="ltr:mr-[-4px] rtl:ml-[-4px]" />
              <HiArrowNarrowUp className="ltr:ml-[-4px] rtl:mr-[-4px]" />
            </Link>
            <SortMenu itemsCount={itemsCount} />
          </div>
        </div>

        <div className="sm-maximum:block hidden ">
          <AppliedFilters filters={appliedFilters} />
        </div>
      </div>
      <div className="flex flex-col flex-wrap md:flex-row">
        <div className="flex-1">{children}</div>
      </div>
    </>
  );
}

export function FiltersDrawer({
  filters = [],
  appliedFilters = [],
  collections = [],
  setOpen,
}: {
  filters: Filter[];
  appliedFilters: AppliedFilter[];
  collections: Collection[];
  setOpen?: (state: boolean) => void;
}) {
  const [params] = useSearchParams();
  const location = useLocation();

  const filterMarkup = (filter: Filter, option: Filter['values'][0]) => {
    switch (filter.type) {
      case 'PRICE_RANGE':
        const min =
          params.has('minPrice') && !isNaN(Number(params.get('minPrice')))
            ? Number(params.get('minPrice'))
            : undefined;

        const max =
          params.has('maxPrice') && !isNaN(Number(params.get('maxPrice')))
            ? Number(params.get('maxPrice'))
            : undefined;

        return <PriceRangeFilter min={min} max={max} />;

      default:
        const to = getFilterLink(
          filter,
          option.input as string,
          params,
          location,
        );
        return (
          <Link className="block font-noto py-1" prefetch="intent" to={to}>
            {option.label}
          </Link>
        );
    }
  };

  const collectionsMarkup = collections.map((collection) => {
    return (
      <li key={collection.handle} className="pb-4">
        <Link
          to={`/collections/${collection.handle}`}
          className="focus:underline hover:underline"
          key={collection.handle}
          prefetch="intent"
        >
          {collection.title}
        </Link>
      </li>
    );
  });

  return (
    <>
      <nav className="">
        <div className="sm-minimum:hidden flex justify-between items-center py-[24px] px-[15px] text-[20px] font-bebas tracking-wider leading-[130%] border-b-[1px] border-[#E0E0E0]">
          <span>Filter</span>
          <button
            onClick={() => {
              setOpen!(false);
            }}
          >
            <TfiClose />
          </button>
        </div>
        <div className="sm-maximum:px-[15px] sm-maximum:py-6">
          {filters.map(
            (filter: Filter) =>
              filter.values.length > 1 && (
                <div key={filter.id} className="w-full pb-2">
                  <div className="flex justify-between w-full ">
                    <Text
                      size="lead"
                      className="font-bebas uppercase tracking-wider "
                    >
                      {filter.label}
                    </Text>
                  </div>
                  <ul key={filter.id} className=" pl-[8px]">
                    {filter.values?.map((option) => {
                      return (
                        <li
                          key={option.id}
                          className="h-fit w-full hover:underline"
                        >
                          {filterMarkup(filter, option)}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ),
          )}
        </div>
        <div className="sm-minimum:hidden absolute w-full bottom-0 left-0 bg-[#fff] py-[24px] px-[15px] border-t-[1px] border-[#E0E0E0]">
          <button
            onClick={() => {
              setOpen!(false);
            }}
            className="flex justify-center items-center gap-2 w-[95%] mx-auto text-[#fff] bg-c-red rounded-[100px] py-[12px]"
          >
            <span className="font-noto font-bold tracking-widest text-[12px] leading-4 ">
              SHOW RESULTS
            </span>
            <ImArrowUpRight2 className="text-[10px] rtl:rotate-[-90deg]" />
          </button>
        </div>
      </nav>
    </>
  );
}

function AppliedFilters({filters = []}: {filters: AppliedFilter[]}) {
  const [params] = useSearchParams();
  const location = useLocation();

  return (
    <>
      {/* <Heading as="h4" size="lead" className="pb-4">
        Applied filters
      </Heading> */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter: AppliedFilter) => {
          return (
            <Link
              to={getAppliedFilterLink(filter, params, location)}
              className="flex p-[8px] gap-[8px]  items-center bg-black text-[#fff] rounded-[2px]"
              key={`${filter.label}-${filter.urlParam}`}
            >
              <span className="font-noto font-bold text-[12px] leading-[150%]">
                {filter.label}
              </span>
              <span className="text-[11px]">
                <TfiClose />
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

function getAppliedFilterLink(
  filter: AppliedFilter,
  params: URLSearchParams,
  location: Location,
) {
  const paramsClone = new URLSearchParams(params);
  if (filter.urlParam.key === 'variantOption') {
    const variantOptions = paramsClone.getAll('variantOption');
    const filteredVariantOptions = variantOptions.filter(
      (options) => !options.includes(filter.urlParam.value),
    );
    paramsClone.delete(filter.urlParam.key);
    for (const filteredVariantOption of filteredVariantOptions) {
      paramsClone.append(filter.urlParam.key, filteredVariantOption);
    }
  } else {
    paramsClone.delete(filter.urlParam.key);
  }
  return `${location.pathname}?${paramsClone.toString()}`;
}

function getSortLink(
  sort: SortParam,
  params: URLSearchParams,
  location: Location,
) {
  params.set('sort', sort);
  return `${location.pathname}?${params.toString()}`;
}

function getFilterLink(
  filter: Filter,
  rawInput: string | Record<string, any>,
  params: URLSearchParams,
  location: ReturnType<typeof useLocation>,
) {
  const paramsClone = new URLSearchParams(params);
  const newParams = filterInputToParams(filter.type, rawInput, paramsClone);
  return `${location.pathname}?${newParams.toString()}`;
}

const PRICE_RANGE_FILTER_DEBOUNCE = 500;

function PriceRangeFilter({max, min}: {max?: number; min?: number}) {
  const location = useLocation();
  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const navigate = useNavigate();

  const [minPrice, setMinPrice] = useState(min ? String(min) : '');
  const [maxPrice, setMaxPrice] = useState(max ? String(max) : '');

  useDebounce(
    () => {
      if (
        (minPrice === '' || minPrice === String(min)) &&
        (maxPrice === '' || maxPrice === String(max))
      )
        return;

      const price: {min?: string; max?: string} = {};
      if (minPrice !== '') price.min = minPrice;
      if (maxPrice !== '') price.max = maxPrice;

      const newParams = filterInputToParams('PRICE_RANGE', {price}, params);
      navigate(`${location.pathname}?${newParams.toString()}`);
    },
    PRICE_RANGE_FILTER_DEBOUNCE,
    [minPrice, maxPrice],
  );

  const onChangeMax = (event: SyntheticEvent) => {
    const newMaxPrice = (event.target as HTMLInputElement).value;
    setMaxPrice(newMaxPrice);
  };

  const onChangeMin = (event: SyntheticEvent) => {
    const newMinPrice = (event.target as HTMLInputElement).value;
    setMinPrice(newMinPrice);
  };

  return (
    <div className="flex flex-col">
      <label className="mb-4">
        <span>from</span>
        <input
          name="maxPrice"
          className="text-black"
          type="text"
          defaultValue={min}
          placeholder={'$'}
          onChange={onChangeMin}
        />
      </label>
      <label>
        <span>to</span>
        <input
          name="minPrice"
          className="text-black"
          type="number"
          defaultValue={max}
          placeholder={'$'}
          onChange={onChangeMax}
        />
      </label>
    </div>
  );
}

function filterInputToParams(
  type: FilterType,
  rawInput: string | Record<string, any>,
  params: URLSearchParams,
) {
  const input = typeof rawInput === 'string' ? JSON.parse(rawInput) : rawInput;
  switch (type) {
    case 'PRICE_RANGE':
      if (input.price.min) params.set('minPrice', input.price.min);
      if (input.price.max) params.set('maxPrice', input.price.max);
      break;
    case 'LIST':
      Object.entries(input).forEach(([key, value]) => {
        if (typeof value === 'string') {
          params.set(key, value);
        } else if (typeof value === 'boolean') {
          params.set(key, value.toString());
        } else {
          const {name, value: val} = value as {name: string; value: string};
          const allVariants = params.getAll(`variantOption`);
          const newVariant = `${name}:${val}`;
          if (!allVariants.includes(newVariant)) {
            params.append('variantOption', newVariant);
          }
        }
      });
      break;
  }

  return params;
}

export default function SortMenu({itemsCount}: {itemsCount: number}) {
  const items: {name: string; value: SortParam}[] = [
    {name: 'Featured', value: 'featured'},
    {
      name: 'Price',
      value: 'price',
    },
    {
      name: 'Best Selling',
      value: 'best-selling',
    },
    {
      name: 'Newest',
      value: 'newest',
    },
  ];
  const [params] = useSearchParams();
  // `${selectedLocale.pathPrefix}/products?reverse=${varParams.reverse}&query=${vendorsQuery}`
  const location = useLocation();
  // const activeItem = items.find((item) => item.key === params.get('sort'));
  return (
    <>
      {itemsCount > 0 ? (
        <div className="flex items-center sm-maximum:w-full">
          <SortBy
            isCategoriesPage={true}
            dataLinks={items}
            linkStr={`${location.pathname}`}
            activeSort={params.get('sort') || 'newest'}
          />
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
