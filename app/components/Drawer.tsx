import {Fragment, useState} from 'react';
import {Dialog, Transition} from '@headlessui/react';
import {useAsyncValue} from '@remix-run/react';

import {Heading, IconClose} from '~/components';
import {Cart} from '~/components';

import CartCount from './Layout';

import mobLogo from '~/../public/mob-logo.svg';

/**
 * Drawer component that opens on user click.
 * @param heading - string. Shown at the top of the drawer.
 * @param open - boolean state. if true opens the drawer.
 * @param onClose - function should set the open state.
 * @param openFrom - right, left
 * @param children - react children node.
 */

export function Drawer({
  heading,
  open,
  onClose,
  openFrom = 'right',
  children,
  isHome,
  openCart,
}: {
  heading?: string;
  open: boolean;
  onClose: () => void;
  openFrom: 'right' | 'left';
  children: React.ReactNode;
  isHome: boolean;
  openCart: () => void;
}) {
  const offScreen = {
    right: 'translate-x-full',
    left: '-translate-x-full',
  };
  const cart = useAsyncValue();

  if (openFrom === 'left') {
    return (
      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className=" relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 left-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 ">
            <div className="absolute inset-0 overflow-hidden ">
              <div
                className={` fixed inset-y-0 flex max-w-full  ${
                  openFrom === 'right' ? 'right-0' : ''
                }`}
              >
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-300"
                  enterFrom={offScreen[openFrom]}
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-300"
                  leaveFrom="translate-x-0"
                  leaveTo={offScreen[openFrom]}
                >
                  <Dialog.Panel className=" bg-[#D80F16] w-screen max-w-lg text-left align-middle transition-all transform shadow-xl h-screen-dynamic ">
                    <header
                      className={`sticky top-0 flex items-center px-6 py-8  h-nav sm:px-8 md:px-12 border-b-[1px] border-b-[#7f7878b0] ${
                        heading ? 'justify-between' : 'justify-end'
                      }`}
                    >
                      <button
                        type="button"
                        className="p-4 -m-4 transition text-white hover:text-primary/50 z-10"
                        onClick={onClose}
                        data-test="close-cart"
                      >
                        <IconClose aria-label="Close panel" />
                      </button>

                      <div className="">
                        <img
                          src={mobLogo}
                          alt=""
                          className="w-[48px] h-[48px] "
                        />
                      </div>
                      {/* <IconBag /> */}
                      <CartCount isHome={isHome} openCart={openCart} />
                      {/* <div className="">
                        <svg
                          width="24"
                          height="26"
                          viewBox="0 0 24 26"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M17 25H7C6.44772 25 6 24.5523 6 24V13.4002C6 13.1433 6.09886 12.8963 6.27608 12.7103L7.65517 11.2632L9.47725 9.17736C9.63642 8.99515 9.72414 8.76141 9.72414 8.51947V5.60004C9.72414 5.28823 9.57869 4.99426 9.33081 4.80509L9.08298 4.61596C8.8351 4.42679 8.68966 4.13282 8.68966 3.82101V2C8.68966 1.44772 9.13737 1 9.68965 1H14.3103C14.8626 1 15.3103 1.44772 15.3103 2V3.76666C15.3103 4.10866 15.1356 4.42694 14.847 4.61047L14.5627 4.79124C14.2577 4.9852 14.0812 5.32866 14.1009 5.68957L14.2571 8.55078C14.2693 8.77366 14.3556 8.98606 14.5025 9.15416L16.3448 11.2632L17.7239 12.7103C17.9011 12.8963 18 13.1433 18 13.4002V24C18 24.5523 17.5523 25 17 25Z"
                            stroke="white"
                            strokeWidth="2"
                          />
                        </svg>
                      </div> */}
                    </header>
                    {children}
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  }
  if (openFrom === 'right') {
    return (
      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 left-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0">
            <div className="absolute inset-0 overflow-hidden">
              <div
                className={`fixed inset-y-0 flex max-w-full ${
                  openFrom === 'right' ? 'right-0' : ''
                }`}
              >
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-300"
                  enterFrom={offScreen[openFrom]}
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-300"
                  leaveFrom="translate-x-0"
                  leaveTo={offScreen[openFrom]}
                >
                  <Dialog.Panel className="w-screen max-w-lg text-left align-middle transition-all transform shadow-xl h-screen-dynamic bg-[#FFFEFA]">
                    <header
                      //classname different
                      className={`text-black sticky top-0 flex items-center px-6 h-nav sm:px-8 md:px-12 border-b-[1px] border-black mb-8 ${
                        heading ? 'justify-between' : 'justify-end'
                      }`}
                    >
                      {heading !== null && (
                        <Dialog.Title>
                          <Heading as="span" size="lead" id="cart-contents">
                            <span className="uppercase font-bebas !font-normal !text-[32px]">
                              Your bag ({cart?.totalQuantity})
                            </span>
                            {/* {heading} */}
                          </Heading>
                        </Dialog.Title>
                      )}

                      <button
                        type="button"
                        className="p-4 -m-4 text-black transition hover:text-primary/30"
                        onClick={onClose}
                        data-test="close-cart"
                      >
                        <IconClose aria-label="Close panel" />
                      </button>
                    </header>
                    <div className="grid">
                      <Cart layout="drawer" onClose={onClose} cart={cart} />
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  }
}

/* Use for associating arialabelledby with the title*/
Drawer.Title = Dialog.Title;

export function useDrawer(openDefault = false) {
  const [isOpen, setIsOpen] = useState(openDefault);

  function openDrawer() {
    setIsOpen(true);
  }

  function closeDrawer() {
    setIsOpen(false);
  }

  return {
    isOpen,
    openDrawer,
    closeDrawer,
  };
}
