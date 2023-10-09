const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// GET /index.html HTTP/1.1
//
// Host: localhost:4221
// User-Agent: curl/7.64.1
function parseRequest(req){
  const [startLine, ...headers] = req.split('\r\n\r\n')
  const path = startLine[1]
  return path
}

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data", (data) => {

    let successResponse = 'HTTP/1.1 200 OK\r\n\r\n' 
    socket.write(successResponse, "utf-8", () => {
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
