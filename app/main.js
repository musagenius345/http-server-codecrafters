const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");
const CRLF = '\r\n\r\n'
const PORT = 4221
const HOST = 'localhost'


function parseRequest(req) {
  const [startLine, ...headers] = req.split(CRLF)
  const userAgentLine = headers.find((line) => line.startsWith('User-Agent: ')); 
  const userAgent = userAgentLine ? userAgentLine.split(' ')[1] : '';
   console.log(headers)   
  const [method, path, version] = startLine.split(' ')
  return [path, userAgent]
}

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data", (data) => {

    const [path, userAgent] = parseRequest(data.toString().trim());
    const echoEndPoint = path.startsWith('/echo/');
    const userAgentEndPoint = path.startsWith('/user-agent');
    let response;

    console.log(`Path: ${path}`);
    console.log(`user agent: ${userAgent}`);

    if (path === '/') {
      response = `HTTP/1.1 200 OK${CRLF}`;
    } else if (echoEndPoint) {
      const randomString = path.replace(/^\/echo\//, '');
      console.log('Random String: ', randomString);
      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${randomString.length}${CRLF}${randomString}`;
    } else if(userAgentEndPoint){
      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 11\${CRLF}${userAgent}`
    }
    else {
      response = `HTTP/1.1 404 Not Found${CRLF}`;
    }


    socket.write(response, "utf-8", () => {
      console.log('Response sent to client')
      socket.end()
      console.log('Server Disconnected')
    })
  })


});

server.listen(PORT, HOST);
