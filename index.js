// You're going to need to do the following things
// npm install node
// npm install discord.js
// npm i @discordjs/opus

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
// var List = require("collections/list");
var transChannel

console.log("\n\n\n 1 \n\n\n")

discordClient.on('message', async msg => {
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

    console.log("\n\n\n 2 \n\n\n")


    const connection = await memberVoiceChannel.join()
    const receiver = connection.receiver

    connection.on('speaking', (user, speaking) => {
      if (!speaking) {
        return
      }

      console.log("\n\n\n 3 \n\n\n")


      console.log(`I'm listening to ${user.username}`)
      const audioStream = receiver.createStream(user, { mode: 'pcm' })
      const requestConfig = {
        encoding: 'LINEAR16',
        sampleRateHertz: 48000,
        languageCode: 'en-US'
      }

      console.log("\n\n\n 4 \n\n\n")


      const request = {
        config: requestConfig
      }
      const recognizeStream = googleSpeechClient
        .streamingRecognize(request)
        .on('error', console.error)
        .on('data', response => {
          console.log("\n\n\n reeeeeee \n\n\n")

          const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n')
            .toLowerCase()
          console.log(`Transcription: ${transcription}`)
          console.log(transChannel.id)
          transChannel.send(`${user.username}: ${transcription}`)
        })

      const convertTo1ChannelStream = new ConvertTo1ChannelStream()
      audioStream.pipe(convertTo1ChannelStream).pipe(recognizeStream)
      audioStream.on('end', async () => {
        console.log('audioStream end')
      })
    })
  }else if(msg.content === 'transcribeHere'){
    const memberTextChannel = msg.channel
    if (memberTextChannel == null) {
      msg.reply("I can only transcribe your speech into a text channel!")
      return
    }
    transChannel = memberTextChannel
    console.log(transChannel.id)
  }
})