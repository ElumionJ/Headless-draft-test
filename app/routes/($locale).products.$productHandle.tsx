import {
  type ReactNode,
  useRef,
  Suspense,
  useMemo,
  useState,
  useEffect,
} from 'react';
import DOMPurify from 'dompurify';
import {Disclosure, Listbox} from '@headlessui/react';
import {defer, type LoaderArgs} from '@shopify/remix-oxygen';
import {
  useLoaderData,
  Await,
  useSearchParams,
  useLocation,
  useNavigation,
} from '@remix-run/react';
import type {ShopifyAnalyticsProduct} from '@shopify/hydrogen';
import {AnalyticsPageType, Money, ShopPayButton} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';
import clsx from 'clsx';
import type {
  ProductVariant,
  SelectedOptionInput,
  Product as ProductType,
  Shop,
  ProductConnection,
  Metafield,
  Metaobject,
  MetaobjectField,
} from '@shopify/hydrogen/storefront-api-types';

import {
  Heading,
  IconCaret,
  IconCheck,
  IconClose,
  ProductGallery,
  ProductSwimlane,
  Section,
  Skeleton,
  Text,
  Link,
  AddToCartButton,
  Button,
  ProductQuantity,
  ProductTabs,
  SwiperImages,
  IconAddToCartBag,
} from '~/components';
import {getExcerpt} from '~/lib/utils';
import {seoPayload} from '~/lib/seo.server';
import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import type {Storefront} from '~/lib/type';
import {routeHeaders, CACHE_SHORT} from '~/data/cache';

const DESCRIPTION_METAFIELD_VARIABLE = [
  {
    key: 'attributes',
    namespace: 'custom',
  },
  {
    namespace: 'custom',
    key: 'attributes_title',
  },
];
const SHIPPING_INFO_METAOBJECT_VARIABLE = {
  handle: 'shipping-information-wndmvoiu',
  type: 'shipping_information',
};

export const headers = routeHeaders;

export async function loader({params, request, context}: LoaderArgs) {
  const {productHandle} = params;
  invariant(productHandle, 'Missing productHandle param, check route filename');

  const searchParams = new URL(request.url).searchParams;

  const selectedOptions: SelectedOptionInput[] = [];
  searchParams.forEach((value, name) => {
    selectedOptions.push({name, value});
  });

  const {shop, product} = await context.storefront.query<{
    product: ProductType & {selectedVariant?: ProductVariant};
    shop: Shop;
  }>(PRODUCT_QUERY, {
    variables: {
      handle: productHandle,
      selectedOptions,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
      identifiers: DESCRIPTION_METAFIELD_VARIABLE,
      handleShippingInfo: SHIPPING_INFO_METAOBJECT_VARIABLE,
    },
  });

  if (!product?.id) {
    throw new Response('product', {status: 404});
  }

  const shippingInfo = await context.storefront.query(SHIPPING_INFO_QUERY, {
    variables: {
      handleShippingInfo: SHIPPING_INFO_METAOBJECT_VARIABLE,
    },
  });
  const shippingInfoText = shippingInfo.metaobject.fields.find(
    (el: MetaobjectField) => el.key === 'text',
  ).value;

  const attributesMetaobjectsString = product.metafields.find(
    (el) => el?.key === 'attributes',
  )?.value;

  const attributesTitleString = product.metafields.find(
    (el) => el?.key === 'attributes_title',
  )?.value;

  const attributesMetaobjectsArr: string[] | [] = JSON.parse(
    attributesMetaobjectsString || '[]',
  );
  const metaobjectsPromises = attributesMetaobjectsArr.map(async (el) => {
    return context.storefront.query(
      `query($id:ID!){
      metaobject(id:$id){
        fields{
          value
          key
        }
      }
    }`,
      {
        variables: {
          id: el,
        },
      },
    );
  });
  const metaobjectsArr = await Promise.all(metaobjectsPromises);
  const attributesArr = metaobjectsArr.map((meta) => {
    const obj = {};
    (meta.metaobject as unknown as Metaobject).fields.forEach((field) => {
      obj[field.key] = {...field};
    });
    return obj;
  });

  const recommended = getRecommendedProducts(context.storefront, product.id);
  const firstVariant = product.variants.nodes[0];
  const selectedVariant = product.selectedVariant ?? firstVariant;

  const productAnalytics: ShopifyAnalyticsProduct = {
    productGid: product.id,
    variantGid: selectedVariant.id,
    name: product.title,
    variantName: selectedVariant.title,
    brand: product.vendor,
    price: selectedVariant.price.amount,
  };

  const seo = seoPayload.product({
    product,
    selectedVariant,
    url: request.url,
  });

  return defer(
    {
      shippingInfoText,
      attributesTitleString,
      attributesArr,
      product,
      shop,
      storeDomain: shop.primaryDomain.url,
      recommended,
      analytics: {
        pageType: AnalyticsPageType.product,
        resourceId: product.id,
        products: [productAnalytics],
        totalValue: parseFloat(selectedVariant.price.amount),
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

export default function Product() {
  const {
    product,
    shop,
    recommended,
    attributesArr,
    attributesTitleString,
    shippingInfoText,
  } = useLoaderData<typeof loader>();
  const {media, title, vendor, descriptionHtml} = product;
  const {shippingPolicy, refundPolicy} = shop;
  const descriptionRef = useRef(null);

  useEffect(() => {
    const sanitizedHtml = DOMPurify.sanitize(descriptionHtml);
    (descriptionRef.current as unknown as HTMLParagraphElement).innerHTML =
      sanitizedHtml;
  }, []);
  return (
    <>
      <Section className="!px-0 !py-0">
        <div className=" justify-center !gap-[63px] !flex px-0 md:px-8 lg:px-12 gt-l:flex-col  gt-l:items-center bg-c-gray pt-[60px]">
          <div className=" px-[4px] max-w-[325px]">
            <Heading as="h1" className="text-5xl  mb-8">
              {title}
            </Heading>
            {descriptionHtml && (
              <p
                ref={descriptionRef}
                className="text-[16px] text-[#333333]"
              ></p>
            )}
          </div>
          <div className="max-h-[468px] max-w-[368px] gt-ssm:w-[280px]">
            {/* <ProductGallery
              media={media.nodes}
              className="w-full lg:col-span-2"
            /> */}
            <SwiperImages media={media.nodes} />
          </div>

          <div className="sticky md:-mb-nav md:top-nav md:-translate-y-nav md:pt-nav hiddenScroll md:overflow-y-scroll ">
            <section className="flex flex-col w-full max-w-xl gap-8 p-6 md:mx-auto md:max-w-sm md:px-0 gt-ssm:p-1">
              {vendor && (
                <div className="flex gap-[8px] items-end">
                  <span className="text-xl text-[#000] uppercase">Brand:</span>
                  <span className="text-[#333]">{vendor}</span>
                </div>
              )}
              <ProductForm />
              <div className="grid gap-4 py-4">
                {shippingPolicy?.body && (
                  <ProductDetail
                    title="Shipping"
                    content={getExcerpt(shippingPolicy.body)}
                    learnMore={`/policies/${shippingPolicy.handle}`}
                  />
                )}
                {refundPolicy?.body && (
                  <ProductDetail
                    title="Returns"
                    content={getExcerpt(refundPolicy.body)}
                    learnMore={`/policies/${refundPolicy.handle}`}
                  />
                )}
              </div>
            </section>
          </div>
        </div>
        <div className="mt-24 px-[60px] gt-l:px-[10px]">
          <ProductTabs
            shippingInfoText={shippingInfoText}
            attributesTitle={attributesTitleString}
            attributes={attributesArr}
            description={product.description}
            title={product.title}
          />
        </div>
      </Section>
      <Suspense fallback={<Skeleton className="h-32" />}>
        <Await
          errorElement="There was a problem loading related products"
          resolve={recommended}
        >
          {(products) => (
            <ProductSwimlane title="Related Products" products={products} />
          )}
        </Await>
      </Suspense>
    </>
  );
}

export function ProductForm() {
  const {product, analytics, storeDomain} = useLoaderData<typeof loader>();

  const [currentSearchParams] = useSearchParams();
  const {location} = useNavigation();

  const [quantity, setQuantity] = useState<number>(1); //---------

  const changeQuantity = (action: 'plus' | 'minus') => {
    if (action === 'plus') {
      setQuantity((prev) => Math.max(1, prev + 1));
    } else if (action === 'minus') {
      setQuantity((prev) => Math.max(1, prev - 1));
    }
  };

  useEffect(() => {
    if (!product.totalInventory) return;
    if (product.totalInventory >= quantity) {
      console.log('AVAILABLE');
    } else {
      console.log('Not AVAILABLE');
    }
  }, [quantity]);

  /**
   * We update `searchParams` with in-flight request data from `location` (if available)
   * to create an optimistic UI, e.g. check the product option before the
   * request has completed.
   */
  const searchParams = useMemo(() => {
    return location
      ? new URLSearchParams(location.search)
      : currentSearchParams;
  }, [currentSearchParams, location]);

  const firstVariant = product.variants.nodes[0];

  /**
   * We're making an explicit choice here to display the product options
   * UI with a default variant, rather than wait for the user to select
   * options first. Developers are welcome to opt-out of this behavior.
   * By default, the first variant's options are used.
   */
  const searchParamsWithDefaults = useMemo<URLSearchParams>(() => {
    const clonedParams = new URLSearchParams(searchParams);

    for (const {name, value} of firstVariant.selectedOptions) {
      if (!searchParams.has(name)) {
        clonedParams.set(name, value);
      }
    }

    return clonedParams;
  }, [searchParams, firstVariant.selectedOptions]);

  /**
   * Likewise, we're defaulting to the first variant for purposes
   * of add to cart if there is none returned from the loader.
   * A developer can opt out of this, too.
   */
  // product.selectedVariant?.quantityAvailable;
  const selectedVariant = product.selectedVariant ?? firstVariant;
  const isOutOfStock = !selectedVariant?.availableForSale;

  const isOnSale =
    selectedVariant?.price?.amount &&
    selectedVariant?.compareAtPrice?.amount &&
    selectedVariant?.price?.amount < selectedVariant?.compareAtPrice?.amount;

  const productAnalytics: ShopifyAnalyticsProduct = {
    ...analytics.products[0],
    quantity,
  };

  return (
    <div className="grid gap-10">
      <div className="grid gap-4">
        <ProductOptions
          options={product.options}
          searchParamsWithDefaults={searchParamsWithDefaults}
        />
        {selectedVariant && (
          <div className="grid items-stretch gap-4">
            {isOutOfStock ? (
              <Button variant="secondary" disabled>
                <Text>Sold out</Text>
              </Button>
            ) : (
              <div className="flex gap-[16px] items-center gt-xl:flex-col">
                <ProductQuantity
                  quantity={quantity}
                  changeQuantity={changeQuantity}
                />
                <div className="w-full ">
                  <AddToCartButton
                    lines={[
                      {
                        merchandiseId: selectedVariant.id,
                        quantity,
                      },
                    ]}
                    className="mt-2 flex justify-between items-center bg-c-red w-fit gap-[12px] py-4 px-[16px] rounded-[100px] text-[#fff]"
                    variant="primary"
                    data-test="add-to-cart"
                    analytics={{
                      products: [productAnalytics],
                      totalValue: parseFloat(productAnalytics.price),
                    }}
                  >
                    <Text
                      as="span"
                      className="flex items-center justify-center gap-2 uppercase text-[12px] leading-4 font-noto tracking-widest font-bold"
                    >
                      <span>Add to Cart</span>

                      <IconAddToCartBag />
                    </Text>
                  </AddToCartButton>
                </div>
              </div>
            )}
            {!isOutOfStock && (
              <ShopPayButton
                width="100%"
                variantIds={[selectedVariant?.id!]}
                storeDomain={storeDomain}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductOptions({
  options,
  searchParamsWithDefaults,
}: {
  options: ProductType['options'];
  searchParamsWithDefaults: URLSearchParams;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      {options
        .filter((option) => option.values.length > 1)
        .map((option) => (
          <div
            key={option.name}
            className="flex flex-col flex-wrap mb-4 gap-y-2 last:mb-0"
          >
            <Heading as="legend" size="lead" className="min-w-[4rem]">
              {option.name}
            </Heading>
            <div className="flex flex-wrap items-baseline gap-4">
              {/**
               * First, we render a bunch of <Link> elements for each option value.
               * When the user clicks one of these buttons, it will hit the loader
               * to get the new data.
               *
               * If there are more than 7 values, we render a dropdown.
               * Otherwise, we just render plain links.
               */}
              {option.values.length > 7 ? (
                <div className="relative w-full">
                  <Listbox>
                    {({open}) => (
                      <>
                        <Listbox.Button
                          ref={closeRef}
                          className={clsx(
                            'flex items-center justify-between w-full py-3 px-4 border border-primary',
                            open
                              ? 'rounded-b md:rounded-t md:rounded-b-none'
                              : 'rounded',
                          )}
                        >
                          <span>
                            {searchParamsWithDefaults.get(option.name)}
                          </span>
                          <IconCaret direction={open ? 'up' : 'down'} />
                        </Listbox.Button>
                        <Listbox.Options
                          className={clsx(
                            'border-primary bg-contrast absolute bottom-12 z-30 grid h-48 w-full overflow-y-scroll rounded-t border px-2 py-2 transition-[max-height] duration-150 sm:bottom-auto md:rounded-b md:rounded-t-none md:border-t-0 md:border-b',
                            open ? 'max-h-48' : 'max-h-0',
                          )}
                        >
                          {option.values.map((value) => (
                            <Listbox.Option
                              key={`option-${option.name}-${value}`}
                              value={value}
                            >
                              {({active}) => (
                                <ProductOptionLink
                                  optionName={option.name}
                                  optionValue={value}
                                  className={clsx(
                                    'text-primary w-full p-2 transition rounded flex justify-start items-center text-left cursor-pointer',
                                    active && 'bg-primary/10',
                                  )}
                                  searchParams={searchParamsWithDefaults}
                                  onClick={() => {
                                    if (!closeRef?.current) return;
                                    closeRef.current.click();
                                  }}
                                >
                                  {value}
                                  {searchParamsWithDefaults.get(option.name) ===
                                    value && (
                                    <span className="ml-2">
                                      <IconCheck />
                                    </span>
                                  )}
                                </ProductOptionLink>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </>
                    )}
                  </Listbox>
                </div>
              ) : (
                <>
                  {option.values.map((value) => {
                    const checked =
                      searchParamsWithDefaults.get(option.name) === value;
                    const id = `option-${option.name}-${value}`;

                    return (
                      <Text key={id}>
                        <ProductOptionLink
                          optionName={option.name}
                          optionValue={value}
                          searchParams={searchParamsWithDefaults}
                          className={clsx(
                            'leading-none py-1 border-b-[1.5px] cursor-pointer transition-all duration-200',
                            checked ? 'border-primary/50' : 'border-primary/0',
                          )}
                        />
                      </Text>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        ))}
    </>
  );
}

function ProductOptionLink({
  optionName,
  optionValue,
  searchParams,
  children,
  ...props
}: {
  optionName: string;
  optionValue: string;
  searchParams: URLSearchParams;
  children?: ReactNode;
  [key: string]: any;
}) {
  const {pathname} = useLocation();
  const isLocalePathname = /\/[a-zA-Z]{2}-[a-zA-Z]{2}\//g.test(pathname);
  // fixes internalized pathname
  const path = isLocalePathname
    ? `/${pathname.split('/').slice(2).join('/')}`
    : pathname;

  const clonedSearchParams = new URLSearchParams(searchParams);
  clonedSearchParams.set(optionName, optionValue);

  return (
    <Link
      {...props}
      preventScrollReset
      prefetch="intent"
      replace
      to={`${path}?${clonedSearchParams.toString()}`}
    >
      {children ?? optionValue}
    </Link>
  );
}

function ProductDetail({
  title,
  content,
  learnMore,
}: {
  title: string;
  content: string;
  learnMore?: string;
}) {
  return (
    <Disclosure key={title} as="div" className="grid w-full gap-2">
      {({open}) => (
        <>
          <Disclosure.Button className="text-left">
            <div className="flex justify-between">
              <Text size="lead" as="h4">
                {title}
              </Text>
              <IconClose
                className={clsx(
                  'transition-transform transform-gpu duration-200',
                  !open && 'rotate-[45deg]',
                )}
              />
            </div>
          </Disclosure.Button>

          <Disclosure.Panel className={'pb-4 pt-2 grid gap-2'}>
            <div
              className="prose dark:prose-invert"
              dangerouslySetInnerHTML={{__html: content}}
            />
            {learnMore && (
              <div className="">
                <Link
                  className="pb-px border-b border-primary/30 text-primary/50"
                  to={learnMore}
                >
                  Learn more
                </Link>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariantFragment on ProductVariant {
    id
    availableForSale
    selectedOptions {
      name
      value
    }
    image {
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
  }
`;

const SHIPPING_INFO_QUERY = `
  #graphql
  query ShippingInfo($handleShippingInfo: MetaobjectHandleInput) {
    metaobject(handle: $handleShippingInfo) {
      fields {
        key
        type
        value
      }
    }
  }
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $selectedOptions: [SelectedOptionInput!]!
    $identifiers: [HasMetafieldsIdentifier!]!
    
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      totalInventory
      id
      title
      vendor
      handle
      descriptionHtml
      description
      options {
        name
        values
      }

      metafields(identifiers: $identifiers) {
        id
        value
        key
      }
      selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
        ...ProductVariantFragment
      }
      media(first: 7) {
        nodes {
          ...Media
        }
      }
      variants(first: 1) {
        nodes {
          ...ProductVariantFragment
        }
      }
      seo {
        description
        title
      }
    }
    shop {
      name
      primaryDomain {
        url
      }
      shippingPolicy {
        body
        handle
      }
      refundPolicy {
        body
        handle
      }
    }
  }
  ${MEDIA_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}


`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  query productRecommendations(
    $productId: ID!
    $count: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    recommended: productRecommendations(productId: $productId) {
      ...ProductCard
    }
    additional: products(first: $count, sortKey: BEST_SELLING) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

async function getRecommendedProducts(
  storefront: Storefront,
  productId: string,
) {
  const products = await storefront.query<{
    recommended: ProductType[];
    additional: ProductConnection;
  }>(RECOMMENDED_PRODUCTS_QUERY, {
    variables: {productId, count: 12},
  });

  invariant(products, 'No data returned from Shopify API');

  const mergedProducts = products.recommended
    .concat(products.additional.nodes)
    .filter(
      (value, index, array) =>
        array.findIndex((value2) => value2.id === value.id) === index,
    );

  const originalProduct = mergedProducts
    .map((item: ProductType) => item.id)
    .indexOf(productId);

  mergedProducts.splice(originalProduct, 1);

  return mergedProducts;
}
