import {json, type LoaderArgs} from '@shopify/remix-oxygen';
import {useLoaderData, useMatches} from '@remix-run/react';
import type {
  Collection as CollectionType,
  CollectionConnection,
  Filter,
  Metaobject,
} from '@shopify/hydrogen/storefront-api-types';
import {flattenConnection, AnalyticsPageType} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';
import {Image as ImageComponent} from '@shopify/hydrogen';

import {PageHeader, Section, Text, SortFilter, Link} from '~/components';
import {ProductGrid} from '~/components/ProductGrid';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {CACHE_SHORT, routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';
import type {AppliedFilter, SortParam} from '~/components/SortFilter';
import parseMetaobject from '~/helpers/parseMetaobject';

export const headers = routeHeaders;

const PAGINATION_SIZE = 48;

type VariantFilterParam = Record<string, string | boolean>;
type PriceFiltersQueryParam = Record<'price', {max?: number; min?: number}>;
type VariantOptionFiltersQueryParam = Record<
  'variantOption',
  {name: string; value: string}
>;
type FiltersQueryParams = Array<
  VariantFilterParam | PriceFiltersQueryParam | VariantOptionFiltersQueryParam
>;

export async function loader({params, request, context}: LoaderArgs) {
  const {collectionHandle} = params;

  invariant(collectionHandle, 'Missing collectionHandle param');

  const searchParams = new URL(request.url).searchParams;
  const knownFilters = ['productVendor', 'productType'];
  const available = 'available';
  const variantOption = 'variantOption';
  const {sortKey, reverse} = getSortValuesFromParam(
    searchParams.get('sort') as SortParam,
  );
  const cursor = searchParams.get('cursor');
  const filters: FiltersQueryParams = [];
  const appliedFilters: AppliedFilter[] = [];

  for (const [key, value] of searchParams.entries()) {
    if (available === key) {
      filters.push({available: value === 'true'});
      appliedFilters.push({
        label: value === 'true' ? 'In stock' : 'Out of stock',
        urlParam: {
          key: available,
          value,
        },
      });
    } else if (knownFilters.includes(key)) {
      filters.push({[key]: value});
      appliedFilters.push({label: value, urlParam: {key, value}});
    } else if (key.includes(variantOption)) {
      const [name, val] = value.split(':');
      filters.push({variantOption: {name, value: val}});
      appliedFilters.push({label: val, urlParam: {key, value}});
    }
  }

  // Builds min and max price filter since we can't stack them separately into
  // the filters array. See price filters limitations:
  // https://shopify.dev/custom-storefronts/products-collections/filter-products#limitations
  if (searchParams.has('minPrice') || searchParams.has('maxPrice')) {
    const price: {min?: number; max?: number} = {};
    if (searchParams.has('minPrice')) {
      price.min = Number(searchParams.get('minPrice')) || 0;
      appliedFilters.push({
        label: `Min: $${price.min}`,
        urlParam: {key: 'minPrice', value: searchParams.get('minPrice')!},
      });
    }
    if (searchParams.has('maxPrice')) {
      price.max = Number(searchParams.get('maxPrice')) || 0;
      appliedFilters.push({
        label: `Max: $${price.max}`,
        urlParam: {key: 'maxPrice', value: searchParams.get('maxPrice')!},
      });
    }
    filters.push({
      price,
    });
  }

  const {collection, collections, metaobject} = await context.storefront.query<{
    collection: CollectionType;
    collections: CollectionConnection;
    metaobject: Metaobject;
  }>(COLLECTION_QUERY, {
    variables: {
      handle: collectionHandle,
      pageBy: PAGINATION_SIZE,
      cursor,
      filters,
      sortKey,
      reverse,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  const customizeObject = await parseMetaobject(metaobject, context.storefront);
  if (!collection) {
    throw new Response('collection', {status: 404});
  }

  const collectionNodes = flattenConnection(collections);
  const bannerImg = await context.storefront.query(BANNER_IMAGE_QUERY, {
    variables: {
      id: collection.metafield?.value,
    },
  });
  // console.log(await bannerImg);
  const seo = seoPayload.collection({collection, url: request.url});

  return json(
    {
      bannerImg,
      collection,
      appliedFilters,
      collections: collectionNodes,
      analytics: {
        pageType: AnalyticsPageType.collection,
        collectionHandle,
        resourceId: collection.id,
      },
      seo,
    },
    {
      headers: {
        'Cache-Control': CACHE_SHORT,
      },
    },
  );
}

export default function Collection() {
  const {collection, collections, appliedFilters, bannerImg} =
    useLoaderData<typeof loader>();
  return (
    <>
      <div className="relative pt-[20px] h-[200px] flex items-center">
        <ImageComponent
          className=" z-[-1] w-full h-full object-cover banner-shadow"
          data={bannerImg.node.previewImage}
        />
        <h1 className=" px-[48px] z-3 text-[#fff] font-bebas text-[32px] leading-[120%] tracking-wider uppercase ">
          {collection.title}
        </h1>
      </div>
      {collection?.description && (
        <div className=" px-[48px] mt-[32px] text-[16px] font-noto leading-[150%] text-[#333] flex items-baseline justify-between w-full">
          <div>
            <Text format width="narrow" as="p" className="inline-block">
              {collection.description}
            </Text>
          </div>
        </div>
      )}
      <Section>
        <SortFilter
          filters={collection.products.filters as Filter[]}
          appliedFilters={appliedFilters}
          collections={collections as CollectionType[]}
        >
          <ProductGrid
            key={collection.id}
            collection={collection as CollectionType}
            url={`/collections/${collection.handle}`}
            data-test="product-grid"
          />
        </SortFilter>
      </Section>
    </>
  );
}

const COLLECTION_QUERY = `#graphql
  query CollectionDetails(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $pageBy: Int!
    $cursor: String
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys!
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    metaobject(
      handle: {handle: "collections-all-customize", type: "collections_all_customize"}
    ) {
      fields{
        key
        value
        type
      }
    }
    collection(handle: $handle) {
      metafield(namespace: "categories", key: "banner"){
        value
      }
      id
      handle
      title
      description
      seo {
        description
        title
      }
      image {
        id
        url
        width
        height
        altText
      }
      products(
        first: $pageBy,
        after: $cursor,
        filters: $filters,
        sortKey: $sortKey,
        reverse: $reverse
      ) {
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        nodes {
          ...ProductCard
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
    collections(first: 100) {
      edges {
        node {
          title
          handle
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

const BANNER_IMAGE_QUERY = `
#graphql
query GetBannerImage($id:ID!) {
  node(id: $id) {
    id
    ... on Media {
      previewImage {
        url
        height
        width
        altText
      }
    }
  }
}`;

function getSortValuesFromParam(sortParam: SortParam | null) {
  switch (sortParam) {
    case 'price-high-low':
      return {
        sortKey: 'PRICE',
        reverse: true,
      };
    case 'price-low-high':
      return {
        sortKey: 'PRICE',
        reverse: false,
      };
    case 'best-selling':
      return {
        sortKey: 'BEST_SELLING',
        reverse: false,
      };
    case 'newest':
      return {
        sortKey: 'CREATED',
        reverse: true,
      };
    case 'featured':
      return {
        sortKey: 'MANUAL',
        reverse: false,
      };
    default:
      return {
        sortKey: 'RELEVANCE',
        reverse: false,
      };
  }
}
