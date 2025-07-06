async function loadRates() {
  const response = await fetch('./assets/data/rates.json');
  if (!response.ok) {
    throw new Error('Failed to load rate data');
  }
  return response.json();
}

function generateTableHead(table, data) {
  const thead = table.createTHead();
  const row = thead.insertRow();
  for (const key of data) {
    const th = document.createElement('th');
    const text = document.createTextNode(key);
    th.appendChild(text);
    row.appendChild(th);
  }
}

function generateTable(table, data) {
  for (const element of data) {
    const row = table.insertRow();
    for (const key in element) {
      const cell = row.insertCell();
      const text = document.createTextNode(element[key]);
      cell.appendChild(text);
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const table = document.querySelector('table');
  try {
    const rates = await loadRates();
    if (rates.length > 0) {
      const headers = Object.keys(rates[0]);
      generateTableHead(table, headers);
      generateTable(table, rates);
    }
  } catch (err) {
    console.error(err);
  }
});
