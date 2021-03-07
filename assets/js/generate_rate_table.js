let rates = [
    { country: "ALBANIA", Operator_Network: "Albania - Vodafone", data: 0.0128, call:0.24, sms:0.033 },
    { country: "ALGERIA", Operator_Network: "Algerie Telecom", data: 0.0398, call:"n/a", sms:"n/a" },
    { country: "ARMENIA", Operator_Network: "Armenia - Armentel", data: 0.0214, call:0.2, sms:0.266 }
   
    
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
  }
  
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
  
  let table = document.querySelector("table");
  let data = Object.keys(rates[0]);
  generateTableHead(table, data);
  generateTable(table, rates);