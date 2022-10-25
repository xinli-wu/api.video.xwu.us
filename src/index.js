const { config } = require("dotenv");
config();

const express = require('express');
const yt = require('./router/yt');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors({
  origin: [
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : [])
    , 'https://video.xwu.us'
    , 'https://utube.xwu.us'
  ]
}));

app.use('/yt', yt);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});

module.exports = app;