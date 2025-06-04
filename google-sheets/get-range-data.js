import {GoogleSpreadsheet} from "google-spreadsheet";
import {JWT} from "google-auth-library";
import credentials from "./../google-sheets/credentials.json" assert {type: "json"};

import {SPREADSHEET_ID} from "./../config.js"

/**
 * Gets values from Google Sheets by sheet name, column name, and row list
 * @param {string} sheetName - Sheet name
 * @param {string[]} columnTitle - Column title
 * @param {number[]} rowNumbers - Array of row numbers (starting at 1)
 * @returns {Promise<Array>} - Array of corresponding cell values
 */

const jwt = new JWT({
    email: credentials.client_email,
    key: credentials.private_key.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export async function getValues(sheetName, columnTitles, limit, offset) {
    try {
        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, jwt);
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle[sheetName];

        if (!sheet) {
            console.error(`Sheet "${sheetName}" not found.`);
            return [];
        }

        await sheet.loadHeaderRow();
        const headers = sheet.headerValues;

        let rows = await sheet.getRows();
        if (limit > 0) {
            rows = rows.slice(offset, limit + offset);
        }

        const columnIndexes = columnTitles
            .map(title => ({ title, index: headers.indexOf(title) }))
            .filter(col => col.index !== -1);

        if (columnIndexes.length === 0) {
            console.warn(`None of the requested columns were found.`);
            return [];
        }

        return rows.map((row, index) => {
            let rowData = {};
            columnIndexes.forEach(({title, index}) => {
                rowData[title] = row._rawData[index] || null;
            });

            // Прибираємо зайве з Product Name
            if (rowData["Product Name"]) {
                rowData["Product Name"] = rowData["Product Name"].replace(/ - .*/, "");
            }

            return {...rowData, rowIndex: index + 1};
        });
    } catch (error) {
        console.error("Error fetching values:", error.message);
        return [];
    }
}

export function aggregateToString(dataArray, separator = " ") {
    return dataArray
        .map(obj => {
            let result = [];

            for (let key in obj) {
                if (key === "Volume Value" && obj["Volume Unit"]) {
                    result.push(`${obj[key]}${obj["Volume Unit"]}`);
                } else if (key === "Price Number" && obj["Price Currency"]) {
                    result.push(`${obj[key]}${obj["Price Currency"]}`);
                } else if (key === "rowIndex") {
                    result.push(``);
                } else if (key !== "Volume Unit" && key !== "Price Currency") {
                    result.push(obj[key]);
                }
            }

            return result.filter(Boolean).join(separator);
        })
        .join("\n");
}

// console.log(await getValues("GTIN Search Test", ["Brand", "Product Name", "Volume Value", "Volume Unit"], 10, 0))

