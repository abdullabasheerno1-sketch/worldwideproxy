const axios = require('axios');

module.exports = async (req, res) => {
  const vercelHost = req.headers.host;
  const protocol = 'https';
  const vercelBase = `${protocol}://${vercelHost}`;

  const hostUrl = 'http://raztv.online:80';
  
  // ഡിഫോൾട്ട് ആയി വർക്ക് ചെയ്യുന്ന ലിങ്ക് (ഒന്നുമില്ലെങ്കിൽ ഇത് എടുക്കും)
  let targetUrl = `${hostUrl}/live/MAGNL39E26/hvhS6xsuZP/1339214.m3u8`;
  
  // പ്രൊക്സി ലിങ്കിന് ശേഷം നമ്മൾ കൊടുക്കുന്ന പാത്ത് അല്ലെങ്കിൽ ഫുൾ ലിങ്ക് ഇവിടെ ഓട്ടോമാറ്റിക് ആയി റീഡ് ചെയ്യും
  const queryPath = req.url.replace(/^\/+/, '');
  if (queryPath && queryPath !== '' && queryPath !== 'proxy.m3u8' && !queryPath.startsWith('api/')) {
    try {
      let decoded = decodeURIComponent(queryPath);
      if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
        targetUrl = decoded;
      } else {
        targetUrl = `${hostUrl}/${decoded}`;
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
    return res.status(500).send('Proxy Error: ' + (error.response ? error.response.status + ' - ' + JSON.stringify(error.response.data) : error.message));
  }
};
