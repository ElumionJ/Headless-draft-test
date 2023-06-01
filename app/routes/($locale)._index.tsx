import {defer, type LoaderArgs} from '@shopify/remix-oxygen';
import {Suspense} from 'react';
import {Await, useLoaderData} from '@remix-run/react';
import type {
  CollectionConnection,
  ProductConnection,
} from '@shopify/hydrogen/storefront-api-types';
import {AnalyticsPageType} from '@shopify/hydrogen';

import {
  ProductSwimlane,
  FeaturedCollections,
  Hero,
  HeroBanner,
  HeroBannerFirst,
  CustomData,
} from '~/components';
import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getHeroPlaceholder} from '~/lib/placeholders';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders, CACHE_SHORT} from '~/data/cache';
import {type CollectionHero} from '~/components/Hero';

interface HomeSeoData {
  shop: {
    name: string;
    description: string;
  };
}

export const headers = routeHeaders;

export async function loader({params, context}: LoaderArgs) {
  const {language, country} = context.storefront.i18n;

  if (
    params.locale &&
    params.locale.toLowerCase() !== `${language}-${country}`.toLowerCase()
  ) {
    // If the locale URL param is defined, yet we still are on `EN-US`
    // the the locale param must be invalid, send to the 404 page
    throw new Response(null, {status: 404});
  }

  const {shop, hero} = await context.storefront.query<{
    hero: CollectionHero;
    shop: HomeSeoData;
  }>(HOMEPAGE_SEO_QUERY, {
    variables: {handle: 'freestyle'},
  });

  const IMAGE_QUERY = `
  query ImageUrl($id: ID!) {
    node(id: $id) {
      id
      ... on MediaImage {
        image {
          url
        }
      }
    }
  }
`;

  const heroBannerMetaData = await context.storefront.query(`
  #graphql
  query {
    metaobjects(type: "hero_baner", first: 15) {
      nodes {
        fields {
          type
          key
          value
        }
      }
    }

  }`);

  const heroBannerMetaDataFirst = await context.storefront.query(`
  #graphql
  query {
    metaobjects(type: "hero_banner_first", first: 15) {
      nodes {
        fields {
          type
          key
          value
        }
      }
    }

  }`);

  const heroBannerMetaDataAll = await context.storefront.query(`
  #graphql
  query {
  bannerMetaobjects: metaobjects(type: "hero_banner_first", first: 15) {
    nodes {
      fields {
        value
        key
      }
    }
  }
  designerMetaobjects: metaobjects(type: "hero_baner", first: 15) {
    nodes {
      fields {
        value
        key
      }
    }
  }
}`);

  // const metaObjectsArrAll = await Promise.all(
  //   for (const key in heroBannerMetaDataAll) {
  //     console.log(`Key: ${key}`);
  //   }
  // );

  const metaObjectsArrFirst = await Promise.all(
    heroBannerMetaDataFirst.metaobjects.nodes.map(async (element: any) => {
      const parsedMetaobject = {};
      await Promise.all(
        element.fields.map(async (el: any) => {
          if (el.type === 'file_reference') {
            const imgUrl = await context.storefront.query(IMAGE_QUERY, {
              variables: {id: el.value},
            });
            parsedMetaobject[el.key] = {...el, value: imgUrl.node.image.url};
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
    }),
  );

  const metaObjectsArr = await Promise.all(
    heroBannerMetaData.metaobjects.nodes.map(async (element: any) => {
      const parsedMetaobject = {};
      await Promise.all(
        element.fields.map(async (el: any) => {
          if (el.type === 'file_reference') {
            const imgUrl = await context.storefront.query(IMAGE_QUERY, {
              variables: {id: el.value},
            });
            parsedMetaobject[el.key] = {...el, value: imgUrl.node.image.url};
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
    }),
  );


  console.log(heroBannerMetaDataAll);

  //Kate

  const customData = await context.storefront.query(`
  #graphql

    query {
      shop {
        name
      }
      metaobjects(type: "developers", first: 5) {
        nodes {
          handle
          id
          fields {
            key
            value
            type
          }
        }
      }
    }`);

  const metaObjectsKate = await Promise.all(
    customData.metaobjects.nodes.map(async (element: any) => {
      const parsedMetaobject = {};
      await Promise.all(
        element.fields.map(async (el: any) => {
          if (el.type === 'file_reference') {
            const imgUrl = await context.storefront.query(IMAGE_QUERY, {
              variables: {id: el.value},
            });
            parsedMetaobject[el.key] = {...el, value: imgUrl.node.image.url};
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
    }),
  );

  const seo = seoPayload.home();

  return defer(
    {
      metaObjectsKate,
      metaObjectsArr,
      metaObjectsArrFirst,
      shop,
      primaryHero: hero,
      // These different queries are separated to illustrate how 3rd party content
      // fetching can be optimized for both above and below the fold.
      featuredProducts: context.storefront.query<{
        products: ProductConnection;
      }>(HOMEPAGE_FEATURED_PRODUCTS_QUERY, {
        variables: {
          /**
           * Country and language properties are automatically injected
           * into all queries. Passing them is unnecessary unless you
           * want to override them from the following default:
           */
          country,
          language,
        },
      }),
      secondaryHero: context.storefront.query<{hero: CollectionHero}>(
        COLLECTION_HERO_QUERY,
        {
          variables: {
            handle: 'backcountry',
            country,
            language,
          },
        },
      ),
      featuredCollections: context.storefront.query<{
        collections: CollectionConnection;
      }>(FEATURED_COLLECTIONS_QUERY, {
        variables: {
          country,
          language,
        },
      }),
      tertiaryHero: context.storefront.query<{hero: CollectionHero}>(
        COLLECTION_HERO_QUERY,
        {
          variables: {
            handle: 'winter-2022',
            country,
            language,
          },
        },
      ),
      analytics: {
        pageType: AnalyticsPageType.home,
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

export default function Homepage() {
  const {
    primaryHero,
    secondaryHero,
    tertiaryHero,
    featuredCollections,
    featuredProducts,
    metaObjectsArr,
    metaObjectsArrFirst,

    metaObjectsKate,
  } = useLoaderData<typeof loader>();

  // TODO: skeletons vs placeholders
  const skeletons = getHeroPlaceholder([{}, {}, {}]);

  return (
    <>
      <HeroBannerFirst data={metaObjectsArrFirst[0]} />

      <ul>
        {metaObjectsArr.map((el: any) => (
          <li className="w-[100%]" key={el.value}>
            <HeroBanner data={el} />
          </li>
        ))}
      </ul>

      <CustomData data={metaObjectsKate[0]} />

      {primaryHero && (
        <Hero {...primaryHero} height="full" top loading="eager" />
      )}

      {featuredProducts && (
        <Suspense>
          <Await resolve={featuredProducts}>
            {({products}) => {
              if (!products?.nodes) return <></>;
              return (
                <ProductSwimlane
                  products={products.nodes}
                  title="Featured Products"
                  count={4}
                />
              );
            }}
          </Await>
        </Suspense>
      )}

      {secondaryHero && (
        <Suspense fallback={<Hero {...skeletons[1]} />}>
          <Await resolve={secondaryHero}>
            {({hero}) => {
              if (!hero) return <></>;
              return <Hero {...hero} />;
            }}
          </Await>
        </Suspense>
      )}

      {featuredCollections && (
        <Suspense>
          <Await resolve={featuredCollections}>
            {({collections}) => {
              if (!collections?.nodes) return <></>;
              return (
                <FeaturedCollections
                  collections={collections.nodes}
                  title="Collections"
                />
              );
            }}
          </Await>
        </Suspense>
      )}

      {tertiaryHero && (
        <Suspense fallback={<Hero {...skeletons[2]} />}>
          <Await resolve={tertiaryHero}>
            {({hero}) => {
              if (!hero) return <></>;
              return <Hero {...hero} />;
            }}
          </Await>
        </Suspense>
      )}
    </>
  );
}

const COLLECTION_CONTENT_FRAGMENT = `#graphql
  fragment CollectionContent on Collection {
    id
    handle
    title
    descriptionHtml
    heading: metafield(namespace: "hero", key: "title") {
      value
    }
    byline: metafield(namespace: "hero", key: "byline") {
      value
    }
    cta: metafield(namespace: "hero", key: "cta") {
      value
    }
    spread: metafield(namespace: "hero", key: "spread") {
      reference {
        ...Media
      }
    }
    spreadSecondary: metafield(namespace: "hero", key: "spread_secondary") {
      reference {
        ...Media
      }
    }
  }
  ${MEDIA_FRAGMENT}
`;

const HOMEPAGE_SEO_QUERY = `#graphql
  query seoCollectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
    shop {
      name
      description
    }
  }
  ${COLLECTION_CONTENT_FRAGMENT}
`;

const COLLECTION_HERO_QUERY = `#graphql
  query heroCollectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
  }
  ${COLLECTION_CONTENT_FRAGMENT}
`;

// @see: https://shopify.dev/api/storefront/2023-04/queries/products
export const HOMEPAGE_FEATURED_PRODUCTS_QUERY = `#graphql
  query homepageFeaturedProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 8) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

// @see: https://shopify.dev/api/storefront/2023-04/queries/collections
export const FEATURED_COLLECTIONS_QUERY = `#graphql
  query homepageFeaturedCollections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(
      first: 4,
      sortKey: UPDATED_AT
    ) {
      nodes {
        id
        title
        handle
        image {
          altText
          width
          height
          url
        }
      }
    }
  }
`;