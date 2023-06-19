import clsx from 'clsx';
import type {ShopifyAnalyticsProduct} from '@shopify/hydrogen';
import {flattenConnection, Image, Money, useMoney} from '@shopify/hydrogen';
import type {MoneyV2, Product} from '@shopify/hydrogen/storefront-api-types';

import {Text, Link, AddToCartButton, IconAddToCartBag} from '~/components';
import {isDiscounted, isNewArrival} from '~/lib/utils';
import {getProductPlaceholder} from '~/lib/placeholders';

export function ProductCard({
  product,
  label,
  className,
  loading,
  onClick,
  quickAdd,
}: {
  product: Product;
  label?: string;
  className?: string;
  loading?: HTMLImageElement['loading'];
  onClick?: () => void;
  quickAdd?: boolean;
}) {
  let cardLabel;

  const cardProduct: Product = product?.variants
    ? (product as Product)
    : getProductPlaceholder();
  if (!cardProduct?.variants?.nodes?.length) return null;

  const firstVariant = flattenConnection(cardProduct.variants)[0];

  if (!firstVariant) return null;
  const {image, price, compareAtPrice, availableForSale} = firstVariant;
  // console.log(firstVariant);

  if (label) {
    cardLabel = label;
  } else if (isDiscounted(price as MoneyV2, compareAtPrice as MoneyV2)) {
    cardLabel = 'Sale';
  } else if (isNewArrival(product.publishedAt)) {
    cardLabel = 'New';
  }

  const productAnalytics: ShopifyAnalyticsProduct = {
    productGid: product.id,
    variantGid: firstVariant.id,
    name: product.title,
    variantName: firstVariant.title,
    brand: product.vendor,
    price: firstVariant.price.amount,
    quantity: 1,
  };

  return (
    <div className="product-card flex flex-col gap-2 ">
      <Link
        onClick={onClick}
        to={
          product.collections.nodes[0].handle
            ? `/categories/${product.collections.nodes[0].handle}/${product.handle}`
            : `/products/${product.handle}`
        }
        prefetch="intent"
      >
        <div className={clsx('grid gap-4', className)}>
          <div className="card-image aspect-[4/5] bg-primary/5">
            {!availableForSale && (
              <div
                data-outofstock-overlay
                className="absolute w-full h-full top-0 left-0 z-20 backdrop-grayscale "
              >
                <span className="absolute top-[16px] left-[16px] rounded-[2px] w-fit uppercase p-2 bg-black text-[#fff] text-[12px] font-bold leading-[150%] font-noto">
                  OUT OF SToCK
                </span>
              </div>
            )}
            {image && (
              <Image
                className={`object-cover w-full fadeIn rounded-[2px] `}
                sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
                aspectRatio="4/5"
                data={image}
                alt={image.altText || `Picture of ${product.title}`}
                loading={'lazy'}
              />
            )}
            <Text
              as="label"
              size="fine"
              className="absolute top-0 right-0 rtl:right-auto rtl:left-0 m-4 text-right text-notice"
            >
              {cardLabel}
            </Text>
          </div>
          <div className="grid gap-1">
            <Text
              className="w-full overflow-hidden whitespace-nowrap text-[20px] leading-[110%] font-bebas tracking-wider"
              as="h3"
            >
              {product.title}
            </Text>
            <div className="flex gap-4">
              <Text className="flex gap-4 text-[20px] leading-[130%]">
                <Money
                  className="font-bebas tracking-wider leading-[130%]"
                  withoutTrailingZeros
                  data={price!}
                />
                {/* {isDiscounted(price as MoneyV2, compareAtPrice as MoneyV2) && (
                  <CompareAtPrice
                    className={'opacity-50'}
                    data={compareAtPrice as MoneyV2}
                  />
                )} */}
              </Text>
            </div>
          </div>
        </div>
      </Link>

      <AddToCartButton
        lines={[
          {
            quantity: 1,
            merchandiseId: firstVariant.id,
          },
        ]}
        variant="secondary"
        className="mt-2 opacity-0 gt-l:opacity-100  flex justify-between items-center bg-c-red w-fit gap-[12px] py-4 px-[16px] rounded-[100px] text-[#fff]"
        analytics={{
          products: [productAnalytics],
          totalValue: parseFloat(productAnalytics.price),
        }}
      >
        <Text
          as="span"
          className="flex items-center justify-center gap-2 uppercase text-[12px] leading-4 font-noto tracking-widest font-bold"
        >
          Add to Bag
        </Text>
        <IconAddToCartBag />
      </AddToCartButton>
    </div>
  );
}

function CompareAtPrice({
  data,
  className,
}: {
  data: MoneyV2;
  className?: string;
}) {
  const {currencyNarrowSymbol, withoutTrailingZerosAndCurrency} =
    useMoney(data);

  const styles = clsx('strike', className);

  return (
    <span className={styles}>
      {currencyNarrowSymbol}
      {withoutTrailingZerosAndCurrency}
    </span>
  );
}
