const express = require('express');
const videoRoute = require('./router/video');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors({
  origin: ['http://localhost:3000', 'https://video.xwu.us']
}));

app.use('/video', videoRoute);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});

module.exports = app;