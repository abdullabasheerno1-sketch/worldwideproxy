const axios = require('axios');

module.exports = async (req, res) => {
  const username = 'MAGNL39E26';
  const password = 'hvhS6xsuZP';
  const streamId = '1339214';
  
  // Xtream Codes API direct live link format
  let targetUrl = `http://raztv.online/live/${username}/${password}/${streamId}.m3u8`;

  try {
    const response = await axios({
      method: 'get',
      url: targetUrl,
      headers: {
        'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
        'Accept': '*/*'
      },
      responseType: 'text',
      timeout: 15000
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    return res.status(200).send(response.data);

  } catch (error) {
    return res.status(500).send('Proxy Error: ' + (error.response ? error.response.status : error.message));
  }
};
