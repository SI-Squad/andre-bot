// You're going to need to do the following things
// npm install node
// npm install discord.js
// npm i @discordjs/opus
// also going to need this "npm install --save collections"
// Bot needs top three permissions of second section for the voice channel (speak, connect, and the other thing)

var {transChannelList, transDMList} = require("./state.js")
var ConvertTo1ChannelStream = require("./stream_util.js");
var {addToTransList, removeFromTransList, displayTransLists} = require("./list_util.js")

const dotenv = require('dotenv');
dotenv.config();
const Discord = require('discord.js')
const config = require('./config')
const discordClient = new Discord.Client()

discordClient.on('ready', () => {
  console.log(`Logged in as ${discordClient.user.tag}!`)
})
discordClient.login(config.discordApiToken)
const googleSpeech = require('@google-cloud/speech')
const googleSpeechClient = new googleSpeech.SpeechClient()

const PREFIX = "&"
const helpEmbed = new Discord.MessageEmbed()
	.setColor('#92DCE5')
	.setTitle('Andre Commands')
	.addField('&help', 'Displays all of the commands needed to operate Andre.', false)
	.addField('&add < @Member | #TextChannel >', 'Add a single user or text channel to the lists of locations receiving the transcription. Users will receive the transcriptions via DMs. You can only add yourself to the user list.', false)
	.addField('&remove < @Member | #TextChannel >', 'Remove a single user or text channel from the lists of locations receiving the transcription. You can only remove yourself from the user list.', false)
	.addField('&display', 'Displays the two lists, one containing all the users receiving the transcription via DMs, and another with all of the text channels.', false)
	.addField('&listen', 'Calls Andre to the voice channel you are currently in.', false)


discordClient.on('message', async msg => {

  	let args = msg.content.substring(PREFIX.length).split(" ");

	switch(args[0]){
		case 'help':
			msg.channel.send(helpEmbed)
			break;
		
		case 'add':
			console.log(args)
			addToTransList(args, msg)
			break;

		case 'remove':
			removeFromTransList(args, msg)
			break;

		case 'display':
			displayTransLists(msg)
			break;
			
		case 'listen':
			
			const memberVoiceChannel = msg.member.voice.channel

			if (memberVoiceChannel == null) {
				msg.reply("you need to be in a voice channel for me to help you!")
				return
			}

			msg.reply('I\'m omw')

			const connection = await memberVoiceChannel.join()
			const receiver = connection.receiver

			connection.on('speaking', (user, speaking) => {

				console.log("--\n\n" + transChannelList + "\n\n--")

				if (!speaking) {
				return
				}

				console.log(`I'm listening to ${user.username}`)
				const audioStream = receiver.createStream(user, { mode: 'pcm' })
				const requestConfig = {
				encoding: 'LINEAR16',
				sampleRateHertz: 48000,
				languageCode: 'en-US'
				}

				const request = {
				config: requestConfig
				}
				const recognizeStream = googleSpeechClient
				.streamingRecognize(request)
				.on('error', console.error)
				.on('data', response => {

					const transcription = response.results
					.map(result => result.alternatives[0].transcript)
					.join('\n')
					.toLowerCase()
					console.log(`Transcription: ${transcription}`)
					
					if(transChannelList.length > 0){
						for(index=0; index<transChannelList.length; index++){
							chan = msg.guild.channels.get(transChannelList[index])
							chan.send(`${user.username}: ${transcription}`)
						}
					}
					if(transDMList.length > 0){
						for(i=0; i<transDMList.length; i++){
							mem = msg.guild.members.fetch(transDMList[i])
							mem.then(function(member){member.send(`${user.username}: ${transcription}`)})
						}
					}

				})

				const convertTo1ChannelStream = new ConvertTo1ChannelStream()
				audioStream.pipe(convertTo1ChannelStream).pipe(recognizeStream)
				audioStream.on('end', async () => {
				console.log('audioStream end')
				})
			})

			break;
	}
  	
})