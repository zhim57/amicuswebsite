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
let jsonArray = [

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
        vesselList = result;
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
        cleanShips1 = result;
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
                let x = x1.replaceAll("[^a-zA-Z_0-9-.-]+", "").toLowerCase().trim();

                var toSearch = x;
                console.log(x);


                for (var i = 0; i < cleanShips1.length; i++) {
                    for (key in cleanShips1[i]) {


                        cleanShips1[i][key] = cleanShips1[i][key].replaceAll("[^a-zA-Z_0-9-.-]+", "").toLowerCase().trim();

                        if (cleanShips1[i][key].indexOf(toSearch) != -1) {
                            let cell = row.insertCell();

                            let text = document.createTextNode(cleanShips1[i].email);
                            console.log(text);
                            cell.appendChild(text);
                            element.remarks = element.remarks + ","+ cleanShips1[i].email ;

                        }
                    }
                }
                cleanShips2.push(element);
            }
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

  var i;
  for (i = 0; i < portId.length; i++) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {


      if (this.readyState == 4 && this.status == 200) {
        response2 = JSON.parse(this.response).vessels;
        response1 = response2;
        var k;
        for (k = 0; k < response1.length; k++) {
          const vessel2 = response1[k];
          const { departure, serviceDep, terminalGeoId, vesselCode, voyageArrival, voyageDeparture, ...rest } = vessel2;
          rest.remarks = "";
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
    
    let table = document.querySelector("table");
    generateTableHead(table, data);
    generateTable(table, cleanShips);
    //========================

  }, 5000);


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



function saveJson(text, filenameJason) {
    // let vesselList1 = JSON.stringify(vesselList)
    // filenameJason = $("#saveJsonFileName").val();
    var a = document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    a.setAttribute('download', filenameJason);
    a.click()
}


function matchAdresses() {


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


var c2;
var c3;
var ok;
var gd;
var gE;
var shortAdresses = [];
function loadFileForJason() {
    // prepareArrays();
    //Reference the FileUpload element.
    var fileUpload = document.getElementById("selectFileForJason");

    //Validate whether File is valid Excel file.
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
    if (regex.test(fileUpload.value.toLowerCase())) {
        if (typeof FileReader != "undefined") {
            var reader = new FileReader();

            //For Browsers other than IE.
            if (reader.readAsBinaryString) {
                reader.onload = function (e) {
                    GetTableFromExcel(e.target.result);
                };
                reader.readAsBinaryString(fileUpload.files[0]);
            } else {
                //For IE Browser.
                reader.onload = function (e) {
                    var data = "";
                    var bytes = new Uint8Array(e.target.result);
                    for (var i = 0; i < bytes.byteLength; i++) {
                        data += String.fromCharCode(bytes[i]);
                    }
                    GetTableFromExcel(data);
                };
                reader.readAsArrayBuffer(fileUpload.files[0]);
            }
        } else {
            alert("This browser does not support HTML5.");
        }
    } else {
        alert("Please upload a valid Excel file.");
    }
}
function GetTableFromExcel(data) {
    //Read the Excel File data in binary
    var workbook = XLSX.read(data, {
        type: "binary",
    });

    //get the name of First Sheet.
    var Sheet = workbook.SheetNames[0];

    //Read all rows from First Sheet into an JSON array.
    excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[Sheet]);

    //Create a HTML Table element.
    var myTable = document.createElement("table");
    myTable.border = "1";

    //Add the header row.
    var row = myTable.insertRow(-1);

    //Add the header cells.
    var headerCell = document.createElement("TH");
    headerCell.innerHTML = "name";
    row.appendChild(headerCell);

    headerCell = document.createElement("TH");
    headerCell.innerHTML = "email";
    row.appendChild(headerCell);

    headerCell = document.createElement("TH");
    headerCell.innerHTML = "good domain";
    row.appendChild(headerCell);

    for (let i = 1; i < excelRows.length; i++) {
        console.log(excelRows[i]);
        splitEmailArray = excelRows[i].email.toLowerCase().trim();
        splitNameArray = excelRows[i].name.toLowerCase().trim();
        var jsonObj = {};
        jsonObj.email= splitEmailArray;
        jsonObj.name = splitNameArray;
        jsonArray.push(jsonObj);

    }

    var formatted2 = JSON.stringify(jsonArray, null, 2);
    document.getElementById('resultJson1').value = formatted2;
    


}

function saveJson1() {

    let text = JSON.stringify(jsonArray);

    let fileNameJson = $("#saveJsonFileName1").val();

    saveJson(text, fileNameJson);
}