import {json, type LoaderArgs} from '@shopify/remix-oxygen';
import {Image as ImageComponent} from '@shopify/hydrogen';
import {LuArrowDownUp} from 'react-icons/lu';
import {TfiClose} from 'react-icons/tfi';
import {Link, useLoaderData, useNavigate} from '@remix-run/react';
import type {
  ProductConnection,
  Collection,
  Metaobject,
} from '@shopify/hydrogen/storefront-api-types';
import invariant from 'tiny-invariant';
import {Pagination__unstable as Pagination} from '@shopify/hydrogen';
import {useEffect, useState} from 'react';
import {HiArrowLongDown} from 'react-icons/hi2';
import {HiArrowNarrowUp} from 'react-icons/hi';

import {Section, ProductCard, Grid, SortBy, VendorsFilter} from '~/components';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getImageLoadingPriority} from '~/lib/const';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders, CACHE_SHORT} from '~/data/cache';
import type {Storefront} from '~/lib/type';
import parseMetaobject from '~/helpers/parseMetaobject';

const PAGE_BY = 8;

export const headers = routeHeaders;

export async function loader({request, context: {storefront}}: LoaderArgs) {
  const url = new URL(request.url);
  const paramsObj = Object.fromEntries(url.searchParams.entries());
  const variablesFromParams = {
    sortKey: paramsObj.sortKey || 'TITLE',
    reverse: paramsObj.reverse === 'true',
    // endCursor: paramsObj.cursor || null,
    // startCursor: paramsObj.direction === 'prev' ? paramsObj.cursor : null,
    direction: paramsObj.direction || null,
  };
  // console.log(paramsObj);
  // const variables = getPaginationVariables(request, {pageBy: PAGE_BY});
  const action: any = {};
  if (paramsObj.direction === 'next') {
    action.first = PAGE_BY;
    action.endCursor = paramsObj.cursor;
  } else if (paramsObj.direction === 'prev') {
    action.last = PAGE_BY;
    action.startCursor = paramsObj.cursor;
  } else {
    action.first = PAGE_BY;
  }

  const vendorsQuery = paramsObj.query
    ? `vendor:${paramsObj.query.replaceAll(',', ' OR ')}`
    : null;

  const data = await storefront.query<{
    products: ProductConnection;
    metaobject: Metaobject;
  }>(ALL_PRODUCTS_QUERY, {
    variables: {
      // ...variables,
      // first: PAGE_BY,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
      ...variablesFromParams,
      ...action,
      query: vendorsQuery,
      metaobjectHandle: {
        handle: 'all-products',
        type: 'products_list_page_customize',
      },
    },
  });
  const allProducts = await getAllProducts(storefront);

  const metaObject = await parseMetaobject(data.metaobject, storefront);
  invariant(data, 'No data returned from Shopify API');

  const seoCollection = {
    id: 'all-products',
    title: 'All Products',
    handle: 'products',
    descriptionHtml: 'All the store products',
    description: 'All the store products',
    seo: {
      title: 'All Products',
      description: 'All the store products',
    },
    metafields: [],
    products: data.products,
    updatedAt: '',
  } satisfies Collection;

  const seo = seoPayload.collection({
    collection: seoCollection,
    url: request.url,
  });

  return json(
    {
      customize: metaObject,
      rawUrl: request.url,
      allProducts,
      selectedLocale: storefront.i18n,
      origin: url.origin,
      rawParams: paramsObj,
      varParams: variablesFromParams,
      pageInfo: data.products.pageInfo,
      products: data.products,
      seo,
    },
    {
      headers: {
        'Cache-Control': CACHE_SHORT,
      },
    },
  );
}

export default function AllProducts() {
  const sortKeys = [
    {value: 'TITLE', name: 'Name'},
    {value: 'PRICE', name: 'Price'},
    {value: 'PRODUCT_TYPE', name: 'Type'},
    {value: 'VENDOR', name: 'Brand'},
    {value: 'UPDATED_AT', name: 'Update'},
    {value: 'CREATED_AT', name: 'Date'},
    {value: 'BEST_SELLING', name: 'Trending'},
  ];
  const {
    products,
    varParams,
    pageInfo,
    rawParams,
    allProducts,
    rawUrl,
    customize,
    selectedLocale,
  } = useLoaderData<typeof loader>();

  const [timer, setTimer] = useState<number | null>(null);
  const navigate = useNavigate();
  const [rotate, setRotate] = useState<'180deg' | '0deg'>('0deg');

  const [brands, setBrands] = useState({});
  const [vendorsQuery, setVendorsQuery] = useState<string>(
    rawParams.query || '',
  );
  useEffect(() => {
    const brandsArr = allProducts.reduce((acc, el) => {
      if (acc[el.vendor]) {
        acc[el.vendor].quantity += 1;
      } else {
        acc[el.vendor] = {};
        acc[el.vendor].title = el.vendor;
        acc[el.vendor].quantity = 1;
      }
      return acc;
    }, {});
    setBrands(brandsArr);
  }, [products]);

  const handleVendorClick = (value: string, checked: string) => {
    let newVendors = '';
    if (checked && !vendorsQuery.length) {
      newVendors = `'${value}'`;
    } else if (checked) {
      const splittedVendors = vendorsQuery.split(',');
      const removeIndex = splittedVendors.indexOf(`'${value}'`);
      if (removeIndex >= 0) splittedVendors.splice(removeIndex, 1);
      newVendors = splittedVendors.join(',') + `,'${value}'`;
    } else if (!checked) {
      const splittedVendors = vendorsQuery.split(',');
      const removeIndex = splittedVendors.indexOf(`'${value}'`);
      if (removeIndex > -1) splittedVendors.splice(removeIndex, 1);
      newVendors = splittedVendors.join(',');
    }
    setVendorsQuery(newVendors);
  };
  useEffect(() => {
    setRotate(varParams.reverse ? '0deg' : '180deg');
  }, [varParams.reverse]);

  const handleRemoveVendorOnChip = (e: React.MouseEvent<HTMLButtonElement>) => {
    const splittedVendors = vendorsQuery.split(',');
    const target = e.target as HTMLButtonElement;
    let value = '';
    if (target.value) {
      value = target.value;
    } else {
      value = (target.parentElement as HTMLButtonElement).value!;
    }
    const removeIndex = splittedVendors.indexOf(value);
    splittedVendors.splice(removeIndex, 1);
    const newVendors = splittedVendors.join(',');
    setVendorsQuery(newVendors);
  };

  useEffect(() => {
    if (timer) {
      clearTimeout(timer);
    }

    // Set a new timer to redirect after 2 seconds
    const newTimer = setTimeout(() => {
      if (rawParams.query !== undefined || vendorsQuery.length)
        navigate(
          `${selectedLocale.pathPrefix}/products?sortKey=${varParams.sortKey}&reverse=${varParams.reverse}&query=${vendorsQuery}`,
          {
            preventScrollReset: true,
          },
        );
      // console.log(vendorsQuery);
    }, 2000);

    // Update the timer state
    setTimer(newTimer);
  }, [vendorsQuery]);

  // //Clean up the timer when the component is unmounted
  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);
  return (
    <>
      <header data-header className="relative w-full">
        <ImageComponent
          loading={'lazy'}
          data={customize.title_image.value}
          className="object-cover  h-full fadeIn relative title-bg-shadow max-h-[200px] "
        />
        <div className="absolute z-10 h-full w-full title-bg-shadow flex items-center px-6 md:px-8 lg:px-12 top-0 left-0">
          <h1 className=" font-bebas text-[#fff] tracking-wider text-3xl leading-[120%] uppercase">
            {customize.title.value}
          </h1>
        </div>
      </header>
      <Section>
        <div className=" gt-sm:flex w-full flex gt-sm:gap-1 justify-between items-center border-b-[1px] border-b-[#E0E0E0] pb-[32px] text-black">
          <div className="flex items-center sm:gap-[40px] gt-sm:w-full">
            <VendorsFilter
              url={vendorsQuery || ''}
              click={handleVendorClick}
              vendors={brands}
            />
            <div className="gt-l:hidden flex gap-[16px] flex-wrap max-w-[70%]">
              {vendorsQuery &&
                vendorsQuery.split(',').map((el) => (
                  <span
                    key={el}
                    className="flex p-[8px] gap-[8px]  items-center bg-black text-[#fff] rounded-[2px]"
                  >
                    <span className="font-noto font-bold text-[12px] leading-[150%]">
                      {el.replaceAll("'", '')}
                    </span>
                    <button
                      aria-label="button"
                      data-value={el}
                      value={el}
                      className="text-[11px]"
                      onClick={handleRemoveVendorOnChip}
                    >
                      <TfiClose />
                    </button>
                  </span>
                ))}
            </div>
          </div>
          <div className="flex gap-[16px] items-center gt-sm:w-full">
            <Link
              to={`${selectedLocale.pathPrefix}/products?sortKey=${
                varParams.sortKey
              }&reverse=${!varParams.reverse}&query=${vendorsQuery}`}
              preventScrollReset
              className="gt-sm:hidden flex gap-0"
              style={{
                rotate,
              }}
            >
              <HiArrowLongDown className="ltr:mr-[-4px] rtl:ml-[-4px]" />
              <HiArrowNarrowUp className="ltr:ml-[-4px] rtl:mr-[-4px]" />
            </Link>

            <div data-filter className="gt-sm:w-full">
              <SortBy
                dataLinks={sortKeys}
                linkStr={`${selectedLocale.pathPrefix}/products?reverse=${varParams.reverse}&query=${vendorsQuery}`}
                activeSort={rawParams.sortKey}
              />

              {}
            </div>
          </div>
          <div className="gt-sm:flex hidden w-fit">
            {' '}
            <Link
              to={`${selectedLocale.pathPrefix}/products?sortKey=${
                varParams.sortKey
              }&reverse=${!varParams.reverse}&query=${vendorsQuery}`}
              preventScrollReset
              className=" flex gap-0"
              style={{
                rotate,
              }}
            >
              <HiArrowLongDown className="ltr:mr-[-4px] rtl:ml-[-4px]" />
              <HiArrowNarrowUp className="ltr:ml-[-4px] rtl:mr-[-4px]" />
            </Link>
          </div>
        </div>
        <div className="hidden gt-l:flex gap-[16px] flex-wrap">
          {vendorsQuery &&
            vendorsQuery.split(',').map((el) => (
              <span
                key={el}
                className="flex p-[8px] gap-[8px]  items-center bg-black text-[#fff] rounded-[2px]"
              >
                <span className="font-noto font-bold text-[12px] leading-[150%]">
                  {el.replaceAll("'", '')}
                </span>
                <button
                  aria-label="button"
                  data-value={el}
                  value={el}
                  className="text-[11px]"
                  onClick={handleRemoveVendorOnChip}
                >
                  <TfiClose />
                </button>
              </span>
            ))}
        </div>
        <Pagination connection={products}>
          {({nodes, isLoading, NextLink, PreviousLink}) => {
            const itemsMarkup = nodes.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                loading={getImageLoadingPriority(i)}
              />
            ));

            return (
              <>
                <Grid data-test="product-grid">{itemsMarkup}</Grid>
                <div className="flex items-center justify-center mt-6">
                  <div className="flex justify-center gap-2 font-noto ">
                    {pageInfo.hasPreviousPage && (
                      <Link
                        className="text-[12px] font-bold leading-[150%] hover:text-feature-link-color block w-[100px] px-3 py-1 text-center"
                        to={`${selectedLocale.pathPrefix}/products?sortKey=${
                          varParams.sortKey
                        }&reverse=${varParams.reverse}&cursor=${
                          pageInfo.startCursor || null
                        }&query=${vendorsQuery}&direction=prev`}
                      >
                        PREVIOUS
                      </Link>
                    )}
                    {pageInfo.hasNextPage && (
                      <Link
                        className="text-[12px] font-bold leading-[150%] hover:text-feature-link-color block w-[100px] px-3 py-1 text-center"
                        to={`${selectedLocale.pathPrefix}/products?sortKey=${
                          varParams.sortKey
                        }&reverse=${varParams.reverse}&cursor=${
                          pageInfo.endCursor || null
                        }&query=${vendorsQuery}&direction=next`}
                      >
                        NEXT
                      </Link>
                    )}
                  </div>
                </div>
              </>
            );
          }}
        </Pagination>
      </Section>
    </>
  );
}

const ALL_PRODUCTS_QUERY = `
  #graphql
  query AllProducts(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $query: String
    $metaobjectHandle: MetaobjectHandleInput
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first
      last: $last
      before: $startCursor
      after: $endCursor
      sortKey: $sortKey
      query: $query
      reverse: $reverse
    ) {
      nodes {
        ...ProductCard
        vendor
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
    metaobject(handle: $metaobjectHandle) {
      fields{
        value
        key
        type
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

const LOOP_PRODUCTS_VENDOR_QUERY = `
#graphql
query FetchAllProducts($cursor:String){
  products(first:250, after:$cursor){
    nodes{
      vendor
    }
    pageInfo{
      endCursor
      hasNextPage
    }
  }
}`;

const getAllProducts = async (storefront: Storefront) => {
  const resultArr = [];
  let hasMore = true;
  let localCursor = null;
  while (hasMore) {
    const returnObj = await storefront.query<{
      products: ProductConnection;
    }>(LOOP_PRODUCTS_VENDOR_QUERY, {
      variables: {
        cursor: localCursor,
      },
    });
    resultArr.push(...returnObj.products.nodes);
    hasMore = returnObj.products.pageInfo.hasNextPage;
    localCursor = returnObj.products.pageInfo.endCursor;
  }
  return resultArr;
};
