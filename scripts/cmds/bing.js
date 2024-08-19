const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');
const cookies = '1EW67wRni4gKmk_zowEoOrzhMN3d9SlfuT2_OfVb4TbMw6bWjJTJbvfl38l-bm29-znqig6j76FgVaAQMA8hFttxRxM9oAgr6jmftI9mzkf5aVNkXG7pIgjREgd6076llZqos734VkdtJC6OMepxxDtJyHiK5NXqO6QoEa2sU_uWturd2VzESYhHkq-G2kv2D7wuZ-DAFfgNr_htp4kkdTg'; // Add your cookies here

module.exports = {
  config: {
    name: "bing",
    version: "10.5",
    author: "ArYAN",
    shortDescription: { en: 'Converts text to image' },
    longDescription: { en: "Generates images based on provided text using Bing API." },
    category: "image",
    countDown: 10,
    role: 2,
    guide: { en: '{pn} your prompt' }
  },

  onStart: async function ({ api, event, args, message }) {
    const startTime = new Date().getTime();
    const text = args.join(" ");

    if (!text) {
      return message.reply("❌|𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗨𝘀𝗮𝗴𝗲\n━━━━━━━━━━━━\n\nPlease provide some prompts\n\nExample:\nCreate a 3D illustration of an animated character sitting casually on top of a social media logo \"SocialMedia\". The character must wear casual modern clothing such as jeans jacket and sneakers shoes. The background of the image is a social media profile page with a user name \"YourName\" and a profile picture that match.");
    }

    message.reply(`⚙ Creating your imagination, please be patient...`, async (err, info) => {
      if (err) {
        console.error("Error sending initial message:", err);
        return;
      }
      
      let ui = info.messageID;
      api.setMessageReaction("⏰", event.messageID, () => {}, true);

      try {
        console.log("Sending request to Bing API with prompt:", text);
        const response = await axios.get(`https://c-v1.onrender.com/api/bing?prompt=${encodeURIComponent(text)}&cookie=${encodeURIComponent(cookies)}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        console.log("Received response from Bing API:", response.data);
        api.setMessageReaction("✅", event.messageID, () => {}, true);

        const images = response.data.images;
        if (!images || images.length === 0) {
          throw new Error("No images found in the response");
        }

        api.unsendMessage(ui);

        const endTime = new Date().getTime();
        const timeTaken = (endTime - startTime) / 1000;

        let imagesInfo = `🖼 [𝗕𝗜𝗡𝗚] 
━━━━━━━━━━━━

👑 𝗣𝗿𝗼𝗺𝗽𝘁𝘀: ${text}

🌟 𝗡𝘂𝗺𝗯𝗲𝗿 𝗼𝗳 𝗜𝗺𝗮𝗴𝗲𝘀: ${images.length}

⚙ 𝗜𝗺𝗮𝗴𝗲𝘀 𝗟𝗶𝗻𝗸𝘀:
${images.map((img, index) => `(${index + 1}) ${img}`).join("\n")}

⏰ 𝗧𝗶𝗺𝗲 𝗧𝗮𝗸𝗲𝗻: ${timeTaken.toFixed(2)} seconds
━━━━━━━━━━━━`;

        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bing-'));

        const imagePaths = await Promise.all(
          images.map(async (img, index) => {
            const imgPath = path.join(tempDir, `image_${index}.jpg`);
            const writer = fs.createWriteStream(imgPath);

            const response = await axios({
              url: img,
              method: 'GET',
              responseType: 'stream'
            });

            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
              writer.on('finish', () => resolve(imgPath));
              writer.on('error', reject);
            });
          })
        );

        const imageAttachments = imagePaths.map(imgPath => fs.createReadStream(imgPath));

        console.log("Sending message with images.");
        message.reply({
          body: imagesInfo,
          attachment: imageAttachments
        }, async (err) => {
          if (err) {
            console.error("Failed to send message with images", err);
          }
          
          imagePaths.forEach(imgPath => fs.unlinkSync(imgPath));
          fs.rmdirSync(tempDir);
        });
      } catch (error) {
        console.error("Error during image generation or sending", error);
        api.unsendMessage(ui);
        api.sendMessage(`There was an error processing your request. Please check the logs for details.`, event.threadID, event.messageID);
      }
    });
  },
};
