import {useParams, Form, Await, useMatches, Links} from '@remix-run/react';
import {useWindowScroll} from 'react-use';
import {Disclosure} from '@headlessui/react';
import {Suspense, useEffect, useMemo} from 'react';

import {
  Drawer,
  useDrawer,
  Text,
  Input,
  IconLogin,
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

import type {LayoutData} from '../root';

import logo from '~/../public/logo.svg';
import banner1 from '~/../public/banner1.png';
import banner2 from '~/../public/banner2.png';
import banner3 from '~/../public/banner3.png';

export function Layout({
  children,
  layout,
}: {
  children: React.ReactNode;
  layout: LayoutData;
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
        />
        <main role="main" id="mainContent" className="flex-grow">
          {children}
        </main>
      </div>
      <Footer menu={layout?.footerMenu} />
    </>
  );
}

function Header({title, menu}: {title: string; menu?: EnhancedMenu}) {
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
              <Link to="/products" className="inline-block">
                <div className="flex justify-center items-center bg-[url('/banner1.png')] bg-no-repeat	 w-[345px] h-[120px]">
                  <span className="uppercase  text-3xl">All products</span>
                </div>
              </Link>
            );
          }

          if (item.to === '/collections/freestyle') {
            return (
              <Link to="/collections">
                <div className="flex justify-center items-center bg-[url('/banner2.png')] bg-no-repeat	 w-[345px] h-[120px]">
                  <span className="uppercase text-3xl">Shop bundles</span>
                </div>
              </Link>
            );
          }

          if (item.to === '/journal') {
            return (
              <Link to="/journal">
                <div className="flex justify-center items-center bg-[url('/banner3.png')] bg-no-repeat	 w-[345px] h-[120px]">
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
      } flex lg:hidden items-center h-nav sticky backdrop-blur-lg z-40 top-0 justify-between w-full leading-none gap-4 px-4 py-8 md:px-8`}
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
          {/* {title} */}
          <div className="p-2 ">
            <img src={logo} alt="" className="w-[50px] h-[50px]" />
          </div>
        </Heading>
        {/* {logo} */}
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
}: {
  isHome: boolean;
  openCart: () => void;
  menu?: EnhancedMenu;
  title: string;
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
      } hidden h-nav lg:flex items-center justify-center sticky transition duration-300 backdrop-blur-lg z-40 top-0  w-full leading-none gap-10 px-12 py-8`}
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
        <div className="flex gap-12">
          <nav className="flex gap-10 font-bebas items-center justify-center">
            {/* Top level menu items */}
            {(menu?.items || []).map((item) => {
              if (item.to === '/') {
                return (
                  <Link to="/" className="w-[70px] h-[70px]">
                    <img src={logo} alt="" className="" />
                  </Link>
                );
              }

              return (
                <Link
                  key={item.id}
                  to={item.to}
                  target={item.target}
                  prefetch="intent"
                  className={({isActive}) =>
                    isActive ? 'pb-1 border-b -mb-px' : 'pb-1'
                  }
                >
                  {item.title}
                </Link>
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

        <div
          className={`${
            dark
              ? 'text-primary bg-contrast dark:text-contrast dark:bg-primary'
              : 'text-contrast bg-primary'
          } absolute bottom-1 right-1 text-[0.625rem] font-medium subpixel-antialiased h-3 min-w-[0.75rem] flex items-center justify-center leading-none text-center rounded-full w-auto px-[0.125rem] pb-px`}
        >
          <span>{count || 0}</span>
        </div>
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

function Footer({menu}: {menu?: EnhancedMenu}) {
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
      className={`grid min-h-[25rem] items-start grid-flow-row w-full gap-6 py-8 px-6 md:px-8 lg:px-12 md:gap-8 lg:gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-${itemsCount}
        bg-primary dark:bg-contrast dark:text-primary text-contrast overflow-hidden`}
    >
      <FooterMenu menu={menu} />
      <CountrySelector />
      <div
        className={`self-end pt-8 opacity-50 md:col-span-2 lg:col-span-${itemsCount}`}
      >
        &copy; {new Date().getFullYear()} / Shopify, Inc. Hydrogen is an MIT
        Licensed Open Source project.
      </div>
    </Section>
  );
}

const FooterLink = ({item}: {item: EnhancedMenuItem}) => {
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

function FooterMenu({menu}: {menu?: EnhancedMenu}) {
  const styles = {
    section: 'grid gap-4',
    nav: 'grid gap-2 pb-6',
  };

  return (
    <>
      {(menu?.items || []).map((item: EnhancedMenuItem) => (
        <section key={item.id} className={styles.section}>
          <Disclosure>
            {({open}) => (
              <>
                <Disclosure.Button className="text-left md:cursor-default">
                  <Heading className="flex justify-between" size="lead" as="h3">
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
