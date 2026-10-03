module.exports = async (req, res) => {
  const username = 'MAGNL39E26';
  const password = 'hvhS6xsuZP';
  const streamId = '1339214';
  
  // പോർട്ട് 80 ഉപയോഗിച്ചുള്ള ഒറിജിനൽ Xtream ലിങ്ക്
  const targetUrl = `http://raztv.online:80/live/${username}/${password}/${streamId}.m3u8`;

  // ആപ്പിനും പ്ലെയറിനും വേണ്ടി CORS ഉം റീഡയറക്ടും സെറ്റ് ചെയ്യുന്നു
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // സെർവർ ബ്ലോക്ക് ചെയ്യാതിരിക്കാൻ ഒറിജിനൽ ബ്രൗസർ റിക്വസ്റ്റ് പോലെ റീഡയറക്ട് ചെയ്യുന്നു
    return res.redirect(302, targetUrl);
  } catch (error) {
    return res.status(500).send('Proxy Error: ' + error.message);
  }
};
