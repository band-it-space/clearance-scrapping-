import axios from "axios";
import { URL_BIGW } from "./config.js";
import { delay } from "../../addons/index.js";
import {
  specificationFormating,
  descriptionFormating,
  toSlug,
  categotysFormating,
} from "./helpers.js";

export const getProductDetailsBigw = async (productId, prices) => {
  try {
    const { data } = await axios.get(
      `${URL_BIGW}/api/products/v0/product/${productId}`,
      {
        headers: {
          referer: "https://www.bigw.com.au/",
          origin: "https://www.bigw.com.au",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
          "accept-language": "en-US,en;q=0.9",
        },
        timeout: 7000,
      }
    );

    await delay(2000);

    const product = data.products[productId];

    const sizes =
      product.variantCodes
        ?.map((variantId) => {
          const variant = data.products[variantId];
          const isInStore = variant?.convenienceTypes?.includes("IN_STORE");
          if (isInStore) {
            return variant?.variantInformation?.size;
          }
          return null;
        })
        .filter(Boolean)
        .join(",") || "N/A";

    console.log(sizes);

    return {
      URL: toSlug(product.name, productId),
      "Store Name": "Bigw",
      EAN: product.information.ean,
      "Product SKU": productId,
      "Product Name": product.name,
      "Current Price first seen on": "N/A",
      "Current price last seen on": "N/A",
      "Product Brand": product.information.brand,
      "Original Price": prices.wasPrice.cents / 100,
      "Sale Price": prices.price.cents / 100,
      Description: descriptionFormating(
        product.information.description,
        product.information.summary
      ),
      Specification: specificationFormating(product.information.specifications),
      Images:
        product.assets.images
          ?.map((img) => "https://www.bigw.com.au/" + img.sources[2]?.url)
          .filter(Boolean)
          .join("|") || "N/A",
      "Original store Category": categotysFormating(product.categories),
      Size: sizes,
    };
  } catch (err) {
    console.error(`Failed to get details for ${productId}: ${err.message}`);
    return null;
  }
};
