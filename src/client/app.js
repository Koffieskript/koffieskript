import '../styles/styles.scss';
import io from 'socket.io-client';
import { init_incident_form } from './modules/IncidentForm';
import { init_incident_alert } from './modules/IncidentAlert';

const socket = io.connect();

document.addEventListener('DOMContentLoaded', init);

function init() {
  document.querySelector('#toggle-cleaner-button').addEventListener('click', toggle_cleaner);

  socket.on('incident', incident => {
    init_incident_alert(incident)
  });

  moment.locale(window.navigator.userLanguage || window.navigator.language);

  init_incident_form();
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
