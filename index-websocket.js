const express = require('express');
const server = require('http').createServer();
const app = express();

app.get('/', function (req, res) {
  res.sendFile('index.html', { root: __dirname });
});

server.on('request', app);
server.listen(3000, function () {
  'server started on 3000...';
});

/**** Begin websocket ******/
const websocketServer = require('ws').Server;

const wss = new websocketServer({ server });
wss.on('connection', function connection(ws) {
  const numClients = wss.clients.size;
  console.log('clients connected', numClients);

  wss.boardcast(`current visitors ${numClients}`);
  if (ws.readyState === ws.OPEN) {
    ws.send('welcome to my server');
  }
  ws.on('close', function close() {
    wss.boardcast(`current visitors ${numClients}`);
    console.log('a client has disconnect');
  });
});

wss.boardcast = function boardcast(data) {
  wss.clients.forEach((client) => {
    client.send(data);
  });
};
