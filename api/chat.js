export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { type, message, conversationId } = req.body;

  const DUST_API_KEY = process.env.DUST_API_KEY;

  try {
    let dustRes;

    if (type === 'create_conversation') {
      dustRes = await fetch(`https://eu.dust.tt/api/v1/w/V0Dbkz7sL9/assistant/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DUST_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            content: message,
            mentions: [{ configurationId: "PuCKOfYTNx" }]
          },
          title: 'Chat avec Apamad',
          visibility: 'unlisted'
        }),
      });
    }

    // Gère d'autres types comme send_message / get_events ici...

    const data = await dustRes.json();
    res.status(dustRes.status).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}
