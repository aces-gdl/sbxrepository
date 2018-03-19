import React, { Component } from 'react';

import {
  AppRegistry,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  Item,
  AsyncStorage,
  TouchableHighlight,
  Alert,
  Dimensions,
} from 'react-native'

import {
    Cell,
    DataTable,
    Header,
    HeaderCell,
    Row,

} from 'react-native-data-table';
import Icon from 'react-native-vector-icons/Ionicons';


import { ListView } from 'realm/react-native';
import ApiUtils from './../../utils/ApiUtils'
import List from '../components/List.js';
const styles = require ('./../../css/global');


const myPickerOptions=[
    {id:0,key:'today', label:'Hoy'},
    {id:1,key:'yesterday', label:'Ayer'},
    {id:2,key:'week_to_date', label:'Semana Actual'},
    {id:3,key:'last_week', label:'Semana Pasada'},
    {id:4,key:'month_to_date', label:'Mes Actual'},
    {id:5,key:'last_month', label:'Mes Pasado'},
    {id:6,key:'year_to_date', label:'Año Actual'},
  ];
class Mejores100Vendidos extends React.Component {


constructor(props) {

  super(props);
  const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
  this.state = {
    dataSource: ds,
    myData:{},
    login_url: '',
    login_token:'',
    loadingData:false,
    maxWidth:600,
    menuVisible:false,
    selectedOption:myPickerOptions[0],
  };

  this.renderRow          = this.renderRow.bind(this);
  this.renderHeader       = this.renderHeader.bind(this);
  this.loadData           = this.loadData.bind(this);
  this.loadingAnimation   = this.loadingAnimation.bind(this);
  this.formatMoney        = this.formatMoney.bind(this);
  this.handleDimensionEvents = this.handleDimensionEvents.bind(this);
  this.onSort             = this.onSort.bind(this);
  AsyncStorage.getItem("login_url").then((value) => {
            this.setState({login_url: value,});
       });
  AsyncStorage.getItem("login_token").then((value) => {
            this.setState({login_token: value,});
       });

}

componentDidMount(){
  AsyncStorage.getItem("login_url").then((value) => {
            this.setState({login_url: value,});
            AsyncStorage.getItem("login_token").then((value) => {
                      this.setState({login_token: value,});
                      this.loadData(this.state.selectedOption);
                    }).catch(function () {
                        console.log("Promise Rejected");
                    });

            }).catch(function () {
                console.log("Promise Rejected");
            });

}


componentWillMount(){
    Dimensions.addEventListener("change", this.handleDimensionEvents);
  }
  componentWillUnmount(){
    Dimensions.addEventListener("change", this.handleDimensionEvents);
  }

handleDimensionEvents(){
  let dims = Dimensions.get('window');
  let maxWidth = 600 > dims.width ? 600 : dims.width;
  this.setState({
    maxWidth: maxWidth,
  });
}



loadData(option){


  if (!option){
    this.setState({
      loadingData:false,
      menuVisible:false,
    });
    return;
  }

  this.setState({
    loadingData:true,
    menuVisible:false,
  });


  console.log('en loadData: ' + option);

  let full_url = this.state.login_url + '/api/reports/best_sellers/' + option.key;
  console.log ('URL =' + full_url);
  fetch(full_url, {
          method: 'GET',
          headers: {
              'Authorization' : 'Bearer ' + this.state.login_token,
              'Content-Type':'application/json',
          },
      }).then(ApiUtils.checkStatus)
        .then((response) => response.json())
        .then((responseData) => {
              if (responseData.length){
                this.setState({
                  myData: responseData,
                  dataSource: this.state.dataSource.cloneWithRows(responseData),
                  loadingData:false,
                  menuVisible:false,
                  selectedOption:option,
                 });
                 console.log ('Con Datos : '+ responseData);
              }
              else
              {
                this.setState({
                  myData: responseData,
                   dataSource: this.state.dataSource.cloneWithRows(responseData),
                  loadingData:false,
                  menuVisible:false,
                  selectedOption:option,
                });
                 console.log ('Sin Datos : Vacio');
              }
              console.log (responseData);
            }).catch((e) => {
              console.log (e);
              let rJson = JSON.stringify(e.response);
              Alert.alert('Error',rJson);
              this.setState({loadingData:false });
            });
}

formatMoney(number){
  if (number === null ){
    number = 0;
  }
  return number.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
}

renderRow(record) {
  return(
  <Row style={styles.rows}>

    <Cell width={3}><Text style={[styles.cell, {textAlign:'center'}]}>{record.ItemDescription.substring(0,20)}</Text></Cell>
    <Cell width={2}><Text style={[styles.cell, {textAlign:'right'}]}>{this.formatMoney(record.Sold)}</Text></Cell>
    <Cell width={1}><Text style={[styles.cell, {textAlign:'right'}]}>{record.QuantitySold}</Text></Cell>
    <Cell width={1}><Text style={[styles.cell, {textAlign:'center'}]}>{record.Margin === null ? 0 :record.Margin.toFixed(2)}</Text></Cell>
    <Cell width={1}><Text style={[styles.cell, {textAlign:'right'}]}>{record.QuantityOnHand === null ? 0 : record.QuantityOnHand.toFixed(0)}</Text></Cell>
    <Cell width={1}><Text style={[styles.cell, {textAlign:'right'}]}>{record.SellThru ===null ? 0 : record.SellThru.toFixed(2)}</Text></Cell>
  </Row>
);
}





sortJsonArrayByProperty(objArray, prop, direction){
  if (arguments.length<2) throw new Error("sortJsonArrayByProp requires 2 arguments");
  var direct = arguments.length>2 ? arguments[2] : 1; //Default to ascending
  let newObjArray= [];
  newObjArray.push(objArray[0]);
  let itemAdded = false;

  for (let x = 1; x< objArray.length; x++){
    let myValue = objArray[x][prop];
    itemAdded = false;
    if (objArray[x]['StoreNumber'] !='Total'){
      for (let i = 0; i< newObjArray.length; i++){
        if (newObjArray[i][prop] >= myValue) {
          newObjArray.splice(i,0,objArray[x]);
          itemAdded = true;
          break;
        }
      }
      if (!itemAdded){
        newObjArray.push(objArray[x])
      }
    }
  }
  if (direction){
    return newObjArray;
  }else{
    return newObjArray.reverse();
  }
}

onSort(ColumnName){
  let resultado = this.sortJsonArrayByProperty(this.state.myData,ColumnName, this.state.isAscending);
  let isAscending = !this.state.isAscending;
  this.setState({
    isAscending: isAscending,
    dataSource: this.state.dataSource.cloneWithRows(resultado),
    isSelected: ColumnName,
  })
  
}



renderHeader() {
  return (
      <Header style={styles.header}>
        <HeaderCell
        style={styles.headerCell}
        textStyle={styles.headerCellText}
        width={3}
        text="Producto"
        isAscending={this.state.isAscending}
        isSelected={this.state.sortBy==='ItemDescription'}
        onPress={()=>this.onSort('ItemDescription')}

        />
        <HeaderCell
        style={styles.headerCell}
        textStyle={styles.headerCellText}
        width={2}
        text="Vta($)"
        isAscending={this.state.isAscending}
        isSelected={this.state.sortBy==='Sold'}
        onPress={()=>this.onSort('Sold')}
        />
        <HeaderCell
        style={styles.headerCell}
        textStyle={styles.headerCellText}
        width={1}
        text="Vta(u)"
        isAscending={this.state.isAscending}
        isSelected={this.state.sortBy==='QuantitySold'}
        onPress={()=>this.onSort('QuantitySold')}
        />
        <HeaderCell
        style={styles.headerCell}
        textStyle={styles.headerCellText}
        width={1}
        text="Mrg%"
        isAscending={this.state.isAscending}
        isSelected={this.state.sortBy==='Margin'}
        onPress={()=>this.onSort('Margin')}
        />
        <HeaderCell
        style={styles.headerCell}
        textStyle={styles.headerCellText}
        width={1}
        text="Exist"
        isAscending={this.state.isAscending}
        isSelected={this.state.sortBy==='QuantityOnHand'}
        onPress={()=>this.onSort('QuantityOnHand')}
        />
        <HeaderCell
        style={styles.headerCell}
        textStyle={styles.headerCellText}
        width={1}
        text="% Vnd"
        isAscending={this.state.isAscending}
        isSelected={this.state.sortBy==='SellThru'}
        onPress={()=>this.onSort('SellThru')}
        />
      </Header>
  );
}

loadingAnimation(){
  return(
    <View style={[
              styles.container,
              {
                backgroundColor:'black', 
                flexDirection:'column', 
                justifyContent:'center',
                alignContent:'center',
                
              }]}>
      <Text style={{color:'white', alignSelf:'center'}}>Cargando...</Text>
    </View>
  )
}

  render(){
    if (this.state.loadingData){
       return this.loadingAnimation();
    }

    return (

      <View style={{ flex:1, flexDirection:'column', justifyContent:'flex-start', alignSelf:'stretch',backgroundColor:'black' }}>  
          <View style={{ justifyContent:'space-between', alignItems:'center', flexDirection:'row', marginLeft:10 }} >
            <TouchableHighlight  style={[styles.highlightbuttonframe,{width:250, height:30,alignSelf:'flex-start'}]} onPress={()=>{this.setState({menuVisible:true});}}>
              <View style={{flexDirection:'row' }}>
                    <Icon style={{marginLeft:4}} name="ios-calendar" size={25} color='white' />
                    <Text style={styles.highlightbuttontext}>Periodo : {this.state.selectedOption.label}</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight style={{marginRight:20, alignItems:'center', alignSelf:'flex-end'}} onPress={()=>{this.loadData(this.state.selectedOption)}}>
              <Icon name="ios-refresh" size={30} color='#2D7991' />
            </TouchableHighlight>
          </View>


        <ScrollView style={{flex:1, backgroundColor:'black'}}
              directionalLockEnabled={false}
              horizontal={true} >
         <View style={{flexDirection: 'column',backgroundColor:'black'}}>
          <DataTable
            enableEmptySections={true}
            style={[styles.container,{width:this.state.maxWidth, backgroundColor:'black'}]}
            listViewStyle={styles.listContainer}
            dataSource={this.state.dataSource}
            renderRow={this.renderRow}
            renderHeader={this.renderHeader}
          />
          </View>
        </ScrollView>
        <List onPress={this.loadData} visible={this.state.menuVisible} zIndex={99} title={'Seleccione Rango'} listOptions={myPickerOptions}/>
      </View>
    );
 }
}

Mejores100Vendidos.navigationOptions = {
  title: "Mejores 100 Vendidos",
  tintColor:'white',
  headerTintColor:'white',
  headerStyle:{backgroundColor:'black'},
  
};
//AppRegistry.registerComponent('Login', () => Login);


export default Mejores100Vendidos;
