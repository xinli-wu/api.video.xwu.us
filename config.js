const s3Env = {
  accessKey: process.env.S3_ACCESS_KEY,
  secret: process.env.S3_SECRET_KEY,
  bucket: process.env.S3_BUCKET
};

const youTubeEnv = {
  apiKey: process.env.YOUTUBE_API_KEY
};

module.exports = { s3Env, youTubeEnv };