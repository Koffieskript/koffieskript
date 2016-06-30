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
const cleaners = [];

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

io.on('connection', socket => {

  socket.on('register', function() {
    cleaners.push(socket.id);
    socket.emit('update');
  });

  socket.on('unregister', function() {
    cleaners.splice(cleaners.indexOf(socket.id), 1);
    socket.emit('update');
  });

  socket.on('incident', incident => {
    io.sockets.emit('update');

    cleaners.forEach(cleaner => {
      socket.to(cleaner).emit('incident', incident);
    });
  });

  socket.on('subscribe', incident => {
    const date = moment.tz('Europe/Amsterdam').format();

    const options = {
      method: 'put',
      url: `http://koffieskriptapi-67341.onmodulus.net/incidents/${incident.incident}`,
      json: {
        cleaner: incident.cleaner,
        subscribedAt: date
      }
    };

    request(options)
      .then(incident => {
        console.log('updating list from subscription');
        io.sockets.emit('update', incident);
      });
  });

  socket.on('resolve', incident => {
    const date = moment.tz('Europe/Amsterdam').format();

    const options = {
      method: 'put',
      url: `http://koffieskriptapi-67341.onmodulus.net/incidents/${incident}`,
      json: {
        resolvedAt: date
      }
    };

    request(options)
      .then(incident => {
        io.sockets.emit('update', incident);
      })
    })

    socket.on('battery', () => {
      const options = {
        method: 'post',
        url: `http://koffieskriptapi-67341.onmodulus.net/battery`
      };

      request(options)
        .then(data => {
          console.log();
          const battery = JSON.parse(data);

          if (battery.wasFull) {
            io.sockets.emit('batteryFull', battery);
          }
          else {
            io.sockets.emit('batteryCharge', battery);
          }
        })
    });
});
