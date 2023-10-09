const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");
const CLRF = '\r\n\r\n'
// GET /index.html HTTP/1.1
//
// Host: localhost:4221
// User-Agent: curl/7.64.1
/**
  *@param {Buffer} req 
  * */
function parseRequest(req){
  const [startLine, ...headers] = req.split(CLRF)
  const [method, path, version] = startLine.split('')
  return [method, path, version]
}

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const path = parseRequest(data.toString())
    let response
    if(path === '/'){
      response= `HTTP/1.1 200 OK${CLRF}`
    } else {
      response = `HTTP/1.1 400 Not Found${CLRF}`
    }
    socket.write(response, "utf-8", () => {
      console.log('Response sent to client')
      socket.end('close', () => {
        console.log('Server disconnnected')
      })
    })
  })

  socket.on("close", () => {
    socket.end();
    server.close();
  });
});

server.listen(4221, "localhost");
