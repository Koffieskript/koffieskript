import io from 'socket.io-client';
import * as utils from './utilities';
import jade from 'jade';

export function navigate_to_detail(socket, incident) {
  fetch('/static/views/IncidentDetail.jade')
    .then(response => response.text())
    .then(htmlString => {
      document.querySelector('#content').innerHTML = jade.render(htmlString, { incident });
      componentHandler.upgradeAllRegistered();
      init_incident_detail(socket, incident);
    });
}

export function init_incident_detail(socket, incident) {
  const subscribe_button = document.querySelector('#subscribe-to-incident-button');
  if (subscribe_button) {
    subscribe_button.addEventListener('click', () => {
      utils.subscribe_to_incident(socket, incident);
    });
  }

  const resolve_button = document.querySelector('#resolve-incident-button');
  if (resolve_button) {
    resolve_button.addEventListener('click', () => {
      socket.emit('resolve', incident._id);
      if (incident.status == utils.incident_status.PENDING) {
        utils.subscribe_to_incident(socket, incident);
      }
    });
  }

  socket.on('update_list', incident => {
    navigate_to_detail(socket, format_incident(incident));
  });
}

export function format_incident (incident) {
  if (incident.reportedAt) {
    const reported_at = moment(incident.reportedAt);
    incident.timestamp = reported_at.from(moment(moment.now()));
    incident.full_timestamp = reported_at;
  }

  if (incident.resolvedAt) {
    incident.status = utils.incident_status.DONE;
    incident.status_text = "Klaar";
  } else if (incident.cleaner) {
    incident.status = utils.incident_status.SUBSCRIBED;
    incident.status_text = "Bezig";
  } else {
    incident.status = utils.incident_status.PENDING;
    incident.status_text = "Open";
  }

  return incident;
}
