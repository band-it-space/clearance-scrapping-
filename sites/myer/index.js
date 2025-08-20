import {getAllProductSlugs} from "./getAllProduct.js"
import {fetchProductDataBySlugs} from "./getAllProductDeteils.js"
import { sheetId } from "./config.js";
import {overwriteGoogleSheet} from "../../google-sheets/overwrite-data.js"

(async () => {
    console.log('start')

    const allSlugs = await getAllProductSlugs()

    console.log(allSlugs.length)

    //['verali-gabe-tall-boots-in-black', 'grab-denim-denim-long-sleeve-mini-shirt-dress-in-light-blue']
    const allProducts = await fetchProductDataBySlugs(allSlugs)

    console.log(allProducts.length)

    await overwriteGoogleSheet(sheetId, allProducts)
})()
