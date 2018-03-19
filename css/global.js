'use strict'

import {
  StyleSheet,
 } from 'react-native';



module.exports = StyleSheet.create({
container: {
  flex: 1,
  borderColor: "black",
  backgroundColor: "white",

},listContainer: {
  flex: 1,
  borderColor: "black",
  backgroundColor: "white",

},
header: {
  marginTop:5,
  backgroundColor: '#5E5E5E',
},
headerCell:{
  borderWidth:1,
  alignContent:"center",

},
headerCellText:{
  color:"white",
  fontSize: 12,
  textAlign:"center",
  width:"90%",
  backgroundColor: "rgba(200,196,196,0.23)",

},
rows: {

},
  center:{
    textAlign:"center",
  },
  left:{
    textAlign:"left",
  },
  right:{
    textAlign:"right",
  },
  cell:{
    fontSize: 12,
  borderWidth:1,
  color:"rgb(0,0,0)",
  backgroundColor: "rgb(210,210,210)",
},
texttotal:{
  backgroundColor:"#F9610B",
},
menu:{
  flex:1,
  alignContent:"center",
  alignItems:'center',
  justifyContent:'center',
  backgroundColor:"#9eb1c1",
  padding:10,
  marginBottom:2,
  marginTop:2,
  marginLeft:5,
  marginRight:5,
  borderRadius:4,
},
highlightbuttonframe:{
  alignContent:'center',
  justifyContent:'center',
  marginBottom:5,
  width:'75%',
  height:40,
  borderRadius:6,
  backgroundColor:"#2D7991"},
highlightbuttonframeyellow:{
    marginBottom:5,
    width:'75%',
    borderRadius:6,
    backgroundColor:"#851219"},
highlightbuttontext:{
  marginLeft:5,
  marginRight:5,
  color:'#000000',
  padding:5,
  textAlign:'center',
},
textInput: {
  fontSize: 14,
  textAlign: "left",
  width:250,
  borderBottomWidth:1,
  backgroundColor:"#dbdde0",
  height:40,

},


});
