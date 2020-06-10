const dotenv = require('dotenv');
dotenv.config();

const Discord = require('discord.js')
const config = require('./config')

const discordClient = new Discord.Client()

discordClient.on('ready', () => {
  console.log(`Logged in as ${discordClient.user.tag}!`)
})

discordClient.login(config.discordApiToken)



/******** */

const googleSpeech = require('@google-cloud/speech')

const googleSpeechClient = new googleSpeech.SpeechClient()






discordClient.on('presenceUpdate', async (oldPresence, newPresence) => {
  // console.log('New Presence:', newPresence)

  const member = newPresence.member
  // console.log('Member: ', member, '\n\n\n\n\n') //test

  const presence = newPresence
  const memberVoiceChannel = member.voice.channel

  // console.log('Presence Activity: ',presence.activity, '\n\n\n\n\n')
  // console.log('Presence Activity Name: ',presence.activity.name, '\n\n\n\n\n')
  // console.log('Member Voice Channel: ',memberVoiceChannel, '\n\n\n\n\n')

  if (memberVoiceChannel == null) {
    return
  }

  console.log("\n -1 \n")                                                        // -1

  const connection = await memberVoiceChannel.join()
  const receiver = connection.receiver

  connection.on('speaking', (user, speaking) => {

    console.log("\n 0 \n")                                                        // 0

    if (!speaking) {
      return
    }

    console.log(`I'm listening to ${user.username}`)

    // this creates a 16-bit signed PCM, stereo 48KHz stream
    const audioStream = receiver.createStream(user, { mode: 'pcm' })
    const requestConfig = {
      encoding: 'LINEAR16',
      sampleRateHertz: 48000,
      languageCode: 'en-US'
    }

    console.log("\n 1 \n")                                                        // 1

    const request = {
      config: requestConfig
    }

    console.log("\n 2 \n")                                                        // 2

    const recognizeStream = googleSpeechClient
      .streamingRecognize(request)
      .on('error', console.error)
      .on('data', response => {
        const transcription = response.results
          .map(result => result.alternatives[0].transcript)
          .join('\n')
          .toLowerCase()
        console.log(`Transcription: ${transcription}`)
      })

    console.log("\n 3 \n")                                                        // 3

      /*********** */

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

      /*********** */

    const convertTo1ChannelStream = new ConvertTo1ChannelStream()

    console.log("\n 4 \n")                                                        // 4

    audioStream.pipe(convertTo1ChannelStream).pipe(recognizeStream)

    console.log("\n 5 \n")                                                        // 5

    audioStream.on('end', async () => {
      console.log('audioStream end')
    })
  })
})
