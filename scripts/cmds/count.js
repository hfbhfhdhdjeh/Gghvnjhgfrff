module.exports = {
  config: {
    name: "count",
    version: "3.0",
    author: "NTKhang | ArYAN",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "View group messages"
    },
    longDescription: {
      en: "View the number of messages of all members or yourself (since the bot joined the group)"
    },
    category: "boxchat",
    guide: {
      en: "   {pn}: used to view the number of messages of you"
        + "\n   {pn} @tag: used to view the number of messages of those tagged"
        + "\n   {pn} all: used to view the number of messages of all members"
    }
  },

  langs: {
    en: {
      count: "ℹ 𝗚𝗿𝗼𝘂𝗽 𝗗𝗮𝘁𝗮\n\n➤ Number of messages of members:",
      endMessage: "➤ Those who do not have a name in the list have not sent any messages.",
      page: "➤ Page [%1/%2]",
      reply: "➤ Reply to this message with the page number to view more",
      result: "➤ %1 rank %2 with %3 messages",
      yourResult: "❇ 𝗥𝗮𝗻𝗸 𝗗𝗲𝘁𝗮𝗶𝗹𝘀\n✤━━━━━━━━━━━━━✤\n🔍 𝗥𝗮𝗻𝗸\n➤ ❍ %1 \n✨ 𝗠𝘀𝗴 𝗖𝗼𝘂𝗻𝘁\n➤ ❍ %2\n➤ Your messages in this group,You have send\n✤━━━━━━━━━━━━━✤",
      invalidPage: "❌ Invalid page number"
    }
  },

  onStart: async function ({ args, threadsData, userData, message, event, api, commandName, getLang }) {
    const { threadID, senderID } = event;
    const threadData = await threadsData.get(threadID);
    const { members } = threadData;
    const usersInGroup = (await api.getThreadInfo(threadID)).participantIDs;
    let arraySort = [];
    for (const user of members) {
      if (!usersInGroup.includes(user.userID))
        continue;
      const charac = "";
      arraySort.push({
        name: user.name.includes(charac) ? `✤━━━━━━━━━━━━━✤\n🆔 𝗨𝗜𝗗\n➤ ${user.uid}\n✤━━━━━━━━━━━━━✤` : user.name,
        count: user.count,
        uid: user.userID
      });
    }
    let stt = 1;
    arraySort.sort((a, b) => b.count - a.count);
    arraySort.map(item => item.stt = stt++);

    if (args[0]) {
      if (args[0].toLowerCase() == "all") {
        let msg = getLang("count");
        const endMessage = getLang("endMessage");
        for (const item of arraySort) {
          if (item.count > 0)
            msg += `\n✤━━━━━[  ${item.stt}  ]━━━━━✤\nℹ 𝗡𝗮𝗺𝗲\n➤ ${item.name}\n📝 𝗠𝘀𝗴 𝗖𝗼𝘂𝗻𝘁\n➤ ${item.count}\n🆔 𝗜𝗗\n➤ ${item.uid}\n✤━━━━━━━━━━━━━✤\n`;
        }

        if ((msg + endMessage).length > 19999) {
          msg = "";
          let page = parseInt(args[1]);
          if (isNaN(page))
            page = 1;
          const splitPage = global.utils.splitPage(arraySort, 50);
          arraySort = splitPage.allPage[page - 1];
          for (const item of arraySort) {
            if (item.count > 0)
              msg += `\n✤━━━━━[  ${item.stt}  ]━━━━━✤\nℹ 𝗡𝗮𝗺𝗲\n➤ ${item.name}\n📝 𝗠𝘀𝗴 𝗖𝗼𝘂𝗻𝘁${item.count}\n🆔 𝗜𝗗\n ➤ ${item.uid}\n✤━━━━━━━━━━━━━✤\n`;
          }
          msg += getLang("page", page, splitPage.totalPage)
            + `\n${getLang("reply")}`
            + `\n\n${endMessage}`;

          return message.reply(msg, (err, info) => {
            if (err)
              return message.err(err);
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              splitPage,
              author: senderID
            });
          });
        }
        message.reply(msg);
      }
      else if (event.mentions) {
        let msg = "";
        for (const id in event.mentions) {
          const findUser = arraySort.find(item => item.uid == id);
          msg += `\n✤━━━━━[  ${findUser.stt}  ]━━━━━✤\nℹ 𝗡𝗮𝗺𝗲\n➤ ${findUser.name}\n📝 𝗠𝘀𝗴 𝗖𝗼𝘂𝗻𝘁\n➤ ${findUser.count}\n🆔 𝗜𝗗\n➤ ${findUser.uid}\n✤━━━━━━━━━━━━━✤\n`;
        }
        message.reply(msg);
      }
    }
    else {
      const findUser = arraySort.find(item => item.uid == senderID);
      return message.reply(getLang("yourResult", findUser.stt, findUser.count));
    }
  },

  onReply: ({ message, event, Reply, commandName, getLang }) => {
    const { senderID, body } = event;
    const { author, splitPage } = Reply;
    if (author != senderID)
      return;
    const page = parseInt(body);
    if (isNaN(page) || page < 1 || page > splitPage.totalPage)
      return message.reply(getLang("invalidPage"));
    let msg = getLang("count");
    const endMessage = getLang("endMessage");
    const arraySort = splitPage.allPage[page - 1];
    for (const item of arraySort) {
      if (item.count > 0)
        msg += `\n✤━━━━━[  ${item.stt}  ]━━━━━✤\nℹ 𝗡𝗮𝗺𝗲\n➤ ${item.name}\n📝 𝗠𝘀𝗴 𝗖𝗼𝘂𝗻𝘁\n➤ ${item.count}\n🆔 𝗜𝗗\n➤ ${item.uid}\n✤━━━━━━━━━━━━━✤\n`;
    }
    msg += getLang("page", page, splitPage.totalPage)
      + "\n" + getLang("reply")
      + "\n\n" + endMessage;
    message.reply(msg, (err, info) => {
      if (err)
        return message.err(err);
      message.unsend(Reply.messageID);
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        messageID: info.messageID,
        splitPage,
        author: senderID
      });
    });
  },

  onChat: async ({ usersData, threadsData, event }) => {
    const { senderID, threadID } = event;
    const members = await threadsData.get(threadID, "members");
    const findMember = members.find(user => user.userID == senderID);
    if (!findMember) {
      members.push({
        userID: senderID,
        name: await usersData.getName(senderID),
        nickname: null,
        inGroup: true,
        count: 1
      });
    }
    else
      findMember.count += 1;
    await threadsData.set(threadID, members, "members");
  }

};
