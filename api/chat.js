export default async function handler(req, res) {
  // ✅ CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // ✅ Réponse pré-vol CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ✅ Autorise POST et GET
  if (!['POST', 'GET'].includes(req.method)) {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // ✅ Lecture dynamique en fonction de la méthode
  const {
    type,
    message,
    conversationId,
    title,
    visibility
  } = req.method === 'GET' ? req.query : req.body || {};

  const DUST_API_KEY = process.env.DUST_API_KEY;
  const WORKSPACE_ID = 'V0Dbkz7sL9';
  const AGENT_ID = 'PuCKOfYTNx';

  const context = {
    username: 'user',
    timezone: 'Europe/Paris',
  };

  try {
    let url = '';
    let method = 'POST';
    let dustBody = null;

    switch (type) {
      case 'create_conversation':
        url = `https://eu.dust.tt/api/v1/w/${WORKSPACE_ID}/assistant/conversations`;
        dustBody = {
          message: {
            ...message,
            mentions: [{ configurationId: AGENT_ID }],
            context,
          },
          title: title || 'Chat avec Apamad',
          visibility: visibility || 'unlisted',
        };
        break;

      case 'send_message':
        if (!conversationId) {
          return res.status(400).json({ error: 'conversationId requis pour send_message' });
        }
        url = `https://eu.dust.tt/api/v1/w/${WORKSPACE_ID}/assistant/conversations/${conversationId}/messages`;
        dustBody = {
          message: {
            ...message,
            mentions: [{ configurationId: AGENT_ID }],
            context,
          },
        };
        break;

      case 'get_events':
        if (!conversationId) {
          return res.status(400).json({ error: 'conversationId requis pour get_events' });
        }
        url = `https://eu.dust.tt/api/v1/w/${WORKSPACE_ID}/assistant/conversations/${conversationId}/events`;

        const eventsRes = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${DUST_API_KEY}`,
          },
        });

        const eventsData = await eventsRes.json();

        if (!eventsRes.ok) {
          return res.status(eventsRes.status).json(eventsData);
        }

        return res.status(200).json(eventsData);

      default:
        return res.status(400).json({ error: 'Type de requête invalide' });
    }

    const headers = {
      Authorization: `Bearer ${DUST_API_KEY}`,
    };

    if (method === 'POST') {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      method,
      headers,
      ...(method === 'POST' ? { body: JSON.stringify(dustBody) } : {}),
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
