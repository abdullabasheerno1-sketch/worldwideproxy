const axios = require('axios');

module.exports = async (req, res) => {
  const serverUrl = 'http://raztv.online:80';
  const username = 'MAGNL39E26';
  const password = 'hvhS6xsuZP';
  
  // ഡിഫോൾട്ട് സ്ട്രീം ഐഡി
  let streamId = '1339214.m3u8';

  // ആപ്പിൽ നിന്ന് വരുന്ന പാത്ത് റീഡ് ചെയ്യുന്നു
  const queryPath = req.url.replace(/^\/+/, '');
  if (queryPath && queryPath !== '' && !queryPath.startsWith('api/') && queryPath !== 'proxy.m3u8') {
    const parts = queryPath.split('/');
    if (parts.length > 0) {
      streamId = parts[parts.length - 1];
    }
  }

  const targetUrl = `${serverUrl}/live/${username}/${password}/${streamId}`;
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
          const vercelHost = req.headers.host;
          return `https://${vercelHost}/live/${username}/${password}/${encodeURIComponent(segmentUrl)}`;
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
    return res.status(500).send('Proxy Error: ' + (error.response ? error.response.status : error.message));
  }
};
