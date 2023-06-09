import {json, redirect, type LoaderArgs} from '@shopify/remix-oxygen';
import {Image as ImageComponent} from '@shopify/hydrogen';
import {LuArrowDownUp} from 'react-icons/lu';
import {TfiClose} from 'react-icons/tfi';
import {
  Link,
  useLoaderData,
  useNavigate,
  useParams,
  useSearchParams,
} from '@remix-run/react';
import type {
  ProductConnection,
  Collection,
  PageInfo,
  Metaobject,
  Node,
  Media,
  Image,
} from '@shopify/hydrogen/storefront-api-types';
import invariant from 'tiny-invariant';
import {
  Pagination__unstable as Pagination,
  flattenConnection,
  getClientBrowserParameters,
  getPaginationVariables__unstable as getPaginationVariables,
} from '@shopify/hydrogen';
import {useEffect, useRef, useState} from 'react';
import {useLocation} from 'react-use';

import {
  PageHeader,
  Section,
  ProductCard,
  Grid,
  Button,
  SortBy,
  VendorsFilter,
} from '~/components';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getImageLoadingPriority} from '~/lib/const';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders, CACHE_SHORT} from '~/data/cache';
import type {Storefront} from '~/lib/type';

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
  // const titleImg = await storefront.query<{
  //   node: Node & {image: Image};
  // }>(IMAGE_QUERY, {
  //   variables: {
  //     id: data.metaobject.field?.value,
  //   },
  // });
  // console.log(titleImg.node.image.url);
  const allProducts = await getAllProducts(storefront);

  console.log(data);

  const func = async () => {
    const parsedMetaobject = {};

    await Promise.all(
      data.metaobject.fields.map(async (el) => {
        if (el.type === 'file_reference') {
          const imgUrl = await storefront.query(IMAGE_QUERY, {
            variables: {id: el.value},
          });
          parsedMetaobject[el.key] = {...el, value: imgUrl.node.image};
          return;
        } else if (el.type === 'number_integer') {
          parsedMetaobject[el.key] = {
            ...el,
            value: isNaN(+el.value) ? 0 : +el.value,
          };
          return;
        }
        parsedMetaobject[el.key] = {...el};
      }),
    );
    return parsedMetaobject;
  };
  const metaObject = await func();

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
  const {
    products,
    varParams,
    pageInfo,
    rawParams,
    allProducts,
    rawUrl,
    customize,
  } = useLoaderData<typeof loader>();

  const [timer, setTimer] = useState<number | null>(null);
  const navigate = useNavigate();

  const [brands, setBrands] = useState({});
  const vendorsFilterRef = useRef(null);
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
      console.log(removeIndex);
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
    if (timer) {
      clearTimeout(timer);
    }

    // Set a new timer to redirect after 2 seconds
    const newTimer = setTimeout(() => {
      navigate(
        `/products?sortKey=${varParams.sortKey}&reverse=${varParams.reverse}&query=${vendorsQuery}`,
        {
          preventScrollReset: true,
        },
      );
      console.log(vendorsQuery);
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
          loading={'eager'}
          data={customize.title_image.value}
          className="object-cover h-full fadeIn relative title-bg-shadow "
        />
        <div className="absolute z-10 h-full w-full title-bg-shadow flex items-center pl-[40px] top-0 left-0">
          <h1 className=" font-bebas text-[#fff] tracking-wider text-3xl leading-[120%] uppercase">
            {customize.title.value}
          </h1>
        </div>
      </header>
      <Section>
        <div className="w-full flex justify-between items-center  border-b-[1px] border-b-[#E0E0E0] pb-[32px] text-black">
          <div className="flex items-center gap-[40px]">
            <VendorsFilter
              url={vendorsQuery || ''}
              click={handleVendorClick}
              vendors={brands}
            />
            <div className="flex gap-[16px] flex-wrap max-w-[70%]">
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
                      data-value={el}
                      value={el}
                      className="text-[11px]"
                      onClick={(e) => {
                        // ==== Stoped here
                        const splittedVendors = vendorsQuery.split(',');
                        let value = '';
                        if (e.target.value) {
                          value = e.target.value;
                        } else {
                          value = e.target.parentElement.value;
                        }
                        const removeIndex = splittedVendors.indexOf(value);
                        console.log(e.target.parentElement.value);
                        splittedVendors.splice(removeIndex, 1);
                        const newVendors = splittedVendors.join(',');
                        setVendorsQuery(newVendors);
                      }}
                    >
                      <TfiClose />
                    </button>
                  </span>
                ))}
            </div>
          </div>
          <div className="flex gap-[16px] items-center ">
            <Link
              to={`/products?sortKey=${
                varParams.sortKey
              }&reverse=${!varParams.reverse}&query=${vendorsQuery}`}
              preventScrollReset
            >
              <LuArrowDownUp />
            </Link>

            <div data-filter className="">
              <SortBy
                dataLinks={[
                  {value: 'TITLE', name: 'Name'},
                  {value: 'PRICE', name: 'Price'},
                ]}
                linkStr={`/products?reverse=${varParams.reverse}&query=${vendorsQuery}`}
                activeSort={rawParams.sortKey}
              />

              {}
            </div>
          </div>
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
                <div className="flex items-center justify-center mt-6"></div>
                <Grid data-test="product-grid">{itemsMarkup}</Grid>
                <div className="flex items-center justify-center mt-6">
                  <div className="flex justify-center gap-2 font-noto">
                    {pageInfo.hasPreviousPage && (
                      <Link
                        className="text-[12px] font-bold leading-[150%] hover:text-[#D80F16] block w-[100px] px-3 py-1 text-right"
                        to={`/products?sortKey=${varParams.sortKey}&reverse=${
                          varParams.reverse
                        }&cursor=${
                          pageInfo.startCursor || null
                        }&query=${vendorsQuery}&direction=prev`}
                      >
                        PREVIOUS
                      </Link>
                    )}
                    {pageInfo.hasNextPage && (
                      <Link
                        className="text-[12px] font-bold leading-[150%] hover:text-[#D80F16] block w-[100px] px-3 py-1 text-left"
                        to={`/products?sortKey=${varParams.sortKey}&reverse=${
                          varParams.reverse
                        }&cursor=${
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

const IMAGE_QUERY = `#graphql
query GetImage($id:ID!){
  node(id: $id) {
    id
    ... on MediaImage {
      image {
        url
        altText
        height
        id
        width
      }
    }
  }
}
`;

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
