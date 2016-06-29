import io from 'socket.io-client';
import * as utils from './utilities';

export function init_incident_detail (socket, incident) {
  document
    .querySelector('#subscribe-to-incident-button')
    .addEventListener('click', () => { utils.subscribe_to_incident(socket, incident)})

  document
    .querySelector('#resolve-incident-button')
    .addEventListener('click', () => {
      socket.emit('resolve', incident._id);
    });
}
