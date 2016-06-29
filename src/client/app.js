import '../styles/styles.scss';
import io from 'socket.io-client';
import jade from 'jade';
import * as utils from './modules/utilities';
import { init_incident_form } from './modules/IncidentForm';
import { init_incident_list } from './modules/IncidentList';
import { init_incident_alert } from './modules/IncidentAlert';

const socket = io.connect();

document.addEventListener('DOMContentLoaded', init);

function init() {
  moment.locale(window.navigator.userLanguage || window.navigator.language);

  document.querySelector('#toggle-cleaner-button').addEventListener('click', toggle_cleaner);

  socket.on('incident', incident => {
    setTimeout(() => {
      console.log("subscribing");
      subscribe_to_incident(incident);
    }, 3000);
  });

  socket.on('update_list', update_list);

  init_tab_view();
}

function subscribe_to_incident(incident) {
  socket.emit('subscribe', {
    incident: incident._id,
    cleaner: utils.cleaner_id
  });
}


function update_list() {
  console.log("updating the list");
  fetch_list_view()
    .then(({jadeStringListView, incidents}) => {
      render_list_view(jadeStringListView, incidents);
    });
}

function init_tab_view() {
  const view = fetch('/static/views/TabView.jade')
    .then(response => response.text());

  const categories = fetch('https://koffieskriptapi-67341.onmodulus.net/categories', { mode: 'cors' })
    .then(response => response.json());

  const listData = fetch_list_view();

  Promise.all([view, categories, listData])
    .then(refactor_tab_data)
    .then(render_tab_view);
}

function fetch_list_view () {
  const list_view = fetch('/static/views/IncidentList.jade')
    .then(response => response.text());

  const incidents = fetch('https://koffieskriptapi-67341.onmodulus.net/incidents', { mode: 'cors' })
    .then(response => response.json());

  return Promise.all([list_view, incidents])
    .then(refactor_list_view_data)
    .then(format_incidents);
}

function refactor_list_view_data (data) {
  return {
    jadeStringListView: data[0],
    incidents: data[1].items
  };
}

function format_incidents (data) {
  const { incidents } = data;

  data.incidents = data.incidents.map(incident => {
    const reported_at = moment(incident.reportedAt);
    incident.timestamp = reported_at.from(moment(moment.now()));

    if (incident.resolvedAt) {
      incident.status = ' done';
    } else if (incident.cleaner) {
      incident.status = ' subscribed';
    } else {
      incident.status = ' pending';
    }

    return incident;
  });

  return data;
}

function refactor_tab_data (data) {
  return Object.assign({
    jadeStringTabView: data[0],
    categories: data[1].items
  }, data[2])
}

function render_tab_view({jadeStringTabView, jadeStringListView, categories, incidents}) {
  document.querySelector('#content').innerHTML = jade.render(jadeStringTabView, { categories });
  componentHandler.upgradeAllRegistered();
  render_list_view(jadeStringListView, incidents);
  add_tab_view_listeners(incidents)
}

function render_list_view(jadeStringListView, incidents) {
  document.querySelector('#list').innerHTML = jade.render(jadeStringListView, { incidents });
}

function add_tab_view_listeners (incidents) {
  const incidentsAsHtml = document
    .querySelector('#list')
    .getElementsByClassName('incident-list__item');

  for (let i = 0; i < incidentsAsHtml.length; i++) {
    incidentsAsHtml[i].addEventListener('click', () => {
      navigate_to_detail(incidents[i])
    });
  }

  document.querySelector('#save-incident-button').addEventListener('click', init_save_incident);
}

function navigate_to_detail (incident) {
  fetch('/static/views/IncidentDetail.jade')
    .then(response => response.text())
    .then(htmlString => {
      document.querySelector('#content').innerHTML = jade.render(htmlString, { incident });
      componentHandler.upgradeAllRegistered();
      init_incident_detail(socket, incident);
    });
}

function init_save_incident() {
  save_incident()
  .then(incident => {
    console.log("Incident emitted");
    socket.emit('incident', incident);
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



function toggle_cleaner(e) {
  const toggle = e.target;

  if (toggle.classList.contains('active')) {
    socket.emit('unregister');
  } else {
    socket.emit('register');
  }

  toggle.classList.toggle('active');
}
