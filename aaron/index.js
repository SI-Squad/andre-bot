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
          // transChannel.send(`${user.username}: ${transcription}`)
          console.log(transChannel.id)
          transChannel.send(`${user.username}: ${transcription}`)
        })
        const { Transform } = require('stream')
  
        function convertBufferTo1Channel(buffer) {
          const convertedBuffer = Buffer.alloc(buffer.length / 2)
          for (let i = 0; i < convertedBuffer.length / 2; i++) {
            const uint16 = buffer.readUInt16LE(i * 4)
            convertedBuffer.writeUInt16LE(uint16, i * 2)
          }
          return convertedBuffer
        }
  
        class ConvertTo1ChannelStream extends Transform {
          constructor(source, options) {
            super(options)
          }
  
          _transform(data, encoding, next) {
            next(null, convertBufferTo1Channel(data))
          }
        }
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











// To be removed in replacement for commands

// discordClient.on('presenceUpdate', async (oldPresence, newPresence) => {
//   // console.log('New Presence:', newPresence)
//   const member = newPresence.member
//   // console.log('Member: ', member, '\n\n\n\n\n') //test

//   const presence = newPresence
//   const memberVoiceChannel = member.voice.channel

//   // console.log('Presence Activity: ',presence.activity, '\n\n\n\n\n')
//   // console.log('Presence Activity Name: ',presence.activity.name, '\n\n\n\n\n')
//   // console.log('Member Voice Channel: ',memberVoiceChannel, '\n\n\n\n\n')

//   if (memberVoiceChannel == null) {
//     return
//   }
//   const connection = await memberVoiceChannel.join()
//   const receiver = connection.receiver

//   connection.on('speaking', (user, speaking) => {
//     if (!speaking) {
//       return
//     }
//     console.log(`I'm listening to ${user.username}`)
//     const audioStream = receiver.createStream(user, { mode: 'pcm' })
//     const requestConfig = {
//       encoding: 'LINEAR16',
//       sampleRateHertz: 48000,
//       languageCode: 'en-US'
//     }
//     const request = {
//       config: requestConfig
//     }
//     const recognizeStream = googleSpeechClient
//       .streamingRecognize(request)
//       .on('error', console.error)
//       .on('data', response => {
//         const transcription = response.results
//           .map(result => result.alternatives[0].transcript)
//           .join('\n')
//           .toLowerCase()
//         console.log(`Transcription: ${transcription}`)
//       })
//       const { Transform } = require('stream')

//       function convertBufferTo1Channel(buffer) {
//         const convertedBuffer = Buffer.alloc(buffer.length / 2)
//         for (let i = 0; i < convertedBuffer.length / 2; i++) {
//           const uint16 = buffer.readUInt16LE(i * 4)
//           convertedBuffer.writeUInt16LE(uint16, i * 2)
//         }
//         return convertedBuffer
//       }

//       class ConvertTo1ChannelStream extends Transform {
//         constructor(source, options) {
//           super(options)
//         }

//         _transform(data, encoding, next) {
//           next(null, convertBufferTo1Channel(data))
//         }
//       }
//     const convertTo1ChannelStream = new ConvertTo1ChannelStream()
//     audioStream.pipe(convertTo1ChannelStream).pipe(recognizeStream)
//     audioStream.on('end', async () => {
//       console.log('audioStream end')
//     })
//   })
// })
