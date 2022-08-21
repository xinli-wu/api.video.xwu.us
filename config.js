const { config } = require("dotenv");
config();
const s3Env = {
  accessKey: process.env.S3_ACCESS_KEY,
  secret: process.env.S3_SECRET_KEY,
  bucket: process.env.S3_BUCKET
};

module.exports = {
  s3Env
};