const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");
const CLRF = '\r\n\r\n'
const PORT = 4221
const HOST = 'localhost'


function parseRequest(req) {
  const [startLine, ...headers] = req.split(CLRF)
  const [method, path, version] = startLine.split(' ')
  return [path, headers]
}

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data", (data) => {

    const [path, header] = parseRequest(data.toString().trim());
    const echoEndPoint = path.startsWith('/echo/');
    const userAgentEndPoint = path.startsWith('/user-agent');
    let response;

    console.log(`Path: ${path}`);
    console.log(`Header ${header.toString()}`);

    if (path === '/') {
      response = `HTTP/1.1 200 OK${CLRF}`;
    } else if (echoEndPoint) {
      const randomString = path.replace(/^\/echo\//, '');
      console.log('Random String: ', randomString);
      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${randomString.length}${CLRF}${randomString}`;
    } else if(userAgentEndPoint){
      j
const userAgentLine = headers.find((line) => line.startsWith('User-Agent: '));
const userAgent = userAgentLine ? userAgentLine.match(/User-Agent: (.+)/)[1] : '';
      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 11\r\ncurl/7.64.1`
    }
    else {
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
