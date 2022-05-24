let arc = require('@architect/functions')
let data = require('@begin/data')
let stringifiedResponse = "It works."
exports.handler = async function http(req) {
 return {status : 400, headers:{
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(stringifiedResponse)
    },body:stringifiedResponse}
}
