const net = require("net");
const path = require('path');
const fs = require("fs");

const CRLF = '\r\n\r\n';
const PORT = 4221;
const HOST = 'localhost';

function parseRequest(req) {
  const [startLine, ...headers] = req.split('\r\n');
  const responseBody = headers[headers.length - 1];
  const headerObject = Object.fromEntries(headers.map(line => line.split(': ')));
  const userAgent = headerObject['User-Agent'];
  const [method, rawPath, version] = startLine.split(' ');
  return [method, rawPath, userAgent, responseBody];
}

function handleRootPath() {
  return `HTTP/1.1 200 OK${CRLF}`;
}

function handleEchoPath(rawPath) {
  const randomString = rawPath.replace(/^\/echo\//, '');
  return `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${randomString.length}${CRLF}${randomString}`;
}

function handleUserAgentPath(userAgent) {
  return `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}${CRLF}${userAgent}`;
}

function handleFilesPath(method, rawPath, directory, responseBody) {
  const filename = rawPath.replace(/^\/files\//, '');
  const filePath = path.join(directory, filename);

  if (method === 'GET') {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath);
      return `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileContent.length}\r\n\r\n${fileContent}`;
    } else {
      return `HTTP/1.1 404 Not Found${CRLF}`;
    }
  } else if (method === 'POST') {
    fs.writeFileSync(filePath, responseBody);
    return 'HTTP/1.1 201 CREATED\r\n\r\n';
  }
}

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const [method, rawPath, userAgent, responseBody] = parseRequest(data.toString().trim());
    let response;

    if (rawPath === '/') {
      response = handleRootPath();
    } else if (rawPath.startsWith('/echo/')) {
      response = handleEchoPath(rawPath);
    } else if (rawPath === '/user-agent') {
      response = handleUserAgentPath(userAgent);
    } else if (rawPath.startsWith('/files/')) {
      const directory = process.argv[3];
      response = handleFilesPath(method, rawPath, directory, responseBody);
    } else {
      response = `HTTP/1.1 404 Not Found${CRLF}`;
    }

    socket.write(response, "utf-8", () => {
      console.log('Response sent to client');
      socket.end();
      console.log('Server Disconnected');
    });
  });
});

server.listen(PORT, HOST);

