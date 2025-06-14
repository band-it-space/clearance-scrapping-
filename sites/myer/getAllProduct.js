import axios from "axios";
import { myerApiUrl } from "./config.js";
import {delay} from "./helper.js"

export const getAllProductSlugs = async () => {
  const baseUrl = `${myerApiUrl}/v3/product/cat/byseo/clearance-offers`;
  const pageSize = 500;
  let pageNumber = 1;
  let allSlugs = [];
  let totalCount = 0;

  while (true) {
    const url = `${baseUrl}?categoryUrlId=%2Fclearance-offers&pageNumber=${pageNumber}&facets=&sort=relevance&variants=&ai_cluster=24&pageSize=${pageSize}`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      if (!data?.productList?.length) break;

      const slug = data.productList.map((product) => product.seoToken);
      allSlugs.push(...slug);

      totalCount = data.productTotalCount;

      if (allSlugs.length >= totalCount) break;

      await delay(2000);

      pageNumber++;
    } catch (err) {
      console.error("Error:", err.message);
      break;
    }
  }

  return allSlugs;
};
