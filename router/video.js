const express = require('express');
const router = express.Router();
const fs = require('fs');
const { DateTime } = require("luxon");
const { sizeOf, createAWSStream } = require('../streamClient');
const { s3Env } = require("../config");
const mime = require('mime');
const ytdl = require('ytdl-core');
const { getHeaderInfo } = require('../utils');

// middleware that is specific to this router
router.use((req, res, next) => {
  console.log('Req starts at: ', DateTime.now().toISO());
  next();
});
// define the home page route
router.get('/', (req, res) => {
  res.send('Videos home page');
});

router.get('/yt/info/:key', async (req, res, next) => {
  const url = `https://www.youtube.com/watch?v=${req.params.key}`;
  const info = await ytdl.getInfo(`${url}`);
  res.send(info);
  next();
});

router.get('/yt/format/:key', async (req, res, next) => {
  const url = `https://www.youtube.com/watch?v=${req.params.key}`;
  const info = await ytdl.getInfo(`${url}`);
  const format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo' });
  res.send(format);
  next();
});

router.get('/yt/:key', async (req, res, next) => {
  const videoRange = req.headers.range;

  const url = `https://www.youtube.com/watch?v=${req.params.key}`;

  const info = await ytdl.getInfo(`${url}`);

  const format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo' });

  const { contentLength, mimeType } = format;

  const { httpHeader, start, end } = getHeaderInfo(videoRange, { contentLength, mimeType });

  res.writeHead(videoRange ? 206 : 200, httpHeader);

  const stream = ytdl.downloadFromInfo(info, { format, range: { start, end } });
  stream.pipe(res);

});

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

module.exports = router;