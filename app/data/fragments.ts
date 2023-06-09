export const MEDIA_FRAGMENT = `#graphql
  fragment Media on Media {
    __typename
    mediaContentType
    alt
    previewImage {
      url
    }
    ... on MediaImage {
      id
      image {
        url
        width
        height
      }
    }
    ... on Video {
      id
      sources {
        mimeType
        url
      }
    }
    ... on Model3d {
      id
      sources {
        mimeType
        url
      }
    }
    ... on ExternalVideo {
      id
      embedUrl
      host
    }
  }
`;

export const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCard on Product {
    id
    title
    publishedAt
    handle
    productType
    media(first:7, sortKey:POSITION){
      nodes{
        previewImage{
          id
          url
          width
          height
          altText
        }
      }
    }
    collections(first:1){
      nodes{
        title
        handle
      }
    }
    variants(first: 1) {
      nodes {
        currentlyNotInStock
        availableForSale
        id
        image {
          url
          altText
          width
          height
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
        product {
          handle
          title
          vendor
        }
      }
    }
  }
`;
