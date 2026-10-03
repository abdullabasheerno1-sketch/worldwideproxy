const axios = require('axios');

module.exports = async (req, res) => {
  const vercelHost = req.headers.host;
  const protocol = 'https';
  const vercelBase = `${protocol}://${vercelHost}`;

  let targetUrl = 'http://raztv.online//live/MAGNL39E26/hvhS6xsuZP/1339214.m3u8';
  
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'http://raztv.online//',
        'Origin': 'http://raztv.online//',
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
      // സെഗ്മെന്റ് ഫയലുകൾക്ക് ഒറിജിനൽ ഹെഡേഴ്സ് കൂടെ നൽകുന്നു
      if (response.headers['content-type']) {
        res.setHeader('Content-Type', response.headers['content-type']);
      } else {
        res.setHeader('Content-Type', 'video/mp2t');
      }
      if (response.headers['content-length']) {
        res.setHeader('Content-Length', response.headers['content-length']);
      }
      return res.status(200).send(Buffer.from(body));
    }

  } catch (error) {
    return res.status(500).send('Proxy Error: ' + error.message);
  }
};
