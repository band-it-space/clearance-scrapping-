import axios from "axios";
import { URL_BIGW } from "./config.js";
import { delay } from "../../addons/index.js";

export const getProductDetailsBigw = async (productId) => {
    try {
        console.log(`${URL_BIGW}api/products/v0/product/${productId}`);

        const { data } = await axios.get(
            `${URL_BIGW}/api/products/v0/product/${productId}`,
            {
                headers: {
                    referer: "https://www.bigw.com.au/",
                    origin: "https://www.bigw.com.au",
                    "user-agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
                    "accept-language": "en-US,en;q=0.9",
                },
                timeout: 10000,
            }
        );
        
        await delay(2000);

        return data;
    } catch (err) {
        console.error(
            `❌ Failed to get details for ${productId}: ${err.message}`
        );
        return null;
    }
};
