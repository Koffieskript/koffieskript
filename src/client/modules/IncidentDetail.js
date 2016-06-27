import io from 'socket.io-client';
import * as utils from './utilities';

const socket = io.connect();

export function init_incident_detail (incident) {
  document
    .querySelector('#subscribe-to-incident-button')
    .addEventListener('click', () => { utils.subscribe_to_incident(incident)});
}
