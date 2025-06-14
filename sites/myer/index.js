import {getAllProductSlugs} from "./getAllProduct.js"
import {fetchProductDataBySlugs} from "./getAllProductDeteils.js"
import { sheetId } from "./config.js";
import {overwriteGoogleSheet} from "../../google-sheets/overwrite-data.js"

(async () => {
    console.log('start')

    const allSlugs = await getAllProductSlugs()

    console.log(allSlugs.length)

    const allProducts = await fetchProductDataBySlugs(allSlugs)

    console.log(allProducts.length)

    await overwriteGoogleSheet(sheetId, allProducts)
})()
