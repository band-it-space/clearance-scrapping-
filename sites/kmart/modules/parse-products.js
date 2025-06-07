import axios from "axios";
import { getPageDetails } from "./fetch-page-details.js";
import { URL, QUERY_PARAMETERS, STORE_NAME } from "./../config.js";

import pLimit from 'p-limit';
const limit = pLimit(100);


export async function parseProducts(GROUP_IDS) {
    const result = [];

    for (const key in GROUP_IDS) {
        const groupId = GROUP_IDS[key];
        const categoryResults = [];
        let page = 1;
        let resultsCount = 1;

        while (categoryResults.length < resultsCount) {
            const pageUrl = `${URL}/${groupId}?${QUERY_PARAMETERS}&page=${page}`;
            console.log(`Loading: ${pageUrl}`);

            let response;
            try {
                response = await axios.get(pageUrl);
                resultsCount = response.data.response.result_sources.token_match.count;
            } catch (err) {
                console.error(`Error loading page ${page} for [${key}]: ${err.message}`);
                break;
            }

            const pageItems = response.data.response.results || [];

            const batchPromises = pageItems.map(item =>
                limit(async () => {
                    const baseData = {
                        URL: `https://www.kmart.com.au${item.data.url}` || "N/A",
                        "Store Name": STORE_NAME,
                        "Product SKU": item.data.id || "N/A",
                        "Product Name": item.value || "N/A",
                        "Product Brand": item.data.Brand || "N/A",
                        "Original Price": item.data.SavePrice
                            ? parseFloat(item.data.SavePrice.match(/\d+(\.\d+)?/)[0])
                            : item.data.price,
                        "Sale Price": item.data.SavePrice ? item.data.price : "N/A",
                        "Current Price first seen on": "N/A",
                        "Current price last seen on": "N/A",
                        Images: item.data.image_url?.split("?")[0] || "N/A",
                        "RRP?": "N/A",
                    };

                    try {
                        const extraData = await getPageDetails(baseData.URL);
                        return { ...baseData, ...extraData.data };
                    } catch (err) {
                        console.error(`Failed on item [${key}] ${baseData.URL}: ${err}`);
                        return {
                            ...baseData,
                            Description: "N/A",
                            Specification: "N/A",
                            "Original store Category": "N/A",
                        };
                    }
                })
            );

            const batchResults = await Promise.all(batchPromises);
            categoryResults.push(...batchResults);
            console.log(`Scrapped: ${categoryResults.length}/${resultsCount}`)
            page++;
        }

        result.push(...categoryResults);
    }

    return result;
}
