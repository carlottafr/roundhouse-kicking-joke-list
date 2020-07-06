const aws = require("aws-sdk");
const fs = require("fs");
const cryptoRandomString = require("crypto-random-string");

let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env;
} else {
    secrets = require("./secrets");
}

const s3 = new aws.S3({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
});

exports.upload = async (path) => {
    // Get the csv body
    const fileBody = fs.readFileSync(path);
    // Generate a random file name for individual
    // file uploads
    let fileName = cryptoRandomString({
        length: 12,
    });
    const params = {
        Bucket: "progcf",
        ACL: "public-read",
        Key: `${fileName}.csv`,
        Body: fileBody,
        ContentType: "text/csv",
    };
    // Invoke s3.upload as a promise
    let uploadPromise = s3.upload(params).promise();
    try {
        let { Location } = await uploadPromise;
        // Delete the file:
        fs.unlink(path, () => {
            console.log("File has been removed!");
        });
        return Location;
    } catch (err) {
        throw err;
    }
};
