import React, {Component} from 'react';
import { Alert, View, StyleSheet, ActivityIndicator, AsyncStorage } from 'react-native';
import { createStackNavigator, createAppContainer } from 'react-navigation';

import { loadItems, connectWs, disconnectWs } from "./service";
import { Login } from './Login';
import { ItemsList } from '../items/ItemsList';

export class Management extends Component {
  constructor(props){
    super(props);
    this.state={
      isLoading: true,
      user: '',
    };
  }

  componentDidMount(){
    const { store } = this.props;
    this.unsubscribe = store.subscribe(() => {
      const {isLoggedIn, error} = store.getState().login;
      this.setState({isLoggedIn, error});
    });
    this.ws = connectWs(store);
    AsyncStorage.getItem('user').then((token) => {
      this.setState({
        isLoading: false,
        user: token,
      });
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
    disconnectWs(this.ws);
  }

  showAlert() {
    return Alert.alert(
      "Error",
      this.state.error,
      [
        {text: 'Cancel', style: 'cancel'},
      ],
      { cancelable: false },
    );
  }

  render() {
    if(this.state.isLoading) {
      return (
        <View style={[styles.container, styles.horizontal]}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }
    if(this.state.isLoggedIn || this.state.user){
      return this.props.navigation.navigate("ItemsListScreen", { ...this.props });
    } else {
      if(this.state.error && this.state.error != "Server error") {
        return (
          <Login store={this.props.store}>
            {this.showAlert()}
          </Login>
        );

      }
    }
      return <Login store={this.props.store}/>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10
  }
})
