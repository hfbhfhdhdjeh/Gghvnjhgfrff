const axios = require("axios");
const ytdl = require("@distube/ytdl-core");
const fs = require("fs-extra");
const { getStreamFromURL, downloadFile, formatNumber } = global.utils;
const agent = ytdl.createAgent(
	JSON.parse(fs.readFileSync(process.cwd() + "/ytdl.json"))
);
async function getStreamAndSize(url, path = "") {
	const response = await axios({
		method: "GET",
		url,
		responseType: "stream",
		headers: {
			Range: "bytes=0-",
		},
	});
	if (path) response.data.path = path;
	const totalLength = response.headers["content-length"];
	return {
		stream: response.data,
		size: totalLength,
	};
}

module.exports = {
	config: {
		name: "ytb",
		version: "1.17",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: {
			vi: "Tải video, audio hoặc xem thông tin video trên YouTube",
			en: "Download video, audio or view video information on YouTube",
		},
		category: "media",
		guide: {
			vi:
				"   {pn} [video|-v] [<tên video>|<link video>]: dùng để tải video từ youtube." +
				"\n   {pn} [audio|-a] [<tên video>|<link video>]: dùng để tải audio từ youtube" +
				"\n   {pn} [info|-i] [<tên video>|<link video>]: dùng để xem thông tin video từ youtube" +
				"\n   Ví dụ:" +
				"\n    {pn} -v Fallen Kingdom" +
				"\n    {pn} -a Fallen Kingdom" +
				"\n    {pn} -i Fallen Kingdom",
			en:
				"   {pn} [video|-v] [<video name>|<video link>]: use to download video from youtube." +
				"\n   {pn} [audio|-a] [<video name>|<video link>]: use to download audio from youtube" +
				"\n   {pn} [info|-i] [<video name>|<video link>]: use to view video information from youtube" +
				"\n   Example:" +
				"\n    {pn} -v Fallen Kingdom" +
				"\n    {pn} -a Fallen Kingdom" +
				"\n    {pn} -i Fallen Kingdom",
		},
	},

	langs: {
		vi: {
			error: "❌ Đã xảy ra lỗi: %1",
			noResult: "⭕ Không có kết quả tìm kiếm nào phù hợp với từ khóa %1",
			choose: "%1Reply tin nhắn với số để chọn hoặc nội dung bất kì để gỡ",
			video: "video",
			audio: "âm thanh",
			downloading: '⬇ Đang tải xuống %1 "%2"',
			downloading2:
				'⬇ Đang tải xuống %1 "%2"\n🔃 Tốc độ: %3MB/s\n⏸ Đã tải: %4/%5MB (%6%)\n⏳ Ước tính thời gian còn lại: %7 giây',
			noVideo:
				"⭕ Rất tiếc, không tìm thấy video nào có dung lượng nhỏ hơn 83MB",
			noAudio:
				"⭕ Rất tiếc, không tìm thấy audio nào có dung lượng nhỏ hơn 26MB",
			info: "💠 Tiêu đề: %1\n🏪 Channel: %2\n👨‍👩‍👧‍👦 Subscriber: %3\n⏱ Thời gian video: %4\n👀 Lượt xem: %5\n👍 Lượt thích: %6\n🆙 Ngày tải lên: %7\n🔠 ID: %8\n🔗 Link: %9",
			listChapter: "\n📖 Danh sách phân đoạn: %1\n",
		},
		en: {
			error: "❌ An error occurred: %1",
			noResult: "⭕ No search results match the keyword %1",
			choose:
				"%1Reply to the message with a number to choose or any content to cancel",
			video: "video",
			audio: "audio",
			downloading: '⬇ Downloading %1 "%2"',
			downloading2:
				'⬇ Downloading %1 "%2"\n🔃 Speed: %3MB/s\n⏸ Downloaded: %4/%5MB (%6%)\n⏳ Estimated time remaining: %7 seconds',
			noVideo: "⭕ Sorry, no video was found with a size less than 83MB",
			noAudio: "⭕ Sorry, no audio was found with a size less than 26MB",
			info: "💠 Title: %1\n🏪 Channel: %2\n👨‍👩‍👧‍👦 Subscriber: %3\n⏱ Video duration: %4\n👀 View count: %5\n👍 Like count: %6\n🆙 Upload date: %7\n🔠 ID: %8\n🔗 Link: %9",
			listChapter: "\n📖 List chapter: %1\n",
		},
	},

	onStart: async function ({ args, message, event, commandName, getLang }) {
		let type;
		switch (args[0]) {
			case "-v":
			case "video":
				type = "video";
				break;
			case "-a":
			case "-s":
			case "audio":
			case "sing":
				type = "audio";
				break;
			case "-i":
			case "info":
				type = "info";
				break;
			default:
				return message.SyntaxError();
		}

		const checkurl =
			/^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
		const urlYtb = checkurl.test(args[1]);

		if (urlYtb) {
			const infoVideo = await getVideoInfo(args[1]);
			handle({ type, infoVideo, message, downloadFile, getLang });
			return;
		}

		let keyWord = args.slice(1).join(" ");
		keyWord = keyWord.includes("?feature=share")
			? keyWord.replace("?feature=share", "")
			: keyWord;
		const maxResults = 6;

		let result;
		try {
			result = (await search(keyWord)).slice(0, maxResults);
		} catch (err) {
			return message.reply(getLang("error", err.message));
		}
		if (result.length == 0) return message.reply(getLang("noResult", keyWord));
		let msg = "";
		let i = 1;
		const thumbnails = [];
		const arrayID = [];

		for (const info of result) {
			thumbnails.push(getStreamFromURL(info.thumbnail));
			msg += `${i++}. ${info.title}\nTime: ${info.time}\nChannel: ${info.channel.name
				}\n\n`;
		}

		message.reply(
			{
				body: getLang("choose", msg),
				attachment: await Promise.all(thumbnails),
			},
			(err, info) => {
				global.GoatBot.onReply.set(info.messageID, {
					commandName,
					messageID: info.messageID,
					author: event.senderID,
					arrayID,
					result,
					type,
				});
			}
		);
	},

	onReply: async ({ event, api, Reply, message, getLang }) => {
		const { result, type } = Reply;
		const choice = event.body;
		if (!isNaN(choice) && choice <= 6) {
			const infoChoice = result[choice - 1];
			api.unsendMessage(Reply.messageID);
			await handle({ type, infoChoice, api, message, getLang });
		} else api.unsendMessage(Reply.messageID);
	},
};

async function handle({ type, infoChoice, api, message, getLang }) {
	const { title, id } = infoChoice;
	const videoId = id; // just being lazy

	if (type == "video") {
		const MAX_SIZE = 83 * 1024 * 1024; // 83MB (max size of video that can be sent on fb)
		const msgSend = message.reply(
			getLang("downloading", getLang("video"), title)
		);

		const { formats } = await ytdl.getInfo(videoId, { agent });
		const getFormat = formats
			.filter((f) => f.hasVideo && f.hasAudio)
			.sort((a, b) => b.contentLength - a.contentLength)
			.find((f) => f.contentLength || 0 < MAX_SIZE);

		if (!getFormat) return message.reply(getLang("noVideo"));
		const getStream = await getStreamAndSize(getFormat.url, `${videoId}.mp4`);

		if (getStream.size > MAX_SIZE) return message.reply(getLang("noVideo"));

		const savePath = __dirname + `/tmp/${videoId}_${Date.now()}.mp4`;
		const writeStrean = fs.createWriteStream(savePath);
		const startTime = Date.now();
		getStream.stream.pipe(writeStrean);
		const contentLength = getStream.size;
		let downloaded = 0;
		let count = 0;

		getStream.stream.on("data", async (chunk) => {
			try {
				downloaded += chunk.length;
				count++;
				if (count == 5) {
					const endTime = Date.now();
					const speed = (downloaded / (endTime - startTime)) * 1000;
					const timeLeft =
						((contentLength / downloaded) * (endTime - startTime)) / 1000;
					const percent = (downloaded / contentLength) * 100;

					if (timeLeft > 30) {
						// if time left > 30s, send message
						await api.editMessage(
							getLang(
								"downloading2",
								getLang("video"),
								title,
								(Math.floor(speed / 1000) / 1000).toFixed(3),
								(Math.floor(downloaded / 1000) / 1000).toFixed(3),
								(Math.floor(contentLength / 1000) / 1000).toFixed(3),
								Math.floor(percent),
								timeLeft.toFixed(2)
							),
							msgSend.messageID
						);
					}
				}
			} catch (error) {
				console.error("Error in data event handler:", error);
			}
		});

		writeStrean.on("finish", () => {
			message.reply(
				{
					body: title,
					attachment: fs.createReadStream(savePath),
				},
				async (err) => {
					if (err) return message.reply(getLang("error", err.message));
					fs.unlinkSync(savePath);
					message.unsend((await msgSend).messageID);
				}
			);
		});
	} else if (type == "audio") {
		const MAX_SIZE = 27262976; // 26MB (max size of audio that can be sent on fb)
		const msgSend = message.reply(
			getLang("downloading", getLang("audio"), title)
		);

		const { formats } = await ytdl.getInfo(videoId, { agent });
		const getFormat = formats
			.filter((f) => f.hasAudio && !f.hasVideo)
			.sort((a, b) => b.contentLength - a.contentLength)
			.find((f) => f.contentLength || 0 < MAX_SIZE);
		if (!getFormat) return message.reply(getLang("noAudio"));
		const getStream = await getStreamAndSize(getFormat.url, `${videoId}.mp3`);
		if (getStream.size > MAX_SIZE) return message.reply(getLang("noAudio"));

		const savePath = __dirname + `/tmp/${videoId}_${Date.now()}.mp3`;
		const writeStrean = fs.createWriteStream(savePath);
		const startTime = Date.now();
		getStream.stream.pipe(writeStrean);
		const contentLength = getStream.size;
		let downloaded = 0;
		let count = 0;

		getStream.stream.on("data", async (chunk) => {
			try {
				downloaded += chunk.length;
				count++;
				if (count === 5) {
					const endTime = Date.now();
					const speed = (downloaded / (endTime - startTime)) * 1000;
					const timeLeft =
						((contentLength / downloaded) * (endTime - startTime)) / 1000;
					const percent = (downloaded / contentLength) * 100;

					if (timeLeft > 30) {
						// if time left > 30s, send message
						await api.editMessage(
							getLang(
								"downloading2",
								getLang("video"),
								title,
								(Math.floor(speed / 1000) / 1000).toFixed(3),
								(Math.floor(downloaded / 1000) / 1000).toFixed(3),
								(Math.floor(contentLength / 1000) / 1000).toFixed(3),
								Math.floor(percent),
								timeLeft.toFixed(2)
							),
							msgSend.messageID
						);
					}
				}
			} catch (error) {
				console.error("Error in data event handler:", error);
			}
		});

		writeStrean.on("finish", () => {
			message.reply(
				{
					body: title,
					attachment: fs.createReadStream(savePath),
				},
				async (err) => {
					if (err) return message.reply(getLang("error", err.message));
					fs.unlinkSync(savePath);
					message.unsend((await msgSend).messageID);
				}
			);
		});
	} else if (type == "info") {
		const {
			title,
			lengthSeconds,
			viewCount,
			videoId,
			uploadDate,
			likes,
			channel,
			chapters,
		} = infoVideo;

		const hours = Math.floor(lengthSeconds / 3600);
		const minutes = Math.floor((lengthSeconds % 3600) / 60);
		const seconds = Math.floor((lengthSeconds % 3600) % 60);
		const time = `${hours ? hours + ":" : ""}${minutes < 10 ? "0" + minutes : minutes
			}:${seconds < 10 ? "0" + seconds : seconds}`;
		let msg = getLang(
			"info",
			title,
			channel.name,
			formatNumber(channel.subscriberCount || 0),
			time,
			formatNumber(viewCount),
			formatNumber(likes),
			uploadDate,
			videoId,
			`https://youtu.be/${videoId}`
		);
		// if (chapters.length > 0) {
		// 	msg += getLang("listChapter")
		// 		+ chapters.reduce((acc, cur) => {
		// 			const time = convertTime(cur.start_time * 1000, ':', ':', ':').slice(0, -1);
		// 			return acc + ` ${time} => ${cur.title}\n`;
		// 		}, '');
		// }

		message.reply({
			body: msg,
			attachment: await Promise.all([
				getStreamFromURL(
					infoVideo.thumbnails[infoVideo.thumbnails.length - 1].url
				),
				getStreamFromURL(
					infoVideo.channel.thumbnails[infoVideo.channel.thumbnails.length - 1]
						.url
				),
			]),
		});
	}
}

async function search(keyWord) {
	try {
		const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
			keyWord
		)}`;
		const res = await axios.get(url);
		const getJson = JSON.parse(
			res.data.split("ytInitialData = ")[1].split(";</script>")[0]
		);
		const videos =
			getJson.contents.twoColumnSearchResultsRenderer.primaryContents
				.sectionListRenderer.contents[0].itemSectionRenderer.contents;
		const results = [];
		for (const video of videos)
			if (video.videoRenderer?.lengthText?.simpleText)
				// check is video, not playlist or channel or live
				results.push({
					id: video.videoRenderer.videoId,
					title: video.videoRenderer.title.runs[0].text,
					thumbnail: video.videoRenderer.thumbnail.thumbnails.pop().url,
					time: video.videoRenderer.lengthText.simpleText,
					channel: {
						id: video.videoRenderer.ownerText.runs[0].navigationEndpoint
							.browseEndpoint.browseId,
						name: video.videoRenderer.ownerText.runs[0].text,
						thumbnail:
							video.videoRenderer.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails
								.pop()
								.url.replace(/s[0-9]+\-c/g, "-c"),
					},
				});
		return results;
	} catch (e) {
		const error = new Error("Cannot search video");
		error.code = "SEARCH_VIDEO_ERROR";
		throw error;
	}
}

async function getVideoInfo(id) {


	return result;
}

function parseAbbreviatedNumber(string) {
	const match = string
		.replace(",", ".")
		.replace(" ", "")
		.match(/([\d,.]+)([MK]?)/);
	if (match) {
		let [, num, multi] = match;
		num = parseFloat(num);
		return Math.round(
			multi === "M" ? num * 1000000 : multi === "K" ? num * 1000 : num
		);
	}
	return null;
}

const saveFormatsToFile = async (formats, filePath) => {
	try {
		const jsonString = JSON.stringify(formats, null, 2);
		await fs.promises.writeFile(filePath, jsonString);
		console.log("Formats JSON saved successfully!");
	} catch (err) {
		console.error("Error writing formats JSON file:", err);
	}
};
