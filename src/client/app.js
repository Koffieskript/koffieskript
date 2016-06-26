import '../styles/styles.scss';
import io from 'socket.io-client';
import {init_incident_form} from './modules/IncidentForm';
import {init_incident_alert} from './modules/IncidentAlert';

const socket = io.connect();

document.addEventListener('DOMContentLoaded', init);

function init() {
  document.querySelector('#toggle-cleaner-button').addEventListener('click', toggle_cleaner);
  socket.on('incident', incident => { init_incident_alert(socket, incident)});
  socket.emit('register');
  setTimeout(() => {socket.emit('incident', {"_id":"d003af2f-e014-4999-a36f-74dd6dd3d3d9","category":{"_id":"e636ed9b-dd81-4005-b0cc-02603ae38ff3","title":"Koffie gemorst","icon":"free_breakfast","__v":0},"location":"1e verdieping, pl1.45","subscribedAt":null,"resolvedAt":null,"reportedAt":"2016-06-26T19:15:55.158Z","cleaner":{"_id":"1a0a6f67-a594-4e3d-8d58-c253f2c0351d","name":"Wenskinky is noob","__v":0}})}, 2000);
  moment.locale(window.navigator.userLanguage || window.navigator.language);
  init_incident_form(socket);
  // init_incident_list(socket);
}

function toggle_cleaner(e) {
  const toggle = e.target;
  if (toggle.classList.contains('active')) {
    socket.emit('unregister');
  } else {
    socket.emit('register');
  }
  toggle.classList.toggle('active');
}

