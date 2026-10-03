module.exports = async (req, res) => {
  // ആപ്പ് വിളിക്കുന്ന ലിങ്കിലെ അവസാന ഐഡി (ഉദാഹരണത്തിന്: 1339214.m3u8) ഇവിടെ എടുക്കും
  const { id } = req.query;

  const serverUrl = 'http://raztv.online:80';
  const username = 'MAGNL39E26';
  const password = 'hvhS6xsuZP';
  
  // ഒരു മാറ്റവുമില്ലാത്ത ഒറിജിനൽ Xtream ലിങ്ക് ഫോർമാറ്റ്
  const targetUrl = `${serverUrl}/live/${username}/${password}/${id || '1339214.m3u8'}`;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // പ്ലെയറിലേക്ക് നേരിട്ട് റീഡയറക്ട് ചെയ്യുന്നു
  return res.redirect(302, targetUrl);
};
