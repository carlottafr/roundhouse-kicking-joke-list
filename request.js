const https = require("https");

exports.httpsRequest = (url) => {
    return new Promise((resolve, reject) => {
        let request = https.get(url, (res) => {
            if (res.statusCode != 200) {
                return reject(new Error("statusCode = " + res.statusCode));
            }
            let joke = "";
            res.on("data", (data) => {
                // I parse the incoming data to
                // access the value-key
                joke += JSON.parse(data).value;
            });
            res.on("end", () => {
                resolve(joke);
            });
        });
        request.on("error", (err) => {
            console.log("Error: ", err);
            reject(err);
        });
        request.end();
    });
};
