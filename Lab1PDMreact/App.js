import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {createStore, applyMiddleware, combineReducers} from 'redux';
import thunk from 'redux-thunk';
import { createStackNavigator, createAppContainer } from 'react-navigation';

import { Management } from './login/Management';
import { itemReducer } from './items/service';
import { loginReducer } from './login/service';
import { ItemsList } from './items/ItemsList';

const rootReducer = combineReducers({ items: itemReducer, login: loginReducer });
const store = createStore(rootReducer, applyMiddleware(thunk));

const AppNavigator = createStackNavigator({
  ManagementScreen: { screen: props => <Management {...props} store={store} /> },
  ItemsListScreen: { screen: props => <ItemsList {...props} store={store} /> },
});

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
  render() {
    return (
      <AppContainer />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
