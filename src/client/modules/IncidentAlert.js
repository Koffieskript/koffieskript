import jade from 'jade';
import dialog from './dialog';

let socket;

export function init_incident_alert(s, incident) {
  console.log(incident);
  socket = s;
  fetch('/static/views/IncidentAlert.jade').then(response => {
    return response.text();
  }).then(htmlstring => {
    const _dialog = document.querySelector('#incident-alert');
    if (_dialog) {
      _dialog.parentNode.removeChild(_dialog);
    }
    document.querySelector('#content').insertAdjacentHTML('afterend', jade.render(htmlstring, {incident}));
    componentHandler.upgradeAllRegistered();
    const dialog = document.querySelector('#incident-alert');
    dialog.MaterialDialog.show(true);
    document.querySelector('#subscribe-incident-button').addEventListener('click', subscribe_to_incident.bind(incident));
    document.querySelector('#dismiss-alert-button').addEventListener('click', close_dialog);
  });
}

function close_dialog() {
  const dialog = document.querySelector('#incident-alert');
  dialog.MaterialDialog.close();
}

function subscribe_to_incident() {
  const incident = this;
  console.log(incident);
  // Use utils.cleaner_id when posting subscription or other status change
  close_dialog();
}
