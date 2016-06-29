import * as utils from './utilities';
import jade from 'jade';
import {init_incident_list} from './IncidentList';

let socket;

export function init_incident_form(s) {
  socket = s;
  fetch_categories(categories=>{ print_incident_form(categories.items); });
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
      button.addEventListener('click', () => {
        init_incident_list(socket);
      });
    });
  });
}
