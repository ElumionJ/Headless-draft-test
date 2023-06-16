import {useParams, Form, Await, useMatches} from '@remix-run/react';
import {useWindowScroll} from 'react-use';
import {Disclosure} from '@headlessui/react';
import {Suspense, useEffect, useMemo} from 'react';

import {
  Drawer,
  useDrawer,
  Text,
  Input,
  IconAccount,
  IconBag,
  IconSearch,
  Heading,
  IconMenu,
  IconCaret,
  Section,
  CountrySelector,
  CartLoading,
  Link,
  Button,
} from '~/components';

import {
  type EnhancedMenu,
  type EnhancedMenuItem,
  useIsHomePath,
} from '~/lib/utils';
import {useIsHydrated} from '~/hooks/useIsHydrated';
import {useCartFetchers} from '~/hooks/useCartFetchers';

import logo from '~/../public/logo.svg';
import banner1 from '~/../public/banner1.png';
import banner2 from '~/../public/banner2.png';
import banner3 from '~/../public/banner3.png';
import footer from '~/../public/footer.png';

import type {LayoutData} from '../root';

interface ParsedMetaobject {
  [key: string]: {
    key: string;
    type: string;
    value: string | {url: string};
  };
}

export function Layout({
  children,
  layout,
  menuLinks,
  metaObject,
}: {
  children: React.ReactNode;
  layout: LayoutData;
  menuLinks: any;
  metaObject: any;
}) {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <div className="">
          <a href="#mainContent" className="sr-only">
            Skip to content
          </a>
        </div>
        <Header
          title={layout?.shop.name ?? 'Hydrogen'}
          menu={layout?.headerMenu}
          imagesLinks={metaObject}
        />
        <main role="main" id="mainContent" className="flex-grow">
          {children}
        </main>
      </div>
      <div className="gt-md:hidden fr-md:!block">
        <Footer menu={layout?.footerMenu} />
      </div>
      <div className="md:hidden fr-md:!hidden">
        <FooterMob menu={layout?.footerMenu} />
      </div>
    </>
  );
}

function Header({
  title,
  menu,
  imagesLinks,
}: {
  title: string;
  menu?: EnhancedMenu;
  imagesLinks: ParsedMetaobject;
}) {
  const isHome = useIsHomePath();

  const {
    isOpen: isCartOpen,
    openDrawer: openCart,
    closeDrawer: closeCart,
  } = useDrawer();

  const {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();

  const addToCartFetchers = useCartFetchers('ADD_TO_CART');

  // toggle cart drawer when adding to cart
  useEffect(() => {
    if (isCartOpen || !addToCartFetchers.length) return;
    openCart();
  }, [addToCartFetchers, isCartOpen, openCart]);
  return (
    <>
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      {menu && (
        <MenuDrawer isOpen={isMenuOpen} onClose={closeMenu} menu={menu} />
      )}
      <DesktopHeader
        isHome={isHome}
        title={title}
        menu={menu}
        openCart={openCart}
        imagesLinks={imagesLinks}
      />
      <MobileHeader
        isHome={isHome}
        title={title}
        openCart={openCart}
        openMenu={openMenu}
      />
    </>
  );
}

function CartDrawer({isOpen, onClose}: {isOpen: boolean; onClose: () => void}) {
  const [root] = useMatches();

  return (
    <Suspense fallback={<CartLoading />}>
      <Await resolve={root.data?.cart}>
        <Drawer
          open={isOpen}
          onClose={onClose}
          heading="Cart"
          openFrom="right"
        />
      </Await>
    </Suspense>
  );
}

export function MenuDrawer({
  isOpen,
  onClose,
  menu,
}: {
  isOpen: boolean;
  onClose: () => void;
  menu: EnhancedMenu;
}) {
  return (
    <Drawer open={isOpen} onClose={onClose} openFrom="left" heading="Menu">
      <div className="grid ">
        <MenuMobileNav menu={menu} onClose={onClose} />
      </div>
    </Drawer>
  );
}

function MenuMobileNav({
  menu,
  onClose,
  isHome,
}: {
  menu: EnhancedMenu;
  onClose: () => void;
  isHome: boolean;
}) {
  const params = useParams();

  return (
    <>
      <nav className="font-bebas grid gap-4 p-[17px] pt-6 sm:gap-6   sm:py-8 text-white">
        <Form
          method="get"
          action={params.locale ? `/${params.locale}/search` : '/search'}
          className="font-noto items-center gap-2 sm:flex bg-white rounded-[100px] mb-8"
        >
          <button
            type="submit"
            className="relative flex items-center justify-center w-8 h-8 text-[#A0A0A0] pl-[10px]"
          >
            <div>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="6.74142"
                  cy="6.74142"
                  r="6.74142"
                  transform="matrix(-1 0 0 1 15.918 2.08398)"
                  stroke="#A0A0A0"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4.48828 13.8652L1.84526 16.5014"
                  stroke="#A0A0A0"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </button>
          <Input
            className={
              isHome
                ? 'focus:border-contrast/20 dark:focus:border-primary/20 text-black w-full'
                : 'focus:border-primary/20 text-black w-full'
            }
            type="search"
            variant="minisearch"
            placeholder="Tabasco, Cholula, Very Hot"
            name="q"
          />
        </Form>
        {/* Top level menu items */}
        {(menu?.items || []).map((item) => {
          if (item.to === '/products') {
            return (
              <Link to="/products" key={item.id}>
                <div
                  className="flex justify-center items-center bg-no-repeat w-[345px] h-[120px]"
                  style={{backgroundImage: `url(${banner1})`}}
                >
                  <span className="uppercase  text-3xl">All products</span>
                </div>
              </Link>
            );
          }

          if (item.to === '/collections/freestyle') {
            return (
              <Link to="/collections" key={item.id}>
                <div
                  className="flex justify-center items-center  bg-no-repeat	 w-[345px] h-[120px]"
                  style={{backgroundImage: `url(${banner2})`}}
                >
                  <span className="uppercase text-3xl">Shop bundles</span>
                </div>
              </Link>
            );
          }

          if (item.to === '/journal') {
            return (
              <Link to="/journal" key={item.id}>
                <div
                  className="flex justify-center items-center  bg-no-repeat w-[345px] h-[120px]"
                  style={{backgroundImage: `url(${banner3})`}}
                >
                  <span className="uppercase  text-3xl">Journal</span>
                </div>
              </Link>
            );
          }

          return (
            <span key={item.id} className="block">
              <Link
                to={item.to}
                target={item.target}
                onClick={onClose}
                className={({isActive}) =>
                  isActive ? 'pb-1 border-b -mb-px' : 'pb-1'
                }
              >
                <Text as="span" size="copy">
                  {item.title}
                </Text>
              </Link>
            </span>
          );
        })}
      </nav>

      <a href="/account/login" className="mt-[80px] mx-3">
        <Button
          as="span"
          width="full"
          className=" border-white border-2 text-white mb-4  flex items-center justify-center  px-3 py-4  bg-[#D80F16] rounded-[100px] w-full hover:opacity-80"
        >
          Login
        </Button>
      </a>
    </>
  );
}

function MobileHeader({
  title,
  isHome,
  openCart,
  openMenu,
}: {
  title: string;
  isHome: boolean;
  openCart: () => void;
  openMenu: () => void;
}) {
  // useHeaderStyleFix(containerStyle, setContainerStyle, isHome);

  const params = useParams();

  return (
    <header
      role="banner"
      className={`${
        isHome
          ? 'bg-white dark:bg-contrast/60 text-contrast dark:text-primary shadow-darkHeader'
          : 'bg-contrast/80 text-primary'
      } flex lg:hidden items-center  sticky backdrop-blur-lg z-40 top-0 justify-between w-full leading-none gap-4 px-4 py-8 md:px-8 h-fit`}
    >
      <div className="flex items-center justify-start w-full gap-4 ">
        <button
          onClick={openMenu}
          className="relative flex items-center justify-center w-8 h-8 text-black"
        >
          <IconMenu />
        </button>
      </div>

      <Link
        className="flex items-center self-stretch leading-[3rem] md:leading-[4rem] justify-center flex-grow w-full h-full"
        to="/"
      >
        <Heading
          className="font-bold leading-none text-center"
          as={isHome ? 'h1' : 'h2'}
        >
          <div className="p-2 ">
            <img src={logo} alt="" className="w-[50px] h-[50px]" />
          </div>
        </Heading>
      </Link>

      <div className="flex items-center justify-end w-full gap-4">
        {/* <AccountLink className="relative flex items-center justify-center w-8 h-8" />s */}
        <CartCount isHome={isHome} openCart={openCart} />
      </div>
    </header>
  );
}

function DesktopHeader({
  isHome,
  menu,
  openCart,
  title,
  imagesLinks,
}: {
  isHome: boolean;
  openCart: () => void;
  menu?: EnhancedMenu;
  title: string;
  imagesLinks: ParsedMetaobject;
}) {
  const params = useParams();
  const {y} = useWindowScroll();
  return (
    <header
      role="banner"
      className={`${
        isHome
          ? 'bg-white dark:bg-contrast/60 text-contrast dark:text-primary shadow-darkHeader'
          : 'bg-contrast/80 text-primary'
      } ${
        !isHome && y > 50 && ' shadow-lightHeader'
      } hidden h-fit lg:flex items-center justify-center sticky transition duration-300 backdrop-blur-lg z-40 top-0  w-full leading-none gap-10 px-12 `}
    >
      <div className="flex justify-between items-center lg:gap-x-28 xl:gap-x-60 text-black ">
        <Form
          method="get"
          action={params.locale ? `/${params.locale}/search` : '/search'}
          className="flex items-center gap-2"
        >
          <button
            type="submit"
            className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
          >
            <IconSearch />
          </button>
        </Form>

        <div className=" flex gap-12">
          <nav className="flex gap-10 font-bebas items-center justify-center">
            {/* Top level menu items */}

            {(menu?.items || []).map((item) => {
              if (item.to === '/') {
                return (
                  <div key={item.id} className="h-fit">
                    <Link to="/" key={item.id} className="w-[70px] block">
                      <img src={logo} alt="" className="" />
                    </Link>
                  </div>
                );
              }

              return (
                <div key={`${item.id}`}>
                  <div className="top-menu navigation-item">
                    <Link
                      // onMouseEnter={menuOpen}
                      key={item.id}
                      to={item.to}
                      target={item.target}
                      prefetch="intent"
                      className={({isActive}) => {
                        const mainStyles = `  block py-8 `;
                        return `${mainStyles} ${isActive ? ' ' : ' '} `;
                      }}
                    >
                      {item.title}
                    </Link>

                    {/* nested menu - 2 level*/}

                    {item?.items.length > 0 && (
                      <div className="drop-down hidden absolute pt-10 bg-[#FFF] pb-8 top-full left-0 w-full">
                        <ul className="max-w-5xl flex gap-[125px] mx-auto">
                          {(item?.items || []).map((submenu) => (
                            <li
                              className=" max-w-[150px] "
                              key={`${item.id}-${submenu.id}`}
                            >
                              <Link
                                key={submenu.id}
                                to={submenu.to}
                                target={submenu.target}
                                className="pb-[6px] inline-block uppercase font-bebas text-[20px] leading-[110%] tracking-wider text-[#1f1f1f]"
                              >
                                {submenu.title}
                              </Link>

                              {/*  nested menu - 3 level */}
                              <ul>
                                {submenu.items.length > 0 &&
                                  submenu?.items.map((el) => (
                                    <li key={el.id}>
                                      <Link
                                        className="text-[#333] font-noto leading-[150%] text-[16px]  py-3 inline-block"
                                        key={`${item.id}-${submenu.id}-${el.id}`}
                                        to={el.to}
                                        target={el.target}
                                      >
                                        {el.title}
                                      </Link>
                                    </li>
                                  ))}
                              </ul>
                            </li>
                          ))}

                          <li className="flex gap-x-10 pl-32">
                            {imagesLinks &&
                              typeof imagesLinks.navigation_relative.value ===
                                'string' &&
                              imagesLinks.navigation_relative.value.toLowerCase() ===
                                item.title.toLowerCase() && (
                                <div className="flex flex-col-reverse ">
                                  <Link
                                    to={imagesLinks.link.value}
                                    className="pt-3 text-xl"
                                  >
                                    {imagesLinks.text.value}
                                  </Link>

                                  {imagesLinks.image && (
                                    <img
                                      src={imagesLinks.image.value.url}
                                      alt={imagesLinks.text.value}
                                      width={200}
                                      height={500}
                                    />
                                  )}
                                </div>
                              )}

                            {imagesLinks &&
                              typeof imagesLinks.navigation_relative.value ===
                                'string' &&
                              imagesLinks.navigation_relative.value.toLowerCase() ===
                                item.title.toLowerCase() && (
                                <div className="flex flex-col-reverse">
                                  <Link
                                    to={imagesLinks.link_2.value}
                                    className="pt-3 text-xl"
                                  >
                                    {imagesLinks.text_2.value}
                                  </Link>
                                  {imagesLinks.image_2 && (
                                    <img
                                      src={imagesLinks.image_2.value.url}
                                      alt={imagesLinks.text_2.value}
                                      width={200}
                                      height={500}
                                    />
                                  )}
                                </div>
                              )}
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-9">
          <AccountLink className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5" />
          <CartCount isHome={isHome} openCart={openCart} />
        </div>
      </div>
    </header>
  );
}

function AccountLink({className}: {className?: string}) {
  const [root] = useMatches();
  const isLoggedIn = root.data?.isLoggedIn;
  return isLoggedIn ? (
    <Link to="/account" className={className}>
      <IconAccount />
      <div className="flex items-center justify-center text-black uppercase border-b-2 border-black w-fit gap-x-2 hover:opacity-80">
        Login
      </div>
    </Link>
  ) : (
    <Link to="/account/login" className={className}>
      {/* <IconLogin /> */}
      <div className="tracking-widest font-bebas flex items-center justify-center   uppercase border-b-2  border-black dark:border-white w-fit gap-x-2 hover:opacity-80">
        Login
        <span className="">
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
        </span>
      </div>
    </Link>
  );
}

export default function CartCount({
  isHome,
  openCart,
}: {
  isHome: boolean;
  openCart: () => void;
}) {
  const [root] = useMatches();

  return (
    <Suspense fallback={<Badge count={0} dark={isHome} openCart={openCart} />}>
      <Await resolve={root.data?.cart}>
        {(cart) => (
          <Badge
            dark={isHome}
            openCart={openCart}
            count={cart?.totalQuantity || 0}
          />
        )}
      </Await>
    </Suspense>
  );
}

function Badge({
  openCart,
  dark,
  count,
}: {
  count: number;
  dark: boolean;
  openCart: () => void;
}) {
  const isHydrated = useIsHydrated();

  const BadgeCounter = useMemo(
    () => (
      <>
        <IconBag />

        <span
          className={`${
            dark
              ? 'text-primary bg-contrast dark:text-contrast dark:bg-primary'
              : 'text-contrast bg-primary'
          } absolute bottom-1 right-1 text-[0.625rem] font-medium subpixel-antialiased h-3 min-w-[0.75rem] flex items-center justify-center leading-none text-center rounded-full w-auto px-[0.125rem] pb-px`}
        >
          <span>{count || 0}</span>
        </span>
      </>
    ),
    [count, dark],
  );

  return isHydrated ? (
    <button
      onClick={openCart}
      className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
    >
      {BadgeCounter}
    </button>
  ) : (
    <Link
      to="/cart"
      className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
    >
      {BadgeCounter}
    </Link>
  );
}

//FOOTER
//Desktop
export function Footer({menu}: {menu?: EnhancedMenu}) {
  const isHome = useIsHomePath();
  const itemsCount = menu
    ? menu?.items?.length + 1 > 4
      ? 4
      : menu?.items?.length + 1
    : [];

  return (
    <Section
      divider={isHome ? 'none' : 'top'}
      as="footer"
      role="contentinfo"
      className={`font-bebas uppercase !w-auto  md:gap-5
      bg-gradient-to-r from-white via-white to-white bg-no-repeat bg-cover dark:bg-primary dark:text-contrast text-primary  overflow-hidden`}
      style={{backgroundImage: `url(${footer})`}}
    >
      <div className="flex items-center justify-between  w-full border-b-[1px] border-b-[#E0E0E0] pb-[10px]">
        <Link to="/">
          <div className="">
            <img src={logo} alt="" className="w-[72px] h-[72px]" />
          </div>
        </Link>

        <div className="flex gap-x-8">
          <FooterMenu menu={menu} />
        </div>

        <div className="flex items-center justify-center gap-x-6 ">
          {/* instagram */}

          <a href="/" className="cursor-pointer ">
            <svg
              width="24"
              height="25"
              viewBox="0 0 24 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="hover:fill-[#E1306C]"
            >
              <path
                d="M17.5556 1.01758H6.44444C5.00043 1.01758 3.61559 1.59133 2.59457 2.61254C1.57356 3.63375 1 5.01876 1 6.46288V17.5761C1 19.0203 1.57356 20.4053 2.59457 21.4265C3.61559 22.4477 5.00043 23.0215 6.44444 23.0215H17.5556C18.9996 23.0215 20.3844 22.4477 21.4054 21.4265C22.4264 20.4053 23 19.0203 23 17.5761V6.46288C23 5.01876 22.4264 3.63375 21.4054 2.61254C20.3844 1.59133 18.9996 1.01758 17.5556 1.01758Z"
                stroke="black"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M12 16.0211C13.0609 16.0211 14.0783 15.5995 14.8284 14.8493C15.5786 14.099 16 13.0814 16 12.0203C16 10.9592 15.5786 9.94162 14.8284 9.19133C14.0783 8.44104 13.0609 8.01953 12 8.01953C10.9391 8.01953 9.92172 8.44104 9.17157 9.19133C8.42143 9.94162 8 10.9592 8 12.0203C8 13.0814 8.42143 14.099 9.17157 14.8493C9.92172 15.5995 10.9391 16.0211 12 16.0211Z"
                fill="white"
                stroke="black"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M18 7.01799C18.2652 7.01799 18.5196 6.91261 18.7071 6.72504C18.8946 6.53746 19 6.28306 19 6.01778C19 5.75251 18.8946 5.49811 18.7071 5.31053C18.5196 5.12296 18.2652 5.01758 18 5.01758C17.7348 5.01758 17.4804 5.12296 17.2929 5.31053C17.1054 5.49811 17 5.75251 17 6.01778C17 6.28306 17.1054 6.53746 17.2929 6.72504C17.4804 6.91261 17.7348 7.01799 18 7.01799Z"
                fill="black"
              />
            </svg>
          </a>

          {/* facebook */}
          <a href="/" className=" cursor-pointer">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              // className="hover:fill-[#3b5998]"
            >
              <path
                d="M15.3201 11.3562V9.76226C15.3201 9.07154 15.4794 8.69961 16.595 8.69961H17.9762V6.04297H15.8513C13.1952 6.04297 12.1327 7.79635 12.1327 9.76226V11.3562H10.0078V14.0129H12.1327V21.9828H15.3201V14.0129H17.6575L17.9762 11.3562H15.3201Z"
                fill="black"
              />
              <rect
                x="1"
                y="1"
                width="22"
                height="22"
                rx="4"
                stroke="black"
                strokeWidth="2"
              />
            </svg>
          </a>

          {/* youtube */}
          <a href="/" className=" cursor-pointer">
            <svg
              width="32"
              height="24"
              viewBox="0 0 32 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="hover:fill-[#D80F16]"
            >
              <path
                d="M30.3778 4.73562C30.1722 3.98918 29.7711 3.31128 29.2152 2.77481L29.2144 2.77397C28.6546 2.23298 27.9671 1.84436 27.216 1.64647C26.5642 1.47206 25.5162 1.35792 24.3944 1.27595C23.243 1.19183 21.9245 1.13623 20.6838 1.09931C19.4416 1.06234 18.2693 1.04388 17.4082 1.03466C16.9774 1.03004 16.6239 1.02773 16.3779 1.02658C16.2549 1.026 16.1587 1.02571 16.0932 1.02556L16.0182 1.02544L15.9987 1.02542L15.9978 1.02542C12.299 0.982833 8.60123 1.17129 4.92521 1.58972L4.84466 1.59889L4.76663 1.62092C4.02012 1.83165 3.33807 2.22639 2.78051 2.76835L2.78051 2.76835L2.77794 2.77087C2.22506 3.31217 1.82055 3.98379 1.60853 4.72501L1.59503 4.77224L1.58621 4.82056C1.1831 7.03031 0.987061 9.27394 1.0007 11.5213C0.98671 13.7667 1.18228 16.0097 1.58624 18.2223L1.59463 18.2683L1.60728 18.3133C1.816 19.0559 2.22139 19.7281 2.77843 20.2674C3.33648 20.8077 4.02625 21.1932 4.77727 21.3963L4.78292 21.3978C5.43964 21.5712 6.48928 21.6853 7.61359 21.7673C8.76486 21.8512 10.0806 21.9067 11.3178 21.9436C12.5564 21.9805 13.7242 21.9989 14.5818 22.0081C15.0108 22.0127 15.3626 22.015 15.6075 22.0162C15.73 22.0167 15.8257 22.017 15.891 22.0172L15.9656 22.0173L15.985 22.0173H15.9859C19.6893 22.0599 23.3917 21.8715 27.0723 21.453L27.1439 21.4449L27.2136 21.4266C27.966 21.2288 28.6547 20.8396 29.2153 20.2976L29.2167 20.2962C29.7758 19.7534 30.1762 19.0754 30.3776 18.3331L30.3881 18.2945L30.3954 18.2552C30.8091 16.046 31.0106 13.8012 30.997 11.5524C31.0275 9.28973 30.8259 7.02993 30.3954 4.80969L29.9556 4.85193L30.3778 4.73562Z"
                stroke="black"
                strokeWidth="2"
              />
              <path
                d="M20 11.5L13.25 15.3971L13.25 7.60289L20 11.5Z"
                fill="black"
                className="hover:fill-white"
              />
            </svg>
          </a>
        </div>
      </div>

      <div className="flex items-center  flex-row-reverse gap-x-72">
        <CountrySelector />
        <div
          className={`text-sm self-end opacity-50 md:col-span-2 lg:col-span-${itemsCount}`}
        >
          &copy; {new Date().getFullYear()} / Shopify, Inc. Hydrogen is an MIT
          Licensed Open Source project.
        </div>
      </div>
    </Section>
  );
}

function FooterLink({item}: {item: ChildEnhancedMenuItem}) {
  if (item.to.startsWith('http')) {
    return (
      <a href={item.to} target={item.target} rel="noopener noreferrer">
        {item.title}
      </a>
    );
  }

  return (
    <Link to={item.to} target={item.target} prefetch="intent">
      {item.title}
    </Link>
  );
}

function FooterMenu({menu}: {menu?: EnhancedMenu}) {
  const styles = {
    section: '',
    nav: '',
  };

  return (
    <>
      {(menu?.items || []).map((item) => (
        <section key={item.id} className={styles.section}>
          <Disclosure>
            {({open}) => (
              <>
                <Disclosure.Button className="text-center md:cursor-default hover:text-[#D80F16] ">
                  <Heading className=" cursor-pointer" size="footer" as="h3">
                    {item.title}
                    {item?.items?.length > 0 && (
                      <span className="md:hidden">
                        <IconCaret direction={open ? 'up' : 'down'} />
                      </span>
                    )}
                  </Heading>
                </Disclosure.Button>
                {item?.items?.length > 0 ? (
                  <div
                    className={`${
                      open ? `max-h-48 h-fit` : `max-h-0 md:max-h-fit`
                    } overflow-hidden transition-all duration-300`}
                  >
                    <Suspense data-comment="This suspense fixes a hydration bug in Disclosure.Panel with static prop">
                      <Disclosure.Panel static>
                        <nav className={styles.nav}>
                          {item.items.map((subItem: ChildEnhancedMenuItem) => (
                            <FooterLink key={subItem.id} item={subItem} />
                          ))}
                        </nav>
                      </Disclosure.Panel>
                    </Suspense>
                  </div>
                ) : null}
              </>
            )}
          </Disclosure>
        </section>
      ))}
    </>
  );
}

// MOBILE

function FooterMob({menu}: {menu?: EnhancedMenu}) {
  const isHome = useIsHomePath();
  const itemsCount = menu
    ? menu?.items?.length + 1 > 4
      ? 4
      : menu?.items?.length + 1
    : [];

  return (
    <Section
      divider={isHome ? 'none' : 'top'}
      as="footer"
      role="contentinfo"
      className={`font-bebas uppercase min-h-[15px] grid items-start grid-flow-row w-full py-8 px-6 md:px-8       lg:px-12   lg:gap-12 grid-cols-1  lg:grid-cols-${itemsCount}

      bg-gradient-to-r from-white via-white to-white bg-no-repeat bg-cover dark:bg-primary dark:text-contrast text-primary overflow-hidden`}
      style={{backgroundImage: `url(${footer})`}}
    >
      <div className="flex flex-col items-center justify-center border-b-[1px] border-b-[#E0E0E0]">
        <div className="p-2">
          <img src={logo} alt="" className="w-[70px] h-[70px]" />
        </div>
        <div>
          <span className="flex items-center justify-center mb-[14px]">
            Follow the hot news:
          </span>
          <div className="flex items-center justify-center gap-x-6 mb-8">
            {/* instagram */}
            <svg
              width="24"
              height="25"
              viewBox="0 0 24 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.5556 1.01758H6.44444C5.00043 1.01758 3.61559 1.59133 2.59457 2.61254C1.57356 3.63375 1 5.01876 1 6.46288V17.5761C1 19.0203 1.57356 20.4053 2.59457 21.4265C3.61559 22.4477 5.00043 23.0215 6.44444 23.0215H17.5556C18.9996 23.0215 20.3844 22.4477 21.4054 21.4265C22.4264 20.4053 23 19.0203 23 17.5761V6.46288C23 5.01876 22.4264 3.63375 21.4054 2.61254C20.3844 1.59133 18.9996 1.01758 17.5556 1.01758Z"
                stroke="black"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M12 16.0211C13.0609 16.0211 14.0783 15.5995 14.8284 14.8493C15.5786 14.099 16 13.0814 16 12.0203C16 10.9592 15.5786 9.94162 14.8284 9.19133C14.0783 8.44104 13.0609 8.01953 12 8.01953C10.9391 8.01953 9.92172 8.44104 9.17157 9.19133C8.42143 9.94162 8 10.9592 8 12.0203C8 13.0814 8.42143 14.099 9.17157 14.8493C9.92172 15.5995 10.9391 16.0211 12 16.0211Z"
                fill="white"
                stroke="black"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M18 7.01799C18.2652 7.01799 18.5196 6.91261 18.7071 6.72504C18.8946 6.53746 19 6.28306 19 6.01778C19 5.75251 18.8946 5.49811 18.7071 5.31053C18.5196 5.12296 18.2652 5.01758 18 5.01758C17.7348 5.01758 17.4804 5.12296 17.2929 5.31053C17.1054 5.49811 17 5.75251 17 6.01778C17 6.28306 17.1054 6.53746 17.2929 6.72504C17.4804 6.91261 17.7348 7.01799 18 7.01799Z"
                fill="black"
              />
            </svg>

            {/* facebook */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.3201 11.3562V9.76226C15.3201 9.07154 15.4794 8.69961 16.595 8.69961H17.9762V6.04297H15.8513C13.1952 6.04297 12.1327 7.79635 12.1327 9.76226V11.3562H10.0078V14.0129H12.1327V21.9828H15.3201V14.0129H17.6575L17.9762 11.3562H15.3201Z"
                fill="black"
              />
              <rect
                x="1"
                y="1"
                width="22"
                height="22"
                rx="4"
                stroke="black"
                strokeWidth="2"
              />
            </svg>

            {/* youtube */}
            <svg
              width="32"
              height="24"
              viewBox="0 0 32 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M30.3778 4.73562C30.1722 3.98918 29.7711 3.31128 29.2152 2.77481L29.2144 2.77397C28.6546 2.23298 27.9671 1.84436 27.216 1.64647C26.5642 1.47206 25.5162 1.35792 24.3944 1.27595C23.243 1.19183 21.9245 1.13623 20.6838 1.09931C19.4416 1.06234 18.2693 1.04388 17.4082 1.03466C16.9774 1.03004 16.6239 1.02773 16.3779 1.02658C16.2549 1.026 16.1587 1.02571 16.0932 1.02556L16.0182 1.02544L15.9987 1.02542L15.9978 1.02542C12.299 0.982833 8.60123 1.17129 4.92521 1.58972L4.84466 1.59889L4.76663 1.62092C4.02012 1.83165 3.33807 2.22639 2.78051 2.76835L2.78051 2.76835L2.77794 2.77087C2.22506 3.31217 1.82055 3.98379 1.60853 4.72501L1.59503 4.77224L1.58621 4.82056C1.1831 7.03031 0.987061 9.27394 1.0007 11.5213C0.98671 13.7667 1.18228 16.0097 1.58624 18.2223L1.59463 18.2683L1.60728 18.3133C1.816 19.0559 2.22139 19.7281 2.77843 20.2674C3.33648 20.8077 4.02625 21.1932 4.77727 21.3963L4.78292 21.3978C5.43964 21.5712 6.48928 21.6853 7.61359 21.7673C8.76486 21.8512 10.0806 21.9067 11.3178 21.9436C12.5564 21.9805 13.7242 21.9989 14.5818 22.0081C15.0108 22.0127 15.3626 22.015 15.6075 22.0162C15.73 22.0167 15.8257 22.017 15.891 22.0172L15.9656 22.0173L15.985 22.0173H15.9859C19.6893 22.0599 23.3917 21.8715 27.0723 21.453L27.1439 21.4449L27.2136 21.4266C27.966 21.2288 28.6547 20.8396 29.2153 20.2976L29.2167 20.2962C29.7758 19.7534 30.1762 19.0754 30.3776 18.3331L30.3881 18.2945L30.3954 18.2552C30.8091 16.046 31.0106 13.8012 30.997 11.5524C31.0275 9.28973 30.8259 7.02993 30.3954 4.80969L29.9556 4.85193L30.3778 4.73562Z"
                stroke="black"
                strokeWidth="2"
              />
              <path
                d="M20 11.5L13.25 15.3971L13.25 7.60289L20 11.5Z"
                fill="black"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="border-b-[1px] border-b-[#E0E0E0] md:block ">
        <FooterMenuMob menu={menu} />
      </div>

      <div className="">
        <div
          className={`pb-2 text-sm self-end opacity-50 md:col-span-2 lg:col-span-${itemsCount}`}
        >
          &copy; {new Date().getFullYear()} / Shopify, Inc. Hydrogen is an MIT
          Licensed Open Source project.
        </div>
        <div className="flex !items-start">
          <CountrySelector />
        </div>
      </div>
    </Section>
  );
}

const FooterLinkMob = ({item}: {item: EnhancedMenuItem}) => {
  if (item.to.startsWith('http')) {
    return (
      <a href={item.to} target={item.target} rel="noopener noreferrer">
        {item.title}
      </a>
    );
  }

  return (
    <Link to={item.to} target={item.target} prefetch="intent">
      {item.title}
    </Link>
  );
};

function FooterMenuMob({menu}: {menu?: EnhancedMenu}) {
  const styles = {
    section: 'grid gap-4 mb-5',
    nav: 'grid gap-2 pb-6',
  };

  return (
    <>
      {(menu?.items || []).map((item: EnhancedMenuItem) => (
        <section key={item.id} className={styles.section}>
          <Disclosure>
            {({open}) => (
              <>
                <Disclosure.Button className="text-left md:cursor-default ">
                  <Heading
                    className="flex justify-between "
                    size="footer"
                    as="h3"
                  >
                    {item.title}
                    {item?.items?.length > 0 && (
                      <span className="md:hidden ">
                        <IconCaret direction={open ? 'up' : 'down'} />
                      </span>
                    )}
                  </Heading>
                </Disclosure.Button>
                {item?.items?.length > 0 ? (
                  <div
                    className={`${
                      open ? `max-h-48 h-fit` : `max-h-0 md:max-h-fit`
                    } overflow-hidden transition-all duration-300`}
                  >
                    <Suspense data-comment="This suspense fixes a hydration bug in Disclosure.Panel with static prop">
                      <Disclosure.Panel static>
                        <nav className={styles.nav}>
                          {item.items.map((subItem) => (
                            <FooterLink key={subItem.id} item={subItem} />
                          ))}
                        </nav>
                      </Disclosure.Panel>
                    </Suspense>
                  </div>
                ) : null}
              </>
            )}
          </Disclosure>
        </section>
      ))}
    </>
  );
}

function MenuLinks({metaObject}: any) {
  console.log(metaObject);
  return (
    <>
      <h1>menu link</h1>

      <div className="w-2/3 gt-m:w-full relative">
        {/* <Image data={metaObject.image.value} className="w-full h-full" /> */}
        {/* <MediaImage gid={imageValue} alt="test" className="w-full h-full" /> */}
        {/* <Image src={`${banner1}`} alt="test" /> */}
      </div>
      {/* <span>{textValue}</span> */}

      {/* <span>{menuLinks.nodes[1].fields[0].value}</span> */}
    </>
  );
}
