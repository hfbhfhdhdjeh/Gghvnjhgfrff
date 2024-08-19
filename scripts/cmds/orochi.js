const axios = require('axios');

const Prefixes = [
  'chi',
  '.chi',
  '.orochi',
  'orochi',
  '/chi',
  '/orochi',
];

module.exports = {
  config: {
    name: 'orochi',
    aliases: ["chi"],
    version: '1.0.7',
    author: '©Custom AI', // don't change credits please 🙏🙂
    role: 0,
    category: 'ai',
    longDescription: {
      en: 'AI is designed to answer user queries and engage in conversations based on user input. It provides responses and insights on a wide range of topics.'
    },
    guide: {
      en: `
      Command: chi [question]
      - Use this command to ask a question to the AI chatbot.
      `
    }
  },
  onStart: async () => {},
  onChat: async ({ event, args, message }) => {
    const prefix = Prefixes.find(p => event.body.toLowerCase().startsWith(p));
    if (!prefix) return;

    const question = event.body.slice(prefix.length).trim();
    if (!question) {
      return message.reply("Hello! How can I assist you today?");
    }

    try {
      const response = await axios.get('https://c-v2.onrender.com/api/orochi', {
        params: { prompt: question }
      });

      if (response.status !== 200 || !response.data) {
        throw new Error('Invalid or missing response from API');
      }

      await message.reply(response.data.answer); 

    } catch (error) {
      console.error(`Error fetching response: ${error.message}, Status Code: ${error.response ? error.response.status : 'N/A'}`);
      message.reply(`⚠ An error occurred while processing your request. Error: ${error.message}${error.response ? `, Status Code: ${error.response.status}` : ''}. Please try again later.`);
    }
  }
};
