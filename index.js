function readFile() {
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const rawData = e.target.result.split(',')[1];
    loadFromFile(atob(rawData));
  }

  const fileInput = document.getElementById('file');
  reader.readAsDataURL(fileInput.files[0]);
}

let games;
let gamesWeb;
let gamesNonWeb;

function loadFromFile(rawDat) {
  document.getElementById('needData').style.visibility = 'visible';
  let raw = JSON.parse(rawDat);
  games = raw.jam_games;
  games.sort((a, b) => b.rating_count - a.rating_count);

  console.log(games);

  gamesWeb = games.filter(game => game.game.platforms?.some(plat => plat === 'web'));
  gamesNonWeb = games.filter(game => !game.game.platforms?.some(plat => plat === 'web'));

  const median = games[Math.floor(games.length * 1 / 2)].rating_count;
  const medianWeb = gamesWeb[Math.floor(gamesWeb.length * 1 / 2)].rating_count;
  const medianNonWeb = gamesNonWeb[Math.floor(gamesNonWeb.length * 1 / 2)].rating_count;

  document.getElementById('date').innerText = `Data as of: ${new Date(raw.generated_on * 1000).toLocaleString()} (${new Date(raw.generated_on * 1000).toISOString()})`;
  document.getElementById('gameCount').innerText = `${games.length} games in the Jam. The median at the time listed above is ${median}`;
  
  document.getElementById('tableBody').innerHTML = "";
  document.getElementById('tableBodyWeb').innerHTML = "";
  document.getElementById('tableBodyNonWeb').innerHTML = "";

  if (myChart) {
    myChart.destroy();
  }
  if (myChartWeb) {
    myChartWeb.destroy();
  }
  if (myChartNonWeb) {
    myChartNonWeb.destroy();
  }

  // overall
  addRow('tableBody', ` top 1:`,`${games[0].rating_count}`);
  addRow('tableBody', `top 10:`,`${games[10].rating_count}`);
  addRow('tableBody', `   99%:`,`${games[Math.floor(games.length * 1 / 100)].rating_count}`);
  addRow('tableBody', `   95%:`,`${games[Math.floor(games.length * 5 / 100)].rating_count}`);
  addRow('tableBody', `   90%:`,`${games[Math.floor(games.length * 1 / 10)].rating_count}`);
  addRow('tableBody', `   75%:`,`${games[Math.floor(games.length * 1 / 4)].rating_count}`);
  addRow('tableBody', `   50%:`,`${games[Math.floor(games.length * 1 / 2)].rating_count}`);
  addRow('tableBody', `   25%:`,`${games[Math.floor(games.length * 3 / 4)].rating_count}`);
  addRow('tableBody', `   10%:`,`${games[Math.floor(games.length * 9 / 10)].rating_count}`);
  addRow('tableBody', `    0%:`,`${games[Math.floor(games.length - 1)].rating_count}`);

  // web
  addRow('tableBodyWeb', ` top 1:`,`${gamesWeb[0].rating_count}`);
  addRow('tableBodyWeb', `top 10:`,`${gamesWeb[10].rating_count}`);
  addRow('tableBodyWeb', `   99%:`,`${gamesWeb[Math.floor(gamesWeb.length * 1 / 100)].rating_count}`);
  addRow('tableBodyWeb', `   95%:`,`${gamesWeb[Math.floor(gamesWeb.length * 5 / 100)].rating_count}`);
  addRow('tableBodyWeb', `   90%:`,`${gamesWeb[Math.floor(gamesWeb.length * 1 / 10)].rating_count}`);
  addRow('tableBodyWeb', `   75%:`,`${gamesWeb[Math.floor(gamesWeb.length * 1 / 4)].rating_count}`);
  addRow('tableBodyWeb', `   50%:`,`${gamesWeb[Math.floor(gamesWeb.length * 1 / 2)].rating_count}`);
  addRow('tableBodyWeb', `   25%:`,`${gamesWeb[Math.floor(gamesWeb.length * 3 / 4)].rating_count}`);
  addRow('tableBodyWeb', `   10%:`,`${gamesWeb[Math.floor(gamesWeb.length * 9 / 10)].rating_count}`);
  addRow('tableBodyWeb', `    0%:`,`${gamesWeb[Math.floor(gamesWeb.length - 1)].rating_count}`);

  // non-web
  addRow('tableBodyNonWeb', ` top 1:`,`${gamesNonWeb[0].rating_count}`);
  addRow('tableBodyNonWeb', `top 10:`,`${gamesNonWeb[10].rating_count}`);
  addRow('tableBodyNonWeb', `   99%:`,`${gamesNonWeb[Math.floor(gamesNonWeb.length * 1 / 100)].rating_count}`);
  addRow('tableBodyNonWeb', `   95%:`,`${gamesNonWeb[Math.floor(gamesNonWeb.length * 5 / 100)].rating_count}`);
  addRow('tableBodyNonWeb', `   90%:`,`${gamesNonWeb[Math.floor(gamesNonWeb.length * 1 / 10)].rating_count}`);
  addRow('tableBodyNonWeb', `   75%:`,`${gamesNonWeb[Math.floor(gamesNonWeb.length * 1 / 4)].rating_count}`);
  addRow('tableBodyNonWeb', `   50%:`,`${gamesNonWeb[Math.floor(gamesNonWeb.length * 1 / 2)].rating_count}`);
  addRow('tableBodyNonWeb', `   25%:`,`${gamesNonWeb[Math.floor(gamesNonWeb.length * 3 / 4)].rating_count}`);
  addRow('tableBodyNonWeb', `   10%:`,`${gamesNonWeb[Math.floor(gamesNonWeb.length * 9 / 10)].rating_count}`);
  addRow('tableBodyNonWeb', `    0%:`,`${gamesNonWeb[Math.floor(gamesNonWeb.length - 1)].rating_count}`);

  const density = [];

  games.forEach(game => {
    if (!density[game.rating_count]) density[game.rating_count] = 0;
    density[game.rating_count]++;
  });
  console.log(density);

  const densityWeb = [];
  gamesWeb.forEach(game => {
    if (!densityWeb[game.rating_count]) densityWeb[game.rating_count] = 0;
    densityWeb[game.rating_count]++;
  });
  console.log(densityWeb);

  const densityNonWeb = [];
  gamesNonWeb.forEach(game => {
    if (!densityNonWeb[game.rating_count]) densityNonWeb[game.rating_count] = 0;
    densityNonWeb[game.rating_count]++;
  });
  console.log(densityNonWeb);
  
  for (let i = 0; i < density.length; i++) {
    density[i] = density[i] ?? 0;
  }
  
  for (let i = 0; i < density.length; i++) {
    densityWeb[i] = densityWeb[i] ?? 0;
  }
  
  for (let i = 0; i < density.length; i++) {
    densityNonWeb[i] = densityNonWeb[i] ?? 0;
  }

  const p10 = games[Math.floor(games.length * 9 / 10)].rating_count;
  const p25 = games[Math.floor(games.length * 3 / 4)].rating_count;
  const p75 = games[Math.floor(games.length * 1 / 4)].rating_count;
  const p90 = games[Math.floor(games.length * 1 / 10)].rating_count;
  const p95 = games[Math.floor(games.length * 5 / 100)].rating_count;
  const p99 = games[Math.floor(games.length * 1 / 100)].rating_count;
  const pt10 = games[10].rating_count;
  
  const p10Web = gamesWeb[Math.floor(gamesWeb.length * 9 / 10)].rating_count;
  const p25Web = gamesWeb[Math.floor(gamesWeb.length * 3 / 4)].rating_count;
  const p75Web = gamesWeb[Math.floor(gamesWeb.length * 1 / 4)].rating_count;
  const p90Web = gamesWeb[Math.floor(gamesWeb.length * 1 / 10)].rating_count;
  const p95Web = gamesWeb[Math.floor(gamesWeb.length * 5 / 100)].rating_count;
  const p99Web = gamesWeb[Math.floor(gamesWeb.length * 1 / 100)].rating_count;
  const pt10Web = gamesWeb[10].rating_count;
  
  const p10NonWeb = gamesNonWeb[Math.floor(gamesNonWeb.length * 9 / 10)].rating_count;
  const p25NonWeb = gamesNonWeb[Math.floor(gamesNonWeb.length * 3 / 4)].rating_count;
  const p75NonWeb = gamesNonWeb[Math.floor(gamesNonWeb.length * 1 / 4)].rating_count;
  const p90NonWeb = gamesNonWeb[Math.floor(gamesNonWeb.length * 1 / 10)].rating_count;
  const p95NonWeb = gamesNonWeb[Math.floor(gamesNonWeb.length * 5 / 100)].rating_count;
  const p99NonWeb = gamesNonWeb[Math.floor(gamesNonWeb.length * 1 / 100)].rating_count;
  const pt10NonWeb = gamesNonWeb[10].rating_count;

  let count = 0;
  for (let i = Math.floor(games.length / 2) ; i >= 0; i--) {
    if (games[i].rating_count > median) {
      break;
    }
    count++;
  }

  document.getElementById('medianMessage').innerText = `${count} ratings on ${median}-rating games needed for the median to increase to ${median + 1}`;

  const lineThickness = 5;

  myChart = new Chart("myChart", {
    data: {
      labels: density.map((v, i) => i),
      datasets: [
        {
          type: 'line',
          label: '# of Ratings',
          data: density,
          fill: true,
          tension: 0.1,
          borderColor: '#37C8',
          backgroundColor: '#37C8'
        },
        {
          type: 'line',
          label: '# of Ratings on Webgames',
          data: densityWeb,
          fill: true,
          tension: 0.1,
          borderColor: '#C7C8',
          backgroundColor: '#C7C8'
        },
        {
          type: 'line',
          label: '# of Ratings on Non-Webgames',
          data: densityNonWeb,
          fill: true,
          tension: 0.1,
          borderColor: '#C738',
          backgroundColor: '#C738'
        },
        {
          type: 'bar',
          label: '10%',
          data: [{ x: p10, y: density.reduce((p, c) => p > c ? p : c) * 1.1 }],
          fill: true,
          tension: 0.1,
          barThickness: lineThickness,
          borderColor: '#600',
          backgroundColor: '#F00',
          borderWidth: 1
        },
        {
          type: 'bar',
          label: '25%',
          data: [{ x: p25, y: density.reduce((p, c) => p > c ? p : c) * 1.1 }],
          fill: true,
          tension: 0.1,
          barThickness: lineThickness,
          borderColor: '#D50',
          backgroundColor: '#F80',
          borderWidth: 1
        },
        {
          type: 'bar',
          label: 'Median (50%)',
          data: [{ x: median, y: density.reduce((p, c) => p > c ? p : c) * 1.1 }],
          fill: true,
          tension: 0.1,
          barThickness: lineThickness,
          borderColor: '#AA0',
          backgroundColor: '#FF0',
          borderWidth: 1
        },
        {
          type: 'bar',
          label: '75%',
          data: [{ x: p75, y: density.reduce((p, c) => p > c ? p : c) * 1.1 }],
          fill: true,
          tension: 0.1,
          barThickness: lineThickness,
          borderColor: '#030',
          backgroundColor: '#290',
          borderWidth: 1
        },
        {
          type: 'bar',
          label: '90%',
          data: [{ x: p90, y: density.reduce((p, c) => p > c ? p : c) * 1.1 }],
          fill: true,
          tension: 0.1,
          barThickness: lineThickness,
          borderColor: '#04A',
          backgroundColor: '#29F',
          borderWidth: 1
        },
        {
          type: 'bar',
          label: '95%',
          data: [{ x: p95, y: density.reduce((p, c) => p > c ? p : c) * 1.1 }],
          fill: true,
          tension: 0.1,
          barThickness: lineThickness,
          borderColor: '#20A',
          backgroundColor: '#80F',
          borderWidth: 1
        },
        {
          type: 'bar',
          label: '99%',
          data: [{ x: p99, y: density.reduce((p, c) => p > c ? p : c) * 1.1 }],
          fill: true,
          tension: 0.1,
          barThickness: lineThickness,
          borderColor: '#333',
          backgroundColor: '#888',
          borderWidth: 1
        },
        {
          type: 'bar',
          label: 'top 10',
          data: [{ x: pt10, y: density.reduce((p, c) => p > c ? p : c) * 1.1 }],
          fill: true,
          tension: 0.1,
          barThickness: lineThickness,
          borderColor: '#000',
          backgroundColor: '#333',
          borderWidth: 1
        }
      ]
    },
    options: {
      scales: {
        x: {
          display: true,
          type: 'logarithmic'
        },
        y: {
          display: true
        },
      },
      elements: {
        point: {
          radius: 2
        }
      }
    }
  });

  myChartWeb = new Chart("myChartWeb", {
    data: {
      labels: densityWeb.map((v, i) => i),
      datasets: [
        {
          type: 'line',
          label: '# of Ratings on Webgames',
          data: densityWeb,
          fill: true,
          tension: 0.1,
          borderColor: '#C7C8',
          backgroundColor: '#C7C8'
        },
        {
          type: 'bar',
          label: '10%',
          data: [{ x: p10Web, y: densityWeb.reduce((p, c) => p > c ? p : c) * 1.1 }],
          fill: true,
          tension: 0.1,
          barThickness: lineThickness,
          borderColor: '#600',
          backgroundColor: '#F00',
          borderWidth: 1
        },
        {
          type: 'bar',
          label: '25%',
          data: [{ x: p25Web, y: densityWeb.reduce((p, c) => p > c ? p : c) * 1.1 }],
          fill: true,
          tension: 0.1,
          barThickness: lineThickness,
          borderColor: '#D50',
          backgroundColor: '#F80',
          borderWidth: 1
        },
        {
          type: 'bar',
          label: 'Median (50%)',
          data: [{ x: medianWeb, y: densityWeb.reduce((p, c) => p > c ? p : c) * 1.1 }],
          fill: true,
          tension: 0.1,
          barThickness: lineThickness,
          borderColor: '#AA0',
          backgroundColor: '#FF0',
          borderWidth: 1
        },
        {
          type: 'bar',
          label: '75%',
          data: [{ x: p75Web, y: densityWeb.reduce((p, c) => p > c ? p : c) * 1.1 }],
          fill: true,
          tension: 0.1,
          barThickness: lineThickness,
          borderColor: '#030',
          backgroundColor: '#290',
          borderWidth: 1
        },
        {
          type: 'bar',
          label: '90%',
          data: [{ x: p90Web, y: densityWeb.reduce((p, c) => p > c ? p : c) * 1.1 }],
          fill: true,
          tension: 0.1,
          barThickness: lineThickness,
          borderColor: '#04A',
          backgroundColor: '#29F',
          borderWidth: 1
        },
        {
          type: 'bar',
          label: '95%',
          data: [{ x: p95Web, y: densityWeb.reduce((p, c) => p > c ? p : c) * 1.1 }],
          fill: true,
          tension: 0.1,
          barThickness: lineThickness,
          borderColor: '#20A',
          backgroundColor: '#80F',
          borderWidth: 1
        },
        {
          type: 'bar',
          label: '99%',
          data: [{ x: p99Web, y: densityWeb.reduce((p, c) => p > c ? p : c) * 1.1 }],
          fill: true,
          tension: 0.1,
          barThickness: lineThickness,
          borderColor: '#333',
          backgroundColor: '#888',
          borderWidth: 1
        },
        {
          type: 'bar',
          label: 'top 10',
          data: [{ x: pt10Web, y: densityWeb.reduce((p, c) => p > c ? p : c) * 1.1 }],
          fill: true,
          tension: 0.1,
          barThickness: lineThickness,
          borderColor: '#000',
          backgroundColor: '#333',
          borderWidth: 1
        }
      ]
    },
    options: {
      scales: {
        x: {
          display: true,
          type: 'logarithmic'
        },
        y: {
          display: true
        },
      },
      elements: {
        point: {
          radius: 2
        }
      }
    }
  });
  

  myChartNonWeb = new Chart("myChartNonWeb", {
    data: {
      labels: densityNonWeb.map((v, i) => i),
      datasets: [
        {
          type: 'line',
          label: '# of Ratings on Webgames',
          data: densityNonWeb,
          fill: true,
          tension: 0.1,
          borderColor: '#C738',
          backgroundColor: '#C738'
        },
        {
          type: 'bar',
          label: '10%',
          data: [{ x: p10NonWeb, y: densityNonWeb.reduce((p, c) => p > c ? p : c) * 1.1 }],
          fill: true,
          tension: 0.1,
          barThickness: lineThickness,
          borderColor: '#600',
          backgroundColor: '#F00',
          borderWidth: 1
        },
        {
          type: 'bar',
          label: '25%',
          data: [{ x: p25NonWeb, y: densityNonWeb.reduce((p, c) => p > c ? p : c) * 1.1 }],
          fill: true,
          tension: 0.1,
          barThickness: lineThickness,
          borderColor: '#D50',
          backgroundColor: '#F80',
          borderWidth: 1
        },
        {
          type: 'bar',
          label: 'Median (50%)',
          data: [{ x: medianNonWeb, y: densityNonWeb.reduce((p, c) => p > c ? p : c) * 1.1 }],
          fill: true,
          tension: 0.1,
          barThickness: lineThickness,
          borderColor: '#AA0',
          backgroundColor: '#FF0',
          borderWidth: 1
        },
        {
          type: 'bar',
          label: '75%',
          data: [{ x: p75NonWeb, y: densityNonWeb.reduce((p, c) => p > c ? p : c) * 1.1 }],
          fill: true,
          tension: 0.1,
          barThickness: lineThickness,
          borderColor: '#030',
          backgroundColor: '#290',
          borderWidth: 1
        },
        {
          type: 'bar',
          label: '90%',
          data: [{ x: p90NonWeb, y: densityNonWeb.reduce((p, c) => p > c ? p : c) * 1.1 }],
          fill: true,
          tension: 0.1,
          barThickness: lineThickness,
          borderColor: '#04A',
          backgroundColor: '#29F',
          borderWidth: 1
        },
        {
          type: 'bar',
          label: '95%',
          data: [{ x: p95NonWeb, y: densityNonWeb.reduce((p, c) => p > c ? p : c) * 1.1 }],
          fill: true,
          tension: 0.1,
          barThickness: lineThickness,
          borderColor: '#20A',
          backgroundColor: '#80F',
          borderWidth: 1
        },
        {
          type: 'bar',
          label: '99%',
          data: [{ x: p99NonWeb, y: densityNonWeb.reduce((p, c) => p > c ? p : c) * 1.1 }],
          fill: true,
          tension: 0.1,
          barThickness: lineThickness,
          borderColor: '#333',
          backgroundColor: '#888',
          borderWidth: 1
        },
        {
          type: 'bar',
          label: 'top 10',
          data: [{ x: pt10NonWeb, y: densityNonWeb.reduce((p, c) => p > c ? p : c) * 1.1 }],
          fill: true,
          tension: 0.1,
          barThickness: lineThickness,
          borderColor: '#000',
          backgroundColor: '#333',
          borderWidth: 1
        }
      ]
    },
    options: {
      scales: {
        x: {
          display: true,
          type: 'logarithmic'
        },
        y: {
          display: true
        },
      },
      elements: {
        point: {
          radius: 2
        }
      }
    }
  });
}

let myChart;
let myChartWeb;
let myChartNonWeb;

function addRow(tableId, percentile, value) {
  const row = document.createElement('tr');
  const d1 = document.createElement('td');
  d1.innerText = percentile;
  const d2 = document.createElement('td');
  d2.innerText = value;
  row.appendChild(d1);
  row.appendChild(d2);
  document.getElementById(tableId).appendChild(row);
}

function populateGameInfo() {
  let gameId = document.getElementById('gameId').value;
  let rank = games.findIndex(element => element.game.id == gameId)
  document.getElementById('game').innerText = `"${games[rank].game.title}" by ${games[rank].game.user.name} has ${games[rank].rating_count} ratings and is at position: #${rank} which is the ${parseFloat(100 - (rank) * 100 / games.length).toFixed(2) }-percentile`;
}
