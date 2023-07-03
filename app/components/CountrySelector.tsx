import {useFetcher, useLocation, useMatches} from '@remix-run/react';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useInView} from 'react-intersection-observer';
import clsx from 'clsx';
import type {CartBuyerIdentityInput} from '@shopify/hydrogen/storefront-api-types';

import {Heading, Button, IconCheck} from '~/components';
import type {Localizations, Locale} from '~/lib/type';
import {CartAction} from '~/lib/type';
import {DEFAULT_LOCALE} from '~/lib/utils';
import {useLanguageText} from '~/hooks/useLanguageText';

export function CountrySelector() {
  const [root] = useMatches();
  const fetcher = useFetcher();
  const closeRef = useRef<HTMLDetailsElement>(null);
  const selectedLocale = root.data?.selectedLocale ?? DEFAULT_LOCALE;
  const {pathname, search} = useLocation();
  const pathWithoutLocale = `${pathname.replace(
    selectedLocale.pathPrefix,
    '',
  )}${search}`;

  const countries = (fetcher.data ?? {}) as Localizations;
  const defaultLocale = countries?.['default'];
  const defaultLocalePrefix = defaultLocale
    ? `${defaultLocale?.language}-${defaultLocale?.country}`
    : '';

  const {ref, inView} = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  const observerRef = useRef(null);
  useEffect(() => {
    ref(observerRef.current);
  }, [ref, observerRef]);

  // Get available countries list when in view
  useEffect(() => {
    if (!inView || fetcher.data || fetcher.state === 'loading') return;
    fetcher.load('/api/countries');
  }, [inView, fetcher]);

  const closeDropdown = useCallback(() => {
    closeRef.current?.removeAttribute('open');
  }, []);

  const arText = 'تغيير اللغة إلى:';
  const enText = 'Change language to:';

  const languageText = useLanguageText({ar_text: arText, en_text: enText});

  // function generateMarkup() {
  //   const countryLocale = countries['/ar-sa'];
  //   console.log(countries);
  //   const countryUrlPath = getCountryUrlPath({
  //     countryLocale,
  //     defaultLocalePrefix,
  //     pathWithoutLocale,
  //   });
  //   return (
  //     <div>
  //       <Country
  //         key={'countryPath'}
  //         countryUrlPath={countryUrlPath}
  //         countryLocale={countryLocale}
  //       />
  //     </div>
  //   );
  // }

  return (
    <section ref={observerRef} className=" w-fit " onMouseLeave={closeDropdown}>
      <div className="flex items-center sm-max:justify-start justify-center text-black">
        <div className="lg:hidden">
          <Heading
            size="lead"
            className="cursor-default font-bebas pr-3 rtl:pl-3 rtl:pr-0"
            as="h3"
          >
            {languageText}
          </Heading>
        </div>

        <div className="relative ">
          <details
            className="w-max border-none rounded border-contrast/30 open:round-b-none overflow-clip "
            ref={closeRef}
          >
            <summary className="flex items-center justify-between w-full  cursor-pointer font-bebas">
              <div className="max-h-36">
                {Object.keys(countries).length > 0 &&
                  (() => {
                    const countryLocale =
                      countries[
                        root.data.selectedLocale.language === 'AR'
                          ? 'default'
                          : '/ar-sa'
                      ];
                    const countryUrlPath = getCountryUrlPath({
                      countryLocale,
                      defaultLocalePrefix,
                      pathWithoutLocale,
                    });
                    return (
                      <Country
                        key={'countryPath'}
                        countryUrlPath={countryUrlPath}
                        countryLocale={countryLocale}
                      />
                    );
                  })()}
              </div>
            </summary>
          </details>
        </div>
      </div>
    </section>
  );
}

function Country({
  // closeDropdown,
  countryLocale,
  countryUrlPath,
}: {
  countryLocale: Locale;
  countryUrlPath: string;
}) {
  return (
    <ChangeLocaleForm
      key={countryLocale.country}
      redirectTo={countryUrlPath}
      buyerIdentity={{
        countryCode: countryLocale.country,
      }}
    >
      <button aria-label="Button" type="submit">
        {countryLocale.label}
      </button>
    </ChangeLocaleForm>
  );
}

function ChangeLocaleForm({
  children,
  buyerIdentity,
  redirectTo,
}: {
  children: React.ReactNode;
  buyerIdentity: CartBuyerIdentityInput;
  redirectTo: string;
}) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form action="/cart" method="post">
      <input
        type="hidden"
        name="cartAction"
        value={CartAction.UPDATE_BUYER_IDENTITY}
      />
      <input
        type="hidden"
        name="buyerIdentity"
        value={JSON.stringify(buyerIdentity)}
      />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      {children}
    </fetcher.Form>
  );
}

function getCountryUrlPath({
  countryLocale,
  defaultLocalePrefix,
  pathWithoutLocale,
}: {
  countryLocale: Locale;
  pathWithoutLocale: string;
  defaultLocalePrefix: string;
}) {
  let countryPrefixPath = '';
  const countryLocalePrefix = `${countryLocale.language}-${countryLocale.country}`;

  if (countryLocalePrefix !== defaultLocalePrefix) {
    countryPrefixPath = `/${countryLocalePrefix.toLowerCase()}`;
  }
  return `${countryPrefixPath}${pathWithoutLocale}`;
}
