import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

import credentials from "./credentials.json" with { type: "json" };
import {getDate} from "../addons/get-today-date.js";


const FIXED_HEADERS = [
    "URL",
    "Store Name",
    "Product SKU",
    "Product Name",
    "Product Brand",
    "Original Price",
    "Sale Price",
    "Current Price first seen on",
    "Current price last seen on",
    "Description",
    "Specification",
    "Images",
    "Original store Category",
    "RRP?",
    "EAN",
];


const jwt = new JWT({
    email: credentials.client_email,
    key: credentials.private_key.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export async function overwriteGoogleSheet(SPREADSHEET_ID, jsonData) {
    try {
        const sheetName = getDate();

        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, jwt);
        await doc.loadInfo();

        let sheet = doc.sheetsByTitle[sheetName];
        if (!sheet) {
            console.log(`Sheet "${sheetName}" not found. Creating a new one...`);
            sheet = await doc.addSheet({ title: sheetName });
        }

        if (!jsonData || jsonData.length === 0) {
            console.error("Error: No data to write");
            return;
        }

        await sheet.clear();

        await sheet.setHeaderRow(FIXED_HEADERS);

        const formattedData = jsonData.map((item) => {
            const flattenedItem = flattenObject(item);
            const result = {};

            FIXED_HEADERS.forEach((header) => {
                result[header] = flattenedItem[header] !== undefined ? flattenedItem[header] : null;
            });

            return result;
        });

        await sheet.addRows(formattedData);
        console.log(`The data is successfully recorded in a sheet "${sheetName}".`);

    } catch (error) {
        console.error("Error when recording in Google Sheets:", error);
    }
}

function flattenObject(obj, prefix = "") {
    const flattened = {};
    for (const key in obj) {
        const value = obj[key];
        const newKey = prefix ? `${prefix} ${key}` : key;

        if (typeof value === "object" && value !== null) {
            Object.assign(flattened, flattenObject(value, newKey));
        } else {
            flattened[newKey] = value;
        }
    }
    return flattened;
}

function collectHeaders(jsonData) {
    if (!jsonData || jsonData.length === 0) return [];

    const headers = [];
    const seenHeaders = new Set();

    jsonData.forEach((item) => {
        const flattenedItem = flattenObject(item);

        Object.keys(flattenedItem).forEach((key) => {
            if (key === "Volume") {
                if (typeof flattenedItem[key] === "object" && flattenedItem[key] !== null) {
                    const valueKey = "Volume Value";
                    const unitKey = "Volume Unit";

                    if (!seenHeaders.has(valueKey)) {
                        seenHeaders.add(valueKey);
                        headers.push(valueKey);
                    }
                    if (!seenHeaders.has(unitKey)) {
                        seenHeaders.add(unitKey);
                        headers.push(unitKey);
                    }
                }
            } else if (!seenHeaders.has(key)) {
                seenHeaders.add(key);
                headers.push(key);
            }
        });
    });

    return headers;
}


// const jsonData = [
//     {
//         "Travel Edition": false,
//         "Brand": "Batton",
//         "Product Name": "Original 200s Österreich",
//         "Price": {
//             "Number": 33.9,
//             "Currency": "€"
//         },
//         "Volume": null,
//         "Stock": "In stock",
//         "Description": "Heinemann Edition",
//         "Details": "Batton Original 200s Österreich",
//         "Item No.": 1449788,
//         "Country": "Österreich",
//         "Alcohol Volume": null,
//         "Manufacturer": "Joh. Wilh. von Eicken GmbH,Drechslerstrasse 1-3,23556 Lübeck,DE",
//         "Ingredients": null,
//         "Image 1": "/_ui/20250130080359/responsive/common/media/article.jpg",
//         "Image 2": null,
//         "Image 3": null
//     },
//     {
//         "Travel Edition": true,
//         "Brand": "Batton",
//         "Product Name": "Batton White 200s Österreich",
//         "Price": {
//             "Number": 33.9,
//             "Currency": "€"
//         },
//         "Volume": null,
//         "Stock": null,
//         "Description": "Heinemann Edition",
//         "Details": "Batton White 200s Österreich",
//         "Item No.": 1449789,
//         "Country": "Österreich",
//         "Alcohol Volume": null,
//         "Manufacturer": "Joh. Wilh. von Eicken GmbH,Drechslerstrasse 1-3,23556 Lübeck,DE",
//         "Ingredients": null,
//         "Image 1": "/_ui/20250130080346/responsive/common/media/article.jpg",
//         "Image 2": null,
//         "Image 3": null
//     },
//     {
//         "Travel Edition": false,
//         "Brand": "AJ Fernandez",
//         "Product Name": "AJF Sampler Toro 5s TPD2",
//         "Price": {
//             "Number": 57.99,
//             "Currency": "€"
//         },
//         "Volume": {
//             "Value": 0.088,
//             "Unit": "kg"
//         },
//         "Stock": "In stock",
//         "Description": "AJF Sampler Toro 5s TPD2\n\nOnly available for non-EU flights.\nPick-up at the airport\nVienna\n* Vienna",
//         "Details": null,
//         "Item No.": 1594113,
//         "Country": "Nicaragua",
//         "Alcohol Volume": null,
//         "Manufacturer": "TABACALERA SLU,Paseo de la Habana 136,28036 Madrid,ES",
//         "Ingredients": null,
//         "Image 1": "/medias/527Wx527H-null?context=bWFzdGVyfGltYWdlc3w2MzUyNXxpbWFnZS9qcGVnfGFHWXhMMmd3Tmk4eE1USTJPVEF5TnpZNU1qVTNOQzgxTWpkWGVEVXlOMGhmYm5Wc2JBfGY2M2RiNDJjNTIxNjlmMzc5OTFkZWFkMDg5NDhmMTg2N2Q4NzA0ZDE1NDhmYzViMDFlZTQ2NDc2N2RmZmFkZDk&v=1729024514432",
//         "Image 2": null,
//         "Image 3": null
//     }
// ];
//
// overwriteGoogleSheet("Heinemann", jsonData);
