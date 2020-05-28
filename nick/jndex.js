// require the discord.js module
const Discord = require('discord.js');


const { prefix, token } = require('./config.json');


// create a new Discord client
const client = new Discord.Client();

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
	console.log('Ready!');
});


client.on('message', message => {
	if (message.content.startsWith((prefix))) {
		// send back "Pong." to the channel the message was sent in
		message.channel.send('Hi' + message.content.slice(3) + ', I\'m Dad.');
	}
	else if (message.content.startsWith('Im')) {
		// send back "Pong." to the channel the message was sent in
		message.channel.send('Hi' + message.content.slice(2) + ', I\'m Dad.');
	}
	else if (message.content.startsWith('im')) {
		// send back "Pong." to the channel the message was sent in
		message.channel.send('Hi' + message.content.slice(2) + ', I\'m Dad.');
	}
	else if (message.content.startsWith('I am')) {
		// send back "Pong." to the channel the message was sent in
		message.channel.send('Hi' + message.content.slice(4) + ', I\'m Dad.');
	}
	else if (message.content.startsWith('i am')) {
		// send back "Pong." to the channel the message was sent in
		message.channel.send('Hi' + message.content.slice(4) + ', I\'m Dad.');
	}
	else if (message.content.startsWith('Yo')) {
		// send back "Pong." to the channel the message was sent in
		message.channel.send('Hi' + message.content.slice(4) + ', I\'m Dad.');
	}
	else if (message.content.startsWith('i am')) {
		// send back "Pong." to the channel the message was sent in
		message.channel.send('Hi' + message.content.slice(4) + ', I\'m Dad.');
	}
});


// login to Discord with your app's token
+ client.login(token);