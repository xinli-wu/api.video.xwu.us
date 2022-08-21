const AWS = require("aws-sdk");
const { s3Env } = require("../config");
const { SmartStream } = require("./SmartStream");

const s3 = new AWS.S3({
  accessKeyId: s3Env.accessKey,
  secretAccessKey: s3Env.secret
});

async function sizeOf(bucketParams) {
  return s3.headObject(bucketParams)
    .promise();
}


async function createAWSStream(bucketParams) {
  return new Promise((resolve, reject) => {
    try {
      s3.headObject(bucketParams, (error, data) => {
        if (error) {
          throw error;
        };

        const stream = new SmartStream(bucketParams, s3, data.ContentLength);

        resolve(stream);
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  sizeOf,
  createAWSStream
};