import type {Metaobject} from '@shopify/hydrogen/storefront-api-types';

import type {Storefront} from '~/lib/type';

export default async function parseMetaobject(
  metaobject: Metaobject,
  storefront: Storefront,
) {
  const parsedMetaobject: {
    [key: string]: {
      key: string;
      value: any;
      type: string;
    };
  } = {};

  await Promise.all(
    metaobject.fields.map(async (el) => {
      if (el.type === 'file_reference') {
        const imgUrl = await storefront.query(IMAGE_QUERY, {
          variables: {id: el.value},
        });
        parsedMetaobject[el.key] = {...el, value: imgUrl.node.image};
        return;
      } else if (el.type === 'number_integer') {
        parsedMetaobject[el.key] = {
          ...el,
          value: isNaN(+el.value!) ? 0 : +el.value!,
        };
        return;
      }
      parsedMetaobject[el.key] = {...el};
    }),
  );
  return parsedMetaobject;
}

const IMAGE_QUERY = `#graphql
query GetImage($id:ID!){
  node(id: $id) {
    id
    ... on MediaImage {
      image {
        url
        altText
        height
        id
        width
      }
    }
  }
}
`;
