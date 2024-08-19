const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", 'png', "animated_image", "video", "audio"];

module.exports = {
  config: {
    name: "report",
    aliases: [`callad`],
    version: "1.0",
    author: "NTKhang & ArYAN",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "send message to 👑 𝗤𝘂𝗲𝗲𝗻 𝖱𝗂𝗒𝖺 🥀🦋 owners."
    },
    longDescription: {
      en: "send report, feedback, bug, to 👑 𝗤𝘂𝗲𝗲𝗻 𝖱𝗂𝗒𝖺 🥀🦋 owners."
    },
    category: "boxchat",
    guide: {
      en: "   {pn} <message>"
    }
  },

  langs: {
    en: {
      missingMessage: "⛔ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗜𝗻𝗽𝘂𝘁\n✤━━━━━━━━━━━━━✤\n➤ Please enter the message you want to send to Cassidy admins (◍•ᴗ•◍)\n✤━━━━━━━━━━━━━✤\n",
      sendByGroup: "\n\n\n✨ 𝗙𝗲𝗲𝗱𝗯𝗮𝗰𝗸 𝗳𝗿𝗼𝗺 𝗚𝗿𝗼𝘂𝗽\n\nℹ 𝗚𝗿𝗼𝘂𝗽𝗡𝗮𝗺𝗲\n➤ %1\n🆔 𝗚𝗿𝗼𝘂𝗽𝗜𝗗\n➤ %2",
      sendByUser: "\n\n🌴 𝗙𝗲𝗲𝗱𝗯𝗮𝗰𝗸 𝗳𝗿𝗼𝗺 𝗨𝘀𝗲𝗿",
      content: "\n\n✅ 𝗠𝗲𝘀𝘀𝗮𝗴𝗲\n✤━━━━━━━━━━━━━✤\n➤ %1\n✤━━━━━━━━━━━━━✤\n➤Reply this message to send message to user (◕ᴗ◕✿)\n",
      success: "✅ 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆 𝗦𝗲𝗻𝗱\n✤━━━━━━━━━━━━━✤\nSent your message\n\nℹ 𝗔𝗱𝗺𝗶𝗻 𝗟𝗶𝘀𝘁\n➤ %1 \n➤ Send message to 👑 𝗤𝘂𝗲𝗲𝗻 𝖱𝗂𝗒𝖺 🥀🦋 admin successfully!\n%2\n➤ Please wait for admin response.\n✤━━━━━━━━━━━━━✤",
      failed: "⛔ 𝗘𝗿𝗿𝗼𝗿\n┏━━━━━━━━━━━━❀\n➤ An error occurred while sending your message to\n%1 \nℹ 𝗔𝗱𝗺𝗶𝗻 𝗟𝗶𝘀𝘁\n%2\n➤ Check console for more details\n┗━━━━━━━━━━━━❀",
      reply: "\n\n👑 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲 𝗳𝗿𝗼𝗺 𝗔𝗱𝗺𝗶𝗻\n\n✅ 𝗠𝗲𝘀𝘀𝗮𝗴𝗲\n✤━━━━━━━━━━━━━✤\n ➤ %2\n✤━━━━━━━━━━━━━✤\n➤ Reply this message to continue send message to admin",
      replySuccess: "📝 𝗗𝗼𝗻𝗲\n\n✤━━━━━━━━━━━━━✤\n➤ Sent your reply to admin successfully!\nPlease wait for admin response \n✤━━━━━━━━━━━━━✤",
      feedback: "\n\n✨ 𝗙𝗲𝗲𝗱𝗯𝗮𝗰𝗸 𝗳𝗿𝗼𝗺 𝗨𝘀𝗲𝗿\n\n✅ 𝗠𝗲𝘀𝘀𝗮𝗴𝗲\n✤━━━━━━━━━━━━━✤\n➤ %4\n✤━━━━━━━━━━━━━✤\n➤ Reply this message to send message to user",
      replyUserSuccess: "✅ 𝗗𝗼𝗻𝗲\n✤━━━━━━━━━━━━━✤\n➤ 🟡 Sent your reply to user successfully! (✿^‿^)\n✤━━━━━━━━━━━━━✤",
      noAdmin: "⛔ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲\n\n✤━━━━━━━━━━━━━✤\n👑 𝗤𝘂𝗲𝗲𝗻 𝖱𝗂𝗒𝖺 🥀🦋 has no admin at the moment. (◕ᴗ◕✿)\n✤━━━━━━━━━━━━━✤"
    }
  },

  onStart: async function ({ args, message, event, usersData, threadsData, api, commandName, getLang }) {
    const { config } = global.GoatBot;
    if (!args[0])
      return message.reply(getLang("missingMessage"));
    const { senderID, threadID, isGroup } = event;
    if (config.adminBot.length == 0)
      return message.reply(getLang("noAdmin"));
    const senderName = await usersData.getName(senderID);
    const msg = "📢 𝗠𝗲𝘀𝘀𝗮𝗴𝗲\n━━━━━━━━━━━━━━━"
      + `\nℹ 𝗨𝘀𝗲𝗿𝗡𝗮𝗺𝗲\n➤ ${senderName}`
      + `\n🆔 𝗨𝘀𝗲𝗿𝗜𝗗\n➤ ${senderID}`
      + (isGroup ? getLang("sendByGroup", (await threadsData.get(threadID)).threadName, threadID) : getLang("sendByUser"));

    const formMessage = {
      body: msg + getLang("content", args.join(" ")),
      mentions: [{
        id: senderID,
        tag: senderName
      }],
      attachment: await getStreamsFromAttachment(
        [...event.attachments, ...(event.messageReply?.attachments || [])]
          .filter(item => mediaTypes.includes(item.type))
      )
    };

    const successIDs = [];
    const failedIDs = [];
    const adminNames = await Promise.all(config.adminBot.map(async item => ({
      id: item,
      name: await usersData.getName(item)
    })));

    for (const uid of config.adminBot) {
      try {
        const messageSend = await api.sendMessage(formMessage, uid);
        successIDs.push(uid);
        global.GoatBot.onReply.set(messageSend.messageID, {
          commandName,
          messageID: messageSend.messageID,
          threadID,
          messageIDSender: event.messageID,
          type: "userCallAdmin"
        });
      }
      catch (err) {
        failedIDs.push({
          adminID: uid,
          error: err
        });
      }
    }

    let msg2 = "";
    if (successIDs.length > 0)
      msg2 += getLang("success", successIDs.length,
        adminNames.filter(item => successIDs.includes(item.id)).map(item => ` <@${item.id}> (${item.name})`).join("\n")
      );
    if (failedIDs.length > 0) {
      msg2 += getLang("failed", failedIDs.length,
        failedIDs.map(item => ` <@${item.adminID}> (${adminNames.find(item2 => item2.id == item.adminID)?.name || item.adminID})`).join("\n")
      );
      log.err("CALL ADMIN", failedIDs);
    }
    return message.reply({
      body: msg2,
      mentions: adminNames.map(item => ({
        id: item.id,
        tag: item.name
      }))
    });
  },

  onReply: async ({ args, event, api, message, Reply, usersData, commandName, getLang }) => {
    const { type, threadID, messageIDSender } = Reply;
    const senderName = await usersData.getName(event.senderID);
    const { isGroup } = event;

    switch (type) {
      case "userCallAdmin": {
        const formMessage = {
          body: getLang("reply", senderName, args.join(" ")),
          mentions: [{
            id: event.senderID,
            tag: senderName
          }],
          attachment: await getStreamsFromAttachment(
            event.attachments.filter(item => mediaTypes.includes(item.type))
          )
        };

        api.sendMessage(formMessage, threadID, (err, info) => {
          if (err)
            return message.err(err);
          message.reply(getLang("replyUserSuccess"));
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            messageIDSender: event.messageID,
            threadID: event.threadID,
            type: "adminReply"
          });
        }, messageIDSender);
        break;
      }
      case "adminReply": {
        let sendByGroup = "";
        if (isGroup) {
          const { threadName } = await api.getThreadInfo(event.threadID);
          sendByGroup = getLang("sendByGroup", threadName, event.threadID);
        }
        const formMessage = {
          body: getLang("feedback", senderName, event.senderID, sendByGroup, args.join(" ")),
          mentions: [{
            id: event.senderID,
            tag: senderName
          }],
          attachment: await getStreamsFromAttachment(
            event.attachments.filter(item => mediaTypes.includes(item.type))
          )
        };

        api.sendMessage(formMessage, threadID, (err, info) => {
          if (err)
            return message.err(err);
          message.reply(getLang("replySuccess"));
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            messageIDSender: event.messageID,
            threadID: event.threadID,
            type: "userCallAdmin"
          });
        }, messageIDSender);
        break;
      }
      default: {
        break;
      }
    }
  }
};
