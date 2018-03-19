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
  Picker,
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
import ApiUtils from './../../utils/ApiUtils';
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

class VentasPorTienda extends React.Component {

constructor(props) {
  super(props);
  const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
  this.state = {
    textInputValue:'Seleccione Periodo',
    myFilter:'semP',
    myData:{},
    dataSource: ds,
    login_url: '',
    login_token:'',
    loadingData:false,
    maxWidth:700,
    menuVisible:false,
    selectedOption:myPickerOptions[0],
 };


  this.renderRow          = this.renderRow.bind(this);
  this.renderHeader       = this.renderHeader.bind(this);
  this.loadData           = this.loadData.bind(this);
  this.calculaSubTotales  = this.calculaSubTotales.bind(this);
  this.loadingAnimation   = this.loadingAnimation.bind(this);
  this.formatMoney        = this.formatMoney.bind(this);
  this.handleDimensionEvents = this.handleDimensionEvents.bind(this);
  this.onSort             = this.onSort.bind(this);
  
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
calculaSubTotales(recordSet){
   let newJson = [];
  if (!recordSet.length){
    return null;
  }
   let lastStore     = recordSet[0].StoreNumber;

   let granTotal  ={'StoreNumber':'Total',
                  'SalesAmount': 0,
                  'SalesQuantity': 0,
                  'Profit': 0,
                  'Margin': 0,
                  'AvgSalePerTransaction': 0,
                  'UnitsPerTransaction': 0,
                  'LastYearSales': 0,
                  'StoreCounter': 0,
                };
  for (var i=0;i<recordSet.length;i++) {

         granTotal.SalesAmount = granTotal.SalesAmount +  recordSet[i].SalesAmount;
         granTotal.SalesQuantity = granTotal.SalesQuantity +  recordSet[i].SalesQuantity;
         granTotal.Profit = granTotal.Profit +  recordSet[i].Profit;
         granTotal.Margin = granTotal.Margin +  recordSet[i].Margin;
         granTotal.AvgSalePerTransaction = granTotal.AvgSalePerTransaction +  recordSet[i].AvgSalePerTransaction;
         granTotal.UnitsPerTransaction = granTotal.UnitsPerTransaction +  recordSet[i].UnitsPerTransaction
         granTotal.LastYearSales = granTotal.LastYearSales +  recordSet[i].LastYearSales;
  }
  recordSet.push (granTotal);

 console.log(recordSet);
  return recordSet;
}


loadData(option){

  this.setState({loadingData:true});
  let full_url = this.state.login_url + '/api/reports/sales_by_store/' + option.key;
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
                    dataSource: this.state.dataSource.cloneWithRows(this.calculaSubTotales(responseData)),
                  });
              }else {
                  this.setState({
                    myData: [],
                    dataSource: this.state.dataSource.cloneWithRows(responseData),
                  });
              }
              this.setState({
                menuVisible:false,
                loadingData:false,
                selectedOption:option,

              });
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
  if (record.StoreNumber === 'Total'){
    return(
      <Row style={styles.rows}>

        <Cell width={1}><Text style={[styles.cell,{textAlign:'left',backgroundColor:"rgb(74,144,226)"}]}>{record.StoreNumber}</Text></Cell>
        <Cell width={2}><Text style={[styles.cell,{textAlign:'right',backgroundColor:"rgb(74,144,226)"}]}>{this.formatMoney(record.SalesAmount)}</Text></Cell>
        <Cell width={1}><Text style={[styles.cell,{textAlign:'right',backgroundColor:"rgb(74,144,226)"}]}>{record.SalesQuantity}</Text></Cell>
        <Cell width={2}><Text style={[styles.cell,{textAlign:'right',backgroundColor:"rgb(74,144,226)"}]}>{this.formatMoney(record.Profit)}</Text></Cell>
        <Cell width={1}><Text style={[styles.cell,{textAlign:'center',backgroundColor:"rgb(74,144,226)"}]}>{record.Margin === null ? 0 :record.Margin.toFixed(0)}</Text></Cell>
        <Cell width={2}><Text style={[styles.cell,{textAlign:'right',backgroundColor:"rgb(74,144,226)"}]}>{this.formatMoney(record.AvgSalePerTransaction)}</Text></Cell>
        <Cell width={2}><Text style={[styles.cell,{textAlign:'right',backgroundColor:"rgb(74,144,226)"}]}>{record.UnitsPerTransaction=== null ? 0 : record.UnitsPerTransaction.toFixed(2)}</Text></Cell>
        <Cell width={2}><Text style={[styles.cell,{textAlign:'right',backgroundColor:"rgb(74,144,226)"}]}>{this.formatMoney(record.LastYearSales)}</Text></Cell>
       </Row>

    )
  }
  else{
  return(
  <Row style={styles.rows}>
    <Cell width={1}><Text style={[styles.cell,{textAlign:'left'}]}>{record.StoreNumber}</Text></Cell>
    <Cell width={2}><Text style={[styles.cell,{textAlign:'right'}]}>{this.formatMoney(record.SalesAmount)}</Text></Cell>
    <Cell width={1}><Text style={[styles.cell,{textAlign:'right'}]}>{record.SalesQuantity}</Text></Cell>
    <Cell width={2}><Text style={[styles.cell,{textAlign:'right'}]}>{this.formatMoney(record.Profit)}</Text></Cell>
    <Cell width={1}><Text style={[styles.cell,{textAlign:'center'}]}>{record.Margin === null ? 0 :record.Margin.toFixed(0)}</Text></Cell>
    <Cell width={2}><Text style={[styles.cell,{textAlign:'right'}]}>{this.formatMoney(record.AvgSalePerTransaction)}</Text></Cell>
    <Cell width={2}><Text style={[styles.cell,{textAlign:'right'}]}>{record.UnitsPerTransaction=== null ? 0 : record.UnitsPerTransaction.toFixed(2)}</Text></Cell>
    <Cell width={2}><Text style={[styles.cell,{textAlign:'right'}]}>{this.formatMoney(record.LastYearSales)}</Text></Cell>
  </Row>

);
 }
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
    dataSource: this.state.dataSource.cloneWithRows(this.calculaSubTotales(resultado)),
    isSelected: ColumnName,
  })
  
}


renderHeader() {
  return (
      <Header style={styles.header}>
        <HeaderCell
        style={styles.headerCell}
        textStyle={styles.headerCellText}
        width={1}
        text="Tda"
        isAscending={this.state.isAscending}
        isSelected={this.state.sortBy==='StoreNumber'}
        onPress={()=>this.onSort('StoreNumber')}
        />
        <HeaderCell
        style={styles.headerCell}
        textStyle={styles.headerCellText}
        width={2}
        text="Vta($)"
        isAscending={this.state.isAscending}
        isSelected={this.state.sortBy==='SalesAmount'}
        onPress={()=>this.onSort('SalesAmount')}
        />
        <HeaderCell
        style={styles.headerCell}
        textStyle={styles.headerCellText}
        width={1}
        text="Vta(u)"
        isAscending={this.state.isAscending}
        isSelected={this.state.sortBy==='SalesQuantity'}
        onPress={()=>this.onSort('SalesQuantity')}
        />
        <HeaderCell
        style={styles.headerCell}
        textStyle={styles.headerCellText}
        width={2}
        text="Ut($)"
        isAscending={this.state.isAscending}
        isSelected={this.state.sortBy==='Profit'}
        onPress={()=>this.onSort('Profit')}
        />
        <HeaderCell
        style={styles.headerCell}
        textStyle={styles.headerCellText}
        width={1}
        text="Mrg(%)"
        isAscending={this.state.isAscending}
        isSelected={this.state.sortBy==='Margin'}
        onPress={()=>this.onSort('Margin')}
        />
        <HeaderCell
        style={styles.headerCell}
        textStyle={styles.headerCellText}
        width={2}
        text="Tk Prm($)"
        isAscending={this.state.isAscending}
        isSelected={this.state.sortBy==='AvgSalePerTransaction'}
        onPress={()=>this.onSort('AvgSalePerTransaction')}
        />
        <HeaderCell
        style={styles.headerCell}
        textStyle={styles.headerCellText}
        width={2}
        text="Tk Prm(U)"
        isAscending={this.state.isAscending}
        isSelected={this.state.sortBy==='UnitsPerTransaction'}
        onPress={()=>this.onSort('UnitsPerTransaction')}
        />
        <HeaderCell
        style={styles.headerCell}
        textStyle={styles.headerCellText}
        width={2}
        text="Año P($)"
        isAscending={this.state.isAscending}
        isSelected={this.state.sortBy==='LastYearSales'}
        onPress={()=>this.onSort('LastYearSales')}
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
          <List onPress={this.loadData} visible={this.state.menuVisible} zIndex={99} listOptions={myPickerOptions}/>
      </View>
    );
 }
}

VentasPorTienda.navigationOptions = {
  title: "Ventas por Tienda",
  tintColor:'white',
  headerTintColor:'white',
  headerStyle:{backgroundColor:'black'},
};


export default VentasPorTienda;
