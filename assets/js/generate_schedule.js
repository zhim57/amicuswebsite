let cleanShips = [

];

function generateTableHead(table, data) {
  let thead = table.createTHead();
  let row = thead.insertRow();
  for (let key of data) {
    let th = document.createElement("th");
    let text = document.createTextNode(key);
    th.appendChild(text);
    row.appendChild(th);
  }
};

function generateTable(table, data) {
  for (let element of data) {
    let row = table.insertRow();
    for (key in element) {
      let cell = row.insertCell();
      let text = document.createTextNode(element[key]);
      cell.appendChild(text);
    }
  }
}


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
          // console.log(rest);
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
    console.log(data);
    let table = document.querySelector("table");
    generateTableHead(table, data);
    generateTable(table, cleanShips);
    //========================

  }, 4000);
};

