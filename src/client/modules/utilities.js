import jade from 'jade';
import io from 'socket.io-client';

export const base_url = 'https://koffieskriptapi-67341.onmodulus.net';
export const cleaner_id = '1a0a6f67-a594-4e3d-8d58-c253f2c0351d';

export function get_parent_by_class(parentClass, child) {
  var node = child;
  while (node != null) {
    if (node.className && node.classList.contains(parentClass)) {
      return node;
    }
    node = node.parentNode;
  }
  return false;
}

export function fetch_data(url, callback, onError) {
  const headers = new Headers({
    'Accept': 'application/json'
  });
  fetch(base_url + url, {mode: 'cors', headers})
    .then(response => {
      return response.json();
    }).then(data => {
    callback(data);
  }).catch(onError);
}

export function renderTemplate (view, data, selector = '#content') {
  return fetch(view)
    .then(response => response.text())
    .then(htmlString => {
      document.querySelector(selector).innerHTML = jade.render(htmlString, data);
      componentHandler.upgradeAllRegistered();
    });
}

export function subscribe_to_incident(socket, incident) {
  socket.emit('subscribe', {
    incident: incident._id,
    cleaner: cleaner_id
  });
}

export const incident_status = {
  DONE: 'done',
  SUBSCRIBED: 'subscribed',
  PENDING: 'pending'
}
