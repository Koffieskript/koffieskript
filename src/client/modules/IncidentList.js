import * as utils from './utilities';
import { init_incident_detail } from './IncidentDetail';
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
  setIncidentDetailListeners(incidents);
  componentHandler.upgradeAllRegistered();
}

function setIncidentDetailListeners (incidents) {
  const incidentsAsHtml = document
    .querySelector('#incident-list')
    .getElementsByClassName('incident-list__item');

  for (let i = 0; i < incidentsAsHtml.length; i++) {
    incidentsAsHtml[i].addEventListener('click', () => { navigateToDetail(incidents[i])})
  }
}

function navigateToDetail (incident) {
  fetch('/static/views/IncidentDetail.jade')
    .then(response => response.text())
    .then(htmlString => {
      document.querySelector('#content').innerHTML = jade.render(htmlString, { incident });
      componentHandler.upgradeAllRegistered();
      init_incident_detail(socket, incident);
    });
}
