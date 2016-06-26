import * as utils from './utilities';
import jade from 'jade';
import {init_incident_list} from './IncidentList';

let socket;

export function init_incident_form(s) {
  socket = s;
  fetch_categories(categories=>{print_incident_form(categories.items)});
}

function fetch_categories(callback) {
  utils.fetch_data(`/categories/`, callback, error => {console.log(error)});
}

function print_incident_form(categories) {
  fetch('/static/views/IncidentForm.jade').then(response => {
    return response.text();
  }).then(htmlstring => {
    document.querySelector('#content').innerHTML = jade.render(htmlstring, {categories});
    componentHandler.upgradeAllRegistered();
    document.querySelector('#save-incident-button').addEventListener('click', init_save_incident);
    document.querySelectorAll('.to-incident-list-button').forEach(button => {
      button.addEventListener('click', init_incident_list);
    });
  });
}

function init_save_incident() {
  save_incident().then(incident => {
    socket.emit('incident', {
      title: incident.title,
      location: incident.location,
      reportedAt: incident.reportedAt
    });
  });
}

function save_incident() {
  const form = document.querySelector('#incident-form');
  const category = form.querySelector('#incident-type-field');
  const location = form.querySelector('#location-field');
  const body = JSON.stringify({
    category: category.value,
    location: location.value
  });
  const headers = new Headers({'Content-Type': 'application/json'});
  return fetch(`${utils.base_url}/incidents`, {method: 'post', body, headers})
    .then(response => {
      location.value = "";
      location.parentNode.classList.remove('is-dirty');
      return response.json();
    });
}
