import React, { Component } from 'react';
import { Text, View, TouchableHighlight, StyleSheet, TextInput } from 'react-native';
import styles from '../core/styles';
import { getLogger, issueToText } from '../core/utils';
import { loadItems, connectWs, disconnectWs, updateItem, logout } from "./service";
import Table from 'react-native-simple-table';

const log = getLogger('ItemsList');
const columns = [
  {
    title: 'Id',
    dataIndex: 'id',
  },
  {
    title: 'Nume',
    dataIndex: 'nume',
  },
  {
    title: 'Nota',
    dataIndex: 'nota',
  },
];

export class ItemsList extends Component {
  constructor(props) {
    super(props);
    log('constructor');
    this.state = {
      id: '',
      nume: '',
      nota: '',
    };
  }

  onClickListener = () => {
    const {store} = this.props;
    store.dispatch(updateItem(this.state));
  }

  onClickLogout = () => {
    const { store, navigation: { navigate }} = this.props;
    store.dispatch(logout());
    navigate('ManagementScreen');
  }

  render() {
    const {loading, items} = this.state;
    return (
      <View style={styles.content}>
        <TouchableHighlight style={[stylesBtn.logoutContainer, stylesBtn.loginButton]} onPress={() => this.onClickLogout()}>
          <Text style={stylesBtn.loginText}>Logout</Text>
        </TouchableHighlight>
        <Text style={styles.title}>Items</Text>
        <Table columnWidth={125} columns={columns} dataSource={items} />
        <View style={stylesBtn.container}>
          <View style={stylesBtn.inputContainer}>
            <TextInput style={stylesBtn.inputs}
                placeholder="Id"
                underlineColorAndroid='transparent'
                onChangeText={(id) => this.setState({id})}/>
          </View>
          <View style={stylesBtn.inputContainer}>
            <TextInput style={stylesBtn.inputs}
                placeholder="Nume"
                underlineColorAndroid='transparent'
                onChangeText={(nume) => this.setState({nume})}/>
          </View>
          <View style={stylesBtn.inputContainer}>
            <TextInput style={stylesBtn.inputs}
                placeholder="Nota"
                underlineColorAndroid='transparent'
                onChangeText={(nota) => this.setState({nota})}/>
          </View>
          <TouchableHighlight style={[stylesBtn.buttonContainer, stylesBtn.loginButton]} onPress={() => this.onClickListener()}>
            <Text style={stylesBtn.loginText}>Update</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }

  componentWillMount() {
    log('componentDidMount');
    const { store } = this.props;
    store.dispatch(loadItems());
    this.unsubscribe = store.subscribe(() => {
      const { isLoading, items } = store.getState().items;
      this.setState({ isLoading, items });
    });
    this.ws = connectWs(store);
  }

  componentWillUnmount() {
    log('componentWillUnmount');
    this.unsubscribe();
    disconnectWs(this.ws);
  }
}

const stylesBtn = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DCDCDC',
    paddingTop: 30,
  },
  inputContainer: {
      borderBottomColor: '#F5FCFF',
      backgroundColor: '#FFFFFF',
      borderRadius:30,
      borderBottomWidth: 1,
      width:250,
      height:30,
      marginBottom:20,
      flexDirection: 'row',
      alignItems:'center'
  },
  inputs:{
      height:45,
      marginLeft:16,
      borderBottomColor: '#FFFFFF',
      flex:1,
  },
  inputIcon:{
    width:30,
    height:30,
    marginLeft:15,
    justifyContent: 'center'
  },
  buttonContainer: {
    height:45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:20,
    width:250,
    borderRadius:30,
  },
  logoutContainer: {
    height: 20,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius:30,
    marginLeft: 'auto',
  },
  loginButton: {
    backgroundColor: "#00b5ec",
  },
  loginText: {
    color: 'white',
  }
});
