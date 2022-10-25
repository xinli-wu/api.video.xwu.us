const getHeaderInfo = (videoRange, { contentLength, mimeType }) => {
  if (!videoRange) return { httpHeader: { 'Content-Length': contentLength, 'Content-Type': mimeType } };

  const parts = videoRange.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : contentLength - 1;
  const chunksize = (end - start) + 1;

  const headerInfo = {
    httpHeader: {
      'Content-Range': `bytes ${start}-${end}/${contentLength}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': mimeType,
    },
    start,
    end
  };

  return headerInfo;
};

const getFilteredFormats = ({ formats }) => {
  return formats.filter(x => x.hasAudio && x.hasVideo && ('contentLength' in x)).sort((a, b) => a.itag - b.itag);
};

module.exports = {
  getHeaderInfo,
  getFilteredFormats
};