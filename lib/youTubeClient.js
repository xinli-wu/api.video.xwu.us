const { youTubeEnv } = require("../config");
const { google } = require('googleapis');

const youtube = google.youtube({
  version: 'v3',
  auth: youTubeEnv.apiKey
});

const searchVideo = async ({ q }) => {
  const { data } = await youtube.search.list({
    "part": ["snippet"],
    "maxResults": 25,
    "q": q,
    "type": ['video']
  });

  return data.items;
};

module.exports = {
  searchVideo
};