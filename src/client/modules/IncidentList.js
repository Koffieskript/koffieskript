import * as utils from './utilities';
import jade from 'jade';

export function init_incident_list() {
  fetch_incidents(print_incidents);
}

function fetch_incidents(callback) {
  utils.fetch_data(`/incidents/`, callback, error => {console.log(error)});
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
  fetch('/static/views/IncidentList.jade').then(response => {
    return response.text();
  }).then(htmlstring => {
    document.querySelector('#content').innerHTML = jade.render(htmlstring, {incidents});
    componentHandler.upgradeAllRegistered();
  });
}