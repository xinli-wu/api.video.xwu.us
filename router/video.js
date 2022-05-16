const express = require('express');
const router = express.Router();
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
  res.sendFile('./assets/001.mp4', { root: __dirname });
});


module.exports = router;