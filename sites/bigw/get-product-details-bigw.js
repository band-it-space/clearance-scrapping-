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
    // console.log(`${URL_BIGW}api/products/v0/product/${productId}`);

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
        timeout: 10000,
      }
    );

    await delay(2000);
    // console.log(data.products[productId].name);

    return {
      URL: toSlug(data.products[productId].name, productId),
      "Store Name": "Bigw",
      EAN: data.products[productId].information.ean,
      "Product SKU": "N/A",
      "Product Name": data.products[productId].name,
      "Current Price first seen on": "N/A",
      "Current price last seen on": "N/A",
      "Product Brand": data.products[productId].information.brand,
      "Original Price": (prices.wasPrice.cents / 100),
      "Sale Price": (prices.price.cents / 100),
      Description: descriptionFormating(data.products[productId].information.description),
      Specification: specificationFormating(
        data.products[productId].information.specifications
      ),
      Images:
        "https://www.bigw.com.au/" +
        data.products[productId].assets.images[0].sources[0].url,
      "Original store Category": categotysFormating(
        data.products[productId].categories
      ),
    };
  } catch (err) {
    console.error(`Failed to get details for ${productId}: ${err.message}`);
    return null;
  }
};
