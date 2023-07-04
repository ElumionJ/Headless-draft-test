import clsx from 'clsx';
import {useContext, useEffect, useRef} from 'react';
import {useScroll} from 'react-use';
import {flattenConnection, Image, Money} from '@shopify/hydrogen';
import type {
  Cart as CartType,
  CartCost,
  CartLine,
  CartLineUpdateInput,
  Product,
} from '@shopify/hydrogen/storefront-api-types';
import {useFetcher, useLocation, useMatches} from '@remix-run/react';

import {Button, IconRemove, IconClose, Text, Link, Heading} from '~/components';
import {CartAction} from '~/lib/type';

import {useLanguageText} from '~/hooks/useLanguageText';

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
    page: 'w-full pt-4 pb-12 lg:flex md:pt-8 md:items-start lg:pt-0',
  };

  if (layout === 'page' && !cartHasItems) {
    return <></>;
  }

  //Kate

  const arText = 'حقيبتي';
  const enText = 'My bag';

  const languageText = useLanguageText({ar_text: arText, en_text: enText});

  return (
    // When its empty - work not correct
    <div className="flex flex-col w-full bg-[#FFFEFA] text-black ">
      {layout === 'page' && (
        <span className="pl-6 rtl:pr-6 rtl:pl-0 pt-3 lg:pt-8 lg:pb-6 lg:pl-[32px] rtl:lg:pl-0 rtl:lg:pr-[32px]  font-normal uppercase font-bebas text-[32px]">
          {languageText} ({cart?.totalQuantity})
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
              <button aria-label="Button">
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
        ? 'item flex items-start justify-start md:w-1/4'
        : 'item ajax-styles flex flex-col justify-between w-1/4',

    price:
      layout === 'page'
        ? 'item flex  flex-row-reverse gap-x-8 font-bebas text-[20px]'
        : 'item ajax-styles flex flex-col  gap-y-16 font-bebas text-[20px] max-w-[65px] w-full',
  };

  const className = clsx([
    // y > 0 ? 'border-t' : '',
    y > 0 ? '' : '',
    layout === 'page'
      ? 'flex-grow  md:translate-y-4 pr-6 pl-6 h-fit  border-y-[1px] border-black pt-[40px]'
      : 'px-6 pb-6 sm-max:pt-2 overflow-auto transition  text-black',
  ]);

  return (
    <section
      ref={scrollRef}
      aria-labelledby="cart-contents"
      className={className}
    >
      <ul className="">
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
  const [root] = useMatches();

  const {origin, pathname} = new URL(checkoutUrl);
  if (!checkoutUrl) return null;
  const validCheckoutUrl = `${origin}/${
    root.params.locale || 'en-us'
  }${pathname.substring(6)}`;

  const arText = 'الخروج الآمن';
  const enText = 'Secure Checkout';

  const languageText = useLanguageText({ar_text: arText, en_text: enText});

  const arTextForBag = 'حقيبة عرض';
  const enTextForBag = 'View bag';

  const languageTextForBag = useLanguageText({
    ar_text: arTextForBag,
    en_text: enTextForBag,
  });

  return (
    <div className="flex flex-col items-center justify-center mt-2">
      <a href={validCheckoutUrl} target="_self" className="w-full">
        <Button
          aria-label="Language"
          as="span"
          width="full"
          className="font-bold text-white mb-4 uppercase text-xs font-noto flex items-center justify-center gap-x-2 px-3 py-4  bg-c-red w-full hover:opacity-80"
        >
          {languageText}
          <svg
            className="rtl:scale-x-[-1]"
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
        <Link to={'/cart'} reloadDocument>
          <span className="flex flex-row  items-center justify-center  font-bold font-noto text-xs  text-black uppercase border-b-2 border-black w-fit gap-x-2 hover:opacity-80">
            {languageTextForBag}
            <svg
              className="rtl:scale-x-[-1]"
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
          </span>
        </Link>
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
    page: 'sticky top-nav grid gap-6 pt-8 lg:pt-0 md:translate-y-4 rounded lg:w-1/3 lg:ml-10 rtl:lg:mr-10 rtl:lg:ml-0',
  };

  //Kate
  const arText = 'ملخص الطلب';
  const enText = 'Order summary';

  const languageText = useLanguageText({ar_text: arText, en_text: enText});

  //Kate
  const arTextTotal = 'المجموع';
  const enTextTotal = 'Total';

  const languageTextTotal = useLanguageText({
    ar_text: arTextTotal,
    en_text: enTextTotal,
  });

  //Kate
  const arTextTotalDelivery = 'التسليم يحسب عند الخروج';
  const enTextTotalDelivery = ' Delivery calculated at checkout';

  const languageTextDelivery = useLanguageText({
    ar_text: arTextTotalDelivery,
    en_text: enTextTotalDelivery,
  });

  //Kate
  const arTextTotalSubtotal = 'المجموع الفرعي';
  const enTextTotalSubtotal = 'Subtotal';

  const languageTextSubtotal = useLanguageText({
    ar_text: arTextTotalSubtotal,
    en_text: enTextTotalSubtotal,
  });

  return (
    <section aria-labelledby="summary-heading" className={summary[layout]}>
      <div className="mb-5 p-4 md:px-6 bg-[#F2F2F2] h-fit  ">
        <h2 id="summary-heading" className="sr-only">
          {languageText}
        </h2>

        <dl className="grid">
          {layout === 'page' && (
            <>
              <dt className="font-bebas text-2xl p-6 pb-6 font-normal uppercase text-[black] border-b-[1px] border-[#E0E0E0]">
                {languageText}
              </dt>

              <dd className="flex items-center justify-between p-6">
                <span className="uppercase text-[black] font-bebas text-2xl">
                  {languageTextTotal}
                </span>
                <span
                  className="text-feature-link-color font-bebas text-2xl"
                  data-test="subtotal"
                >
                  {cost?.subtotalAmount?.amount ? (
                    <Money data={cost?.subtotalAmount} />
                  ) : (
                    '-'
                  )}
                </span>
              </dd>

              <dd className="p-6 font-noto text-base">
                {languageTextDelivery}
              </dd>
            </>
          )}

          {/* drawer */}
          {layout === 'drawer' && (
            <>
              <dt className="flex items-center justify-between font-semibold">
                <span className="uppercase text-[black] pb-2 font-bebas text-2xl font-normal">
                  {languageTextSubtotal}
                </span>
                <span
                  className="text-feature-link-color font-bebas font-normal text-2xl"
                  data-test="subtotal"
                >
                  {cost?.subtotalAmount?.amount ? (
                    <Money data={cost?.subtotalAmount} />
                  ) : (
                    '-'
                  )}
                </span>
              </dt>
              <dd>{children}</dd>
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
      className={` gt-sm:relative flex gap-4 mb-4 border-solid border-b-[1px] border-[#E0E0E0] gt-sm:justify-end pb-4 last:border-none`}
    >
      <div className="flex-shrink w-max">
        {merchandise.image && (
          <Image
            width={110}
            height={110}
            data={merchandise.image}
            className="object-cover object-center w-24 h-24 border rounded md:w-28 md:h-[120px]"
            alt={merchandise.title}
            loading="lazy"
          />
        )}
      </div>

      {/*  className="flex items-center justify-between flex-grow gap-6" */}
      <div className="flex flex-col sm:flex-row justify-between flex-grow w-1/4">
        <div className={additionalClasses.cartItem}>
          {/* max-w-[200px] */}
          <div className="font-bebas text-base flex flex-col h-full justify-between">
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
        </div>

        <div className="flex justify-start text-copy ">
          <CartLineQuantityAdjust line={line} />
        </div>

        <Text>
          <div className={additionalClasses.price}>
            <div className="gt-sm:absolute gt-sm:top-0 gt-sm:right-0  rtl:gt-sm:right-auto rtl:gt-sm:left-0 flex justify-end">
              <ItemRemoveButton lineIds={[id]} />
            </div>

            <CartLinePrice
              line={line}
              as="span"
              className="font-semibold gt-sm:absolute gt-sm:bottom-[20px] gt-sm:right-0 rtl:gt-sm:right-auto rtl:gt-sm:left-0 md:w-[80px]"
            />
          </div>
        </Text>
      </div>
    </li>
  );
}

function ItemRemoveButton({lineIds}: {lineIds: CartLine['id'][]}) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form action="/cart" method="post" className="w-6 ">
      <input
        type="hidden"
        name="cartAction"
        value={CartAction.REMOVE_FROM_CART}
      />
      <input type="hidden" name="linesIds" value={JSON.stringify(lineIds)} />
      <button
        className="flex items-center justify-center w-6 h-6 rounded-[50%] bg-[#F2F2F2] text-black"
        type="submit"
        aria-label="Submit"
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
      <div className="gt-m:h-[38px] flex border border-black font-bebas h-fit items-center relative md:w-full ">
        <UpdateCartButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            name="decrease-quantity"
            aria-label="Decrease quantity"
            className="gt-m:w-5 gt-m:h-5  w-10 h-10 font-semibold text-black transition hover:opacity-80 disabled:opacity-30"
            value={prevQuantity}
            disabled={quantity <= 1}
          >
            <span>&#8722;</span>
          </button>
        </UpdateCartButton>

        <div
          className="gt-m:w-5 gt-m:h-5 font-semibold text-center md:absolute md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2"
          data-test="item-quantity"
        >
          {quantity}
        </div>

        <UpdateCartButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            className="gt-m:w-5 gt-m:h-5  w-10 h-10 font-semibold text-black transition hover:opacity-80"
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

  //Kate
  const arText = 'حقيبتك فارغة';
  const enText = ' YOUR BAG IS EMPTY';

  const languageText = useLanguageText({ar_text: arText, en_text: enText});

  const arTextStart = 'ابدأ التسوق';
  const enTextStart = 'Start shopping';

  const languageTextStart = useLanguageText({
    ar_text: arTextStart,
    en_text: enTextStart,
  });

  return (
    <div ref={scrollRef} className={container[layout]} hidden={hidden}>
      <section className="grid gap-8 pt-12 ">
        <div className="flex flex-col items-center justify-center ">
          <span className="text-feature-link-color mb-2 font-bebas font-normal text-[32px]">
            OOOOPS...
          </span>
          <span className="text-black font-bebas font-normal text-[24px]">
            {languageText}
          </span>
        </div>
        <div>
          <Link to="/products">
            <Button
              aria-label="Language"
              onClick={onClose}
              className="flex items-center justify-center gap-x-5 px-3 py-4 w-[200px] bg-c-red m-auto hover:opacity-80 text-white font-noto uppercase text-xs font-bold"
            >
              {languageTextStart}
              <svg
                className="rtl:scale-x-[-1]"
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
