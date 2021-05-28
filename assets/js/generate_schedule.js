let cleanShips = [ 
  
];
// https://api.maerskline.com/maeu/schedules/port?portGeoId=02R2IYUF20M7Z&fromDate=2021-05-28&toDate=2021-07-31


// var data={};

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





// function displayShow() {
//     console.log("dudu");

// }
var dateFrom = "";
var dateTo = "";
var portid = "";

var response2;
var response1 = {};
// generateTableHead(table, data);
// generateTable(table, response1);



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

      // let portId="02R2IYUF20M7Z"
      // $("#button1").click(function(){
      // testPortId = "02R2IYUF20M7Z";





      if (this.readyState == 4 && this.status == 200) {
        response2 = JSON.parse(this.response).vessels;
        console.log(response2);
        response1 = response2;

        //=======module for adding the json on the screen=====
        // let area = document.getElementById("demo");
        // var node = document.createElement("LI");
        // var textnode = document.createTextNode(this.responseText);
   
        // node.appendChild(textnode);
        // area.appendChild(node);


        console.log(response1);
        console.log("ok till here");
var k; 
for (k=0;k<response1.length;k++){
  const vessel2 = response1[k];
  const {departure,serviceDep,terminalGeoId,vesselCode,voyageArrival,voyageDeparture, ...rest} = vessel2;
  console.log(rest);
  cleanShips.push(rest)

};

        
  
      };
    };
    // console.log(table);






    console.log(response1);
    xhttp.open("GET", "https://api.maerskline.com/maeu/schedules/port?portGeoId=" + portId[i] + "&fromDate=" + dateFrom + "&toDate=" + dateTo, true);
    xhttp.send();

  };
  // console.log(this.response);
  // response1 = response2
  setTimeout(function(){ 
      //===table construction========
        data = Object.keys(cleanShips[0]);
      console.log(data);
      let table = document.querySelector("table");
      generateTableHead(table, data);
      generateTable(table, cleanShips);
      //========================
  
  }, 4000);
};




  // table = document.querySelector("table");
  // data = Object.keys(response1[0]);








  // };

  // });











// var inputSearch = document.getElementById("mySearch");
// inputSearch.onkeydown= function () { displayShow};
