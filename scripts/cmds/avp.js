module.exports.config = {
  name: "approvelist",
  aliases: ["apvlist", "apv"],
  version: "1.5",
  author: "Dipto",
  role: 1,
  category: "box chat",
  description: { 
    en: "Accept approve ids"
  },
  countDown: 2,
  guide: {
    en: "{pn}"
  }
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
  try {
    const info = await api.getThreadInfo(event.threadID);
    const app = info.approvalQueue;
    const inid = app.map(bal => bal.inviterID);
    const reqid = app.map(bal => bal.requesterID);
    const outarray = await Promise.all(inid.map(async (member, index) => {
      const inviterName = (await api.getUserInfo(member))[member].name;
      const requesterName = (await api.getUserInfo(reqid[index]))[reqid[index]].name;
      return {
        inviterID: member,
        inviterName: inviterName,
        requesterID: reqid[index],
        requesterName: requesterName
      };
    }));
    if (!info.approvalMode) {
      return api.sendMessage("🤣😂 idiot first on approval", event.threadID, event.messageID);
    }
    let groups = `╭─✦ approve list ✦─╮\n`;
    outarray.forEach((entry, index) => {
      groups += `├‣ ${index + 1}. Inviter: ${entry.inviterName}\n├‣ID: ${entry.inviterID}\n`;
      groups += `├‣Requester: ${entry.requesterName}\n├‣ID: ${entry.requesterID}\n`;
    });
    groups += `╰───────────────────⧕\nReply to this message with the number of the ID you want to accept.`;

    api.sendMessage(groups, event.threadID, (error, info) => {  global.GoatBot.onReply.set(info.messageID, {
        commandName:this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        outarray
      });
    }, event.messageID);

  } catch (error) {
    api.sendMessage(error.message, event.threadID, event.messageID);
  }
};

module.exports.onReply = async ({ api, event, Reply, usersData }) => {
  try {
    const { author, messageID, outarray } = Reply;
    if (event.senderID != author) return;
    const choice = parseInt(event.body);
    if (isNaN(choice) || choice < 1 || choice > outarray.length) {
      return api.sendMessage("Invalid choice. Please try again.", event.threadID, event.messageID);
    }

    const selectedID = outarray[choice - 1].requesterID;
    await api.addUserToGroup(selectedID, event.threadID);
    const senderName = await usersData.getName(event.senderID);
    api.editMessage(`✅ | User ${selectedID} approved successfully by ${senderName}`, messageID);
    global.GoatBot.onReply.delete(messageID);
  } catch (error) {
    api.editMessage(`Sorry, ${error.message}`, messageID);
  }
};
