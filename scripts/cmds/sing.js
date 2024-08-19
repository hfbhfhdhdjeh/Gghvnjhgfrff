const axios = require('axios');

module.exports = {
    config: {
        name: "sing",
        version: "4.6",
        author: "ArYAN",
        shortDescription: { 
            en: 'Search and download mp3 songs' 
        },
        longDescription: { 
            en: "Search for video and download the first result or select a specific track." 
        },
        category: "music",
        guide: { 
            en: '{p}s <song name> - Search for a video\n' +
                'Example:\n' +
                '  {p}s Blinding Lights\n' +
                'After receiving the search results, reply with the song ID to download the track.\n' +
                'Reply with "1 to 9" to download the first track in the list.'
        }
    },

    onStart: async function ({ api, event, args }) {
        const searchQuery = encodeURIComponent(args.join(" "));
        const apiUrl = `https://c-v2.onrender.com/yt/s?query=${searchQuery}`;
        
        if (!searchQuery) {
            return api.sendMessage("Please provide the song title.", event.threadID, event.messageID);
        }

        try {
            api.sendMessage(`Searching for your song request "${searchQuery}", Please wait...`, event.threadID, event.messageID);
            const response = await axios.get(apiUrl);
            const tracks = response.data;

            if (tracks.length > 0) {
                const topTracks = tracks.slice(0, 9);
                let message = "🎶 𝗬𝗼𝘂𝗧𝘂𝗯𝗲\n\n━━━━━━━━━━━━━\n🎶 | Here are the top 9 tracks\n\n";
                const attachments = await Promise.all(topTracks.map(async (track) => {
                    return await global.utils.getStreamFromURL(track.thumbnail);
                }));

                topTracks.forEach((track, index) => {
                    message += `🆔 𝗜𝗗: ${index + 1}\n`;
                    message += `📝 𝗧𝗶𝘁𝗹𝗲: ${track.title}\n`;
                    message += `📅 𝗥𝗲𝗹𝗲𝗮𝘀𝗲 𝗗𝗮𝘁𝗲: ${track.publishDate}\n`;
                    message += "━━━━━━━━━━━━━\n"; // Separator between tracks
                });

                message += "\nReply with the number of the song ID you want to download.";
                api.sendMessage({
                    body: message,
                    attachment: attachments
                }, event.threadID, (err, info) => {
                    if (err) {
                        console.error(err);
                        api.sendMessage("🚧 | An error occurred while sending message.", event.threadID);
                        return;
                    }
                    global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name, messageID: info.messageID, author: event.senderID, tracks: topTracks });
                });
            } else {
                api.sendMessage("❓ | Sorry, couldn't find the requested video.", event.threadID);
            }
        } catch (error) {
            console.error(error);
            api.sendMessage("🚧 | An error occurred while processing your request.", event.threadID, event.messageID);
        }
    },

    onReply: async function ({ api, event, Reply, args }) {
        const reply = parseInt(args[0]);
        const { author, tracks } = Reply;

        if (event.senderID !== author) return;

        try {
            if (isNaN(reply) || reply < 1 || reply > tracks.length) {
                throw new Error("Invalid selection. Please reply with a number corresponding to the track.");
            }

            const selectedTrack = tracks[reply - 1];
            const videoUrl = selectedTrack.videoUrl;
            const downloadApiUrl = `https://c-v2.onrender.com/yt/mp3?url=${encodeURIComponent(videoUrl)}`;

            api.sendMessage("⏳ | Downloading your song, please wait...", event.threadID, async (err, info) => {
                if (err) {
                    console.error(err);
                    api.sendMessage("🚧 | An error occurred while sending message.", event.threadID);
                    return;
                }

                try {
                    const response = await axios({
                        url: downloadApiUrl,
                        method: 'GET',
                        responseType: 'stream'
                    });

                    api.sendMessage({
                        body: `🎧| 𝗬𝗼𝘂𝗧𝘂𝗯𝗲\n\n━━━━━━━━━━━━━\nHere's your video ${selectedTrack.title}.\n\n📒 𝗧𝗶𝘁𝗹𝗲: ${selectedTrack.title}\n📅 𝗣𝘂𝗯𝗹𝗶𝘀𝗵 𝗗𝗮𝘁𝗲: ${selectedTrack.publishDate}\n👀 𝗩𝗶𝗲𝘄𝘀: ${selectedTrack.viewCount}\n👍 𝗟𝗶𝗸𝗲𝘀: ${selectedTrack.likeCount}\n\nEnjoy watching!...🥰`,
                        attachment: response.data
                    }, event.threadID);
                } catch (error) {
                    console.error(error);
                    api.sendMessage(`🚧 | An error occurred while processing your request: ${error.message}`, event.threadID);
                }
            });

        } catch (error) {
            console.error(error);
            api.sendMessage(`🚧 | An error occurred while processing your request: ${error.message}`, event.threadID);
        }

        api.unsendMessage(Reply.messageID);
        global.GoatBot.onReply.delete(Reply.messageID);
    }
};
