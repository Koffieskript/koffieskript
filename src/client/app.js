import '../styles/styles.scss';
import io from 'socket.io-client';

const socket = io.connect();

socket.on('news', function (data) {
  console.log(data);
  socket.emit('news', { news: 'This is the news!' });
});
