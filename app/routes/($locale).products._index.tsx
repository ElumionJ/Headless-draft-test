import {json, redirect, type LoaderArgs} from '@shopify/remix-oxygen';
import {LuArrowDownUp} from 'react-icons/lu';
import {
  useLoaderData,
  useNavigate,
  useParams,
  useSearchParams,
} from '@remix-run/react';
import type {
  ProductConnection,
  Collection,
} from '@shopify/hydrogen/storefront-api-types';
import invariant from 'tiny-invariant';
import {
  Pagination__unstable as Pagination,
  getClientBrowserParameters,
  getPaginationVariables__unstable as getPaginationVariables,
} from '@shopify/hydrogen';
import {useEffect, useState} from 'react';

import {PageHeader, Section, ProductCard, Grid, Button} from '~/components';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getImageLoadingPriority} from '~/lib/const';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders, CACHE_SHORT} from '~/data/cache';

const PAGE_BY = 8;

export const headers = routeHeaders;

export async function loader({request, context: {storefront}}: LoaderArgs) {
  const url = new URL(request.url);
  const variables = getPaginationVariables(request, {pageBy: PAGE_BY});
  const data = await storefront.query<{
    products: ProductConnection;
  }>(ALL_PRODUCTS_QUERY, {
    variables: {
      ...variables,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
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
      valuesParams: Object.fromEntries(url.searchParams.entries()),
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
  const {products, valuesParams} = useLoaderData<typeof loader>();
  const [productsFiltered, setProductsFiltered] = useState(products);
  let firstRender = false;
  const [params, setParams] = useState({
    filter: valuesParams.filter || 'name',
    order: valuesParams.order || 'asc',
  });
  const navigate = useNavigate();

  useEffect(() => {
    // const url = getClientBrowserParameters();
    if (valuesParams.filter) {
      setParams({...params, order: valuesParams.filter});
    }
    if (valuesParams.order) {
      setParams({...params, order: valuesParams.order});
    }
    console.log(valuesParams);
    firstRender = true;
  }, []);

  useEffect(() => {
    navigate(`/products?filter=${params.filter}&order=${params.order}`);
  }, [params.filter, params.order, firstRender]);

  return (
    <>
      <PageHeader heading="All Products" variant="allCollections" />
      <Section>
        <div>
          <button
            onClick={() => {
              setParams({
                ...params,
                order: params.order === 'asc' ? 'desc' : 'asc',
              });
            }}
          >
            <LuArrowDownUp />
          </button>
          <select
            name="sort"
            id="sort"
            defaultValue={valuesParams.filter}
            onChange={(e) => {
              setParams({...params, filter: e.target.value});
            }}
          >
            <option value={'price'}>Price</option>
            <option value={'name'}>Name</option>
          </select>
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
                <div className="flex items-center justify-center mt-6">
                  <PreviousLink className="inline-block rounded font-medium text-center py-3 px-6 border border-primary/10 bg-contrast text-primary w-full">
                    {isLoading ? 'Loading...' : 'Previous'}
                  </PreviousLink>
                </div>
                <Grid data-test="product-grid">{itemsMarkup}</Grid>
                <div className="flex items-center justify-center mt-6">
                  <NextLink className="inline-block rounded font-medium text-center py-3 px-6 border border-primary/10 bg-contrast text-primary w-full">
                    {isLoading ? 'Loading...' : 'Next'}
                  </NextLink>
                </div>
              </>
            );
          }}
        </Pagination>
      </Section>
    </>
  );
}

const ALL_PRODUCTS_QUERY = `#graphql
  query AllProducts(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        ...ProductCard
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
