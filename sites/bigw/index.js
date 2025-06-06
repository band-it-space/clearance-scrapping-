import { CATEGORY_IDS, URL_BIGW } from "./config.js";
import { getProductsFromCategoriesBigw } from "./get-products-from-category-bigw.js";

(async () => {
    await Promise.all(
        Object.entries(CATEGORY_IDS).map(
            async ([categoryTitle, categoryId]) => {
                try {
                    await getProductsFromCategoriesBigw(categoryId);
                    console.log(`✅ Done for category: ${categoryId}`);
                } catch (err) {
                    console.error(
                        `❌ Error in category ${categoryId}:`,
                        err.message
                    );
                }
            }
        )
    );

    console.log("🎉 All categories processed!");
})();
