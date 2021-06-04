let cleanShips = [

];
let cleanShips1 = [

];
let cleanShips2 = [

];
let cleanShips3 = [

];
let vesselList = [

];

function loadFileShips() {

  let files1 = document.getElementById('selectFilesShips').files;
  console.log("step1");
  
  
  if (files1.length <= 0) {
    console.log("step_end");
    return false;
  }
  
  var fr = new FileReader();
  console.log("step_2");
  
  fr.onload = function (e) {
    console.log("step_3");
    console.log(e);
    var result = JSON.parse(e.target.result);
    var formatted1 = JSON.stringify(result, null, 2);
    document.getElementById('resultShips').value = formatted1;
    cleanShips3 = result.items;

// for ready files=====
    vesselList=result;
// direct copy to the vesselList array

    //===function for working the raw files , bypassing it  for the ready file=====
    // response1 = result.items;
    //  var k;
    // for (k = 0; k < response1.length; k++) {
    //   const vessel3 = response1[k];
    //   const { userData, ...rest } = vessel3;
    //   console.log(rest)
    //   let temp1 = {};
    //   temp1.countryId = rest.country.id;
    //   temp1.countryName = rest.country.name;
    //   temp1.id = rest.id;
    //   temp1.imo = rest.imo;
    //   temp1.mmsi = rest.mmsi;
    //   temp1.vesselName = rest.name;
    //   temp1.call_sign = rest.call_sign;
    //   temp1.remarks = "";
    //   vesselList.push(temp1);
    // }
     //================================================


  };

    fr.readAsText(files1.item(0));
  
};
// using uploaded Json file from the User =======
function loadFile() {

  var files = document.getElementById('selectFiles').files;

  if (files.length <= 0) {
    return false;
  }

  var fr = new FileReader();

  fr.onload = function (e) {
    // console.log(e);
    var result = JSON.parse(e.target.result);
    var formatted = JSON.stringify(result, null, 2);
    document.getElementById('result').value = formatted;
    cleanShips1 = result.vessels;
  }

  fr.readAsText(files.item(0));
};

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
      if (key == "remarks") {

        let x1 = element.vessel;
        let x = x1.replaceAll("[^a-zA-Z_0-9-.-]+", "")

        var toSearch = x;

        for (var i = 0; i < cleanShips1.length; i++) {
          for (key in cleanShips1[i]) {

            cleanShips1[i][key] = cleanShips1[i][key].replaceAll("[^a-zA-Z_0-9-.-]+", "")

            if (cleanShips1[i][key].indexOf(toSearch) != -1) {
              let cell = row.insertCell();
              let text = document.createTextNode(cleanShips1[i].Email);
              cell.appendChild(text);
              element.remarks = element.remarks + cleanShips1[i].Email + ",";

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
  // portId = $("#ports").val();
  // carrierId=$("#ports").val();
  let offset1 = 0
  var i;
  // for (i = 0; i < carrierId.length; i++) {
  for (i = 0; i < 35; i++) {
    let carrierId = i++;

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {


      if (this.readyState == 4 && this.status == 200) {
        response2 = this.response.items;
        response1 = response2;
        var k;
        for (k = 0; k < response1.length; k++) {
          const vessel2 = response1[k];
          // const { departure, serviceDep, terminalGeoId, vesselCode, voyageArrival, voyageDeparture, ...rest } = vessel2;
          // rest.remarks = "";
          cleanShips3.push(vessel2);

        };



      };
    };

    //https://www.linescape.com/carriers/1;limit=500;offset=0

    //https://ecomm.one-line.com/ecom/CUP_HOM_3006GS.do?f_cmd=121&mod_flg=I&port_cd=USNYC&frm_dt=2021-05-29&to_dt=2021-06-24
    xhttp.open("GET", "https://www.linescape.com/carriers/" + carrierId + ";limit=500;offset=" + offset1, true);
    xhttp.send();

  };

  setTimeout(function () {
    //===table construction========
    data = Object.keys(cleanShips[0]);

    let table = document.querySelector("table");
    generateTableHead(table, data);
    generateTable(table, cleanShips);
    //========================

  }, 5000);

};
  function writeFileShips ()  {
  setTimeout(function () {
    let csvString = "data:text/csv;charset=utf-8,";
    csvString = [
      [
        "id",
        "vesselName",
        "callSign",
        "countryId",
        "countryName",
        "imo",
        "mmsi",
        "remarks",

      ],
      ...vesselList.map(item => [
        item.id,
        item.vesselName,
        item.call_sign,
        item.countryId,
        item.countryName,
        item.imo,
        item.mmsi,
        item.remarks
      ])
    ]
      .map(e => e.join(","))
      .join("\n");




    // The download function takes a CSV string, the filename and mimeType as parameters
    // Scroll/look down at the bottom of this snippet to see how download is called
    var download = function (content, fileName, mimeType) {
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


  function saveJson(text, filenameJason){
   let vesselList1 = JSON.stringify(vesselList)
   filenameJason = $("#saveJsonFileName").val();
    var a = document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-8,'+encodeURIComponent(vesselList1));
    a.setAttribute('download', filenameJason);
    a.click()
  }

  
  function matchAdresses(){


    // setTimeout(function () {
      //===table construction========
      data = Object.keys(vesselList[0]);
  
      let table = document.querySelector("table");
      generateTableHead(table, data);
      // generateTable(table, vesselList);
      //========================
  
    // }, 3000);
    
    for (let element of vesselList) {
      let row = table.insertRow();
      for (key in element) {
        let cell = row.insertCell();
        let text = document.createTextNode(element[key]);
        if (key == "remarks") {
  
          let x1 = element.vesselName;
          let x = x1.replaceAll("[^a-zA-Z_0-9-.-]+", "")
  
          var toSearch = x;
  
          for (var i = 0; i < vesselList.length; i++) {
            for (key in cleanShips1[i]) {
  
              vesselList[i][key] = cleanShips1[i][key].replaceAll("[^a-zA-Z_0-9-.-]+", "")
  
              if (cleanShips1[i][key].indexOf(toSearch) != -1) {
                let cell = row.insertCell();
                let text = document.createTextNode(cleanShips1[i].Email);
                cell.appendChild(text);
                element.remarks = element.remarks + cleanShips1[i].Email + ",";
  
              }
            }
          }
          cleanShips2.push(element);
        }
        cell.appendChild(text);






   };
  }
}