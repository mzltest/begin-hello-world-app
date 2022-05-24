let arc = require('@architect/functions')
let parseBody = arc.http.helpers.bodyParser

exports.handler = async function http (request) {
  console.log(request.body)     // 'Z3JlZXRpbmc9aG93ZHk='
  let body = parseBody(request) // Pass the entire request object
  let greeting = body.greeting  // 'howdy'
  return {
    statusCode: 200,
    headers: { 'content-type': 'text/html; charset=utf8' },
    body: greeting
  }
}
