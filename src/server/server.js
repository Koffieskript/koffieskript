import express from 'express';
import http from 'http';
import moment from 'moment';
import tz from 'moment-timezone'
import socket from 'socket.io';
import configureServer from './configureServer';
import request from 'request-promise';

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.Server(app);
const io = socket(server);

app.use(configureServer());

app.set('view engine', 'jade');
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

const cleaners = [];

io.on('connection', socket => {
  socket.on('register', function() {
    cleaners.push(socket.id);
  });

  socket.on('unregister', function() {
    cleaners.splice(cleaners.indexOf(socket.id), 1);
  });

  socket.on('incident', data => {
    cleaners.forEach(cleaner => {
      socket.to(cleaner).emit('incident', data);
    });
  });

  socket.on('subscription', data => {
    const date = moment.tz('Europe/Amsterdam').format();

    const options = {
      method: 'put',
      url: `http://koffieskriptapi-67341.onmodulus.net/incidents/${data.incident}`,
      json: {
        cleaner: data.cleaner,
        subscribedAt: date
      }
    };

    request(options)
      .then(() => {
        console.log("fadfadsaf");
        socket.emit('subscription');
      });
  });
});
