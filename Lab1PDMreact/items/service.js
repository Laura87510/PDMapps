import { httpApiUrl, wsApiUrl } from '../core/api';
import { AsyncStorage } from 'react-native';

export const loadItems = () => dispatch => {
  dispatch({ type: 'LOAD_STARTED' });
  fetch(`${httpApiUrl}/read`)
    .then(response => response.json())
    .then(responseJson => {
      // AsyncStorage.setItem('items', JSON.stringify(responseJson));
      return dispatch({ type: 'LOAD_SUCCEEDED', payload: responseJson })
    })
    .catch(error => {
      AsyncStorage.getItem('items').then(items => {
        const parsed = JSON.parse(items);
        //if(parsed.items)
          return dispatch({ type: 'LOAD_SUCCEEDED', payload: parsed});
      });
      return dispatch({ type: 'LOAD_FAILED', error: "Server error"})
    });
};

export const updateItem = values => dispatch => {
  const options = {
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Credentials': true,
      },
      credentials: 'include',
      method: 'PUT',
      body: JSON.stringify(values),
  };

  dispatch({ type: 'UPDATE_STARTED'});
  fetch(`${httpApiUrl}/update`, options)
    .then(response => response.json())
    .then(responseJson => {
      // if(responseJson) {
      log('response', responseJson);
        AsyncStorage.getItem('items').then(items => {
          const parsed = JSON.parse(items);
          log('parseeeed',parsed);
          parsed.items.map(item => {
            if(item.id == values.id) {
              item.nume = values.nume;
              item.nota = values.nota;
            }
          });
          AsyncStorage.setItem('items', JSON.stringify(parsed));
        });
        return dispatch({ type: 'UPDATE_SUCCEEDED', payload: responseJson});
    })
    .catch(error => {
      AsyncStorage.getItem('items').then(items => {
        const parsed = JSON.parse(items);
        parsed.items.map(item => {
          if(item.id == values.id) {
            item.nume = values.nume;
            item.nota = values.nota;
          }
        });
        AsyncStorage.setItem('items', JSON.stringify(parsed));
        return dispatch({ type: 'UPDATE_SUCCEEDED', payload: parsed});
      });
      return  dispatch({type: 'UPDATE_FAILED', error: "Server error"});
    });
}

export const logout = () => dispatch => {
  if(AsyncStorage.getItem('user')) {
    AsyncStorage.removeItem('user');
    return dispatch({type: 'LOGOUT_SUCCEEDED', response: false});
  }
}

const initialState = {
  isLoading: false,
  items: null,
}

export const itemReducer = (state = initialState, action) => {
  console.log('ACTION',action);
  switch (action.type) {
    case 'LOAD_STARTED':
      return {...state, isLoading: true, items: [] };
    case 'UPDATE_SUCCEEDED':
    case 'LOAD_SUCCEEDED':
      return {...state, isLoading: false, items: action.payload.items };
    case 'UPDATE_FAILED':
    case 'LOAD_FAILED':
      return {...state, isLoading: false, items: [] };
    case 'ITEM_ADDED':
      return {...state, isLoading: false, items: action.payload };
    default:
      return state;

  }
}

export const connectWs = (store) => {
  const ws = new WebSocket(wsApiUrl);
  ws.onopen = () => { console.log('open');
    AsyncStorage.getItem('items').then(items => {
      const options = {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Credentials': true,
          },
          credentials: 'include',
          method: 'PUT',
          body: items,
      };
      fetch(`${httpApiUrl}/sync`, options);
    });
  };
  ws.onmessage = e => {console.log('message received', JSON.parse(e.data));
  return store.dispatch({
    type: 'ITEM_ADDED', payload: JSON.parse(e.data)
  })};
  ws.onerror = e => {console.log('error');};
  ws.onclose = e => {console.log('close');};
  return ws;
};

export const disconnectWs = (ws) => {
  ws.close();
};
