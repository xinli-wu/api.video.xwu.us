const express = require('express');
const fs = require('fs');
const app = express();
const port = 4000;

const video = require('./router/video');
app.use('/video', video);


app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});