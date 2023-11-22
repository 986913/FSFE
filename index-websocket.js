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

process.on('SIGINT', () => {
  wss.clients.forEach((client) => client.close());
  server.close(() => {
    shutDownDB();
  });
});

/************************ Begin websocket ***********************/
const websocketServer = require('ws').Server;

const wss = new websocketServer({ server });
wss.on('connection', function connection(ws) {
  const numClients = wss.clients.size;
  console.log('clients connected', numClients);

  wss.boardcast(`current visitors ${numClients}`);
  if (ws.readyState === ws.OPEN) {
    ws.send('welcome to my server');
  }

  db.run(`INSERT INTO visitors(count, time)
    VALUES (${numClients}, datetime('now'))
  `);

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
/************************End websocket ************************/

/************************ Begin database ************************/
const sqlite = require('sqlite3');
const db = new sqlite.Database(':memory:');

db.serialize(() => {
  db.run(`
    CREATE TABLE visitors (
      count INTEGER,
      time TEXT
    )
  `);
});

function getCounts() {
  db.each('SELECT * FROM visitors', (err, row) => {
    console.log(row);
  });
}

function shutDownDB() {
  getCounts();
  console.log('shutting down db');
  db.close();
}
/************************ End database ************************/
