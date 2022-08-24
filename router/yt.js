const express = require('express');
const router = express.Router();
const { DateTime } = require("luxon");

const ytdl = require('ytdl-core');
const { getHeaderInfo } = require('../utils');
const { searchVideo } = require('../lib/youTubeClient');

// middleware that is specific to this router
router.use((req, res, next) => {
  console.log([DateTime.now().toISO()], req.params, req.query);
  next();
});

router.get('/search/:q', async (req, res, next) => {
  const r = await searchVideo({ q: decodeURIComponent(req.params.q) });
  res.send(r);
  next();
});


router.get('/watch', async (req, res, next) => {
  const videoId = req.query.v;

  if (typeof videoId === 'string' && !ytdl.validateID(videoId)) return { status: 'error', message: 'video does not exist' };

  const videoRange = req.headers.range;
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  const info = await ytdl.getInfo(`${url}`);

  const format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo' });

  const { contentLength, mimeType } = format;

  const { httpHeader, start, end } = getHeaderInfo(videoRange, { contentLength, mimeType });

  res.writeHead(videoRange ? 206 : 200, httpHeader);

  const stream = ytdl.downloadFromInfo(info, { format, range: { start, end } });
  stream.pipe(res);

});

router.get('/info/:videoId', async (req, res, next) => {
  const url = `https://www.youtube.com/watch?v=${req.params.videoId}`;
  const info = await ytdl.getInfo(`${url}`);
  res.send(info);
  next();
});

router.get('/format/:videoId', async (req, res, next) => {
  const url = `https://www.youtube.com/watch?v=${req.params.videoId}`;
  const info = await ytdl.getInfo(`${url}`);
  const format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo' });
  res.send(format);
  next();
});


module.exports = router;