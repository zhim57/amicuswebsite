// $( document ).ready(function() {
//   console.log( "ready!" );




let cleanShips = [

];
let cleanShips1 = [

];
let cleanShips2 = [

];

// using uploaded Json file from the User =======

// document.getElementById('import').onclick = function() {
 function loadFile() {
   console.log("hellooo?");
  var files = document.getElementById('selectFiles').files;

  // var files = $("#selectFiles").files;
 
console.log(files);
if (files.length <= 0) {
  return false;
}

var fr = new FileReader();

fr.onload = function(e) { 
console.log(e);
  var result = JSON.parse(e.target.result);
  var formatted = JSON.stringify(result, null, 2);
      document.getElementById('result').value = formatted;
      cleanShips1=result.vessels;
      console.log(cleanShips1);
}

fr.readAsText(files.item(0));
};

//===================================

//====== using JSON from file in assets=======
// setTimeout(function () {
// $.getJSON("./assets/js/vesselja.json", function(json) {
// cleanShips1=json.vessels;
// console.log(cleanShips1);
// });
// }, 700);

//================




function generateTableHead(table, data) {
  let thead = table.createTHead();
  let row = thead.insertRow();
  for (let key of data) {
    let th = document.createElement("th");
    let text = document.createTextNode(key);
    th.appendChild(text);
    row.appendChild(th);
  }
  // let th = document.createElement("th");
  // let text = document.createTextNode("remarks");
  // th.appendChild(text);
  //   row.appendChild(th);
};

function generateTable(table, data) {
  for (let element of data) {
    let row = table.insertRow();
    for (key in element) {
      let cell = row.insertCell();
      let text = document.createTextNode(element[key]);
      if(key =="remarks"){

        let x1 = element.vessel;
        console.log(x1);
        let x = x1.replaceAll("[^a-zA-Z_0-9-.-]+", "")
        
        var toSearch = x;
        
        for(var i=0; i<cleanShips1.length; i++) {
          for(key in cleanShips1[i]) {

            cleanShips1[i][key]= cleanShips1[i][key].replaceAll("[^a-zA-Z_0-9-.-]+", "")

            if(cleanShips1[i][key].indexOf(toSearch)!=-1) {
              // results.push(cleanShips1[i].Email);
              let cell = row.insertCell();
              let text = document.createTextNode(cleanShips1[i].Email);
              cell.appendChild(text);
              element.remarks= element.remarks+cleanShips1[i].Email+",";
              
            }
          }
        }
        cleanShips2.push(element);
      }
      cell.appendChild(text);

      
     
      
    }
  }
}

// });
var dateFrom = "";
var dateTo = "";
var portid = "";
var response2;
var response1 = {};


function loadDoc() {
  response1 = {};
  dateFrom = $("#fromDate").val();
  dateTo = $("#toDate").val();
  portId = $("#ports").val();

  console.log(dateFrom);
  console.log(dateTo);
  console.log(portId);
  var i;
  for (i = 0; i < portId.length; i++) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {


      if (this.readyState == 4 && this.status == 200) {
        response2 = JSON.parse(this.response).vessels;
        response1 = response2;

        //=======module for adding the json on the screen=====
        // let area = document.getElementById("demo");
        // var node = document.createElement("LI");
        // var textnode = document.createTextNode(this.responseText);
        // node.appendChild(textnode);
        // area.appendChild(node);
        //===================
        var k;
        for (k = 0; k < response1.length; k++) {
          const vessel2 = response1[k];
          const { departure, serviceDep, terminalGeoId, vesselCode, voyageArrival, voyageDeparture, ...rest } = vessel2;
          rest.remarks ="";
          console.log(rest);
          cleanShips.push(rest);

        };



      };
    };
    
     xhttp.open("GET", "https://api.maerskline.com/maeu/schedules/port?portGeoId=" + portId[i] + "&fromDate=" + dateFrom + "&toDate=" + dateTo, true);
    xhttp.send();

  };

  setTimeout(function () {
    //===table construction========
    data = Object.keys(cleanShips[0]);
    // console.log(data);
    let table = document.querySelector("table");
    generateTableHead(table, data);
    generateTable(table, cleanShips);
    //========================

  }, 5000);


 // vessel: "SANTA LINEA", terminal: "Wilmington Container Terminal L194", arrival: "2021-06-06T08:00:00Z", serviceArr: "750"}

  setTimeout(function () {
    let csvString = "data:text/csv;charset=utf-8,";
  csvString = [
    [
      "Vessel",
      "Terminal",
      "Arrival",
      "Arr Service",
      "Email"

    ],
    ...cleanShips2.map(item => [
      item.vessel,
      item.terminal,
      item.arrival.toLocaleString(),
      item.serviceArr,
      item.remarks
    ])
  ]
   .map(e => e.join(",")) 
   .join("\n");
 

console.log(csvString);
/*
  "Item ID,Item Reference
  1,Item 001
  2,Item 002
  3,Item 003"
*/
// The download function takes a CSV string, the filename and mimeType as parameters
// Scroll/look down at the bottom of this snippet to see how download is called
var download = function(content, fileName, mimeType) {
  var a = document.createElement('a');
  mimeType = mimeType || 'application/octet-stream';

  if (navigator.msSaveBlob) { // IE10
    navigator.msSaveBlob(new Blob([content], {
      type: mimeType
    }), fileName);
  } else if (URL && 'download' in a) { //html5 A[download]
    a.href = URL.createObjectURL(new Blob([content], {
      type: mimeType
    }));
    a.setAttribute('download', fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
  }
}

download(csvString, 'download.csv', 'text/csv;encoding:utf-8');

}, 6000);
};

