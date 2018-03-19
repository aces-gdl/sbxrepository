import React, { Component } from 'react'
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Modal
} from 'react-native'

import Icon from 'react-native-vector-icons/Ionicons';


class List extends Component {


   render() {
      if(this.props.visible){
      return (
             <Modal
                animationType={'fade'}
                transparent={false}
                style={{backgroundColor:'black', flex:1}} >
                <View style={{flex:1, backgroundColor:'black', alignItems:'center', justifyContent:'center'}}>
                    <Text style={{color:'white', fontSize:25}} >Seleccione periodo</Text>
                    {
                      this.props.listOptions.map((item, index) => (
                          <TouchableOpacity
                           
                            key = {item.id}
                            style = {{backgroundColor:item.id % 2?'#4b5059':'#32363d', alignSelf:'center',width:'80%',borderRadius:5, margin:5, marginLeft:30, marginRight:30}}
                            onPress = {() => this.props.onPress(item)}>
                            <View style={{flexDirection:'row', justifyContent:'flex-start', padding:5 }}>
                              <Icon style={{marginLeft:4, padding:10}} name="ios-calendar" size={25} color='white' />
        
                              <Text style = {{color:'white', alignSelf:'center', fontSize:20,}}>
                                  {item.label}
                              </Text>
                            </View>
                          </TouchableOpacity>
                      ))
                    }
                    <TouchableOpacity
                      style = {{backgroundColor:'#851219', alignSelf:'center',width:'80%',borderRadius:5, margin:10, marginLeft:30, marginRight:30}}
                      onPress = {() => this.props.onPress()}>
                      <View style={{flexDirection:'row', justifyContent:'flex-end', padding:5 }}>
                        <Text style={{color:'white', fontSize:20, fontWeight:'bold', alignSelf:'center'}} >Cancelar</Text>
                        <Icon style={{marginLeft:4, padding:10, fontSize:30}} name="ios-close" size={20} color='white' />
  
                      </View>
                    </TouchableOpacity>

                  </View>
             </Modal>
      )}else{
         return null;
      }
   }
}
export default List

