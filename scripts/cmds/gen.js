const axios = require('axios');
const fs = require('fs');

module.exports = {
  config: {
    name: "gen",
    version: "1.2",
    author: "ArYAN",
    countDown: 0,
    role: 0,
    shortDescription: {
      en: 'Generate images based on user prompts.'
    },
    longDescription: {
      en: "This command uses an external API to create images from user-provided prompts."
    },
    category: "media",
    guide: {
      en: "{p}gen <prompt>"
    }
  },
  onStart: async function ({
    message,
    args,
    api,
    event
  }) {
    try {
      const prompt = args.join(" ");
      if (!prompt) {
        return message.reply("Please provide a prompt to generate an image.");
      }
      api.setMessageReaction("⏰", event.messageID, () => {}, true);
      const startTime = new Date().getTime();
      const baseURL = "https://c-v1.onrender.com/gen";
      const params = {
        prompt: prompt,
        apikey: '$c-v1-7bejgsue6@iygv'
      };
      const response = await axios.get(baseURL, {
        params: params,
        responseType: 'arraybuffer'
      });
      if (!response || !response.data) {
        throw new Error('Invalid response from API');
      }
      const endTime = new Date().getTime();
      const timeTaken = (endTime - startTime) / 1000;
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      const fileName = 'emix.png';
      const filePath = `/tmp/${fileName}`;
      fs.writeFileSync(filePath, response.data);
      message.reply({
        body: `📝 𝗣𝗿𝗼𝗺𝗽𝘁: ${prompt}\n👑 𝗧𝗮𝗸𝗲𝗻 𝗧𝗶𝗺𝗲: ${timeTaken} seconds`,
        attachment: fs.createReadStream(filePath)
      });
    } catch (error) {
      console.error('Error generating image:', error);
      message.reply("Failed to generate image. Please try again later.");
    }
  }
};
