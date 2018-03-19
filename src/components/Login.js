
import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  Button,
  AsyncStorage,
  Alert,
  TouchableHighlight,
} from "react-native";

import ApiUtils from './../../utils/ApiUtils';
import Icon from 'react-native-vector-icons/Ionicons';


const  styles = require ('./../../css/global');



class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      myURL:'',
      username: '',
      password: '',
      login_token: '',
      token_is_valid: false,
    };
    this.saveMyValuesNow = this.saveMyValuesNow.bind(this);
    this.removeLocalData = this.removeLocalData.bind(this);
  }


  componentWillMount () {
    AsyncStorage.getItem("login_url").then((value) => {
              this.setState({myURL: value,});
         });
    AsyncStorage.getItem("login_username").then((value) => {
              this.setState({username: value,});
         });

    let today = new Date();
    let tokenExpires = null;

    AsyncStorage.getItem("login_token_expires").then((value)=>{
      let today = new Date();
      if (!value){
          console.log('No hay Fecha de expiracion');
      }else{
          let today = new Date();
          let expireDate = new Date(value);
          if (today < expireDate){
             this.setState ({token_is_valid: true});
              this.props.navigation.navigate('ReportSelector');
          }
      }
    }).done;

  }



  saveMyValuesNow(){
    let myResponse = '';
    AsyncStorage.setItem('login_url', this.state.myURL);
    AsyncStorage.setItem('login_username', this.state.username);
    const myGrant_Type = 'grant_type=password&username='+ this.state.username+'&password='+this.state.password;
    const full_url = this.state.myURL + '/token';
    let myToken = '';
    fetch(full_url, {
            method: 'POST',
            headers: {
                    'Content-Type':'application/json'
            },
            body: myGrant_Type
            ,
        }).then(ApiUtils.checkStatus)
          .then((response) => response.json())
          .then((responseData) => {
                this.setState({
                    login_token: responseData.access_token,
                });
                AsyncStorage.setItem('login_token', responseData.access_token);
                AsyncStorage.setItem('login_token_expires',responseData[".expires"]);
//                Alert.alert("SuccessLogin");
                this.props.navigation.navigate('ReportSelector');
              }).catch((e) => {
                let rJson = JSON.stringify(e.response);
                Alert.alert('Error',e);
              });

}

  removeLocalData(){
    AsyncStorage.removeItem("login_username");
    AsyncStorage.removeItem("login_url");
    AsyncStorage.removeItem("login_token");
    AsyncStorage.removeItem("login_token_expires");

  }


  render(){
    return (
      <View  style={[styles.container,{alignContent:'center', backgroundColor:'black', padding:50, alignItems:'center'}]}>
          <Image source={require('./../../images/sbx_small.png')} style={{marginBottom:20}} />
          <TextInput
            style={[styles.textInput,{marginBottom:10}]}
            placeholder={'URL'}
            onChangeText={(myURL) => this.setState({myURL})}
            value={this.state.myURL}
            autoCorrect={false}
          />
          <TextInput
            style={[styles.textInput,{marginBottom:10}]}
            placeholder={'Usuario'}
            onChangeText={(username) => this.setState({username})}
            autoCorrect={false}
            value={this.state.username}
          />
          <TextInput
            style={[styles.textInput,{marginBottom:10}]}
            style={[styles.textInput,{}]}
            placeholder={'Contrasena'}
            onChangeText={(password) => this.setState({password})}
            value={this.state.password}
            secureTextEntry={true}
          />

           <TouchableHighlight onPress={this.saveMyValuesNow} style={[styles.highlightbuttonframe, {height:50, justifyContent:'space-between', marginTop:30}]}>
              <View style={{flexDirection:'row', justifyContent:'space-between', padding:5, alignContent:'center' }}>
                <Text style={[styles.highlightbuttontext,{alignSelf:'center'}]}>Enviar</Text>
                <Icon style={{marginLeft:4, padding:10, fontSize:20}} name="ios-arrow-dropright-circle" size={20} color='black' />
              </View>
          </TouchableHighlight>

      </View>
    );
 }
}


export default Login;
