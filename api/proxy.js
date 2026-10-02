const axios = require('axios');
const tunnel = require('tunnel');

module.exports = async (req, res) => {
  const targetUrl = req.query.url;
  
  if (!targetUrl) {
    return res.status(400).send('Please provide a target url using ?url=YOUR_LINK');
  }

  try {
    // Proxy configuration with timeout
    const proxyConfig = tunnel.httpOverHttp({
      proxy: {
        host: '103.87.26.161',
        port: 8080
      }
    });

    let response;
    try {
      // First try with the proxy
      response = await axios({
        method: 'get',
        url: targetUrl,
        headers: {
          'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
          'Referer': targetUrl
        },
        responseType: 'text',
        httpsAgent: proxyConfig,
        proxy: false,
        timeout: 5000 // 5 seconds timeout
      });
    } catch (proxyError) {
      // If proxy fails, fallback to direct fetch
      response = await axios({
        method: 'get',
        url: targetUrl,
        headers: {
          'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
          'Referer': targetUrl
        },
        responseType: 'text'
      });
    }

    let body = response.data;
    
    if (targetUrl.includes('.m3u8')) {
      const vercelHost = req.headers.host;
      const protocol = req.headers['x-forwarded-proto'] || 'https';
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
