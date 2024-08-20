module.exports = {
  config: {
    name: "c",
    aliases: ['cl'],
    author: "ArYAN",
    version: "2.0",
    cooldowns: 5,
    role: 0,
    shortDescription: {
      en: "Unsend bot messages"
    },
    longDescription: {
      en: "Unsend a specified number of messages sent by the bot."
    },
    category: "box chat",
    guide: {
      en: "{p}{n} [number]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const threadID = event.threadID;
    let numMessages = parseInt(args[0]);

    if (isNaN(numMessages) || numMessages <= 0) {
      return api.sendMessage("Please provide a valid positive number of messages to unsend.", threadID, event.messageID);
    }

    try {
      const botID = api.getCurrentUserID();
      let totalMessagesUnsent = 0;

      const unsendBotMessages = async () => {
        let messagesUnsent = 0;
        let hasMoreMessages = true;

        while (hasMoreMessages && messagesUnsent < numMessages) {
          const botMessages = await api.getThreadHistory(threadID, numMessages);
          const botSentMessages = botMessages.filter(message => message.senderID === botID);

          if (botSentMessages.length === 0) {
            hasMoreMessages = false;
            continue;
          }

          for (const message of botSentMessages) {
            if (messagesUnsent >= numMessages) break;
            await api.unsendMessage(message.messageID);
            messagesUnsent++;
          }

          totalMessagesUnsent += messagesUnsent;
        }

        if (totalMessagesUnsent > 0) {
          api.sendMessage(`✅`, threadID, event.messageID);
        } else {
          api.sendMessage("No bot messages found to unsend.", threadID, event.messageID);
        }
      };

      await unsendBotMessages();
    } catch (error) {
      console.error("Error occurred while unsending messages:", error);
      api.sendMessage("An error occurred while trying to unsend messages.", threadID, event.messageID);
    }
  }
};
