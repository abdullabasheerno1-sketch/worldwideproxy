module.exports = async (req, res) => {
  const { id } = req.query;

  const serverUrl = 'http://raztv.online:80';
  const username = 'MAGNL39E26';
  const password = 'hvhS6xsuZP';
  
  // ഒറിജിനൽ Xtream ലിങ്കിലേക്ക് നേരിട്ട് വിടുന്നു
  const targetUrl = `${serverUrl}/live/${username}/${password}/${id || '1339214.m3u8'}`;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.redirect(302, targetUrl);
};
