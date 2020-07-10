// You're going to need to do the following things
// npm install node
// npm install discord.js
// npm i @discordjs/opus
// also going to need this "npm install --save collections"
// Bot needs top three permissions of second section for the voice channel (speak, connect, and the other thing)

var ConvertTo1ChannelStream = require("./stream_util.js");
var {identifyMention, parseID} = require("./mention_util.js");

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

// The channel the bot transcribes to 
var List = require("collections/list");
var transChannelList = List();
var transDMList = List();
var transChannelListDisplay = List()
var transDMListDisplay = List()


const PREFIX = "&"
const ADD_ERROR_1 = " the channel you are trying to add is already on the list of channels receiving the transcription."
const ADD_OR_REMOVE_ERROR_2 = " you can only add/remove yourself to the list of users receiving the transcription."
const REMOVE_ERROR_1 = " the channel you are trying to remove from the list of channels receiving the transcription, is already not on the list."
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

		console.log(args[1])

		if(args.length == 2){
			switch(identifyMention(args[1], msg)){
				case 'Confirmed text channel':
					channelID = parseID(args[1])
					if(!transChannelList.has(channelID)){
						// Here is where we add to the transChannelList
						msg.channel.send( args[1] + " is now on the list of channels receiving the transcription.")
						transChannelList.unshift(channelID)
						transChannelListDisplay.unshift(args[1])
						console.log("\nChannel List\n" + transChannelList.toArray() + "\n")
					}else{
						// Already on transChannelList
						msg.reply(ADD_ERROR_1)
					}
					break;
				case 'Confirmed nick name':
				case 'Confirmed member name':
					userID = parseID(args[1])
					if(msg.member.id == userID){
						if(!transDMList.has(userID)){
							msg.channel.send( args[1] + " is now on the list of users receiving the transcription via DMs.")
							transDMList.unshift(userID)
							transDMListDisplay.unshift(args[1])
							console.log("\nDM List\n" + transDMList.toArray() + "\n\n")
						}
					}else{
						// User mentioned is not the same as the user mentioning
						msg.reply(ADD_OR_REMOVE_ERROR_2)
					}
					break;
				default:
					msg.reply(identifyMention(args[1], msg))
			}
		}
		break;

    case 'remove':
		console.log(args[1])

		if(args.length == 2){
			switch(identifyMention(args[1], msg)){
				case 'Confirmed text channel':
					channelID = parseID(args[1])
					if(transChannelList.has(channelID)){
						msg.channel.send( args[1] + " has been removed from the list of channels receiving the transcription.")
						transChannelList.delete(channelID)
						transChannelListDisplay.delete(args[1])
						console.log("\nChannel List\n" + transChannelList.toArray() + "\n")
					}else{
						// Not on transChannelList
						msg.reply(REMOVE_ERROR_1)
					}
					break;
				case 'Confirmed nick name':
				case 'Confirmed member name':
					userID = parseID(args[1])
					if(msg.member.id == userID){
						if(transDMList.has(userID)){
							msg.channel.send( args[1] + " has been removed from the list of users receiving the transcription via DMs.")
							transDMList.delete(userID)
							transDMListDisplay.delete(args[1])
							console.log("\nDM List\n" + transDMList.toArray() + "\n\n")
						}
					}else{
						// User mentioned is not the same as the user mentioning
						msg.reply(ADD_OR_REMOVE_ERROR_2)
					}
					break;
				default:
					msg.reply(identifyMention(args[1], msg))
			}
		}
		break;

    case 'display':

		if(transChannelListDisplay.toArray() == '' && transDMList.toArray() == ''){
			const displayEmbed = new Discord.MessageEmbed()
				.setColor('#92DCE5')
				.setTitle('Andre is transcribing for...')
				.addField('Channels', 'No channels have been added' , false)
				.addField('Users via DM', 'No users have been added' , false)

			msg.channel.send(displayEmbed)
		}else if(transChannelListDisplay.toArray() == ''){
			const displayEmbed = new Discord.MessageEmbed()
				.setColor('#92DCE5')
				.setTitle('Andre is transcribing for...')
				.addField('Channels', 'No channels have been added' , false)
				.addField('Users via DM', transDMListDisplay.toArray() , false)

			msg.channel.send(displayEmbed)
		}else if(transDMList.toArray() == ''){
			const displayEmbed = new Discord.MessageEmbed()
				.setColor('#92DCE5')
				.setTitle('Andre is transcribing for...')
				.addField('Channels', transChannelListDisplay.toArray() , false)
				.addField('Users via DM', 'No users have been added' , false)

			msg.channel.send(displayEmbed)
		}else{
			const displayEmbed = new Discord.MessageEmbed()
				.setColor('#92DCE5')
				.setTitle('Andre is transcribing for...')
				.addField('Channels', transChannelListDisplay.toArray() , false)
				.addField('Users via DM', transDMListDisplay.toArray() , false)

			msg.channel.send(displayEmbed)
		}


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
				

				for(index=0; index<transChannelList.toArray().length; index++){
					chan = msg.guild.channels.get(transChannelList.toArray()[index])
					chan.send(`${user.username}: ${transcription}`)
				}

				for(i=0; i<transDMList.toArray().length; i++){
					mem = msg.guild.members.fetch(transDMList.toArray()[i])
					mem.then(function(member){member.send(`${user.username}: ${transcription}`)})
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