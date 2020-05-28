// this is the way to load a package with NodeJS
var express = require( "express" );

// create an express object: a Web server
var app = express();

// When our server receives a certain request, it needs to know what it should respond,
// so we are defining "routes" the server follows to return the right data.
// When the server gets a request for the "root" route of this domain: "/"
// here: "https://hello-node-server.glitch.me/"
app.get( "/", function( request, response ) {
  // we program the server to respond with an HTML string
  response.send( "<h1>Hello :)</h1><p><a href='/about'>About</a></p>" ); 
} );

// when the server gets a request for "https://hello-node-server.glitch.me/about"
app.get( "/about", function( request, response ) {
  response.send( "<h1>This is my about page</h1><a href='/'>Home</a></p>" );
} );

// finally we tell the server to listen for requests
app.listen( process.env.PORT );
// the server needs to listen for requests on a specified port:
// a port can be thought of as an access on device to communicate data
// and computers have thousands of ports
// on Glitch we can use "process.env.PORT" which corresponds to port 3000

const Discord = require('discord.js')
const client = new Discord.Client()
client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong')
  }
})

const axios = require('axios')
//...
client.on('message', msg => {
  axios.get('https://translate.yandex.net/api/v1.5/tr.json/translate', {
    params: {
      key: process.env.YANDEX_API_KEY,
      text: msg.content,
      lang: 'en'
    }
  }).then(res => {
    if (res.data.text[0] !== msg.content) {
      msg.reply(res.data.text[0])
    }
  })
})

client.login(process.env.BOT_TOKEN)