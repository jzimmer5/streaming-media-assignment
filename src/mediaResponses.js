const fs = require('fs');
const path = require('path');

const mediaGetter = (request, response, file, filetype) => {
  fs.stat(file, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        response.writeHead(400);
      }
      return response.end(err);
    }

    let { range } = request.headers;

    if (!range) {
      range = 'bytes=0-';
    }

    const posisitons = range.replace(/bytes=/, '').split('-');

    let start = parseInt(posisitons[0], 10);

    const total = stats.size;
    const end = posisitons[1] ? parseInt(posisitons[1], 10) : total - 1;

    if (start > end) {
      start = end - 1;
    }

    const chunksize = (end - start) + 1;

    response.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'content-Type': `${filetype}`,
    });

    const stream = fs.createReadStream(file, { start, end });

    stream.on('open', () => {
      stream.pipe(response);
    });

    stream.on('error', (streamErr) => {
      response.end(streamErr);
    });

    return stream;
  });
};

const getParty = (request, response) => {
  const file = path.resolve(__dirname, '../client/party.mp4');
  mediaGetter(request, response, file, 'video/mp4');
};

const getBling = (request, response) => {
  const file = path.resolve(__dirname, '../client/bling.mp3');
  mediaGetter(request, response, file, 'audio/mpeg');
};

module.exports.getParty = getParty;
module.exports.getBling = getBling;
