const axios = require('axios');

module.exports = async (req, res) => {
  const vercelHost = req.headers.host;
  const protocol = 'https';
  const vercelBase = `${protocol}://${vercelHost}`;

  let targetUrl = 'http://raztv.online/live/MAGNL39E26/hvhS6xsuZP/1339214.m3u8';
  
  const cleanPath = req.url.replace(/^\/+/, '');
  if (cleanPath && cleanPath !== '' && cleanPath !== 'stream.m3u8') {
    try {
      const decodedUrl = decodeURIComponent(cleanPath);
      if (decodedUrl.startsWith('http://') || decodedUrl.startsWith('https://')) {
        targetUrl = decodedUrl;
      }
    } catch (e) {}
  }

  try {
    const response = await axios({
      method: 'get',
      url: targetUrl,
      headers: {
        'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
        'Referer': targetUrl,
        'Accept': '*/*'
      },
      responseType: targetUrl.includes('.m3u8') ? 'text' : 'arraybuffer'
    });

    let body = response.data;
    
    if (targetUrl.includes('.m3u8')) {
      const lines = body.split('\n');
      const modifiedLines = lines.map(line => {
        if (line && !line.startsWith('#')) {
          let absoluteSegmentUrl = line;
          if (!line.startsWith('http')) {
            absoluteSegmentUrl = new URL(line, targetUrl).toString();
          }
          return `${vercelBase}/${encodeURIComponent(absoluteSegmentUrl)}`;
        }
        return line;
      });
      body = modifiedLines.join('\n');
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    } else {
      res.setHeader('Content-Type', response.headers['content-type'] || 'video/mp2t');
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(response.status).send(body);

  } catch (error) {
    res.status(500).send('Proxy Error: ' + error.message);
  }
};
