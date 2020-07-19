const Discord = require('discord.js')

var {transChannelList, transDMList, transChannelListDisplay, transDMListDisplay} = require("./state.js")

const ADD_ERROR_1 = " the channel you are trying to add is already on the list of channels receiving the transcription."
const ADD_OR_REMOVE_ERROR_2 = " you can only add/remove yourself to the list of users receiving the transcription."
const REMOVE_ERROR_1 = " the channel you are trying to remove from the list of channels receiving the transcription, is already not on the list."

var {identifyMention, parseID} = require("./mention_util.js");

module.exports.addToTransList = function addToTransList(args, msg){
	console.log(args[1])

	if(args.length == 2){
		switch(identifyMention(args[1], msg)){
			case 'Confirmed text channel':
				channelID = parseID(args[1])
				if(!transChannelList.includes(channelID)){
					// Here is where we add to the transChannelList
					msg.channel.send( args[1] + " is now on the list of channels receiving the transcription.")
					transChannelList.push(channelID)
					transChannelListDisplay.push(args[1])
					console.log("\nChannel List\n" + transChannelList + "\n")
				}else{
					// Already on transChannelList
					msg.reply(ADD_ERROR_1)
				}
				break;
			case 'Confirmed nick name':
			case 'Confirmed member name':
				userID = parseID(args[1])
				if(msg.member.id == userID){
					if(!transDMList.includes(userID)){
						msg.channel.send( args[1] + " is now on the list of users receiving the transcription via DMs.")
						transDMList.push(userID)
						transDMListDisplay.push(args[1])
						console.log("\nDM List\n" + transDMList + "\n\n")
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
	console.log("transChannelList: " + transChannelList)
	console.log("transDMList: " + transDMList)
	
}

module.exports.removeFromTransList = function removeFromTransList(args, msg){
	console.log(args[1])

	if(args.length == 2){
		switch(identifyMention(args[1], msg)){
			case 'Confirmed text channel':
				channelID = parseID(args[1])
				if(transChannelList.includes(channelID)){
					msg.channel.send( args[1] + " has been removed from the list of channels receiving the transcription.")
					transChannelList.splice(transChannelList.indexOf(channelID), 1)
					transChannelListDisplay.splice(transChannelListDisplay.indexOf(args[1]), 1)
					console.log("\nChannel List\n" + transChannelList + "\n")
				}else{
					// Not on transChannelList
					msg.reply(REMOVE_ERROR_1)
				}
				break;
			case 'Confirmed nick name':
			case 'Confirmed member name':
				userID = parseID(args[1])
				if(msg.member.id == userID){
					if(transDMList.includes(userID)){
						msg.channel.send( args[1] + " has been removed from the list of users receiving the transcription via DMs.")
						transDMList.splice(transDMList.indexOf(userID), 1)
						transDMListDisplay.splice(transDMListDisplay.indexOf(args[1]))
						console.log("\nDM List\n" + transDMList + "\n\n")
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
}

module.exports.displayTransLists = function displayTransLists(msg){
	if(transChannelListDisplay == '' && transDMList == ''){
		const displayEmbed = new Discord.MessageEmbed()
			.setColor('#92DCE5')
			.setTitle('Andre is transcribing for...')
			.addField('Channels', 'No channels have been added' , false)
			.addField('Users via DM', 'No users have been added' , false)

		msg.channel.send(displayEmbed)
	}else if(transChannelListDisplay == ''){
		const displayEmbed = new Discord.MessageEmbed()
			.setColor('#92DCE5')
			.setTitle('Andre is transcribing for...')
			.addField('Channels', 'No channels have been added' , false)
			.addField('Users via DM', transDMListDisplay, false)

		msg.channel.send(displayEmbed)
	}else if(transDMList == ''){
		const displayEmbed = new Discord.MessageEmbed()
			.setColor('#92DCE5')
			.setTitle('Andre is transcribing for...')
			.addField('Channels', transChannelListDisplay, false)
			.addField('Users via DM', 'No users have been added', false)

		msg.channel.send(displayEmbed)
	}else{
		const displayEmbed = new Discord.MessageEmbed()
			.setColor('#92DCE5')
			.setTitle('Andre is transcribing for...')
			.addField('Channels', transChannelListDisplay, false)
			.addField('Users via DM', transDMListDisplay, false)

		msg.channel.send(displayEmbed)
	}
}