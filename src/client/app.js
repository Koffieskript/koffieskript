import '../styles/styles.scss';
import io from 'socket.io-client';
import jade from 'jade';
import * as utils from './modules/utilities';
import { init_incident_alert } from './modules/IncidentAlert';
import { format_incident, navigate_to_detail } from './modules/IncidentDetail';
import { ConfettiCannon } from './modules/batteryAnimation';
import Battery from './modules/battery';

const socket = io.connect('http://localhost:3000/');

let battery;

document.addEventListener('DOMContentLoaded', init);

function init() {
  moment.locale(window.navigator.userLanguage || window.navigator.language);

  document.querySelector('#toggle-cleaner-button').addEventListener('click', toggle_cleaner);
  document.querySelector('#back-button').addEventListener('click', init_tab_view);
  socket.on('incident', incident => {
    init_incident_alert(socket, incident);
  });

  socket.on('batteryCharge', charge_battery);
  socket.on('batteryFull', full_battery);

  socket.on('update', update_list);

  init_tab_view();
}

function full_battery (battery_data) {
  const canvas = document.getElementById('canvas')
  const animation = new ConfettiCannon();
  new Audio('/static/sounds/tada.mp3').play();
  set_dismiss_confetti_button(battery_data);
  battery.setPercentage(100);
}

function set_dismiss_confetti_button(battery_data) {
  document.getElementById('canvas').insertAdjacentHTML('afterend', '<button id="dismiss-button" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect">Doel bereikt</button>');

  document.getElementById('dismiss-button').addEventListener('click', e => {
    document.getElementById('canvas').outerHTML = '<canvas id="canvas"></canvas>';
    e.target.parentNode.removeChild(e.target);
    charge_battery(battery_data);
  });
}

function charge_battery(battery_data) {
  battery.setPercentage(battery_data.batteryPercentage);
}

function update_list() {
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

function fetch_list_view() {
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

  data.incidents = data.incidents.map(format_incident);
  return data;
}

function refactor_tab_data (data) {
  return Object.assign({
    jadeStringTabView: data[0],
    categories: data[1].items
  }, data[2])
}

function render_tab_view({jadeStringTabView, jadeStringListView, categories, incidents}) {
  const back_button = document.querySelector('#back-button');
  document.querySelector('#content').innerHTML = jade.render(jadeStringTabView, { categories, active_tab: back_button.classList.contains('hidden') ? 'new': 'existing' });
  componentHandler.upgradeAllRegistered();
  render_list_view(jadeStringListView, incidents);
  add_tab_view_listeners(incidents);
  back_button.classList.toggle('hidden');
  if (back_button.classList.contains('init')) {
    back_button.classList.add('hidden');
  }
  battery = new Battery('isoCubeTop', 'isoCubeRight', 'isoCubeLeft');
  battery.setPercentage(0);
  socket.emit('get_battery_status');
}

function render_list_view(jadeStringListView, incidents) {
  document.querySelector('#list').innerHTML = jade.render(jadeStringListView, { incidents });
  document.querySelector('#list').querySelectorAll('.incident-list__item').forEach((incident, i) => {
    incident.addEventListener('click', () => {
      navigate_to_detail(socket, incidents[i]);
    });
  });
}

function add_tab_view_listeners(incidents) {
  document.querySelector('#save-incident-button').addEventListener('click', init_save_incident);
}

function init_save_incident() {
  save_incident()
  .then(incident => {
    console.log("Incident emitted");
    socket.emit('incident', incident);
    socket.emit('battery');
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
  if (!utils.is_cleaner()) {
    socket.emit('register');
  } else {
    socket.emit('unregister');
  }
  toggle.classList.toggle('active');
}
