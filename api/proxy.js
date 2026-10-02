const axios = require('axios');
const tunnel = require('tunnel');

module.exports = async (req, res) => {
  const targetUrl = req.query.url;
  
  if (!targetUrl) {
    return res.status(400).send('Please provide a target url using ?url=YOUR_LINK');
  }

  try {
    // Indian Proxy Configuration (IP & Port)
    const proxyConfig = tunnel.httpOverHttp({
      proxy: {
        host: '45.116.230.79',
        port: 8080
      }
    });

    const response = await axios({
      method: 'get',
      url: targetUrl,
      headers: {
        'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
        'Referer': targetUrl
      },
      responseType: 'stream',
      httpsAgent: proxyConfig,
      proxy: false
    });

    // CORS and Content-Type Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/vnd.apple.mpegurl');
    
    response.data.pipe(res);
  } catch (error) {
    res.status(500).send('Proxy Error: ' + error.message);
  }
};
