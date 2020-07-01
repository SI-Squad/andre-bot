// You're going to need to do the following things
// npm install node
// npm install discord.js
// npm i @discordjs/opus
// also going to need this "npm install --save collections"

var ConvertTo1ChannelStream = require("./stream_util.js");
console.log(ConvertTo1ChannelStream)

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

var transChannel
var dmList

// console.log("\n\n\n 1 \n\n\n")

const PREFIX = "&"
const ADD_ERROR_1 = " the correct notation for &add is as follows: \n&add < @User | #TextChannel >\nMake sure that the name of the user or channel is highlighted."
const ADD_ERROR_2 = " the channel you are trying to &add is not a text channel."
const ADD_ERROR_3 = " you can only add yourself and, permission granted, channels to the transcription lists. This error also occurs when you are already on the list receiving the transcription."

discordClient.on('message', async msg => {

  let args = msg.content.substring(PREFIX.length).split(" ");

  switch(args[0]){
    case 'help':
      msg.reply("This command has not been set up yet! Take it up with that stupid Aaron guy!")
	  break;
	  
    case 'add':
		// channelOrPersonClean = args[1].slice(2, args[1].length-1)
		// console.log(args[1])
		// transChannelList.unshift(args[1].slice(2, args[1].length-1))
		// discordClient.channels.get(transChannelList.toArray()[0]).send("This channel has now been added to the Channel Transcription List. To remove, do &remove <channelName>.")
		
		// console.log(discordClient.channels.get(args[1].substring(2, args[1].length-1)))
		// console.log(discordClient.users.fetch(args[1].substring(3, args[1].length-1)))

		// console.log(args[1])
		// break;

		if(args.length == 2){
			if(args[1].length >= 4){
				if(args[1].substring(0,1) == "<" && args[1].substring(args[1].length-1, args[1].length) == ">"){
					if(args[1].substring(1,2) == "#"){
						channelID = args[1].substring(2, args[1].length-1)
						if(discordClient.channels.get(channelID) != null){
							if(discordClient.channels.get(channelID).type == "text"){
								if(!transChannelList.has(channelID)){
									// Here is where we add to the transChannelList
									msg.channel.send( args[1] + " is now on the list of channels receiving the transcription.")
									transChannelList.unshift(channelID)
									console.log("\nChannel List\n" + transChannelList.toArray() + "\n")

								}else{
									msg.reply(ADD_ERROR_3)
								}
							}else{
								msg.reply(ADD_ERROR_2)
							}
						}else{
							msg.reply(ADD_ERROR_1)
						}
					}else if(args[1].substring(1,2) == "@" && args[1].substring(2,3) == "!"){
						userID = args[1].substring(3, args[1].length-1)
						if(discordClient.users.fetch(userID) != null){
							if(!transDMList.has(userID) && msg.member.id == userID){
								// Here is where we add to the transDMList
								msg.channel.send( args[1] + " is now on the list of users receiving the transcription via DMs.")
								transDMList.unshift(userID)
								console.log("\nDM List\n" + transDMList.toArray() + "\n\n")

							}else{
								msg.reply(ADD_ERROR_3)
							}
						}else{
							msg.reply(ADD_ERROR_1)
						}
					}else{
						msg.reply(ADD_ERROR_1)
					}
				}else{
					msg.reply(ADD_ERROR_1)
				}
			}else{
				msg.reply(ADD_ERROR_1)
			}
		}else{
			msg.reply(ADD_ERROR_1)
		}

		break;

    case 'remove':
		msg.reply("This command has not been set up yet! Take it up with that stupid Aaron guy!")
		break;

    case 'display':
		msg.reply("This command has not been set up yet! Take it up with that stupid Aaron guy!")
		break;
		
	case 'listen':
		msg.reply("This command has not been set up yet! Take it up with that stupid Aaron guy!")
		break;
  }


  if (msg.content === 'inHere') {
    const memberVoiceChannel = msg.member.voice.channel
    if (memberVoiceChannel == null) {
      msg.reply("you need to be in a voice channel for me to help you!")
      return
    }
    if(transChannel == null){
      msg.reply("you need to type 'transcribeHere' in a text channel before I can start transcribing your message.")
      return
    }

    msg.reply('I\'m omw')

    // console.log("\n\n\n 2 \n\n\n")


    const connection = await memberVoiceChannel.join()
    const receiver = connection.receiver

    connection.on('speaking', (user, speaking) => {
      if (!speaking) {
        return
      }

      // console.log("\n\n\n 3 \n\n\n")


      console.log(`I'm listening to ${user.username}`)
      const audioStream = receiver.createStream(user, { mode: 'pcm' })
      const requestConfig = {
        encoding: 'LINEAR16',
        sampleRateHertz: 48000,
        languageCode: 'en-US'
      }

      // console.log("\n\n\n 4 \n\n\n")


      const request = {
        config: requestConfig
      }
      const recognizeStream = googleSpeechClient
        .streamingRecognize(request)
        .on('error', console.error)
        .on('data', response => {
          // console.log("\n\n\n reeeeeee \n\n\n")

          const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n')
            .toLowerCase()
          console.log(`Transcription: ${transcription}`)
          console.log(transChannel.id)

		
          transChannel.send(`${user.username}: ${transcription}`)
          dmList.send(`${user.username}: ${transcription}`)


        })

      const convertTo1ChannelStream = new ConvertTo1ChannelStream()
      audioStream.pipe(convertTo1ChannelStream).pipe(recognizeStream)
      audioStream.on('end', async () => {
        console.log('audioStream end')
      })
    })
  }
  
  else if(msg.content === 'transcribeHere'){
    const memberTextChannel = msg.channel
    if (memberTextChannel == null) {
      msg.reply("I can only transcribe your speech into a text channel!")
      return
	}
	transChannel = memberTextChannel
	console.log(transChannel)

  }

  else if(msg.content === 'dmMe'){
    const memberDM = msg.member
    dmList = memberDM
  }
})
