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
import ApiUtils        from './../../utils/ApiUtils';
import List            from '../components/List.js';
const styles =      require ('./../../css/global');

const myPickerOptions=[
    {id:0,key:'today', label:'Hoy'},
    {id:1,key:'yesterday', label:'Ayer'},
    {id:2,key:'week_to_date', label:'Semana Actual'},
    {id:3,key:'last_week', label:'Semana Pasada'},
    {id:4,key:'month_to_date', label:'Mes Actual'},
    {id:5,key:'last_month', label:'Mes Pasado'},
    {id:6,key:'year_to_date', label:'Año Actual'},
  ];

class KPI extends React.Component {

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
    sortBy:'',
    isAscending:false,
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
                  'Receipts': 0,
                  'Units': 0,
                  'Sales': 0,
                  'ADS': 0,
                  'AUR': 0,
                  'UPT': 0,
                };
  for (var i=0;i<recordSet.length;i++) {

         granTotal.Receipts = granTotal.Receipts +  recordSet[i].Receipts;
         granTotal.Units = granTotal.Units +  recordSet[i].Units;
         granTotal.Sales = granTotal.Sales +  recordSet[i].Sales;
         granTotal.ADS = granTotal.ADS +  recordSet[i].ADS;
         granTotal.AUR = granTotal.AUR +  recordSet[i].AUR;
         granTotal.UPT = granTotal.UPT +  recordSet[i].UPT;
  }
 granTotal.ADS = granTotal.ADS / recordSet.length;
 granTotal.AUR = granTotal.AUR / recordSet.length;
 granTotal.UPT = granTotal.UPT / recordSet.length;

  recordSet.push (granTotal);

 console.log(recordSet);
  return recordSet;
}


loadData(option){

  this.setState({loadingData:true});
  let full_url = this.state.login_url + '/api/reports/kpi/' + option.key;
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
            console.log('Response Data :');
            console.log(responseData);
              if (responseData.length){
                this.setState({
                  myData: responseData,
                  dataSource: this.state.dataSource.cloneWithRows(this.calculaSubTotales(responseData)),
                });
              }else{

                this.setState({
                  myData: [],
                  dataSource: this.state.dataSource.cloneWithRows([]),
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
              Alert.alert('Error on loadData',rJson);
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
        <Cell width={1}><Text style={[styles.cell,{textAlign:'right',backgroundColor:"rgb(74,144,226)"}]}>{record.Receipts}</Text></Cell>
        <Cell width={1}><Text style={[styles.cell,{textAlign:'right',backgroundColor:"rgb(74,144,226)"}]}>{record.Units}</Text></Cell>
        <Cell width={1}><Text style={[styles.cell,{textAlign:'right',backgroundColor:"rgb(74,144,226)"}]}>{this.formatMoney(record.Sales)}</Text></Cell>
        <Cell width={1}><Text style={[styles.cell,{textAlign:'right',backgroundColor:"rgb(74,144,226)"}]}>{this.formatMoney(record.ADS)}</Text></Cell>
        <Cell width={1}><Text style={[styles.cell,{textAlign:'right',backgroundColor:"rgb(74,144,226)"}]}>{this.formatMoney(record.AUR)}</Text></Cell>
        <Cell width={1}><Text style={[styles.cell,{textAlign:'right',backgroundColor:"rgb(74,144,226)"}]}>{this.formatMoney(record.UPT)}</Text></Cell>
       </Row>

    )
  }
  else{
  return(
  <Row style={styles.rows}>
    <Cell width={1}><Text style={[styles.cell,{textAlign:'left'}]}>{record.StoreNumber}</Text></Cell>
    <Cell width={1}><Text style={[styles.cell,{textAlign:'right'}]}>{record.Receipts}</Text></Cell>
    <Cell width={1}><Text style={[styles.cell,{textAlign:'right'}]}>{record.Units}</Text></Cell>
    <Cell width={1}><Text style={[styles.cell,{textAlign:'right'}]}>{this.formatMoney(record.Sales)}</Text></Cell>
    <Cell width={1}><Text style={[styles.cell,{textAlign:'right'}]}>{this.formatMoney(record.ADS)}</Text></Cell>
    <Cell width={1}><Text style={[styles.cell,{textAlign:'right'}]}>{this.formatMoney(record.AUR)}</Text></Cell>
    <Cell width={1}><Text style={[styles.cell,{textAlign:'right'}]}>{this.formatMoney(record.UPT)}</Text></Cell>
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
        width={1}
        text="Notas"
        isAscending={this.state.isAscending}
        isSelected={this.state.sortBy==='Receipts'}
        onPress={()=>this.onSort('Receipts')}
        />
        <HeaderCell
        style={styles.headerCell}
        textStyle={styles.headerCellText}
        width={1}
        text="Unidades"
        isAscending={this.state.isAscending}
        isSelected={this.state.sortBy==='Units'}
        onPress={()=>this.onSort('Units')}
        />
        <HeaderCell
        style={styles.headerCell}
        textStyle={styles.headerCellText}
        width={1}
        text="Vta($)"
        isAscending={this.state.isAscending}
        isSelected={this.state.sortBy==='Sales'}
        onPress={()=>this.onSort('Sales')}

        />
        <HeaderCell
        style={styles.headerCell}
        textStyle={styles.headerCellText}
        width={1}
        text="VPxNt"
        isAscending={this.state.isAscending}
        isSelected={this.state.sortBy==='ADS'}
        onPress={()=>this.onSort('ADS')}
        />
        <HeaderCell
        style={styles.headerCell}
        textStyle={styles.headerCellText}
        width={1}
        text="PrP"
        isAscending={this.state.isAscending}
        isSelected={this.state.sortBy==='ADR'}
        onPress={()=>this.onSort('ADR')}
        />
        <HeaderCell
        style={styles.headerCell}
        textStyle={styles.headerCellText}
        width={1}
        text="UxNt"
        isAscending={this.state.isAscending}
        isSelected={this.state.sortBy==='UPT'}
        onPress={()=>this.onSort('UPT')}
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

KPI.navigationOptions = {
  title: "KPI",
  tintColor:'white',
  headerTintColor:'white',
  headerStyle:{backgroundColor:'black'},
};

export default KPI;
