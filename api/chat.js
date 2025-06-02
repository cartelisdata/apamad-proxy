export default async function handler(req, res) {
  // ✅ CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // ✅ Répondre aux requêtes OPTIONS pour les navigateurs (pré-vol)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { type, message, conversationId } = req.body;
  const DUST_API_KEY = process.env.DUST_API_KEY;
  const WORKSPACE_ID = 'V0Dbkz7sL9';
  const AGENT_ID = 'PuCKOfYTNx';

  const context = {
    username: 'user',
    timezone: 'Europe/Paris'
  };

  let url = '';
  let method = 'POST';
  let dustBody = null;

  try {
    switch (type) {
      case 'create_conversation':
        url = `https://eu.dust.tt/api/v1/w/${WORKSPACE_ID}/assistant/conversations`;
        dustBody = {
          message,
          title: 'Chat avec Apamad',
          visibility: 'unlisted'
        };
        break;

      case 'send_message':
        if (!conversationId) {
          return res.status(400).json({ error: 'conversationId requis pour send_message' });
        }
        url = `https://eu.dust.tt/api/v1/w/${WORKSPACE_ID}/assistant/conversations/${conversationId}/messages`;
        dustBody = { message };
        break;

      case 'get_events':
        if (!conversationId) {
          return res.status(400).json({ error: 'conversationId requis pour get_events' });
        }
        method = 'GET';
        url = `https://eu.dust.tt/api/v1/w/${WORKSPACE_ID}/assistant/conversations/${conversationId}/events`;
        break;

      default:
        return res.status(400).json({ error: 'Type de requête invalide' });
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${DUST_API_KEY}`,
        'Content-Type': 'application/json'
      },
      ...(method === 'POST' ? { body: JSON.stringify(dustBody) } : {})
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Erreur dans le proxy Dust:', error);
    return res.status(500).json({ error: error.message || 'Erreur inconnue' });
  }
}
