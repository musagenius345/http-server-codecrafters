const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");
const CLRF = '\r\n\r\n'
const PORT = 4221
const HOST = 'localhost'
// GET /index.html HTTP/1.1
//
// Host: localhost:4221
// User-Agent: curl/7.64.1
/**
  *@param {Buffer} req 
  * */
function parseRequest(req) {
  const [startLine, ...headers] = req.split(CLRF)
  const [method, path, version] = startLine.split(' ')
  return path
}

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const path = parseRequest(data.toString().trim())
    const echoEndPoint = path.startsWith('/echo/')
    let response
    console.log(path)
    switch (path) {
      case '/':
        response = `HTTP/1.1 200 OK${CLRF}`;
        break
      case echoEndPoint:
        const randomString = path.replace(/^\/echo\//, '') 
        console.log('Body: ',  body)
        console.log('Random String: ',  randomString)
        response = `HTTP/1.1 200 OK${CLRF}Content-Type: text/plain${CLRF}Content-Length: ${body.length}${CLRF}${randomString}`
        break
      default:
        response = `HTTP/1.1 404 Not Found${CLRF}`;
    }
    
    socket.write(response, "utf-8", () => {
      console.log('Response sent to client')
      socket.end()
      console.log('Server Disconnected')
    })
  })


});

server.listen(PORT, HOST);
