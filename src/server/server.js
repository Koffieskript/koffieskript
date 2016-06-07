import express from 'express';
import http from 'http';
import socket from 'socket.io';
import configureServer from './configureServer';

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.Server(app);
const io = socket(server);

app.use(configureServer());

app.set('view engine', 'pug');
app.set('views', `${__dirname}/../views`);
console.log(`${__dirname}/../views`);

app.get('/', (req, res) => {
  res.render('index');
});

server.listen(PORT, error => {
  if (error) {
    console.log(error);
  } else {
    console.log(`Listening at port ${PORT}`);
  }
});

io.on('connection', socket => {
  console.log("IO connected");
  socket.emit('news', { hello: 'world' });
  socket.on('news', data => {
    console.log(data);
  });
});
