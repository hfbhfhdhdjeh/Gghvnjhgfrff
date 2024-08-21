const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const loveQuotes = [
  "{targetName}, my heart belongs to you and only you. I love you more than words can express. - {senderName} 💓",
  "Every time I see you, {targetName}, I fall in love all over again. - {senderName} 💓",
  "{targetName}, you are my everything. I love you endlessly. - {senderName} 💓",
  "I can’t imagine my life without you, {targetName}. I love you more each day. - {senderName} 💓",
  "You are the light of my life, {targetName}. I love you more than you could ever know. - {senderName} 💓",
  "{targetName}, you make my heart skip a beat. I love you beyond measure. - {senderName} 💓",
  "With every breath I take, {targetName}, I fall more in love with you. - {senderName} 💓",
  "My love for you, {targetName}, is like an endless sea. I love you more than anything. - {senderName} 💓",
  "No matter where life takes us, {targetName}, my love for you will always guide me. - {senderName} 💓",
  "{targetName}, you are my forever and always. I love you with all my heart. - {senderName} 💓",
  "I am yours, {targetName}, completely and forever. I love you more than words can say. - {senderName} 💓",
  "Every day with you, {targetName}, is a beautiful adventure. I love you more each day. - {senderName} 💓",
  "You are the dream I never knew I had, {targetName}. I love you more than anything in this world. - {senderName} 💓",
  "{targetName}, my heart beats for you and only you. I love you more than you can imagine. - {senderName} 💓",
  "You are my greatest joy, {targetName}. I love you beyond words. - {senderName} 💓",
  "From the moment I met you, {targetName}, I knew I was in love. I love you more than ever. - {senderName} 💓",
  "You are my heart's desire, {targetName}. I love you more than you will ever know. - {senderName} 💓",
  "My love for you, {targetName}, is immeasurable. I love you more with each passing moment. - {senderName} 💓",
  "{targetName}, you are the love of my life. I love you more than anything else in this world. - {senderName} 💓",
  "Every moment spent with you, {targetName}, is a treasure. I love you more than words can express. - {senderName} 💓",
"My dearest {targetName}, you are the essence of my happiness. I love you more than you can ever imagine. - {senderName} 💓",
  "{targetName}, you are the heartbeat of my existence. I love you more deeply with every passing day. - {senderName} 💓",
  "In the story of my life, {targetName}, you are my favorite chapter. I love you endlessly. - {senderName} 💓",
  "Every moment without you, {targetName}, is a moment lost. I love you more than words can say. - {senderName} 💓",
  "{targetName}, you are the reason behind my every smile. I love you more than you could ever know. - {senderName} 💓",
  "My love for you, {targetName}, is like a never-ending journey. I cherish you more every day. - {senderName} 💓",
  "To the world, you may be one person, {targetName}, but to me, you are the world. I love you beyond measure. - {senderName} 💓",
  "{targetName}, your love is the light that guides me through life. I love you more than you can ever fathom. - {senderName} 💓",
  "With every sunrise, {targetName}, my love for you grows stronger. I am devoted to you forever. - {senderName} 💓",
  "{targetName}, you are my greatest treasure. I love you more than anything life has to offer. - {senderName} 💓",
  "I found my heart when I found you, {targetName}. I love you with all that I am. - {senderName} 💓",
  "In your embrace, {targetName}, I have found my home. I love you more than you can ever understand. - {senderName} 💓",
  "{targetName}, you are my dream come true and my endless love. I cherish you more than words can express. - {senderName} 💓",
  "Every day with you, {targetName}, is a gift. I love you more than I ever thought possible. - {senderName} 💓",
  "You are my heart's greatest desire, {targetName}. I love you beyond the bounds of this world. - {senderName} 💓",
  "{targetName}, you make my life complete. I love you more than I can ever put into words. - {senderName} 💓",
  "In every heartbeat, {targetName}, you are there. I love you more than you could ever know. - {senderName} 💓",
  "{targetName}, you are my soul's counterpart. I love you with all my heart and soul. - {senderName} 💓",
  "Every look, every touch, {targetName}, reminds me of how much I adore you. I love you endlessly. - {senderName} 💓",
  "My love for you, {targetName}, is a timeless story. I am devoted to you forever and always. - {senderName} 💓"
];

module.exports = {
  config: {
    name: "pair",
    aliases: ["p"],
    version: "2.3",
    author: "ArYAN",
    countDown: 5,
    role: 0,
    shortDescription: "Pair with someone",
    longDescription: "Pair with someone in the chat by mention, UID, reply, or randomly with a random love quote.",
    category: "love",
    guide: "{pn} [@mention | uid | reply]"
  },

  onStart: async function({ api, event, usersData, args }) {
    const { threadID, senderID, messageReply, participantIDs } = event;

    let targetID;

    if (Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];

    } else if (args[0] && !isNaN(args[0])) {
      targetID = args[0];

    } else if (messageReply && messageReply.senderID) {
      targetID = messageReply.senderID;

    } else {
      const randomIndex = Math.floor(Math.random() * participantIDs.length);
      targetID = participantIDs[randomIndex];
      
      if (targetID === senderID) {
        targetID = participantIDs[(randomIndex + 1) % participantIDs.length];
      }
    }

    const senderName = (await usersData.get(senderID)).name;
    const targetName = (await usersData.get(targetID)).name;

    const compatibility = Math.floor(Math.random() * 101);

    const randomQuote = loveQuotes[Math.floor(Math.random() * loveQuotes.length)]
      .replace("{senderName}", senderName)
      .replace("{targetName}", targetName);

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
    }

    const senderAvatar = (await axios.get(`https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(path.join(cacheDir, "avt.png"), Buffer.from(senderAvatar, "utf-8"));

    const loveGif = (await axios.get(`https://i.ibb.co/y4dWfQq/image.gif`, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(path.join(cacheDir, "giflove.png"), Buffer.from(loveGif, "utf-8"));

    const targetAvatar = (await axios.get(`https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(path.join(cacheDir, "avt2.png"), Buffer.from(targetAvatar, "utf-8"));

    const attachments = [
      fs.createReadStream(path.join(cacheDir, "avt.png")),
      fs.createReadStream(path.join(cacheDir, "giflove.png")),
      fs.createReadStream(path.join(cacheDir, "avt2.png"))
    ];

    const messageBody = `🥰 Successful pairing!\n💌 Wish you two a hundred years of happiness\n💕 Compatibility: ${compatibility}%\n\n${randomQuote}`;

    const message = {
      body: messageBody,
      mentions: [
        { id: senderID, tag: senderName },
        { id: targetID, tag: targetName }
      ],
      attachment: attachments
    };

    return api.sendMessage(message, threadID);
  }
};
