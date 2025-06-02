export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const DUST_API_KEY = process.env.DUST_API_KEY;
  const { type, message, conversationId } = req.body;

  let url = '';
  let body = null;

  if (type === 'create_conversation') {
    url = `https://eu.dust.tt/api/v1/w/V0Dbkz7sL9/assistant/conversations`;
    body = {
      message: {
        content: message,
        mentions: [{ configurationId: 'PuCKOfYTNx' }]
      },
      title: 'Chat avec Apamad',
      visibility: 'unlisted'
    };
  } else if (type === 'send_message') {
    url = `https://eu.dust.tt/api/v1/w/V0Dbkz7sL9/assistant/conversations/${conversationId}/messages`;
    body = {
      message: {
        content: message,
        mentions: [{ configurationId: 'PuCKOfYTNx' }]
      }
    };
  } else if (type === 'get_events') {
    url = `https://eu.dust.tt/api/v1/w/V0Dbkz7sL9/assistant/conversations/${conversationId}/events`;
  } else {
    return res.status(400).json({ error: 'Unknown type' });
  }

  try {
    const response = await fetch(url, {
      method: type === 'get_events' ? 'GET' : 'POST',
      headers: {
        'Authorization': `Bearer ${DUST_API_KEY}`,
        'Content-Type': 'application/json'
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
