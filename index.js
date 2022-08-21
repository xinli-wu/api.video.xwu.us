const express = require('express');
const videoRoute = require('./router/video');
const app = express();
const port = 4000;
app.use('/video', videoRoute);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});

module.exports = app;