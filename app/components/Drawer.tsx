import {Fragment, useState} from 'react';
import {Dialog, Transition} from '@headlessui/react';
import {useAsyncValue} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';

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

        <div className="fixed ltr:right-0 top-0 w-[512px] rtl:left-0">
          <div className="absolute inset-0 overflow-hidden">
            <div className={`fixed inset-y-0 flex max-w-full `}>
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
                    className={`text-black sticky top-0 flex items-center px-6 h-nav  border-b-[1px] border-black mb-8 ${
                      heading ? 'justify-between' : 'justify-end'
                    }`}
                  >
                    {heading !== null && (
                      <Dialog.Title>
                        <Heading as="span" size="lead" id="cart-contents">
                          <span className="uppercase font-bebas !font-normal !text-[32px]">
                            Your bag ({cart?.totalQuantity})
                          </span>
                        </Heading>
                      </Dialog.Title>
                    )}

                    <button
                      type="button"
                      className="p-4 -m-4 text-black transition hover:text-primary/30 "
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
  // }
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
