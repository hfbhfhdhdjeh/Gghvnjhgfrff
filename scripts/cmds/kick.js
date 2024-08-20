module.exports = {
  config: {
    name: "kick",
    version: "1.3",
    author: "NTKhang",
    countDown: 0,
    role: 1,
    longDescription: {
      en: "Kick members from chat box with additional features."
    },
    category: "group",
    guide: {
      en: "{pn} @tags [reason]: Kick tagged members with an optional reason."
    }
  },

  langs: {
    en: {
      needAdmin: "⛔|𝗡𝗼 𝗣𝗲𝗿𝗺𝗶𝘀𝘀𝗶𝗼𝗻\n━━━━━━━━━━\n\nPlease add bot as a group admin before using this feature",
      kicked: "Member has been kicked.",
      kickError: "An error occurred while kicking the member.",
      kickReason: "You have been kicked from the group. Reason: {reason}",
      kickSuccess: "Member has been kicked from the group.",
      missingReason: "Please provide a reason for kicking."
    }
  },

  onStart: async function ({ message, event, args, threadsData, api, getLang }) {
    const adminIDs = await threadsData.get(event.threadID, "adminIDs");
    if (!adminIDs.includes(api.getCurrentUserID()))
      return message.reply(getLang("needAdmin"));

    async function kickMember(uid, reason) {
      try {
        await api.removeUserFromGroup(uid, event.threadID);
        if (reason) {
          const kickMessage = getLang("kickReason").replace("{reason}", reason);
          await api.sendMessage(kickMessage, uid);
        }
        return true;
      } catch (e) {
        return false;
      }
    }

    if (!args[0]) {
      if (!event.messageReply)
        return message.SyntaxError();
      const success = await kickMember(event.messageReply.senderID, args[1]);
      if (success) {
        return message.reply(getLang("kicked"));
      } else {
        return message.reply(getLang("kickError"));
      }
    } else {
      const uids = Object.keys(event.mentions);
      if (uids.length === 0)
        return message.SyntaxError();
      const reason = args.slice(1).join(" ");
      if (!reason)
        return message.reply(getLang("missingReason"));
      let successCount = 0;
      let errorCount = 0;
      for (const uid of uids) {
        const success = await kickMember(uid, reason);
        if (success) {
          successCount++;
        } else {
          errorCount++;
        }
      }
      if (errorCount === 0) {
        return message.reply(getLang("kickSuccess"));
      } else {
        return message.reply(`Some members could not be kicked. ${errorCount} errors occurred.`);
      }
    }
  }
};
