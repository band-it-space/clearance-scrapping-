import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

// import { SPREADSHEET_ID } from "./../config.js";
import credentials from "./credentials.json" assert { type: "json" };

const SPREADSHEET_ID = "1xCBoJIkTCrfiewJAmxTL8JU_Yz0BTGaaVuvu_oPCKNE"


const jwt = new JWT({
    email: credentials.client_email,
    key: credentials.private_key.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export async function getGoogleSheetData() {
    try {
        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, jwt);
        await doc.loadInfo();

        const sheet = doc.sheetsByTitle['Input Table'];
        if (!sheet) {
            console.error(`Sheet "Input Table" not found.`);
            return [];
        }

        const headers = await sheet.loadHeaderRow();
        console.log("Headers:", sheet.headerValues);

        const rows = await sheet.getRows();
        console.log("Rows count:", rows.length);


        const validRows = rows.filter(row =>
            sheet.headerValues.some(header => row[header] !== null && row[header] !== "")
        );

        if (validRows.length === 0) {
            console.warn("No valid data found in the sheet.");
            return [];
        }

        let rowData = [];
        validRows.forEach(row => {
            rowData.push(
                {
                    "Site": row._rawData[0],
                    "URL": row._rawData[1],
                }
            );
        })

        return rowData;
    } catch (error) {
        console.error("Error reading data from Google Sheets:", error);
        return [];
    }
}


// getGoogleSheetData("Input Table").then((data) => console.log(data));