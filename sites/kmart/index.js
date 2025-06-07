import { overwriteGoogleSheet } from "./../../google-sheets/overwrite-data.js";
import { SHEET_ID, GROUP_IDS } from "./config.js";
import { parseProducts } from "./modules/parse-products.js";

(async () => {
    let allProducts = [];

    try {
        allProducts = await parseProducts(GROUP_IDS);
        console.log(`Scraping completed. Total items: ${allProducts.length}`);
    } catch (err) {
        console.error(`Fatal error during parsing: ${err}`);
        process.exit(1);
    }

    try {
        console.log(`Saving ${allProducts.length} items to Google Sheets...`);
        await overwriteGoogleSheet(SHEET_ID, allProducts);
        console.log("Data saved to sheet.");
    } catch (sheetErr) {
        console.error(`Failed to save to Google Sheets: ${sheetErr}`);
        try {
            const fs = await import("fs/promises");
            await fs.writeFile("backup.json", JSON.stringify(allProducts, null, 2));
            console.log("Backup saved to backup.json");
        } catch (fsErr) {
            console.error(`Failed to write backup file: ${fsErr}`);
        }
    }
})();
