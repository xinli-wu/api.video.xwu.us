const { s3Env } = require("../config");
const express = require('express');
const fs = require('fs');
const router = express.Router();
const { sizeOf, createAWSStream } = require('../streamClient');
const mime = require('mime');
const { getHeaderInfo } = require('../utils');

router.get('/:key', async (req, res) => {
  const { key } = req.params;

  const bucketParams = {
    Bucket: s3Env.bucket,
    Key: key
  };

  const meta = await sizeOf(bucketParams);

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

  const { httpHeader, start, end } = getHeaderInfo(videoRange, { contentLength: fileSize, mimeType: contentType });

  res.writeHead(videoRange ? 206 : 200, httpHeader);

  const stream = fs.createReadStream(videoPath, { start, end });
  stream.pipe(res);
});