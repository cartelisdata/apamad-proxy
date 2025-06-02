export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const DUST_API_KEY = process.env.DUST_API_KEY;
  const WORKSPACE_ID = 'V0Dbkz7sL9';
  const AGENT_ID = 'PuCKOfYTNx';
  const baseUrl = `https://eu.dust.tt/api/v1/w/${WORKSPACE_ID}/assistant`;

  const { type, conversationId, message } = req.body;

  let url = '';
  let dustBody = null;
  let method = 'POST';

  try {
    if (type === 'create_conversation') {
      url = `${baseUrl}/conversations`;
      dustBody = {
        message: {
          content: message,
          mentions: [{ configurationId: AGENT_ID }]
        },
        title: 'Chat avec Apamad',
        visibility: 'unlisted'
      };
    }

    else if (type === 'send_message') {
      if (!conversationId) throw new Error('Missing conversationId');
      url = `${baseUrl}/conversations/${conversationId}/messages`;
      dustBody = {
        message: {
          content: message,
          mentions: [{ configurationId: AGENT_ID }]
        }
      };
    }

    else if (type === 'get_events') {
      if (!conversationId) throw new Error('Missing conversationId');
      url = `${baseUrl}/conversations/${conversationId}/events`;
      method = 'GET';
    }

    else {
      return res.status(400).json({ error: 'Invalid request type' });
    }

    const fetchOptions = {
      method,
      headers: {
        Authorization: `Bearer ${DUST_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    if (method === 'POST') {
      fetchOptions.body = JSON.stringify(dustBody);
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message || 'Unknown error' });
  }
}
