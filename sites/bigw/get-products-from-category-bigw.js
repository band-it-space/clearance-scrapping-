import axios from "axios";
import fs from "fs";
import path from "path";
import pLimit from "p-limit";

import { overwriteGoogleSheet } from "./../../google-sheets/overwrite-data.js";

import { URL_BIGW, SHEET_ID } from "./config.js";
import { getProductDetailsBigw } from "./get-product-details-bigw.js";

const limit = pLimit(20);

export const getProductsFromCategoriesBigw = async (categoryId) => {
  let productsData = [];
  let page = 0;
  let isResult = true;

  while (isResult) {
    console.log(`categoryId:${categoryId}, page:${page}`);

    const { data } = await axios.post(
      `${URL_BIGW}/search/v1/search`,
      {
        format: "1",
        clientId: "web",
        page,
        perPage: 150,
        sort: "relevance",
        category: categoryId,
        filter: {
          deal: ["Bundle", "Clearance", "Multi-Buy", "Special", "Low Price"],
          inStock: false,
        },
        include: {
          facets: true,
          additionalFacets: ["categorySize"],
          suggestions: false,
          productAttributes: [
            "attributes.collectable",
            "attributes.deliverable",
            "attributes.listingStatus",
            "attributes.maxQuantity",
            "information.name",
            "information.brand",
            "information.bundle",
            "information.rating",
            "information.categories",
            "information.collections",
            "information.media.badges",
            "information.media.images",
            "information.specifications",
            "information.variants.code",
            "fulfilment.dsv",
            "fulfilment.preorder",
            "fulfilment.delivery",
            "fulfilment.collection",
            "fulfilment.logisticType",
            "fulfilment.productChannel",
            "prices.NAT",
            "identifiers",
            "promotions",
          ],
        },
      },
      {
        headers: {
          referer: "https://www.bigw.com.au/",
          origin: "https://www.bigw.com.au",
          "Content-Type": "application/json",
          accept: "*/*",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
          "accept-language": "en-US,en;q=0.9",
          "accept-encoding": "gzip, deflate, br",
        },
      }
    );

    const results = data?.organic?.results || [];

    productsData.push(...results);

    if (results.length < 150) isResult = false;
    else page += 1;
  }
  //   console.log(`Page:${page} on category: ${categoryId}`);
  const productFilteredData = productsData
    .map((p) => {
      const id = p.identifiers?.articleId;
      const prices = p.prices?.NAT;
      if (!id || !prices) return null;

      return { id, prices };
    })
    .filter(Boolean);

  const detailedProductsRaw  = await Promise.all(
    productFilteredData.map((data) =>
      limit(() => getProductDetailsBigw(data.id, data.prices))
    )
  );

  const detailedProducts = detailedProductsRaw.filter(Boolean);


return detailedProducts


  //   console.log(
  //     `Tot results on category: ${categoryId} is ${detailedProducts.length} `
  //   );
  //   const outputPath = path.resolve(`sites/bigw/bigw-${categoryId}.json`);
  //   fs.writeFileSync(outputPath, JSON.stringify(detailedProducts, null, 2));
  //   console.log(`Saved ${detailedProducts.length} items to ${outputPath}`);
};
