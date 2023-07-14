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

function loadFromFile(rawDat) {
  document.getElementById('needData').style.visibility = 'visible';
  let raw = JSON.parse(rawDat);
  games = raw.jam_games;
  games.sort((a, b) => b.rating_count - a.rating_count);

  const median = games[Math.floor(games.length * 1 / 2)].rating_count;

  document.getElementById('date').innerText = `Data as of: ${new Date(raw.generated_on * 1000).toLocaleString()} (${new Date(raw.generated_on * 1000).toISOString()})`;
  document.getElementById('gameCount').innerText = `${games.length} games in the Jam. The median at the time listed above is ${median}`;
  
  document.getElementById('tableBody').innerHTML = "";

  if (myChart) {
    myChart.destroy();
  }
  
  addRow(` top 1:`,`${games[0].rating_count}`);
  addRow(`top 10:`,`${games[10].rating_count}`);
  addRow(`   99%:`,`${games[Math.floor(games.length * 1 / 100)].rating_count}`);
  addRow(`   95%:`,`${games[Math.floor(games.length * 5 / 100)].rating_count}`);
  addRow(`   90%:`,`${games[Math.floor(games.length * 1 / 10)].rating_count}`);
  addRow(`   75%:`,`${games[Math.floor(games.length * 1 / 4)].rating_count}`);
  addRow(`   50%:`,`${games[Math.floor(games.length * 1 / 2)].rating_count}`);
  addRow(`   25%:`,`${games[Math.floor(games.length * 3 / 4)].rating_count}`);
  addRow(`   10%:`,`${games[Math.floor(games.length * 9 / 10)].rating_count}`);
  addRow(`    0%:`,`${games[Math.floor(games.length - 1)].rating_count}`);

  const density = [];

  games.forEach(game => {
    if (!density[game.rating_count]) density[game.rating_count] = 0;
    density[game.rating_count]++;
  });
  console.log(density);


  const p10 = games[Math.floor(games.length * 9 / 10)].rating_count;
  const p25 = games[Math.floor(games.length * 3 / 4)].rating_count;
  const p75 = games[Math.floor(games.length * 1 / 4)].rating_count;
  const p90 = games[Math.floor(games.length * 1 / 10)].rating_count;
  const p95 = games[Math.floor(games.length * 5 / 100)].rating_count;
  const p99 = games[Math.floor(games.length * 1 / 100)].rating_count;
  const pt10 = games[10].rating_count;

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
}

let myChart;

function addRow(percentile, value) {
  const row = document.createElement('tr');
  const d1 = document.createElement('td');
  d1.innerText = percentile;
  const d2 = document.createElement('td');
  d2.innerText = value;
  row.appendChild(d1);
  row.appendChild(d2);
  document.getElementById('tableBody').appendChild(row);
}

function populateGameInfo() {
  let gameId = document.getElementById('gameId').value;
  let rank = games.findIndex(element => element.game.id == gameId)
  document.getElementById('game').innerText = `"${games[rank].game.title}" by ${games[rank].game.user.name} has ${games[rank].rating_count} ratings and is at position: #${rank} which is the ${parseFloat(100 - (rank) * 100 / games.length).toFixed(2) }-percentile`;
}