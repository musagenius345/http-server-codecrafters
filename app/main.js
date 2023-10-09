const net = require("net");
const path = require('path')

const fs = require("fs")
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");
const CRLF = '\r\n\r\n'
const PORT = 4221
const HOST = 'localhost'


function parseRequest(req) {
  const [startLine, ...headers] = req.split('\r\n')
  const responseBody = headers[headers.length - 1]
  const headerObject = Object.fromEntries(headers.map(line => line.split(': ')));
  const userAgent = headerObject['User-Agent']
  // console.log(headers)
  const [method, rawPath, version] = startLine.split(' ')
  return [ method,rawPath, userAgent, responseBody]
}

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data", (data) => {

    const [method, rawPath, userAgent, responseBody] = parseRequest(data.toString().trim());
    const echoEndPoint = rawPath.startsWith('/echo/');
    const filesEndPoint = rawPath.startsWith('/files/');
    const userAgentEndPoint = rawPath === '/user-agent'
    let response;

    // console.log(`Path: ${rawPath}`);

    if (rawPath === '/') {
      response = `HTTP/1.1 200 OK${CRLF}`;
    } else if (echoEndPoint) {
      const randomString = rawPath.replace(/^\/echo\//, '');
      // console.log('Random String: ', randomString);
      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${randomString.length}${CRLF}${randomString}`;
    } else if (userAgentEndPoint) {
      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}${CRLF}${userAgent}`
    } else if (method === 'GET' && filesEndPoint) {
      // console.log(`method: ${method}\n path: ${path}`)
      const filename = rawPath.replace(/^\/files\//, '')
      const directory = process.argv[3]
      const filePath = path.join(directory, filename)
      // console.log('filePath: ', filePath)
      // console.log(`directory: ${directory}\nfile name: ${filename}`)
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath);
        response = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileContent.length}\r\n\r\n${fileContent}`;
      } else {
        response = `HTTP/1.1 404 Not Found${CRLF}`;
      }
    } else if (method === 'POST' && filesEndPoint) {
      console.log(`method: ${method}\n path: ${path}`)
      const filename = rawPath.replace(/^\/files\//, '')
      const directory = process.argv[3]
      const filePath = path.join(directory, filename)
      //const fileContent = responseBody;
      
      console.log(`filePath: ${filePath}\nfileContent: ${responseBody}\ndirectory:${directory}`)
      fs.writeFileSync(filePath, responseBody);
      response = 'HTTP/1.1 201 CREATED\r\n\r\n';

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
