import clsx from 'clsx';
import {useRef} from 'react';
import {useScroll} from 'react-use';
import {flattenConnection, Image, Money} from '@shopify/hydrogen';
import type {
  Cart as CartType,
  CartCost,
  CartLine,
  CartLineUpdateInput,
  Product,
} from '@shopify/hydrogen/storefront-api-types';
import {useFetcher, useLoaderData} from '@remix-run/react';

import {
  Button,
  IconRemove,
  IconClose,
  Text,
  Link,
  Heading,
  FeaturedProducts,
} from '~/components';
import {getInputStyleClasses} from '~/lib/utils';
import {CartAction} from '~/lib/type';

type Layouts = 'page' | 'drawer';
interface StaticPrice {
  amount: string;
  currencyCode: string;
}

export function Cart({
  layout,
  onClose,
  cart,
}: {
  layout: Layouts;
  onClose?: () => void;
  cart: CartType | null;
}) {
  const linesCount = Boolean(cart?.lines?.edges?.length || 0);

  return (
    <>
      {/* {!cart || cart.totalQuantity === 0 ? (
        <CartEmpty hidden={linesCount} onClose={onClose} layout={layout} />
      ) : (
        <CartDetails cart={cart} layout={layout} />
      )} */}
      <CartEmpty hidden={linesCount} onClose={onClose} layout={layout} /> 
      <CartDetails cart={cart} layout={layout} />
    </>
  );
}

export function CartDetails({
  layout,
  cart,
  heading,
}: {
  layout: Layouts;
  cart: CartType | null;
  heading?: string;
}) {
  // @todo: get optimistic cart cost
  const cartHasItems = !!cart && cart.totalQuantity > 0;
  const container = {
    drawer: 'grid grid-cols-1 h-screen-no-nav grid-rows-[1fr_auto] ',
    page: 'w-full pt-4 pb-12 grid  md:pt-8 md:items-start gap-8 md:gap-8 lg:grid-cols-2 lg:gap-x-[155px] lg:px-[27px] xl:px-[155px] lg:pt-0 min-h-screen ',
  };

  if (layout === 'page' && !cartHasItems) {
    return <></>
  }

  return (
    // When its empty - work not correct
    <div className="flex flex-col w-full bg-[#FFFEFA] text-black ">
      {layout === 'page' && (
        <span className="pl-6 pt-3 lg:pt-8 lg:pb-6 lg:pl-[32px] xl:pl-[159px] font-semibold uppercase">
          My bag ({cart?.totalQuantity})
        </span>
      )}
      <div className={container[layout]}>
        <CartLines lines={cart?.lines} layout={layout} />

        {cartHasItems && (
          <CartSummary
            cartQuantity={cart.totalQuantity}
            cost={cart.cost}
            layout={layout}
          >
            <CartDiscounts discountCodes={cart.discountCodes} />
            <CartCheckoutActions
              layout={layout}
              checkoutUrl={cart.checkoutUrl}
            />
          </CartSummary>
        )}
      </div>
    </div>

    // <div className={container[layout]}>
    //   <CartLines lines={cart?.lines} layout={layout} />

    //   {cartHasItems && (
    //     <CartSummary
    //       cartQuantity={cart.totalQuantity}
    //       cost={cart.cost}
    //       layout={layout}
    //     >
    //       <CartDiscounts discountCodes={cart.discountCodes} />
    //       <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
    //     </CartSummary>
    //   )}
    // </div>
  );
}

/**
 * Temporary discount UI
 * @param discountCodes the current discount codes applied to the cart
 * @todo rework when a design is ready
 */
function CartDiscounts({
  discountCodes,
}: {
  discountCodes: CartType['discountCodes'];
}) {
  const codes = discountCodes?.map(({code}) => code).join(', ') || null;

  return (
    <>
      {/* Have existing discount, display it with a remove option */}
      <dl className={codes ? 'grid' : 'hidden'}>
        <div className="flex items-center justify-between font-medium">
          <Text as="dt">Discount(s)</Text>
          <div className="flex items-center justify-between">
            <UpdateDiscountForm>
              <button>
                <IconRemove
                  aria-hidden="true"
                  style={{height: 18, marginRight: 4}}
                />
              </button>
            </UpdateDiscountForm>
            <Text as="dd">{codes}</Text>
          </div>
        </div>
      </dl>

      {/* No discounts, show an input to apply a discount */}
      {/* <UpdateDiscountForm>
        <div
          className={clsx(
            codes ? 'hidden' : 'flex',
            'items-center gap-4 justify-between text-copy',
          )}
        >
          <input
            className={getInputStyleClasses()}
            type="text"
            name="discountCode"
            placeholder="Discount code"
          />
          <button className="flex justify-end font-medium whitespace-nowrap">
            Apply Discount
          </button>
        </div>
      </UpdateDiscountForm> */}
    </>
  );
}

function UpdateDiscountForm({children}: {children: React.ReactNode}) {
  const fetcher = useFetcher();
  return (
    <fetcher.Form action="/cart" method="post">
      <input
        type="hidden"
        name="cartAction"
        value={CartAction.UPDATE_DISCOUNT}
      />
      {children}
    </fetcher.Form>
  );
}

function CartLines({
  layout = 'drawer',
  lines: cartLines,
}: {
  layout: Layouts;
  lines: CartType['lines'] | undefined;
}) {
  const currentLines = cartLines ? flattenConnection(cartLines) : [];
  const scrollRef = useRef(null);
  const {y} = useScroll(scrollRef);
  const styles = {
    cartItem:
      layout === 'page'
        ? 'item flex items-center justify-start'
        : 'item ajax-styles grid gap-2',

    price:
      layout === 'page'
        ? 'item flex flex-row-reverse gap-x-10'
        : 'item ajax-styles flex flex-col gap-y-16',
  };

  const className = clsx([
    // y > 0 ? 'border-t' : '',
    y > 0 ? '' : '',
    layout === 'page'
      ? 'flex-grow md:translate-y-4 pr-6 pl-6  lg:pl-0 lg:pr-[488px] xl:pl-0 border-y-[1px] border-black pt-[40px]  xl:pl-12'
      : 'px-6 pb-6 sm-max:pt-2 overflow-auto transition md:px-12 text-black',
  ]);

  return (
    <section
      ref={scrollRef}
      aria-labelledby="cart-contents"
      className={className}
    >
      <ul className="grid gap-6 md:gap-10">
        {currentLines.map((line) => (
          <CartLineItem
            key={line.id}
            line={line as CartLine}
            additionalClasses={styles}
            staticPrice={line.cost.amountPerQuantity}
            layout={layout}
          />
        ))}
      </ul>
    </section>
  );
}

function CartCheckoutActions({
  checkoutUrl,
  layout,
}: {
  checkoutUrl: string;
  layout: Layouts;
}) {
  if (!checkoutUrl) return null;

  return (
    <div className="flex flex-col items-center justify-center mt-2">
      <a href={checkoutUrl} target="_self" className="w-full">
        <Button
          as="span"
          width="full"
          className="text-white mb-4 uppercase flex items-center justify-center gap-x-2 px-3 py-4  bg-[#D80F16] rounded-[100px] w-full hover:opacity-80"
        >
          Secure Checkout
          <svg
            width="11"
            height="10"
            viewBox="0 0 11 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.45672 2.20542L3.44174 7.9394"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3.38001 2.79731L7.55799 2.06044L8.29492 6.23877"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </a>

      {layout === 'drawer' && (
        <a href="/cart">
          <div className="flex items-center justify-center text-black uppercase border-b-2 border-black w-fit gap-x-2 hover:opacity-80">
            View bag
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.07025 2.25054L2.12057 7.20022"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2.95279 2.12583L7.19526 2.12565L7.19543 6.36847"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </a>
      )}

      {/* @todo: <CartShopPayButton cart={cart} /> */}
    </div>
  );
}

function CartSummary({
  cost,
  layout,
  children = null,
}: {
  children?: React.ReactNode;
  cost: CartCost;
  layout: Layouts;
}) {
  const summary = {
    drawer: 'grid gap-6 p-6 border-t md:px-12 border-[black] bg-[#F2F2F2] ',
    page: 'sticky top-nav grid gap-6 md:translate-y-4 rounded w-full w-[325px] ',
  };

  return (
    <section aria-labelledby="summary-heading" className={summary[layout]}>
      <div className="mb-5 p-4 md:px-6 bg-[#F2F2F2]">
        <h2 id="summary-heading" className="sr-only">
          Order summary
        </h2>
        <dl className="grid">
          {layout === 'page' && (
            <div className="w-full">
              <div className=" p-6 pb-2 font-semibold  uppercase text-[black] border-b-[1px] border-[#E0E0E0]">
                Order summary
              </div>

              <div className="flex items-center justify-between p-6">
                <span className="uppercase text-[black] ">Total</span>
                <span className="text-[red]" data-test="subtotal">
                  {cost?.subtotalAmount?.amount ? (
                    <Money data={cost?.subtotalAmount} />
                  ) : (
                    '-'
                  )}
                </span>
              </div>
              <span className="p-6 ">Delivery calculated at checkout</span>
            </div>
          )}

          {/* drawer */}
          {layout === 'drawer' && (
            <>
              <div className="flex items-center justify-between font-semibold ">
                <span className="uppercase text-[black] pb-2">Subtotal</span>
                <span className="text-[red]" data-test="subtotal">
                  {cost?.subtotalAmount?.amount ? (
                    <Money data={cost?.subtotalAmount} />
                  ) : (
                    '-'
                  )}
                </span>
              </div>
              <div>{children}</div>
            </>
          )}
        </dl>
      </div>
      {layout === 'page' ? <div>{children}</div> : ''}
    </section>
  );
}

function CartLineItem({
  layout,
  line,
  additionalClasses,
  product,
  staticPrice,
}: {
  layout: Layouts;
  line: CartLine;
  additionalClasses: object;
  priceType?: 'regular' | 'compareAt';
  product: Product;
  staticPrice: StaticPrice;
}) {
  if (!line?.id) return null;

  const {id, quantity, merchandise} = line;

  if (typeof quantity === 'undefined' || !merchandise?.product) return null;

  return (
    <li
      key={id}
      className={` flex gap-4 pb-8 border-solid border-b-[1px] border-[#E0E0E0] last:border-none`}
    >
      <div className="flex-shrink w-max">
        {merchandise.image && (
          <Image
            width={110}
            height={110}
            data={merchandise.image}
            className="object-cover object-center w-24 h-24 border rounded md:w-28 md:h-28"
            alt={merchandise.title}
          />
        )}
      </div>

      <div className="flex items-center justify-between flex-grow gap-6">
        <div className={additionalClasses.cartItem}>
          <div className="max-w-[200px] pr-8">
            <Heading as="h3" size="copy">
              {merchandise?.product?.handle ? (
                <Link to={`/products/${merchandise.product.handle}`}>
                  {merchandise?.product?.title || ''}
                </Link>
              ) : (
                <Text>{merchandise?.product?.title || ''}</Text>
              )}
            </Heading>

            {layout === 'page' && (
              <span>
                {staticPrice.currencyCode} {staticPrice.amount}
              </span>
            )}
          </div>

          {/* <div className="grid pb-2">
            {(merchandise?.selectedOptions || []).map((option) => (
              <Text color="subtle" key={option.name}>
                {option.name}: {option.value}
              </Text>
            ))}
          </div> */}

          <div className="flex justify-start text-copy">
            <CartLineQuantityAdjust line={line} />
          </div>
        </div>

        <Text>
          <div className={additionalClasses.price}>
            <div>
              <ItemRemoveButton lineIds={[id]} />
            </div>

            <CartLinePrice line={line} as="span" className="font-semibold" />
          </div>
        </Text>
      </div>
    </li>
  );
}

function ItemRemoveButton({lineIds}: {lineIds: CartLine['id'][]}) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form action="/cart" method="post" className="w-6 m-auto -mr-[3px]">
      <input
        type="hidden"
        name="cartAction"
        value={CartAction.REMOVE_FROM_CART}
      />
      <input type="hidden" name="linesIds" value={JSON.stringify(lineIds)} />
      <button
        className="flex items-center justify-center w-6 h-6 rounded-[50%] bg-[#F2F2F2] text-black"
        type="submit"
      >
        <span className="sr-only">Remove</span>
        <IconClose aria-label="Close panel" />
      </button>
    </fetcher.Form>
  );
}

function CartLineQuantityAdjust({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <>
      <label htmlFor={`quantity-${lineId}`} className="sr-only">
        Quantity, {quantity}
      </label>
      <div className="flex items-center border rounded-[100px] border-black">
        <UpdateCartButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            name="decrease-quantity"
            aria-label="Decrease quantity"
            className="w-10 h-10 font-semibold text-black transition hover:opacity-80 disabled:opacity-30"
            value={prevQuantity}
            disabled={quantity <= 1}
          >
            <span>&#8722;</span>
          </button>
        </UpdateCartButton>

        <div
          className="px-2 font-semibold text-center"
          data-test="item-quantity"
        >
          {quantity}
        </div>

        <UpdateCartButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            className="w-10 h-10 font-semibold text-black transition hover:opacity-80"
            name="increase-quantity"
            value={nextQuantity}
            aria-label="Increase quantity"
          >
            <span>&#43;</span>
          </button>
        </UpdateCartButton>
      </div>
    </>
  );
}

function UpdateCartButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form action="/cart" method="post">
      <input type="hidden" name="cartAction" value={CartAction.UPDATE_CART} />
      <input type="hidden" name="lines" value={JSON.stringify(lines)} />
      {children}
    </fetcher.Form>
  );
}

function CartLinePrice({
  line,
  priceType = 'regular',
  ...passthroughProps
}: {
  line: CartLine;
  priceType?: 'regular' | 'compareAt';
  [key: string]: any;
}) {
  if (!line?.cost?.amountPerQuantity || !line?.cost?.totalAmount) return null;

  const moneyV2 =
    priceType === 'regular'
      ? line.cost.totalAmount
      : line.cost.compareAtAmountPerQuantity;

  if (moneyV2 == null) {
    return null;
  }

  return <Money withoutTrailingZeros {...passthroughProps} data={moneyV2} />;
}

export function CartEmpty({
  hidden = false,
  layout = 'drawer',
  onClose,
}: {
  hidden: boolean;
  layout?: Layouts;
  onClose?: () => void;
}) {
  const scrollRef = useRef(null);
  const {y} = useScroll(scrollRef);

  const container = {
    drawer: clsx([
      'content-start gap-4 px-6 pb-8 transition overflow-y-scroll md:gap-12 md:px-12 h-screen-no-nav md:pb-12 ',
      y > 0 ? 'border-t' : '',
    ]),
    page: clsx([
      hidden ? '' : 'grid',
      `pb-12 w-full md:items-start gap-4 md:gap-8 lg:gap-12 `,
    ]),
  };

  return (
    <div ref={scrollRef} className={container[layout]} hidden={hidden}>
      <section className="grid gap-64 pt-[200px] ">
        <div className="flex flex-col items-center justify-center ">
          <div className="mb-2">
            <svg
              width="130"
              height="104"
              viewBox="0 0 130 104"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_1_1026)">
                <path
                  d="M96.2958 59.8614L54.7589 53.0931C54.2138 53.0043 53.8484 52.4912 53.9428 51.947L55.539 42.7474C55.5837 42.49 55.7275 42.2592 55.9397 42.1045L62.6736 37.1948L71.3249 30.299C71.5185 30.1447 71.6488 29.9252 71.6909 29.6826L73.8598 17.1821C73.9139 16.8706 73.8172 16.5535 73.5991 16.3268L71.0247 13.6503C70.8066 13.4236 70.71 13.1064 70.764 12.7949L71.8535 6.51553C72.3256 3.79475 74.9177 1.94915 77.6432 2.39325L91.7794 4.69669C94.5049 5.1408 96.3316 7.70644 95.8596 10.4272L94.7793 16.6532C94.7202 16.9942 94.4886 17.2822 94.1671 17.4145L90.2513 19.027C89.9113 19.167 89.6734 19.4802 89.6311 19.8436L88.1702 32.4005C88.144 32.6259 88.1954 32.8528 88.3161 33.0437L94.1815 42.3289L98.8882 49.1028C99.0366 49.3163 99.0946 49.5799 99.0499 49.8373L97.4538 59.037C97.3594 59.5811 96.8409 59.9502 96.2958 59.8614Z"
                  stroke="#C2C2C2"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="5 5"
                />
                <path
                  d="M61.511 49.2738L29.0549 57.7016C28.5203 57.8404 27.9677 57.5214 27.8205 56.9891L25.2998 47.8725C25.2295 47.6184 25.2629 47.3484 25.3927 47.1212L28.6161 41.4781L32.5735 33.7803C32.6863 33.5609 32.7121 33.3066 32.6458 33.0669L30.0087 23.5292C29.9238 23.2223 29.6973 22.9718 29.3985 22.8548L26.7851 21.8307C26.4864 21.7136 26.2598 21.4632 26.1749 21.1563L25.1267 17.3651C24.3908 14.7035 25.9609 11.9833 28.6337 11.2892L37.9296 8.8754C40.6023 8.18136 43.3656 9.77635 44.1015 12.4379L45.1353 16.1769C45.2282 16.5126 45.1389 16.8696 44.8997 17.1194L42.737 19.3782C42.4839 19.6425 42.3998 20.0255 42.518 20.3749L45.6803 29.7161C45.7539 29.9334 45.9 30.12 46.0944 30.2447L53.5206 35.0112L59.2236 38.3363C59.4532 38.4702 59.6214 38.6879 59.6917 38.942L62.2124 48.0586C62.3596 48.5909 62.0455 49.135 61.511 49.2738Z"
                  fill="#FFFEFA"
                  stroke="#C2C2C2"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="5 5"
                />
                <path
                  d="M14.4973 57.4297C15.8572 52.7231 20.1659 49.4832 25.065 49.4832H99.4036C103.882 49.4832 107.914 52.1988 109.597 56.3493L122.378 87.8662C125.311 95.0986 119.989 103 112.185 103H15.9583C8.63642 103 3.35809 95.9806 5.39057 88.9465L14.4973 57.4297Z"
                  fill="#F5F5F5"
                  stroke="#C2C2C2"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M51.9806 71.9916C51.9806 71.9916 59.1466 78.5 65.0001 78.5C70.8536 78.5 78.4774 71.9916 78.4774 71.9916"
                  stroke="#C2C2C2"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_1_1026">
                  <rect width="130" height="104" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>

          <span className="text-[#D80F16] mb-2">OOOOPS...</span>
          <span className="text-black">YOUR BAG IS EMPTY</span>
        </div>
        <div>
          <Link to="/products">
            <Button
              onClick={onClose}
              className="flex items-center justify-center gap-x-5 px-3 py-4  bg-[#D80F16] rounded-[100px] w-full hover:opacity-80"
            >
              Start shopping
              <svg
                width="11"
                height="10"
                viewBox="0 0 11 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.45672 2.20542L3.44174 7.9394"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3.38001 2.79731L7.55799 2.06044L8.29492 6.23877"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </Link>
        </div>
      </section>
     
    </div>

   
  );
}
