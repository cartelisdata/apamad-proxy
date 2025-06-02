export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!['POST', 'GET'].includes(req.method)) {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // Fonction pour parser manuellement req.body si Next.js ne le fait pas
  async function parseJsonBody(req) {
    return new Promise((resolve) => {
      let data = '';
      req.on('data', chunk => (data += chunk));
      req.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({});
        }
      });
    });
  }

  let type, message, conversationId, title, visibility;

  if (req.method === 'POST') {
    const body = await parseJsonBody(req);
    type = body?.type;
    message = body?.message;
    conversationId = body?.conversationId;
    title = body?.title;
    visibility = body?.visibility;
  } else {
    ({ type, message, conversationId, title, visibility } = req.query);
  }

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

    if (type === 'get_events') {
      if (!conversationId) {
        return res.status(400).json({ error: 'conversationId requis pour get_events' });
      }

      const eventsUrl = `https://eu.dust.tt/api/v1/w/${WORKSPACE_ID}/assistant/conversations/${conversationId}/events`;
      const eventsRes = await fetch(eventsUrl, {
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
    }

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

      default:
        return res.status(400).json({ error: 'Type de requête invalide' });
    }

    const headers = {
      Authorization: `Bearer ${DUST_API_KEY}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(dustBody),
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
