
import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  Button,
  ScrollView,
  TouchableHighlight,
  AsyncStorage,
} from "react-native";

import Icon from 'react-native-vector-icons/Ionicons';

styles = require ('./../../css/global');



class ReportSelector extends React.Component {
username
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };

    this.logOut = this.logOut.bind(this);
  }


  logOut(){
    AsyncStorage.removeItem("login_username");
    AsyncStorage.removeItem("login_url");
    AsyncStorage.removeItem("login_token");
    AsyncStorage.removeItem("login_token_expires");
    this.props.navigation.navigate('Login')
  }

  render(){
    return (
      <View  style={[styles.container,{alignContent:'center', backgroundColor:'black'}]}>
        <View style={[styles.menu, {backgroundColor:'black'}]}>
          <TouchableHighlight onPress={() => this.props.navigation.navigate('Mejores100Vendidos')} style={[styles.highlightbuttonframe, {height:50, justifyContent:'space-between'}]}>
            <View style={{flexDirection:'row', justifyContent:'space-between', padding:5, alignContent:'center' }}>
              <Icon style={{marginLeft:4, padding:10, fontSize:20}} name="ios-trophy-outline" size={20} color='black' />
               <Text style={[styles.highlightbuttontext,{alignSelf:'center'}]}>Mejores 100 vendidos</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight onPress={() => this.props.navigation.navigate('KPI')} style={[styles.highlightbuttonframe, {height:50, justifyContent:'space-between'}]}>
              <View style={{flexDirection:'row', justifyContent:'space-between', padding:5, alignContent:'center' }}>
                  <Icon style={{marginLeft:4, padding:10, fontSize:20}} name="ios-list-box-outline" size={20} color='black' />
                  <Text style={[styles.highlightbuttontext,{alignSelf:'center'}]}>KPI</Text>
              </View>
          </TouchableHighlight>
          <TouchableHighlight onPress={() => this.props.navigation.navigate('VentasPorTienda')} style={[styles.highlightbuttonframe, {height:50, justifyContent:'space-between'}]}>
                <View style={{flexDirection:'row', justifyContent:'space-between', padding:5, alignContent:'center' }}>
                  <Icon style={{marginLeft:4, padding:10, fontSize:20}} name="ios-cart-outline" size={20} color='black' />
                  <Text style={[styles.highlightbuttontext,{alignSelf:'center'}]}>Ventas por tienda</Text>
              </View>
        </TouchableHighlight>
          <TouchableHighlight onPress={() => this.props.navigation.navigate('VentasPorHora')} style={[styles.highlightbuttonframe, {height:50, justifyContent:'space-between'}]}>
              <View style={{flexDirection:'row', justifyContent:'space-between', padding:5, alignContent:'center' }}>
                <Icon style={{marginLeft:4, padding:10, fontSize:20}} name="ios-time-outline" size={20} color='black' />
                <Text style={[styles.highlightbuttontext,{alignSelf:'center'}]}>Ventas por hora</Text>
              </View>
          </TouchableHighlight>
          <TouchableHighlight onPress={this.logOut} style={styles.highlightbuttonframeyellow}>
          <View style={{flexDirection:'row', justifyContent:'space-between', padding:5, alignContent:'center' }}>
              <Icon style={{marginLeft:4, padding:10, fontSize:20}} name="ios-exit-outline" size={20} color='black' />
               <Text style={[styles.highlightbuttontext,{alignSelf:'center'}]}>Terminar sesión</Text>
            </View>
          </TouchableHighlight>
     


        </View>

      </View >
    );
 }
}

ReportSelector.navigationOptions = {
  title: "Reportes Disponibles",
  tintColor:'white',
  headerTintColor:'white',
  headerStyle:{backgroundColor:'black'},
};


export default ReportSelector;
