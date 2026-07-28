let games;
let gamesWeb;
let gamesNonWeb;

async function fetchData() {
  const jam = document.getElementById('jam-selector').value;
  if (!jam) {
    return;
  }
  const response = fetch(`https://denaro.dev/itch-jam/${jam}`);

  if (response.status === 200) {
    loadFromFile(atob((await response).text()));
  }
}

function readFile() {  
  const reader = new FileReader();
  reader.onload = (e) => {
    const rawData = e.target.result.split(',')[1];
    loadFromFile(atob(rawData));
    const jamSelector = document.getElementById('jam-selector');
    // window.localStorage.setItem(`jam.${jamSelector.options[jamSelector.selectedIndex].innerHTML}`, atob(rawData));
    document.getElementById('file').value = '';
  }

  const fileInput = document.getElementById('file');
  reader.readAsDataURL(fileInput.files[0]);
}

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

  const teamStats = document.getElementById('team-stats');
  const contributorBuckets = games.reduce((prev, cur) => {
    const contributors = cur.contributors?.length ?? 1;
    if (!prev[contributors]) {
      prev[contributors] = 0;
    }

    prev[contributors]++;

    return prev;
  }, {});

  [...teamStats.getElementsByTagName('tbody')].at(0).innerHTML = "";

  for (key of Object.keys(contributorBuckets).sort((a, b) => a - b)) {
    const row = document.createElement('tr');
    const contr = document.createElement('td');
    const ga = document.createElement('td');
    const per = document.createElement('td');

    contr.innerText = key;
    ga.innerText = contributorBuckets[key];
    per.innerText = `${Math.round(contributorBuckets[key] * 100 / games.length)}%`;

    row.appendChild(contr);
    row.appendChild(ga);
    row.appendChild(per);

    [...teamStats.getElementsByTagName('tbody')].at(0).appendChild(row);
  }

  if (myChart) {
    myChart.destroy();
  }
  if (myChartWeb) {
    myChartWeb.destroy();
  }
  if (myChartNonWeb) {
    myChartNonWeb.destroy();
  }

  function addRowsFromList(id, list) {
    addRow(id, ` top 1:`, `${list[0].rating_count}`, list.filter(game => game.rating_count >= list[0].rating_count).length);
    addRow(id, `top 10:`, `${list[9].rating_count}`, list.filter(game => game.rating_count < list[0].rating_count && game.rating_count >= list[9].rating_count).length);
    addRow(id, `   99%:`, `${list[Math.floor(list.length * 1 / 100)].rating_count}`, list.filter(game => game.rating_count < list[9].rating_count && game.rating_count >= list[Math.floor(list.length * 1 / 100)].rating_count).length + ' (99% - top 10)');
    addRow(id, `   95%:`, `${list[Math.floor(list.length * 5 / 100)].rating_count}`, list.filter(game => game.rating_count < list[Math.floor(list.length * 1 / 100)].rating_count && game.rating_count >= list[Math.floor(list.length * 5 / 100)].rating_count).length + ' (95% - 99%)');
    addRow(id, `   90%:`, `${list[Math.floor(list.length * 1 / 10)].rating_count}`, list.filter(game => game.rating_count < list[Math.floor(list.length * 5 / 100)].rating_count && game.rating_count >= list[Math.floor(list.length * 1 / 10)].rating_count).length + ' (90% - 95%)');
    addRow(id, `   75%:`, `${list[Math.floor(list.length * 1 / 4)].rating_count}`, list.filter(game => game.rating_count < list[Math.floor(list.length * 1 / 10)].rating_count && game.rating_count >= list[Math.floor(list.length * 1 / 4)].rating_count).length + ' (75% - 90%)');
    addRow(id, `   50%:`, `${list[Math.floor(list.length * 1 / 2)].rating_count}`, list.filter(game => game.rating_count < list[Math.floor(list.length * 1 / 4)].rating_count && game.rating_count >= list[Math.floor(list.length * 1 / 2)].rating_count).length + ' (50% - 75%)');
    addRow(id, `   25%:`, `${list[Math.floor(list.length * 3 / 4)].rating_count}`, list.filter(game => game.rating_count < list[Math.floor(list.length * 1 / 2)].rating_count && game.rating_count >= list[Math.floor(list.length * 3 / 4)].rating_count).length + ' (25% - 50%)');
    addRow(id, `   10%:`, `${list[Math.floor(list.length * 9 / 10)].rating_count}`, list.filter(game => game.rating_count < list[Math.floor(list.length * 3 / 4)].rating_count && game.rating_count >= list[Math.floor(list.length * 9 / 10)].rating_count).length + ' (10% - 25%)');
    addRow(id, `    0%:`, `${list[Math.floor(list.length - 1)].rating_count}`, list.filter(game => game.rating_count < list[Math.floor(list.length * 9 / 10)].rating_count && game.rating_count >= list[Math.floor(list.length - 1)].rating_count).length + ' (0% - 10%)');
  }

  // overall
  addRowsFromList('tableBody', games);

  // web
  addRowsFromList('tableBodyWeb', gamesWeb);

  // non-web
  addRowsFromList('tableBodyNonWeb', gamesNonWeb);

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

  const first = density.findIndex(d => d > 0);
  const last = density.length - 1;
  
  densityWeb[first] = densityWeb[first] ?? 0;
  densityWeb[last] = densityWeb[last] ?? 0;

  densityNonWeb[first] = densityNonWeb[first] ?? 0;
  densityNonWeb[last] = densityNonWeb[last] ?? 0;

  const p10 = games[Math.floor(games.length * 9 / 10)].rating_count;
  const p25 = games[Math.floor(games.length * 3 / 4)].rating_count;
  const p75 = games[Math.floor(games.length * 1 / 4)].rating_count;
  const p90 = games[Math.floor(games.length * 1 / 10)].rating_count;
  const p95 = games[Math.floor(games.length * 5 / 100)].rating_count;
  const p99 = games[Math.floor(games.length * 1 / 100)].rating_count;
  const pt10 = games[9].rating_count;
  
  const p10Web = gamesWeb[Math.floor(gamesWeb.length * 9 / 10)].rating_count;
  const p25Web = gamesWeb[Math.floor(gamesWeb.length * 3 / 4)].rating_count;
  const p75Web = gamesWeb[Math.floor(gamesWeb.length * 1 / 4)].rating_count;
  const p90Web = gamesWeb[Math.floor(gamesWeb.length * 1 / 10)].rating_count;
  const p95Web = gamesWeb[Math.floor(gamesWeb.length * 5 / 100)].rating_count;
  const p99Web = gamesWeb[Math.floor(gamesWeb.length * 1 / 100)].rating_count;
  const pt10Web = gamesWeb[9].rating_count;
  
  const p10NonWeb = gamesNonWeb[Math.floor(gamesNonWeb.length * 9 / 10)].rating_count;
  const p25NonWeb = gamesNonWeb[Math.floor(gamesNonWeb.length * 3 / 4)].rating_count;
  const p75NonWeb = gamesNonWeb[Math.floor(gamesNonWeb.length * 1 / 4)].rating_count;
  const p90NonWeb = gamesNonWeb[Math.floor(gamesNonWeb.length * 1 / 10)].rating_count;
  const p95NonWeb = gamesNonWeb[Math.floor(gamesNonWeb.length * 5 / 100)].rating_count;
  const p99NonWeb = gamesNonWeb[Math.floor(gamesNonWeb.length * 1 / 100)].rating_count;
  const pt10NonWeb = gamesNonWeb[9].rating_count;

  let count = 0;
  for (let i = Math.floor(games.length / 2) ; i >= 0; i--) {
    if (games[i].rating_count > median) {
      break;
    }
    count++;
  }

  const stats = document.getElementById('overall-stats');
  stats.innerHTML = '';
  function addLine(text) {
    const div = document.createElement('div');
    div.innerText = text;
    stats.appendChild(div);
  }

  addLine(`${games.length} games`);
  addLine(`${gamesWeb.length} web games`);
  addLine(`${gamesNonWeb.length} non-web games`);
  addLine(`${gamesWeb.filter(game => game.rating_count < median).length} (${(gamesWeb.filter(game => game.rating_count < median).length * 100 / gamesWeb.length).toFixed(2)}%) Web games have less than ${median} ratings`);
  addLine(`${gamesNonWeb.filter(game => game.rating_count < median).length} (${(gamesNonWeb.filter(game => game.rating_count < median).length * 100 / gamesNonWeb.length).toFixed(2)}%) Non-Web games have less than ${median} ratings`);

  document.getElementById('medianMessage').innerText = `${count} ratings on ${median}-rating games needed for the median to increase to ${median + 1}`;

  const lineThickness = 5;

  myChart = new Chart("myChart", {
    data: {
      labels: density.map((v, i) => i),
      datasets: [
        {
          type: 'line',
          label: '# Games with Rating',
          data: density,
          fill: true,
          tension: 0.1,
          borderColor: '#37C8',
          backgroundColor: '#37C8'
        },
        {
          type: 'line',
          label: '# Web Games with Rating',
          data: densityWeb,
          fill: true,
          tension: 0.1,
          borderColor: '#C7C8',
          backgroundColor: '#C7C8'
        },
        {
          type: 'line',
          label: '# Non-Web Games with Rating',
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
      },
      onClick: (event, activeElements, chart) => {
        const points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
            
        if (points.length > 0) {
          const firstPoint = points[0];
          
          const datasetIndex = firstPoint.datasetIndex;
          const dataIndex = firstPoint.index;
          
          const label = chart.data.labels[dataIndex];
          const value = chart.data.datasets[datasetIndex].data[dataIndex];
          
          const scroller = document.getElementById('all-games');
          scroller.innerHTML = '';

          const gamesList = [games, gamesWeb, gamesNonWeb][datasetIndex];

          for (let game of gamesList.filter(game => game.rating_count === Number(label))) {
            const div = document.createElement('div');
            const url = document.createElement('a');
            url.href = `https://itch.io${game.url}`;
            div.appendChild(url);
            const image = document.createElement('img');
            image.src = game.game.cover;
            image.width = 320;
            image.height = 240;
            const title = document.createElement('div');
            title.innerText = game.game.title;
            url.appendChild(image);
            url.appendChild(title);
            scroller.appendChild(div);
          }
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
          label: '# Web Games with Rating',
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
      },
      onClick: (event, activeElements, chart) => {
        const points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);

        if (points.length > 0) {
          const firstPoint = points[0];

          const datasetIndex = firstPoint.datasetIndex;
          const dataIndex = firstPoint.index;

          const label = chart.data.labels[dataIndex];
          const value = chart.data.datasets[datasetIndex].data[dataIndex];

          const scroller = document.getElementById('web-games');
          scroller.innerHTML = '';
          for (let game of gamesWeb.filter(game => game.rating_count === Number(label))) {
            const div = document.createElement('div');
            const url = document.createElement('a');
            url.href = `https://itch.io${game.url}`;
            div.appendChild(url);
            const image = document.createElement('img');
            image.src = game.game.cover;
            image.width = 320;
            image.height = 240;
            const title = document.createElement('div');
            title.innerText = game.game.title;
            url.appendChild(image);
            url.appendChild(title);
            scroller.appendChild(div);
          }
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
          label: '# Non-Web Games with Rating',
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
      },
      onClick: (event, activeElements, chart) => {
        const points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);

        if (points.length > 0) {
          const firstPoint = points[0];

          const datasetIndex = firstPoint.datasetIndex;
          const dataIndex = firstPoint.index;

          const label = chart.data.labels[dataIndex];
          const value = chart.data.datasets[datasetIndex].data[dataIndex];

          const scroller = document.getElementById('non-web-games');
          scroller.innerHTML = '';
          for (let game of gamesNonWeb.filter(game => game.rating_count === Number(label))) {
            const div = document.createElement('div');
            const url = document.createElement('a');
            url.href = `https://itch.io${game.url}`;
            div.appendChild(url);
            const image = document.createElement('img');
            image.src = game.game.cover;
            image.width = 320;
            image.height = 240;
            const title = document.createElement('div');
            title.innerText = game.game.title;
            url.appendChild(image);
            url.appendChild(title);
            scroller.appendChild(div);
          }
        }
      }
    }
  });
}

let myChart;
let myChartWeb;
let myChartNonWeb;

function addRow(tableId, percentile, value, count) {
  const row = document.createElement('tr');
  const d1 = document.createElement('td');
  d1.innerText = percentile;
  const d2 = document.createElement('td');
  d2.innerText = value;
  const d3 = document.createElement('td');
  d3.innerText = count;
  row.appendChild(d1);
  row.appendChild(d2);
  row.appendChild(d3);
  document.getElementById(tableId).appendChild(row);
}

function populateGameInfo() {
  let gameId = document.getElementById('gameId').value;
  let rank = games.findIndex(element => element.game.id == gameId);
  const root = document.getElementById('game');
  root.innerHTML = '';

  const game = games[rank];
  const div = document.createElement('div');
  const url = document.createElement('a');
  url.href = `https://itch.io${game.url}`;
  div.appendChild(url);
  const image = document.createElement('img');
  image.src = game.game.cover;
  image.width = 320;
  image.height = 240;
  const title = document.createElement('div');
  title.innerText = game.game.title;
  url.appendChild(image);
  url.appendChild(title);
  root.appendChild(div);

  const info = document.createElement('div');
  info.innerText = `"${games[rank].game.title}" by ${games[rank].game.user.name} has ${games[rank].rating_count} ratings, ${games[rank].coolness} coolness (ratings given to other games), ${games[rank].coolness / games[rank].rating_count} karma (ratio of ratings given to received), and is at position: #${rank} which is the ${parseFloat(100 - (rank) * 100 / games.length).toFixed(2)}-percentile for number of ratings`;
  root.appendChild(info);
}

function searchGameInfo() {
  let gameSearch = document.getElementById('gameSearch').value;
  const regex = new RegExp(gameSearch, 'ig');
  const gamesFound = games.filter(game => regex.test(game.game.title));
  const root = document.getElementById('search');
  root.innerHTML = '';

  for (let game of gamesFound) {
    const div = document.createElement('div');
    const url = document.createElement('a');
    url.href = `https://itch.io${game.url}`;
    div.appendChild(url);
    const image = document.createElement('img');
    image.src = game.game.cover;
    image.width = 320;
    image.height = 240;
    const title = document.createElement('div');
    title.innerText = game.game.title;
    url.appendChild(image);
    url.appendChild(title);
    root.appendChild(div);
  }
  
  const info = document.createElement('div');
  info.innerText = `Found ${gamesFound.length} games matching ${regex}.`;
  const rootInfo = document.getElementById('searchInfo');
  rootInfo.innerHTML = '';
  rootInfo.appendChild(info);
}


function scrollHorizontal(elements) {
  for (let element of elements) {
    element.addEventListener('wheel', evt => {
      if (evt.deltaY !== 0) {
        evt.preventDefault();
        element.scrollLeft += evt.deltaY;
      }
    });
  }
}

scrollHorizontal(document.getElementsByClassName('scroll-horizontal'));