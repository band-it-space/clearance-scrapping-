import { CATEGORY_IDS, URL_BIGW, SHEET_ID } from "./config.js";
import { getProductsFromCategoriesBigw } from "./get-products-from-category-bigw.js";
import { overwriteGoogleSheet } from "./../../google-sheets/overwrite-data.js";
import {getUniqueById} from "./helpers.js"

(async () => {
    let allProducts = [];

    await Promise.all(
        Object.entries(CATEGORY_IDS).map(
            async ([categoryTitle, categoryId]) => {
                try {
                    const categoryProducts = await getProductsFromCategoriesBigw(categoryId);
                    allProducts.push(...categoryProducts);
                    console.log(`Done for category: ${categoryId}, products: ${categoryProducts.length}`);
                } catch (err) {
                    console.error(
                        `Error category ${categoryId}:`,
                        err.message
                    );
                }
            }
        )
    );

    console.log(`Total products collected: ${allProducts.length}`);
    
    if (allProducts.length > 0) {
        console.log(allProducts.length)
        const unique = getUniqueById(allProducts)
        console.log(unique.length)
        await overwriteGoogleSheet(SHEET_ID, unique);
        console.log("All products saved to Google Sheet");
    }

    console.log("All categories processed");
})();