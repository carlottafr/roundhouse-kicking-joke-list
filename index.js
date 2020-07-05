// I use the filesystem module to read, write
// and append the csv file locally

const fs = require("fs");

// I use csvtojson to parse the existing csv
// data so that I can loop through it to prevent
// double entries

const csv = require("csvtojson");

// Import functions that I'll need:

const { upload } = require("./s3");
const { httpsRequest } = require("./request");

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
        // Here I finally upload the world-saving file via S3
        await upload(path);
        console.log("Done with operationWorldSavingJokes!");
    } catch (err) {
        console.log("Error in operationWorldSavingJokes: ", err);
    }
};

operationWorldSavingJokes("https://api.chucknorris.io/jokes/random");
