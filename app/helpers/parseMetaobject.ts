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
  const references: any[] = [];

  await Promise.all(
    metaobject.fields.map(async (el) => {
      if (el.type === 'file_reference') {
        parsedMetaobject[el.key] = {...el};
        references.push(parsedMetaobject[el.key]);
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

  const res = await storefront.query(IMAGE_QUERY, {
    variables: {id: references.map((el) => el.value)},
  });
  res.nodes.forEach((el, i) => {
    references[i].value = el.image;
  });

  return parsedMetaobject;
}

const IMAGE_QUERY = `#graphql
query GetImage($id:[ID!]!){
  nodes(ids: $id) {
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
