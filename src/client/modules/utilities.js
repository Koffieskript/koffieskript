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