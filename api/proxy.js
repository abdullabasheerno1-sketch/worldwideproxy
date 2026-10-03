const axios = require('axios');

module.exports = async (req, res) => {
  // Ningalude original IPTV link ivide hardcode cheythirikkunnu, 
  // allenkil ?url= vazhi pass cheyyam.
  const targetUrl = req.query.url || 'http://raztv.online/live/MAGNL39E26/hvhS6xsuZP/1339214.m3u8';

  try {
    const response = await axios({
      method: 'get',
      url: targetUrl,
      headers: {
        'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
        'Referer': targetUrl,
        'Accept': '*/*'
      },
      responseType: 'text'
    });

    let body = response.data;
    
    // M3U8 playlist anenkil linkukal purnaamayum Vercel HTTPS link-ilekku mattunnu
    if (targetUrl.includes('.m3u8')) {
      const vercelHost = req.headers.host;
      const protocol = 'https'; // Full HTTPS akan
      const vercelBase = `${protocol}://${vercelHost}`;

      const lines = body.split('\n');
      const modifiedLines = lines.map(line => {
        if (line && !line.startsWith('#')) {
          if (!line.startsWith('http')) {
            const absoluteSegmentUrl = new URL(line, targetUrl).toString();
            return `${vercelBase}/?url=${encodeURIComponent(absoluteSegmentUrl)}`;
          } else {
            return `${vercelBase}/?url=${encodeURIComponent(line)}`;
          }
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
