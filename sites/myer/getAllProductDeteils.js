import { delay, fixImagePath, descriptionFormating } from "./helper.js";
import axios from "axios";
import { myerUrl, myerImgUrl } from "./config.js";
import * as cheerio from 'cheerio';

const fetchSingleProduct = async (slug) => {
  const url = `https://www.myer.com.au/p/${slug}`;
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const scriptTag = $('#__NEXT_DATA__').html();

    if (!scriptTag) {
      console.warn(`Not found __NEXT_DATA__ for slug: ${slug}`);
      return null;
    }

    const data = JSON.parse(scriptTag);
    const productData = data.props.pageProps.dehydratedState.queries[3].state.data;

    return {
      URL: myerUrl + 'p/' + slug,
      "Store Name": "Myer",
      "Product SKU": productData.id,
      "Product Name": productData.name,
      "Product Brand": productData.brand,
      "Original Price": productData.listPriceFrom,
      "Sale Price": productData.priceFrom,
      "Current Price first seen on": "N/A",
      "Current price last seen on": "N/A",
      "Description": descriptionFormating(productData.attributes, productData.longDescription) || "N/A",
      "Specification": "N/A",
      "Images": myerImgUrl + fixImagePath(productData.media[0]?.baseUrl) || "N/A",
      "Original store Category": productData.categoryUri,
    };
  } catch (err) {
    console.error(`Error for slug ${slug}:`, err.message);
    return null;
  }
};

export const fetchProductDataBySlugs = async (slugs) => {
  const chunkSize = 40;
  const results = [];

  for (let i = 0; i < slugs.length; i += chunkSize) {
    const chunk = slugs.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(chunk.map(fetchSingleProduct));
    results.push(...chunkResults.filter(Boolean));

    if (i + chunkSize < slugs.length) {
      await delay(2000);
    }
  }

  return results;
};
