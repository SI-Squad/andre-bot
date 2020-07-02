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
var transChannelListDisplay = List()
var transDMListDisplay = List()

// to be removed
var transChannel
var dmList

// console.log("\n\n\n 1 \n\n\n")

const PREFIX = "&"
const ADD_ERROR_1 = " the correct notation for &add is as follows: \n&add < @User | #TextChannel >\nMake sure that the name of the user or channel is highlighted."
const ADD_ERROR_2 = " the channel you are trying to &add is not a text channel."
const ADD_ERROR_3 = " you can only add yourself and, permission granted, channels to the transcription lists. This error also occurs when you are already on the list receiving the transcription."

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
						msg.reply(ADD_ERROR_3)
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
						msg.reply(ADD_ERROR_4)
					}
					break;
				default:
					msg.reply(identifyMention(args[1], msg))
			}
		}
		break;

    case 'remove':

		// number of arguments provided is only 2
		if(args.length == 2){
			// checks to make sure the ID is greater than four. might not be necessary
			if(args[1].length >= 4){
				// makes sure the id starts with "<" and ends with ">"
				if(args[1].substring(0,1) == "<" && args[1].substring(args[1].length-1, args[1].length) == ">"){
					// checks to see if it is a channel id
					if(args[1].substring(1,2) == "#"){
						channelID = args[1].substring(2, args[1].length-1)
						// looks throught the channel list to see if the channel exists...
						if(discordClient.channels.get(channelID) != null){
							// ...and that it is a text channel
							if(discordClient.channels.get(channelID).type == "text"){
								// checks to see if the id is already in the list, it should be in order to remove
								if(transChannelList.has(channelID)){
									// Here is where we remove from the transChannelList
									msg.channel.send( args[1] + " has been removed from the list of channels receiving the transcription.")
									transChannelList.delete(channelID)
									transChannelListDisplay.delete(args[1])
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
					// checks to see if the id is a user mention (and not a category or something else)
					}else if(args[1].substring(1,2) == "@" && args[1].substring(2,3) == "!"){
						userID = args[1].substring(3, args[1].length-1)
						// checks to see if the user exists
						if(discordClient.users.fetch(userID) != null){
							// checks to see if the list already contains the user, it should be in order to remove, and that the user being added to the list is the user calling the function
							if(transDMList.has(userID) && msg.member.id == userID){
								// Here is where we add to the transDMList
								msg.channel.send( args[1] + " has been removed from the list of users receiving the transcription via DMs.")
								transDMList.delete(userID)
								transDMListDisplay.delete(args[1])
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
		}
		if(transDMList.toArray() == ''){
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
		msg.reply("This command has not been set up yet! Take it up with that stupid Aaron guy!")
		break;
		
	// to be removed, used for testing
	case 'identify':
		console.log( args[1] )
		console.log( identifyMention(args[1], msg) )
		break;

	// to be removed, used for testing
	case 'parse':
		console.log(args[1])
		console.log(parseID(args[1]))
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




CONFIRMED_TEXT_CHANNEL = "Confirmed text channel"
CONFIRMED_NICK_NAME = "Confirmed nick name"
CONFIRMED_MEMBER_NAME = "Confirmed member name"

ID_ERROR_1 = "It is not in proper ID format"
ID_ERROR_2 = "It is not a known channel"
ID_ERROR_3 = "It is not a text channel"
ID_ERROR_4 = "Not a member of this server"
ID_ERROR_ROLE = "Is a role on the server and not a member or text channel, or something else because I don't want to check"

/**
 * Function's purpose is to identify whether or not the provided mention ID is valid and of this server.
 * This is done by checking a series of substrings within the provided ID, and then comparing the 
 * full string of numbers to the guild's member and channel lists. For visual purposes
 * 
 * User -  		<@___>				good, if member of guild
 * Nickname -  	<@!__>				good, if member of guild
 * Bot - 		<@___> or <@!___>	bad, we don't want to be able to send things to bots
 * Role -  		<@&__>				bad, all the time
 * Channel -  	<#___>				good, if text channel
 * 
 * @param {*} fullId - the mention's string form
 * @param {*} guildAccess - The message or something giving the function access to the guilds channels 
 * and members lists
 */
function identifyMention(fullId, guildAccess){

	if( fullId.length >= 4 ){
		if( fullId.substring(0,1) == ('<') && fullId.substring(fullId.length - 1, fullId.length) == ('>') ){
			if( fullId.substring(1,2) == ('#') ){
				channelID = fullId.substring(2, fullId.length-1)
				if(guildAccess.guild.channels.get(channelID) != null){
					if(guildAccess.guild.channels.get(channelID).type == "text"){
						return CONFIRMED_TEXT_CHANNEL
					}else{
						// It is not a text channel
						return ID_ERROR_3
					}
				}else{
					// It is not a known channel
					return ID_ERROR_2
				}
			}else if( fullId.substring(1,2) == ('@') ){
				if( fullId.substring(2,3) == ('!') ){
					userID = fullId.substring(3, fullId.length-1)
					if( guildAccess.member.fetch(userID) != null ){
						// console.log("Is a bot: " + userID.)
						return CONFIRMED_NICK_NAME
					}else{
						// Not a member of this server
						return ID_ERROR_4
					}
				}else if( fullId.substring(2,3) == ('&') ){
					// Is a role on the server and not a member or text channel, or something else because I don't want to check
					return ID_ERROR_ROLE
				}else{
					userID = fullId.substring(2, fullId.length-1)
					if( guildAccess.member.fetch(userID) != null ){
						return CONFIRMED_MEMBER_NAME
					}else{
						// Not a member of this server
						return ID_ERROR_4
					}
				}
			}else{
				// It is not in proper ID format
				return ID_ERROR_1
			}
		}else{
			// It is not in proper ID format
			return ID_ERROR_1
		}
	}else{
		// It is not in proper ID format
		return ID_ERROR_1
	}

}

/**
 * A helper function for parsing IDs quickly. Should only be used if fullId has been confirmed
 * by the identifyMention function.
 * 
 * @param {*} fullId 	The full ID provided by the mention. Is known to be a text channel, or name of a user/bot.
 */
function parseID(fullId){

	// Known text channel
	if( fullId.substring(1,2) == ('#') ){
		channelID = fullId.substring(2, fullId.length-1)
		return channelID
	}else if( fullId.substring(1,2) == ('@') ){
		if( fullId.substring(2,3) == ('!') ){
			userID = fullId.substring(3, fullId.length-1)
			return userID
		}else{
			userID = fullId.substring(2, fullId.length-1)
			return userID
		}
	}

}
