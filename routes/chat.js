// @ts-check
const express = require('express');

const router = express.Router();

const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({ port: 7777 });

wss.on('connection', (ws) => {
  // 모든 클라이언트 정보
  wss.clients.forEach((client) => {
    client.send(`유저가 참가했습니다. 현재 유저 수는 ${wss.clients.size}명`);
  });

  ws.on('message', (message) => {
    wss.clients.forEach((client) => {
      client.send(`${message}`);
      // client.send(message.toString());
    });
  });

  ws.on('close', () => {
    wss.clients.forEach((client) => {
      client.send(`유저가 나갔습니다. 현재 유저 수는 ${wss.clients.size}명`);
    });
  });

  //   ws.send('서버의 말인데 보이니');

  //   ws.on('message', (message) => {
  //     console.log(message.toString());
  //   });
});

router.get('/', (req, res) => {
  res.render('chat');
});

module.exports = router;
