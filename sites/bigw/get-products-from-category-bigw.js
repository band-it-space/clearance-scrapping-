import axios from "axios";
import fs from "fs";
import path from "path";
import pLimit from "p-limit";

import { URL_BIGW } from "./config.js";
import { getProductDetailsBigw } from "./get-product-details-bigw.js";

const limit = pLimit(10);

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
                    deal: [
                        "Bundle",
                        "Clearance",
                        "Multi-Buy",
                        "Special",
                        "Low Price",
                    ],
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
        console.log(1);

        const results = data?.organic?.results || [];

        productsData.push(...results);

        if (results.length < 150) isResult = false;
        else page += 1;
    }
    console.log(`Page:${page}`);
    const productIds = productsData
        .map((p) => p.identifiers?.articleId)
        .filter(Boolean);

    const detailedProducts = await Promise.all(
        productIds.map((id) => limit(() => getProductDetailsBigw(id)))
    );
    console.log(detailedProducts.length);
    const outputPath = path.resolve(`bigw-${categoryId}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(detailedProducts, null, 2));
    console.log(`✅ Saved ${detailedProducts.length} items to ${outputPath}`);
};
