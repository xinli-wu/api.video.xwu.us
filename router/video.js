const express = require('express');
const router = express.Router();
const fs = require('fs');
const { DateTime } = require("luxon");

// middleware that is specific to this router
router.use((req, res, next) => {
  console.log('Req starts at: ', DateTime.now().toISO());
  next();
});
// define the home page route
router.get('/', (req, res) => {
  res.send('Videos home page');
});

router.get('/:id', (req, res, next) => {
  const videoPath = `assets/${req.params.id}.mp4`;
  const videoStat = fs.statSync(videoPath);
  const fileSize = videoStat.size;
  const videoRange = req.headers.range;
  if (videoRange) {
    const parts = videoRange.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    console.log({ start, end });
    const chunksize = (end - start) + 1;

    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, head);

    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});


module.exports = router;