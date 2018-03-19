
import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  Button,
  Dimensions,
  ScrollView,
  Alert,
  AsyncStorage,
  TouchableHighlight,
} from "react-native";
import { StockLine } from 'react-native-pathjs-charts'


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



const chartData = [
      [{
        "x": 0,
        "y": 47782
      },
    ],
    ]


const myColorPallete =   [
    {'r':25,'g':99,'b':201},
    {'r':24,'g':175,'b':35},
    {'r':190,'g':31,'b':69},
    {'r':100,'g':36,'b':199},
    {'r':214,'g':207,'b':32},
    {'r':198,'g':84,'b':45},
    {'r':220,'g':220,'b':220},
    {'r':255,'g':218,'b':185},
    {'r':175,'g':238,'b':238},
    {'r':255,'g':228,'b':181},
    {'r':147,'g':112,'b':219},
    {'r':152,'g':251,'b':152},
    {'r':255,'g':20,'b':147},
    {'r':47,'g':79,'b':79},
    {'r':0,'g':0,'b':255},
    {'r':221,'g':160,'b':221},
    {'r':255,'g':255,'b':0},
    {'r':255,'g':165,'b':0},
    {'r':0,'g':128,'b':0},
  ];

const myPickerOptions=[
  {id:0,key:'today', label:'Hoy'},
  {id:1,key:'yesterday', label:'Ayer'},
  {id:2,key:'week_to_date', label:'Semana Actual'},
  {id:3,key:'last_week', label:'Semana Pasada'},
  {id:4,key:'month_to_date', label:'Mes Actual'},
  {id:5,key:'last_month', label:'Mes Pasado'},
  {id:6,key:'year_to_date', label:'Año Actual'},
];


class VentasPorHora extends React.Component {


  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    let dims = Dimensions.get('window');
    let maxWidth = dims.width;

    this.state = {
      myData:{},
      dataSource: ds,
      login_url: '',
      login_token:'',
      loadingData:false,
      maxWidth:maxWidth-40,
      menuVisible:false,
      selectedOption:myPickerOptions[0],
      chartData:chartData,
      tableDataSource:{},
      StoreNumber:'',

    };
    this.handleDimensionEvents  = this.handleDimensionEvents.bind(this);
    this.loadData               = this.loadData.bind(this);
    this.createSeries           = this.createSeries.bind(this);
    this.renderRow              = this.renderRow.bind(this);
    this.renderHeader           = this.renderHeader.bind(this);

    this.createTableData        = this.createTableData.bind(this);
    this.formatMoney            = this.formatMoney.bind(this);
    this.onSort                 = this.onSort.bind(this);
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
  let maxWidth = dims.width;
  this.setState({
    maxWidth: maxWidth,
  });
}

createSeries(recordSet){
  let newJson   = [];
  let storeJson = [];
  let nodo      = {};
  let lastStore     = recordSet[0].StoreNumber;
  let storeIndex    = 0;


  if (this.state.StoreNumber == '*suma*'){
    return this.createSeriesSumarize (recordSet);
  }

  console.log ('StoreNumber = ' + this.state.StoreNumber);
  for (var i=0;i<recordSet.length;i++) {
    if (this.state.StoreNumber =='' || (this.state.StoreNumber != '' && this.state.StoreNumber == recordSet[i].StoreNumber))
    {
      if (lastStore != recordSet[i].StoreNumber){
        if (storeJson.length > 0){
          newJson.push(storeJson);
        }
        storeIndex = storeIndex + 1;
        storeJson = [];
        console.log(storeJson);
        lastStore = recordSet[i].StoreNumber;
      }
      nodo = {};
      let myHour = recordSet[i].Hour.length==4 ? recordSet[i].Hour.substring(0,1):recordSet[i].Hour.substring(0,2);
      nodo.x = isNaN(myHour) ? 0: Number(myHour);
      nodo.y = isNaN(recordSet[i].Sold) ? 0 : Number(recordSet[i].Sold);
      storeJson.push(nodo);
    }
  }
  if (storeJson.length > 0){
    newJson.push(storeJson);
  }
  console.log('Finish createSeries');
  console.log(storeJson);
  return newJson;
}

createSeriesSumarize(recordSet){
  let newJson   = [];
  let storeJson = [];
  let nodo = {};
  let tempResult = [];
  console.log ('Summarize StoreNumber = ' + this.state.StoreNumber);

  for (var i=0; i<24;i++){
    nodo = {x:i,y:0}
    storeJson.push(nodo);
  }
  console.log('summarize clean array');
  console.log(storeJson);
  for (var i=0;i<recordSet.length;i++) {
    let myHour = recordSet[i].Hour.length==4 ? recordSet[i].Hour.substring(0,1):recordSet[i].Hour.substring(0,2);

    storeJson[myHour].y = storeJson[myHour].y + recordSet[i].Sold;
  }

  newJson.push(storeJson);
  console.log('Summarize');
  console.log(newJson);
  return newJson;
}

createTableData(recordSet){
  let newJson   = [];
  let nodo  = {};
  nodo.totalSale = 0;
  let lastStore     = recordSet[0].StoreNumber;
  let storeIndex    = 0;
  console.log ('createTableData StoreNumber = ' + this.state.StoreNumber);
  for (var i=0;i<recordSet.length;i++) {
      nodo.storeIndex = storeIndex;
      if (lastStore != recordSet[i].StoreNumber){

        newJson.push(nodo);
 
        storeIndex = storeIndex + 1;
        lastStore = recordSet[i].StoreNumber;
        nodo = {};
        nodo.totalSale = 0;
      }

      nodo.StoreNumber = recordSet[i].StoreNumber;
      nodo.lowSale = recordSet[i].Sold;
      nodo.topSale = recordSet[i].Sold;
      nodo.totalSale = nodo.totalSale + recordSet[i].Sold;
      nodo.hour      =  recordSet[i].Hour;
    }
  if (nodo.StoreNumber.length > 0){
    newJson.push(nodo);
  }
  console.log('Create Data for Table  :');
  console.log(newJson);
  return newJson;

}


loadData(option){

  this.setState({loadingData:true,
                    menuVisible:false,
                   });

  console.log('en loadData: ' + option);

  let full_url = this.state.login_url + '/api/reports/sales_by_time/' + option.key;
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
                  loadingData:false,
                  menuVisible:false,
                  selectedOption:option,
                  myData: this.createTableData(responseData),
                  chartData:this.createSeries(responseData),
                  dataSource: this.state.dataSource.cloneWithRows(this.createTableData(responseData)),
                 });
                 console.log ('loadData Con Datos : '+ responseData);

              }
              else
              {
                this.setState({
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
          this.setState({loadingData:false,menuVisible:false, });
        }).done;

}

formatMoney(x){
  if (x === null|| isNaN(x)){
    x = 0;
  }

  return x.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
}

selectStore(StoreNumber){
  this.setState({StoreNumber:StoreNumber});
  this.loadData(this.state.selectedOption);
}


renderRow(record) {
  return(
  <Row style={styles.rows}>

    <Cell width={1}><TouchableHighlight onPress={()=> this.selectStore(record.StoreNumber)}><Text style={[styles.cell, {textAlign:'center'}]}>{record.StoreNumber}</Text></TouchableHighlight></Cell>
    <Cell width={1}><Text style={[styles.cell, {textAlign:'right'}]}>{this.formatMoney(record.totalSale)}</Text></Cell>
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
        text="Total"
        isAscending={this.state.isAscending}
        isSelected={this.state.sortBy==='totalSale'}
        onPress={()=>this.onSort('totalSale')}
        />
      </Header>
  );
}

  render(){
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
        <Text >Tienda Seleccionada : {this.state.StoreNumber!= '' ? this.state.StoreNumber == '*suma*'? 'Concentrado': this.state.StoreNumber : 'Todas'} </Text>

      <ScrollView style={{ height:"100%", backgroundColor:'black'}}
          directionalLockEnabled={false}
          horizontal={false} >
          <View style={{flexDirection: 'column', borderWidth:1, alignItems:'center', backgroundColor:'black'}}>
              <ScrollView
                  directionalLockEnabled={true}
                  horizontal={true} >
                  <StockLine
                  showAreas={true}
                  data={this.state.chartData}
                  pallete={myColorPallete}
                  options={{
                    width: this.state.maxWidth,
                    height: 150,
                    color: '#0000FF',
                    margin: {
                      top: 10,
                      left: 35,
                      bottom: 30,
                      right: 10
                    },
                    animate: {
                      type: 'slide',
                      duration: 200
                    },
                    axisX: {
                      showAxis: true,
                      showLines: true,
                      showLabels: true,
                      showTicks: true,
                      zeroAxis: false,
                      orient: 'bottom',
                      tickValues: [
                        {value:0},
                        {value:2},
                        {value:4},
                        {value:6},
                        {value:8},
                        {value:10},
                        {value:12},
                        {value:14},
                        {value:16},
                        {value:18},
                        {value:20},
                        {value:22},
                        {value:24},
                      ],
                      label: {
                        fontFamily: 'Arial',
                        fontSize: 8,
                        fontWeight: true,
                        color:'white',
                      }
                    },
                    axisY: {
                      showAxis: true,
                      showLines: true,
                      showLabels: true,
                      showTicks: true,
                      zeroAxis: false,
                      orient: 'left',
                      tickValues: [],
                      label: {
                        fontFamily: 'Arial',
                        fontSize: 8,
                        fontWeight: true,
                        color:'white',
                      }
                    }
                  }} xKey='x' yKey='y' />
              </ScrollView>


              <DataTable
                enableEmptySections={true}
                style={[styles.container,{width:this.state.maxWidth, backgroundColor:'black'}]}
                listViewStyle={styles.listContainer}
                dataSource={this.state.dataSource}
                renderRow={this.renderRow}
                renderHeader={this.renderHeader}
              />
              <View style={{flexDirection: 'row', padding:5, justifyContent:'space-around'}}>
                <TouchableHighlight onPress={() => this.selectStore('')} style={[styles.highlightbuttonframe,{width:130, marginLeft:5, marginRight:5}]}>
                   <Text style={styles.highlightbuttontext}>Grafica Todas</Text>
                </TouchableHighlight>
                <TouchableHighlight onPress={() => this.selectStore('*suma*')} style={[styles.highlightbuttonframe,{width:130}]}>
                   <Text style={styles.highlightbuttontext}>Concentrado</Text>
                </TouchableHighlight>
              </View>
          </View>
      </ScrollView>
      <List onPress={this.loadData} visible={this.state.menuVisible} zIndex={99} title={'Seleccione Rango'} listOptions={myPickerOptions}/>
      </View>
    );
 }
}

VentasPorHora.navigationOptions = {
  title: "Ventas por Hora",
  tintColor:'white',
  headerTintColor:'white',
  headerStyle:{backgroundColor:'black'},
};
//AppRegistry.registerComponent('Login', () => Login);


export default VentasPorHora;
