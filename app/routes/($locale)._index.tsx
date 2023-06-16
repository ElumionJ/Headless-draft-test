import {defer, type LoaderArgs} from '@shopify/remix-oxygen';
import {Suspense} from 'react';
import {Await, useLoaderData} from '@remix-run/react';
import type {ProductConnection} from '@shopify/hydrogen/storefront-api-types';
import React from 'react';

import {
  ProductSwimlane,
  BrandsBanner,
  HomePageBanner,
  PersonalizeBanner,
  BlogBanner,
  BrandsLogos,
} from '~/components';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';

export const headers = routeHeaders;

export async function loader({params, context}: LoaderArgs) {
  const {language, country} = context.storefront.i18n;

  if (
    params.locale &&
    params.locale.toLowerCase() !== `${language}-${country}`.toLowerCase()
  ) {
    throw new Response(null, {status: 404});
  }

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

  const allMetaobjects = await context.storefront.query(`
    #graphql
      query GetMetaobjects($country: CountryCode, $language: LanguageCode)
      @inContext(country: $country, language: $language)
        {
          HomePageBanner: metaobjects(type: "home_page_banner", first: 15) {
            nodes {
              fields {
                type
                key
                value
              }
            }
          }
          BrandsBanner: metaobjects(type: "brands_banner", first: 15) {
            nodes {
              fields {
                type
                key
                value
              }
            }
          }
          BlogBanner: metaobjects(type: "blog_banner", first: 15) {
            nodes {
              fields {
                type
                key
                value
              }
            }
          }
          PersonalizeBanner: metaobjects(type: "personalize_banner", first: 15) {
            nodes {
              fields {
                type
                key
                value
              }
            }
          }
          ProductSwimlane: metaobjects(type: "product_swimlane", first: 15) {
            nodes {
              fields {
                type
                key
                value
              }
            }
          }
          BrandsLogos: metaobjects(type: "brands_logos", first: 15) {
            nodes {
              fields {
                type
                key
                value
              }
            }
          }
        }
  `);

  const allMetaobjectsArray = [];
  for (const key in allMetaobjects) {
    const nodes = allMetaobjects[key].nodes;
    const result = await Promise.all(
      nodes.map(async (element: any) => {
        const parsedMetaobject = {};
        parsedMetaobject['name'] = key;

        for (const el of element.fields) {
          if (el.type === 'file_reference') {
            const imgUrl = await context.storefront.query(IMAGE_QUERY, {
              variables: {id: el.value},
            });
            parsedMetaobject[el.key] = {...el, value: imgUrl.node.image.url};
          } else if (el.type === 'number_integer') {
            parsedMetaobject[el.key] = {
              ...el,
              value: isNaN(+el.value) ? 0 : +el.value,
            };
          } else {
            parsedMetaobject[el.key] = {...el};
          }
        }

        return parsedMetaobject;
      }),
    );

    allMetaobjectsArray.push(result);
  }

  allMetaobjectsArray.sort((a, b) => {
    const orderA = a[0].order.value;
    const orderB = b[0].order.value;
    return orderA - orderB;
  });

  const seo = seoPayload.home();

  return defer({
    allMetaobjectsArray,
    featuredProducts: context.storefront.query<{
      products: ProductConnection;
    }>(HOMEPAGE_FEATURED_PRODUCTS_QUERY, {
      variables: {
        country,
        language,
      },
    }),
  });
}

export default function Homepage() {
  const {allMetaobjectsArray, featuredProducts} =
    useLoaderData<typeof loader>();

  const componentMap = {
    HomePageBanner,
    BrandsBanner,
    BlogBanner,
    PersonalizeBanner,
    BrandsLogos,
  };

  return (
    <>
      <div>
        {allMetaobjectsArray.map((component) => {
          if (component[0].name === 'ProductSwimlane') {
            return component[0].show.value === 'true'
              ? featuredProducts && (
                  <Suspense key={component[0].order.value}>
                    <Await
                      key={component[0].order.value}
                      resolve={featuredProducts}
                    >
                      {({products}) => {
                        if (!products?.nodes) return <></>;
                        return (
                          <ProductSwimlane
                            key={component[0].order.value}
                            products={products.nodes}
                            data={component[0]}
                            title="Featured Products"
                            count={4}
                          />
                        );
                      }}
                    </Await>
                  </Suspense>
                )
              : '';
          }
          const Component = componentMap[component[0].name];
          return component[0].show.value === 'true' ? (
            <Component key={component[0].order.value} data={component[0]} />
          ) : (
            ''
          );
        })}
      </div>
    </>
  );
}

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
