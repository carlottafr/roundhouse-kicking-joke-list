// These are my server setup variables

const express = require("express");
const app = express();

// These are my imported functions

const { upload } = require("./s3");
const { httpsRequest } = require("./request");

// I use fs for creating, reading,
// appending and deleting the csv file

const fs = require("fs");

// I use csvtojson to read and convert
// the csv data to JSON to check for
// double entries

const csv = require("csvtojson");

// This function looks for double entries.
// It is passed the string that was received
// from the API as well as the JSON that was
// created by parsing the csv data.

const doubleEntryCheck = async (string, json) => {
    // I split the string up because I want to be
    // able to check an entry that has been broken
    // up by a comma
    let stringUnit = string.substring(0, string.indexOf(","));
    for (let i = 0; i < json.length; i++) {
        if (
            json[i]["World-saving Jokes"] == string ||
            json[i]["World-saving-Jokes"] == stringUnit
        ) {
            let doubleEntry = true;
            return doubleEntry;
        }
    }
};

// This function parses the csv data to JSON.

const readCsv = async (string, filePath) => {
    let infoObject = {};
    infoObject.noFile = false;
    try {
        let csvJson = await csv({ quote: "off" }).fromFile(filePath);
        // Here I delegate the check for double entries to an
        // extra function.
        let entryCheck = await doubleEntryCheck(string, csvJson);
        if (entryCheck) {
            infoObject.doubleEntry = true;
        }
        return infoObject;
    } catch (err) {
        // If there is no file, the function sends back
        // a signal indicating that, so that the file
        // can be created and a first entry appended.
        console.log("Error: ", err);
        infoObject.noFile = true;
        return infoObject;
    }
};

// This function checks whether the file can
// be found under the passed path - if not,
// it writes the file. If the file is found,
// it appends the passed string as a new row
// to it.

const addingJokesToCsv = async (path, string) => {
    let nextLine = "\r\n";
    let csvData = string + nextLine;
    fs.stat(path, (err, stat) => {
        if (err == null) {
            // The file already exists and waits for
            // the almighty data to be appended.
            fs.appendFile(path, csvData, (err) => {
                if (err) throw err;
            });
        } else {
            // The creation of the file containing
            // world-saving jokes, as specified in
            // the header.
            let fields = "World-saving Jokes" + nextLine;
            fs.writeFile(path, fields, function (err) {
                if (err) throw err;
                console.log("The file (as well as the world) has been saved!");
            });
        }
    });
};

const path = __dirname + "/roundhouse-kicks-of-jokes.csv";

// This is where my app logic comes together:

const operationWorldSavingJokes = async (url) => {
    try {
        for (let i = 0; i <= 100; i++) {
            let string = await httpsRequest(url);
            let infoObject = await readCsv(string, path);
            // Here I invoke the addingJokesToCsv function
            // only when there is neither an existing file
            // nor a double entry.
            if (infoObject.noFile || !infoObject.doubleEntry) {
                addingJokesToCsv(path, `${string}`);
            } else {
                // To create an even list of 100 roundhouse-
                // kicking jokes, the index is set back by 1
                // in the very improbable case of a double
                // entry.
                i--;
            }
        }
        console.log("Done with operationWorldSavingJokes!");
    } catch (err) {
        console.log("Error in operationWorldSavingJokes: ", err);
    }
};

// I make the content of the public dir
// available (the css file)

app.use(express.static("./public"));

// The HTML code I serve with each GET request

const htmlCode = (body) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>
                Save The World With Chuck Norris
            </title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            ${body}
            <footer>
                &copy; Carlotta Frommer 2020
            </footer>
        </body>
        </html>
        `;
};

// GET / route

app.get("/", (req, res) => {
    let html = htmlCode(
        `<h1>Save the world ...</h1>
        <p>... with classic Chuck Norris jokes!</p>
        <p>Click <a href="/save-the-world"><strong>here</strong></a> and wait a little to get the jokes!</p>`
    );
    res.end(html);
});

// GET /save-the-world route

app.get("/save-the-world", async (req, res) => {
    try {
        await operationWorldSavingJokes(
            "https://api.chucknorris.io/jokes/random"
        );
        let html = htmlCode(
            `
            <h1>Almost there ...</h1>
            <p>The worldsaving jokes are in preparation. Are you ready for the roundhouse kicks?</p>
            <p>Click <a href="/download"><strong>here</strong></a> to get to the final step!</p>
            `
        );
        res.end(html);
    } catch (err) {
        console.log("Error in get /save-the-world: ", err);
    }
});

// GET /download route

app.get("/download", async (req, res) => {
    try {
        let link = await upload(path);
        let html = htmlCode(
            `
            <h1>Here come the jokes</h1>
            <img src="https://media3.giphy.com/media/BIuuwHRNKs15C/200.gif" />
            <p>Click <a href="${link}"><strong>here</strong></a> to download the joke file!</p>
            `
        );
        res.end(html);
    } catch (err) {
        console.log("Error in get /download: ", err);
    }
});

app.listen(8080, () => console.log("Express server is at your service!"));
