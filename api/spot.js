export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  try {
    const [fxRes, metalRes] = await Promise.all([
      fetch('https://api.frankfurter.app/latest?from=USD&to=AUD'),
      fetch('https://api.metals.live/v1/spot/gold,silver'),
    ]);

    const fx     = await fxRes.json();
    const metals = await metalRes.json();
    const aud    = fx?.rates?.AUD;

    const goldUSD   = metals?.find?.(m => m.gold)?.gold;
    const silverUSD = metals?.find?.(m => m.silver)?.silver;

    if (!aud || !goldUSD) {
      return res.status(500).json({ error: 'Data unavailable' });
    }

    res.json({
      gold:          Math.round(goldUSD * aud),
      silver:        Math.round(silverUSD * aud * 100) / 100,
      goldChange:    null,
      silverChange:  null,
      source:        'metals.live + frankfurter.app',
      updatedAt:     new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}