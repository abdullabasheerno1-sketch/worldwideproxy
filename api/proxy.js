const axios = require('axios');

module.exports = async (req, res) => {
  const vercelHost = req.headers.host;
  const protocol = 'https';
  const vercelBase = `${protocol}://${vercelHost}`;

  // HTTPS പോർട്ട് (25460) ഉപയോഗിച്ച് ഒറിജിനൽ ലിങ്ക് അപ്ഡേറ്റ് ചെയ്യുന്നു
  let targetUrl = 'https://raztv.online:25460/live/MAGNL39E26/hvhS6xsuZP/1339214.m3u8';
  
  const queryPath = req.url.replace(/^\/+/, '');
  if (queryPath && queryPath !== '' && !queryPath.startsWith('api/') && queryPath !== 'proxy.m3u8') {
    try {
      const decoded = decodeURIComponent(queryPath);
      if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
        targetUrl = decoded;
      }
    } catch (e) {}
  }

  const isM3U8 = targetUrl.includes('.m3u8');

  try {
    const response = await axios({
      method: 'get',
      url: targetUrl,
      headers: {
        'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
        'Accept': '*/*'
      },
      responseType: isM3U8 ? 'text' : 'arraybuffer',
      timeout: 15000
    });

    let body = response.data;
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (isM3U8) {
      const lines = body.split('\n');
      const modifiedLines = lines.map(line => {
        if (line && !line.startsWith('#')) {
          let segmentUrl = line;
          if (!line.startsWith('http')) {
            segmentUrl = new URL(line, targetUrl).toString();
          }
          return `${vercelBase}/${encodeURIComponent(segmentUrl)}`;
        }
        return line;
      });
      body = modifiedLines.join('\n');
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      return res.status(200).send(body);
    } else {
      res.setHeader('Content-Type', response.headers['content-type'] || 'video/mp2t');
      return res.status(200).send(Buffer.from(body));
    }

  } catch (error) {
    return res.status(500).send('Proxy Error: ' + error.message);
  }
};
