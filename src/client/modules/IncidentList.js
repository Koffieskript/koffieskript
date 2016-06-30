import * as utils from './utilities';
import { navigate_to_detail, init_incident_detail } from './IncidentDetail';
import jade from 'jade';

let socket;

export function init_incident_list(s) {
  socket = s;
  fetch_incidents(print_incidents);
}

function fetch_incidents(callback) {
  utils.fetch_data(`/incidents/`, callback, error => { console.log(error) });
}

function print_incidents(incidents) {
  incidents = incidents.items.map(incident => {
    const _incident = incident;
    const reported_at = moment(incident.reportedAt);
    _incident.timestamp = reported_at.from(moment(moment.now()));

    if (incident.resolvedAt) {
      _incident.status = ' done';
    } else if (incident.cleaner) {
      _incident.status = ' subscribed';
    } else {
      _incident.status = ' pending';
    }
    return _incident;
  });

  document.querySelector('#list').innerHTML = jade.render(htmlstring, { incidents });
  set_incident_detail_listeners(incidents);
  componentHandler.upgradeAllRegistered();
}

function set_incident_detail_listeners (incidents) {
  const incidentsAsHtml = document
    .querySelector('#incident-list')
    .getElementsByClassName('incident-list__item');

  for (let i = 0; i < incidentsAsHtml.length; i++) {
    incidentsAsHtml[i].addEventListener('click', () => { navigate_to_detail(socket, incidents[i])})
  }
}
