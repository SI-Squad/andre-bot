CONFIRMED_TEXT_CHANNEL = "Confirmed text channel"
CONFIRMED_NICK_NAME = "Confirmed nick name"
CONFIRMED_MEMBER_NAME = "Confirmed member name"

ID_ERROR_1 = " It is not in proper ID format"
ID_ERROR_2 = " It is not a known channel"
ID_ERROR_3 = " It is not a text channel"
ID_ERROR_4 = " Not a member of this server"
ID_ERROR_ROLE = " Is a role on the server and not a member or text channel, or something else because I don't want to check"

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
module.exports.identifyMention = function identifyMention(fullId, guildAccess){

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
module.exports.parseID = function parseID(fullId){

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