/**
 * This server allows automatic execution of scripts located in the `sites/` subfolders.
 * Each subfolder can contain an `index.js` file, which will be executed either on schedule or manually.
 *
 * === Main Features: ===
 * - Scans all directories in `sites/`
 * - Executes `index.js` if it exists in a directory
 * - Configures a cron schedule via API
 * - Instantly runs all parsers via API
 * - Allows stopping cron jobs
 * - Scalable: simply add new folders to `sites/`
 *
 * === API Endpoints: ===
 * 1. `GET /run-all`
 *    → Immediately runs all `index.js` files from `sites/` (once, without cron).
 *
 * 2. `GET /set-cron/:schedule`
 *    → Changes the cron job schedule in real time.
 *    → `:schedule` must be in `cron` format, for example:
 *       - `*./5 * * * *` (every 5 minutes, without a dot)
 *       - `0 12 * * *` (daily at 12:00)
 *       - `0 0 * * 0` (at 00:00 on Sunday)
 *    → URLs do not support certain characters, so use their encoded versions:
 *       - `%2A` → `*`
 *       - `%2F` → `/`
 *       - `%20` → ` ` (space)
 *       Thus, the value for running every 5 seconds should be:
 *       - `%2A%2F5%20%2A%20%2A%20%2A%20%2A%20%2A`
 *       Weekly at 00:00 on Sunday:
 *       - `0%200%20%2A%20%2A%200`
 *
 * 3. `GET /stop-cron`
 *    → Stops the cron job.
 */
 

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import express from "express";
import cron from "node-cron";
import * as util from "node:util";
const execPromise = util.promisify(exec)

const app = express();
const PORT = 80;

const SITES_DIR = "./sites";

let cronTask = null;
let cronSchedule = "*/5 * * * *";

/**
 * Measures the time of performing asynchronous function
 */
async function measureExecutionTime(fn, ...args) {
    const startTime = Date.now();
    const result = await fn(...args);
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    return { result, duration };
}

/**
 * Performs all `index.js` found in the Sub -Rector` sites/` sequentially
 */
async function runSiteScripts(res, script) {
    try {
        const directories = fs.readdirSync(SITES_DIR);

        if (!script && res) res.send(`All found scripts are running: ${directories}`);

        let scriptCount = 0;

        for (const dir of directories) {

            scriptCount++;
            if (script && script !== dir) {
                if (script && scriptCount === directories.length && res) {
                    res.send(`Script "${script}" not found`);
                }
               continue;
            } else if (script && script === dir && res) {
                res.send(`Script are running: ${dir}`);
            }

            const scriptPath = path.join(SITES_DIR, dir, "index.js");

            if (fs.existsSync(scriptPath)) {
                console.log(`Starting: ${scriptPath}`);

                try {
                    const { result, duration } = await measureExecutionTime(async () => {
                        const { stdout, stderr } = await execPromise(`node ${scriptPath}`);

                        if (stderr) {
                            console.error(`Errors at ${scriptPath}: ${stderr}`);
                        }
                        console.log(`Logs at ${scriptPath}: ${stdout}`);
                        return stdout;
                    });

                    console.log(`Time of execution ${dir}: ${duration.toFixed(2)} seconds`);
                } catch (error) {
                    console.error(`Error while performing a script for ${dir}:`, error);
                }
            }
        }
    } catch (err) {
        console.error("Folder reading error:", err);
    }
}


/**
 * Launches crown tasks on a given schedule
 * @param {string} schedule - Cron schedule at `cron` format
 */
function startCronJob(schedule) {
    if (cronTask) cronTask.stop();

    cronTask = cron.schedule(schedule, () => {
        console.log("Auto starting scripts...");
        runSiteScripts();
    });

    console.log(`Cron task launched on schedule: ${schedule}`);
}


/**
 * API: Runs all scripts immediately
 */
app.get("/run-all", (req, res) => {
    runSiteScripts(res);
});

/**
 * API: Run specified script
 */
app.get("/run/:script", (req, res) => {
    const script = req.params.script;

    if (!script) {
        return res.status(400).send("Error: not specified script name");
    }
    runSiteScripts(res, script);
});


/**
 * API: Test connection
 */
app.get("/test", (req, res) => {
    const directories = fs.readdirSync(SITES_DIR);
    console.log(`Scripts: ${directories}`);
    res.send(`Connection is OK\nAvailable scripts: ${directories}`);
});

/**
 * API: Establishes a new Cron Schedule
 * Example Request: `/set-cron/0 * * * * ` (every hour)
 */
app.get("/set-cron/:schedule", (req, res) => {
    const newSchedule = req.params.schedule;

    if (!newSchedule) {
        return res.status(400).send("Error: not specified cron schedule");
    }

    try {
        startCronJob(newSchedule);
        cronSchedule = newSchedule;
        console.log(`Cron task updated: ${newSchedule}`);
        res.send(`Cron task updated: ${newSchedule}`);
    } catch (error) {
        res.status(400).send("Wrong schedule format!");
    }
});


/**
 * API: Stops cron task
 */
app.get("/stop-cron", (req, res) => {
    if (cronTask) {
        cronTask.stop();
        console.log("Cron task stopped!");
        res.send("Cron task stopped!");
    } else {
        res.send("The cron task was not started");
    }
});

/**
 * Starts the server
 * */
// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});