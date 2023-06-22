import formsPlugin from '@tailwindcss/forms';
import typographyPlugin from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        contrast: 'rgb(var(--color-contrast) / <alpha-value>)',
        notice: 'rgb(var(--color-accent) / <alpha-value>)',
        shopPay: 'rgb(var(--color-shop-pay) / <alpha-value>)',
      },
      screens: {
        sm: '32em',
        md: '48em',
        lg: '64em',
        xl: '80em',
        'sm-maximum': {max: '37.5em'}, //600px
        'sm-maximum-md': {min: '37.5em', max: '56.3em'}, //600 - 900
        'md-lg': {min: '56.3em'}, //900 and higher
        '2xl': '96em',
        'sm-max': {max: '48em'},
        'sm-only': {min: '32em', max: '48em'},
        'md-only': {min: '48em', max: '64em'},
        'lg-only': {min: '64em', max: '80em'},
        'xl-only': {min: '80em', max: '96em'},
        '2xl-only': {min: '96em'},
        'fr-md': {min: '47em', max: '49em'},
        'gt-xl': {max: '80em'},
        'gt-l': {max: '58em'},
        'gt-md': {max: '48em'},
        'gt-lg': {max: '64em'},
        'gt-m': {max: '37em'},
        'gt-sm': {max: '32em'},
        'gt-ssm': {max: '30em'},
      },
      spacing: {
        nav: 'var(--height-nav)',
        screen: 'var(--screen-height, 100vh)',
      },
      height: {
        screen: 'var(--screen-height, 100vh)',
        'screen-no-nav':
          'calc(var(--screen-height, 100vh) - var(--height-nav))',
        'screen-dynamic': 'var(--screen-height-dynamic, 100vh)',
      },
      width: {
        mobileGallery: 'calc(100vw - 3rem)',
      },
      fontFamily: {
        sans: ['Helvetica Neue', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // serif: ['"IBMPlexSerif"', 'Palatino', 'ui-serif'],
        bebas: ['Bebas Neue', 'sans-serif'],
        noto: ['Noto Sans', 'sans-serif'],
      },
      fontSize: {
        display: ['var(--font-size-display)', '1.1'],
        heading: ['var(--font-size-heading)', '1.25'],
        lead: ['var(--font-size-lead)', '1.333'],
        copy: ['var(--font-size-copy)', '1.5'],
        fine: ['var(--font-size-fine)', '1.333'],
      },
      backgroundColor: {
        'c-gray': '#F2F2F2',
        'c-red': '#D80F16',
      },
      maxWidth: {
        'prose-narrow': '45ch',
        'prose-wide': '80ch',
      },
      boxShadow: {
        border: 'inset 0px 0px 0px 1px rgb(var(--color-primary) / 0.08)',
        darkHeader: 'inset 0px -1px 0px 0px rgba(21, 21, 21, 0.4)',
        lightHeader: 'inset 0px -1px 0px 0px rgba(21, 21, 21, 0.05)',
        darkPopUp: '0px 0px 30px rgba(0, 0, 0, 0.1)',
      },
      transitionProperty: {
        left: 'left',
      },
      gridTemplateColumns: {
        header: '1fr 1fr 1fr',
      },
    },
  },
  plugins: [formsPlugin, typographyPlugin],
};
