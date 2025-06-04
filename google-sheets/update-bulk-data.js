import {GoogleSpreadsheet} from "google-spreadsheet";
import {JWT} from "google-auth-library";

import {SPREADSHEET_ID} from "./../config.js"

import credentials from "./../google-sheets/credentials.json" assert {type: "json"};

/**
 * Adds or updates values in the specified column and row
 * @param {string} sheetName - Sheet name
 * @param {string} columnTitle - Column title
 * @param {number} rowNumber - Row number (starting from 1)
 * @param {string|number} value - Value to insert
 * @returns {Promise<boolean>} - true if successful, false otherwise
 */

const jwt = new JWT({
    email: credentials.client_email,
    key: credentials.private_key.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export async function updateCells(sheetName, columnTitle, updates) {
    try {
        console.log('\n\n\nBulk Updates:', updates.length, 'rows\n\n\n');

        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, jwt);
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle[sheetName];

        if (!sheet) {
            console.error(`Sheet "${sheetName}" not found.`);
            return false;
        }

        await sheet.loadHeaderRow();
        const headers = sheet.headerValues;
        const columnIndex = headers.indexOf(columnTitle);

        if (columnIndex === -1) {
            console.warn(`Column "${columnTitle}" not found.`);
            return false;
        }

        const sorted = updates.sort((a, b) => a.rowIndex - b.rowIndex);
        const minRow = sorted[0].rowIndex;
        const maxRow = sorted[sorted.length - 1].rowIndex;
        const rowRange = maxRow - minRow;

        const RANGE_THRESHOLD = 500;

        if (rowRange > RANGE_THRESHOLD) {
            console.log(`Switching to sparse update mode (spread = ${rowRange})`);

            const columnLetter = String.fromCharCode(65 + columnIndex);
            const range = `${columnLetter}${minRow + 1}:${columnLetter}${maxRow + 1}`;
            console.log(`Loading range: ${range}`);
            await sheet.loadCells(range);

            for (const { rowIndex, gtin } of sorted) {
                const cell = sheet.getCell(rowIndex, columnIndex);
                cell.value = gtin;
            }

            await sheet.saveUpdatedCells();
            console.log(`Sparse update completed (${updates.length} cells)`);
        } else {
            const columnLetter = String.fromCharCode(65 + columnIndex);
            const range = `${columnLetter}${minRow + 1}:${columnLetter}${maxRow + 1}`;
            console.log(`Loading compact range: ${range}`);
            await sheet.loadCells(range);

            updates.forEach(({ rowIndex, gtin }) => {
                const cell = sheet.getCell(rowIndex, columnIndex);
                cell.value = gtin;
            });

            await sheet.saveUpdatedCells();
            console.log(`Range update completed (${updates.length} cells)`);
        }

        return true;

    } catch (error) {
        console.error("Error updating cells:", error.message);
        return false;
    }
}


// await updateCells("Sephora", "Derived GTIN",
//     [
//     { rowIndex: 1, gtin: '194250058888' },
//     { rowIndex: 3, gtin: '3378872178446' },
//     { rowIndex: 4, gtin: '602004087867' },
// ])