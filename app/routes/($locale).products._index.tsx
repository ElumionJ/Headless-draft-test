import {json, redirect, type LoaderArgs} from '@shopify/remix-oxygen';
import {LuArrowDownUp} from 'react-icons/lu';
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
} from '@shopify/hydrogen/storefront-api-types';
import invariant from 'tiny-invariant';
import {
  Pagination__unstable as Pagination,
  flattenConnection,
  getClientBrowserParameters,
  getPaginationVariables__unstable as getPaginationVariables,
} from '@shopify/hydrogen';
import {useEffect, useRef, useState} from 'react';

import {
  PageHeader,
  Section,
  ProductCard,
  Grid,
  Button,
  SortBy,
} from '~/components';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getImageLoadingPriority} from '~/lib/const';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders, CACHE_SHORT} from '~/data/cache';

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
  const data = await storefront.query<{
    products: ProductConnection;
  }>(ALL_PRODUCTS_QUERY, {
    variables: {
      // ...variables,
      // first: PAGE_BY,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
      ...variablesFromParams,
      ...action,
    },
  });

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
  const {products, varParams, pageInfo, rawParams} =
    useLoaderData<typeof loader>();
  const [productsFiltered, setProductsFiltered] = useState(products);
  const [brands, setBrands] = useState({});
  // const [params, setParams] = useState(varParams);
  const vendorsFilterRef = useRef(null);
  const navigate = useNavigate();
  console.log(rawParams);
  useEffect(() => {
    const brandsArr = products.nodes.reduce((acc, el) => {
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

  useEffect(() => {
    console.log(brands);
  }, [brands]);

  return (
    <>
      <PageHeader heading="All Products" variant="allCollections" />
      <Section>
        <div>
          <Link
            to={`/products?sortKey=${
              varParams.sortKey
            }&reverse=${!varParams.reverse}`}
            reloadDocument
            preventScrollReset
          >
            <LuArrowDownUp />
          </Link>

          <div data-filter>
            <SortBy
              dataLinks={[
                {value: 'TITLE', name: 'Name'},
                {value: 'PRICE', name: 'price'},
              ]}
              linkStr={`/products?reverse=${varParams.reverse}`}
              activeSort={rawParams.sortKey}
            />

            {}
          </div>
        </div>
        <Pagination connection={productsFiltered}>
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
                  <div className="flex justify-center gap-2">
                    <Link
                      to={`/products?sortKey=${varParams.sortKey}&reverse=${
                        varParams.reverse
                      }&cursor=${pageInfo.startCursor || null}&direction=prev`}
                      reloadDocument
                    >
                      PREVIOUS
                    </Link>
                    <Link
                      to={`/products?sortKey=${varParams.sortKey}&reverse=${
                        varParams.reverse
                      }&cursor=${pageInfo.endCursor || null}&direction=next`}
                      reloadDocument
                    >
                      NEXT
                    </Link>
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
  }
  ${PRODUCT_CARD_FRAGMENT}
`;
