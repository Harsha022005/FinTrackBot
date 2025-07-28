import handlemessage from './handlemessages.js';

async function handler(req) {
  const { body } = req;
  if (body && body.message) {
    try {
      await handlemessage(body.message);
    } catch (error) {
      console.error(' Error in handlemessage:', error.response?.data || error.message);
    }
  }
  return 'OK';
}

export default handler;
