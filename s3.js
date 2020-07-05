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

exports.upload = async (filePath) => {
    const fileBody = fs.readFileSync(filePath);
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
    s3.upload(params, (err, data) => {
        if (err) {
            throw err;
        }
        // Serve the link:
        console.log("Link to file: ", data.Location);
        // Delete the file:
        fs.unlink(filePath, () => {
            console.log("File has been removed!");
        });
    });
};
