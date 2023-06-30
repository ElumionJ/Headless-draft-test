import {Collection, Product} from '@shopify/hydrogen/storefront-api-types';
import {LoaderArgs} from '@shopify/remix-oxygen';

export enum FilterParamsKey {
  VENDORS = 'productVendor',
  AVAILABLE = 'available',
  PRODUCT_TYPE = 'productType',
}

interface PrettyParams {
  [key: string]: string[];
}

export function filterGivenProducts(collection: Collection, request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const paramsObj: PrettyParams[] = [];

  searchParams.forEach((value, key) => {
    paramsObj.push({
      [key]: value.split(','),
    });
  });
  let productsCopy = [...collection.products.nodes];
  paramsObj.forEach((param) => {
    productsCopy = productsCopy.filter((product, i) => {
      return filterCases(product, param);
    });
  });
  collection.products.nodes = productsCopy;
}

function filterCases(product: Product, param: PrettyParams): boolean {
  const type = Object.keys(param)[0];
  switch (type) {
    case FilterParamsKey.AVAILABLE:
      return param[type].some((el) => {
        const condition = el === 'true';
        return condition === product.variants.nodes[0].availableForSale;
      });
    case FilterParamsKey.VENDORS:
      return param[type].some((el) => {
        return product.variants.nodes[0].product.vendor === el;
      });
    case FilterParamsKey.PRODUCT_TYPE:
      return param[type].some((el) => {
        return product.productType === el;
      });
    default:
      return true;
  }
}
