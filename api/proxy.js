module.exports = async (req, res) => {
  const username = 'MAGNL39E26';
  const password = 'hvhS6xsuZP';
  const streamId = '1339214';
  
  // ഒറിജിനൽ Xtream ലൈവ് ലിങ്ക് (പോർട്ട് 80)
  const targetUrl = `http://raztv.online:80/live/${username}/${password}/${streamId}.m3u8`;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 302 Redirect വഴി നേരിട്ട് പ്ലെയറിലേക്ക് ലിങ്ക് എത്തിക്കുന്നു (403 എറർ ഒഴിവാക്കാൻ)
  return res.redirect(302, targetUrl);
};
