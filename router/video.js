const express = require('express');
const router = express.Router();
const fs = require('fs');
const { DateTime } = require("luxon");
const { sizeOf, createAWSStream } = require('../streamClient');
const { s3Env } = require("../config");
const mime = require('mime');

// middleware that is specific to this router
router.use((req, res, next) => {
  console.log('Req starts at: ', DateTime.now().toISO());
  next();
});
// define the home page route
router.get('/', (req, res) => {
  res.send('Videos home page');
});

router.get('/:key', async (req, res) => {
  const { key } = req.params;

  const bucketParams = {
    Bucket: s3Env.bucket,
    Key: key
  };

  const meta = await sizeOf(bucketParams);

  console.log({ s3Env });
  console.log({ meta });

  const { ContentLength, ContentType } = meta;

  // Create the smart stream
  const stream = await createAWSStream(bucketParams);

  const videoRange = req.headers.range;

  if (videoRange) {
    const parts = videoRange.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : ContentLength - 1;
    const chunksize = (end - start) + 1;

    const head = {
      'Content-Range': `bytes ${start}-${end}/${ContentLength}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': ContentType,
    };

    res.writeHead(206, head);

  } else {
    const head = {
      'Content-Length': ContentLength,
      'Content-Type': ContentType,
    };

    res.writeHead(200, head);
  }
  // Pipe it into the response
  stream.pipe(res);
});

router.get('/local/:key', async (req, res) => {
  const videoPath = `assets/${req.params.key}`;
  const contentType = mime.getType(videoPath);
  const videoStat = fs.statSync(videoPath);
  const fileSize = videoStat.size;
  const videoRange = req.headers.range;

  if (videoRange) {
    const parts = videoRange.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;

    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    };
    res.writeHead(206, head);

    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': contentType,
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

module.exports = router;