const express = require('express');
const router = express.Router();
const { DateTime } = require("luxon");
const ytdl = require('ytdl-core');
const axios = require('axios');
const { getHeaderInfo, getFilteredFormats } = require('../utils');
const { searchVideo } = require('../lib/youTubeClient');

// middleware that is specific to this router
router.use(async (req, res, next) => {

  console.log([DateTime.now().toISO()], `'${req.path}'`, req.params, req.query);

  const { v, q } = req.query;
  if (typeof v === 'string') {
    if (!ytdl.validateID(v)) {
      res.send({ status: 'error', message: 'video does not exist' });
      return;
    }
    const url = `https://www.youtube.com/watch?v=${v}`;
    const info = await ytdl.getInfo(`${url}`);
    const filteredFormats = getFilteredFormats({ formats: info.formats });
    if (info.formats.length && !filteredFormats.length) {
      res.send({ error: true, message: 'Video found, but not available to watch' });
      return;
    }

    const format = ytdl.chooseFormat(info.formats, { quality: filteredFormats[0].itag });

    req['youtube'] = { v, url, info, format };
  }

  if (typeof q === 'string') {
    req['youtube'] = { q };
  }

  res.set('Cache-control', 'public, max-age=3600');
  next();
});

router.get('/search', async (req, res) => {
  const { q } = req['youtube'];
  const r = await searchVideo({ q });
  res.send(r);
});

router.get('/watch', async (req, res) => {
  const { info, format } = req['youtube'];

  const { range } = req.headers;

  const { contentLength, mimeType } = format;
  const { httpHeader, start, end } = getHeaderInfo(range, { contentLength, mimeType });

  res.writeHead(range ? 206 : 200, httpHeader);

  const stream = ytdl.downloadFromInfo(info, { format, range: { start, end } });
  stream.pipe(res);
});

router.get('/thumbnail', async (req, res) => {
  const { url } = req.query;
  // @ts-ignore
  const { data } = await axios(decodeURIComponent(url), { responseType: 'stream' });
  data.pipe(res);
});

router.get('/info', async (req, res) => {
  const { info } = req['youtube'];

  res.send(info);
});

router.get('/format', async (req, res) => {
  const { format } = req['youtube'];

  res.send(format);
});


module.exports = router;