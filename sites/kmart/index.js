import { overwriteGoogleSheet } from "./../../google-sheets/overwrite-data.js";
import axios from "axios";
import * as cheerio from "cheerio";
import {
    URL,
    QUERY_PARAMETERS,
    GROUP_IDS,
    STORE_NAME,
    SHEET_ID,
} from "./config.js";


const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


async function getPageDetails(url, delayMs = 10000) {
    let attempts = 0;
    const maxAttempts = 6;

    while (attempts < maxAttempts) {
        try {
            const { data: html } = await axios.get(url);
            const $ = cheerio.load(html);

            const ldJsonScript = $('script[type="application/ld+json"]').html();
            if (!ldJsonScript) {
                throw new Error(`LD+JSON not found on ${url}`);
            }

            let ldJson;
            try {
                ldJson = JSON.parse(ldJsonScript);
            } catch (parseErr) {
                throw new Error(`Invalid JSON-LD on ${url}: ${parseErr.message}`);
            }

            const description = await parseDescription(ldJson.description ?? "");

            if (
                typeof description.Description === "string" &&
                description.Description.trim().endsWith("Additional Details")
            ) {
                description.Description = description.Description
                    .slice(0, -"Additional Details".length)
                    .trim();
            }

            const category = (await parseCategory($)) || "N/A";

            return {
                ...description,
                "Original store Category": category,
            };
        } catch (error) {
            attempts++;
            if (attempts >= maxAttempts) {
                console.error(`Failed to load ${url} after ${maxAttempts} attempts`);
                return {
                    Description: "N/A",
                    Specification: "N/A",
                    "Original store Category": "N/A",
                };
            }

            if (error.response?.status === 502) {
                console.warn(`Received 502 from ${url}, retrying in ${delayMs / 1000}s...`);
            } else {
                console.warn(`Error in getPageDetails for ${url}: ${error.message || error}`);
            }

            await delay(delayMs);
        }
    }
}

async function parseCategory($) {
    try {
        const breadcrumbs = [];
        $('ol[itemtype="http://schema.org/BreadcrumbList"] li').each((_, el) => {
            const text = $(el).text().trim();
            if (text) breadcrumbs.push(text);
        });
        return breadcrumbs.join(" / ");
    } catch (err) {
        console.warn(`Error in parseCategory: ${err}`);
        return "N/A";
    }
}

async function parseDescription(descriptionHTML) {
    try {
        const $ = cheerio.load(`<div>${descriptionHTML}</div>`);
        const nodes = $("div").contents().toArray();

        const blocks = [];
        let currentHeader = null;
        let currentContent = [];

        function isParagraphWithOnlyStrong(el) {
            const $el = $(el);
            return (
                el.tagName?.toLowerCase() === "p" &&
                $el.children().length === 1 &&
                $el
                    .children()
                    .first()
                    .prop("tagName")
                    ?.toLowerCase() === "strong" &&
                $el.text().trim() === $el.children().text().trim()
            );
        }

        function isTopLevelStrong(el) {
            return (
                el.tagName?.toLowerCase() === "strong" &&
                el.parent.tagName?.toLowerCase() === "div"
            );
        }

        function pushBlock() {
            if (currentHeader !== null || currentContent.length) {
                blocks.push({
                    header: currentHeader,
                    content: [...currentContent],
                });
            }
        }

        for (const el of nodes) {
            const $el = $(el);
            const tagName = el.tagName?.toLowerCase() || "";

            if (tagName === "em" || tagName === "br") {
                continue;
            }

            const isHeaderTag =
                isTopLevelStrong(el) || isParagraphWithOnlyStrong(el);

            if (isHeaderTag) {
                pushBlock();

                if (isTopLevelStrong(el)) {
                    currentHeader = $el.text().trim();
                } else {
                    currentHeader = $el.find("strong").text().trim();
                }

                currentContent = [];
                continue;
            }

            if ($el.find("a").length > 0 || $el.is("a")) {
                continue;
            }

            const text = $el.text().trim();
            if (!text || text === ".") {
                continue;
            }

            if (tagName === "ul" || tagName === "ol") {
                $el.find("li").each((_, li) => {
                    const liText = $(li).text().trim();
                    if (liText) currentContent.push(liText);
                });
            } else {
                currentContent.push(text);
            }
        }

        pushBlock();

        const lowerHeaders = blocks.map((b) =>
            (b.header || "").toLowerCase()
        );
        let specIndex = lowerHeaders.findIndex((h) =>
            h.includes("specification")
        );
        if (specIndex < 0) {
            specIndex = lowerHeaders.findIndex((h) => h.includes("detail"));
        }

        let specText = "N/A";
        if (specIndex >= 0) {
            const b = blocks[specIndex];
            specText = b.header ? b.header + "\n" : "";
            specText += b.content.join("\n");
        }

        const descLines = [];
        blocks.forEach((b, idx) => {
            if (idx === specIndex) return;
            if (b.header) descLines.push(b.header);
            b.content.forEach((line) => descLines.push(line));
            descLines.push("");
        });

        const descText =
            descLines.join("\n").trim() || "N/A";

        return {
            Description: descText,
            Specification: specText,
        };
    } catch (err) {
        console.warn(`Error in parseDescription: ${err}`);
        return {
            Description: "N/A",
            Specification: "N/A",
        };
    }
}

const parseProducts = async (GROUP_IDS) => {
    const result = [];

    for (const key in GROUP_IDS) {
        if (!GROUP_IDS.hasOwnProperty(key)) continue;
        const groupId = GROUP_IDS[key];
        let resultsCount = 1;
        let page = 1;
        const categoryResults = [];

        while (categoryResults.length < resultsCount) {
            const pageUrl = `${URL}/${groupId}?${QUERY_PARAMETERS}&page=${page}`;
            console.log(`Loading: ${pageUrl}`);

            let response;
            try {
                response = await axios.get(pageUrl);
            } catch (err) {
                console.error(
                    `Error loading page ${page} for category [${key}]: ${err.message}`
                );
                break;
            }

            try {
                resultsCount =
                    response.data.response.result_sources.token_match.count;
            } catch (err) {
                console.warn(
                    `Could not get resultsCount on the page ${page}: ${err}`
                );
                break;
            }

            const pageItems = response.data.response.results || [];
            const batchSize = 50;

            for (let i = 0; i < pageItems.length; i += batchSize) {
                const batch = pageItems.slice(i, i + batchSize);

                const batchPromises = batch.map(async (item, index) => {
                    try {
                        console.log(
                            `Scraping [${key}] item ${categoryResults.length + index + 1}/${
                                resultsCount || "?"
                            }`
                        );

                        const itemData = {
                            URL: `https://www.kmart.com.au${item.data.url}` || "N/A",
                            "Store Name": STORE_NAME,
                            "Product SKU": item.data.id || "N/A",
                            "Product Name": item.value || "N/A",
                            "Product Brand": item.data.Brand || "N/A",
                            "Original Price": item.data.SavePrice
                                ? parseFloat(item.data.SavePrice.match(/\d+(\.\d+)?/)[0])
                                : item.data.price,
                            "Sale Price": item.data.SavePrice
                                ? item.data.price
                                : "N/A",
                            "Current Price first seen on": "N/A",
                            "Current price last seen on": "N/A",
                            Images: item.data.image_url
                                ? item.data.image_url.split("?")[0]
                                : "N/A",
                            "RRP?": "N/A",
                        };

                        const extraData = await getPageDetails(itemData.URL);
                        return {
                            ...itemData,
                            ...extraData,
                        };
                    } catch (innerErr) {
                        console.error(
                            `Error scraping item in category [${key}], url=${item.data.url}: ${innerErr}`
                        );
                        return {
                            URL: `https://www.kmart.com.au${item.data.url}` || "N/A",
                            "Store Name": STORE_NAME,
                            "Product SKU": item.data.id || "N/A",
                            "Product Name": item.value || "N/A",
                            "Product Brand": item.data.Brand || "N/A",
                            "Original Price": item.data.SavePrice
                                ? parseFloat(item.data.SavePrice.match(/\d+(\.\d+)?/)[0])
                                : item.data.price,
                            "Sale Price": item.data.SavePrice
                                ? item.data.price
                                : "N/A",
                            "Current Price first seen on": "ERROR",
                            "Current price last seen on": "ERROR",
                            Images: item.data.image_url
                                ? item.data.image_url.split("?")[0]
                                : "N/A",
                            "RRP?": "N/A",
                            Description: "ERROR",
                            Specification: "ERROR",
                            "Original store Category": "ERROR",
                        };
                    }
                });

                let resolvedBatch;
                try {
                    resolvedBatch = await Promise.all(batchPromises);
                } catch (allErr) {
                    console.error(
                        `Batch failed unexpectedly in category [${key}], page=${page}: ${allErr}`
                    );
                    resolvedBatch = [];
                }

                categoryResults.push(...resolvedBatch);
            }

            page++;
        }

        result.push(...categoryResults);
    }

    return result;
};

(async () => {
    let allProducts = [];
    try {
        allProducts = await parseProducts(GROUP_IDS);
        console.log(`Scraping completed. Total items: ${allProducts.length}`);
    } catch (err) {
        console.error(`Fatal error in parseProducts(): ${err}`);
    } finally {
        try {
            console.log(`Saving ${allProducts.length} items to Google Sheets...`);
            await overwriteGoogleSheet(SHEET_ID, allProducts);
            console.log("Data saved to sheet.");
        } catch (sheetErr) {
            console.error(`Failed to save to Google Sheets: ${sheetErr}`);
            try {
                const fs = await import("fs/promises");
                await fs.writeFile(
                    "backup.json",
                    JSON.stringify(allProducts, null, 2)
                );
                console.log("Backup written to backup.json");
            } catch (fsErr) {
                console.error(`Failed to write backup.json: ${fsErr}`);
            }
        }
    }
})();
