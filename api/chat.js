export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const DUST_API_KEY = process.env.DUST_API_KEY;

  const response = await fetch("https://eu.dust.tt/api/v1/w/V0Dbkz7sL9/assistant/conversations", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${DUST_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req.body),
  });

  const data = await response.json();
  return res.status(response.status).json(data);
}
