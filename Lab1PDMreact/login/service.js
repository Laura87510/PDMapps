import { httpApiUrl, wsApiUrl } from '../core/api';
import { AsyncStorage } from 'react-native';

const initialState = {
  isLoggedIn: false,
  error: '',
};

export const login = (values) => dispatch => {
  const options = {
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Credentials': true,
      },
      credentials: 'include',
      method: 'POST',
      body: JSON.stringify(values),
  };
  dispatch({ type: 'LOGIN_STARTED'});
  fetch(`${httpApiUrl}/login`, options)
    .then(response => response.json())
    .then(responseJson => {
      if(responseJson.token) {
        AsyncStorage.setItem(values.username, JSON.stringify(values));
        AsyncStorage.setItem('user', JSON.stringify(responseJson));
        return dispatch({ type: 'LOGIN_SUCCEEDED', response: responseJson});
      }
      else {
       return dispatch({ type: 'LOGIN_FAILED', error: 'Invalid username or password!'});
      }
    })
    .catch(error => {
      AsyncStorage.getItem(values.username).then(credentials => {
        const parsed = JSON.parse(credentials);
        if(parsed.username === values.username && parsed.password === values.password) {
          AsyncStorage.setItem('user', JSON.stringify({token: 'auth'}));
          return dispatch({ type: 'LOGIN_SUCCEEDED', response: true});
        }
      });
      return  dispatch({type: 'LOGIN_FAILED', error: "Server error"});
    });
}

export const loginReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LOGIN_STARTED':
    case 'LOGOUT_SUCCEEDED':
      return {...state, isLoggedIn: false};
    case 'LOGIN_SUCCEEDED':
      return {...state, isLoggedIn: true};
    case 'LOGIN_FAILED':
      return {...state, isLoggedIn: false, error: action.error};
    default:
      return state;
  }
}
export const connectWs = (store) => {
  const ws = new WebSocket(wsApiUrl);
  ws.onopen = () => {};
  ws.onerror = e => {};
  ws.onclose = e => {};
  return ws;
};

export const disconnectWs = (ws) => {
  ws.close();
};
