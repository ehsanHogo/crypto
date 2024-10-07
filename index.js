// Show coins and trades

async function fetchData() {
  const coinsTableEl = document.getElementById("CoinsTable");
  const tradeTableEl = document.getElementById("TradeTable");
  const showChartEl = document.getElementById("ShowChart");

  showChartEl.setAttribute("hideChart", "");

  let filteredTrades = [];
  let filteredCoins = [];

  try {
    const response = await fetch("https://api.exir.io/v2/constants");

    const data = await response.json();

    filteredCoins = data.coins;

    filteredTrades = data.pairs;

    showCoins(filteredCoins, coinsTableEl);

    showTrades(filteredTrades, tradeTableEl, data, showChartEl);
  } catch (e) {
    console.log(e);
  }
}

fetchData();
//Show Chart for trade

async function fetchTradeChart(tradePair, tradeID, precision) {
  const res = await fetch(
    `https://api.exir.io/v2/chart?symbol=${tradePair}&resolution=1D&from=1711917000&to=1714509000`
  );

  if (!res.ok) {
    throw new Error("http request faild");
  } else {
    const data = await res.json();
    const xLables = getXaxisLables(data, precision);
    const chartData = getChartData(data, precision);

    makeChart(tradeID, xLables, tradePair, chartData);
  }
}

function findLogo(data, pair1, pair2) {
  let logo1 = null;
  let logo2 = null;
  for (const item in data["coins"]) {
    if (!item.localeCompare(pair1)) {
      logo1 = data["coins"][item].logo;
    }
    if (!item.localeCompare(pair2)) {
      logo2 = data["coins"][item].logo;
    }
  }

  return { logo1, logo2 };
}

function showCoins(filteredCoins, coinsTableEl) {
  for (const coin in filteredCoins) {
    const coinCardEl = document.createElement("div");
    const coinValue = filteredCoins[coin];
    coinCardEl.innerHTML = `     
       <div class="coin-card">
        <div class="coin-card__coin-name">${coinValue.fullname}</div>
        <div class="coin-logo">
          <img class="logo-pic" src="${coinValue.logo}" alt="${coinValue.fullname}" />
        </div>
      </div>`;

    coinsTableEl.appendChild(coinCardEl);
  }
}

function showTrades(filteredTrades, tradeTableEl, data, showChartEl) {
  for (const trade in filteredTrades) {
    const tradeCardEl = document.createElement("div");
    tradeCardEl.classList.add("pair-card");

    const tradeValue = filteredTrades[trade];
    const { logo1, logo2 } = findLogo(
      data,
      tradeValue.pair_base,
      tradeValue.pair_2
    );

    tradeCardEl.innerHTML = `
      <button class="pair-card__button" key="${tradeValue.id}" name="tradeCard${tradeValue.id}">
        <div class="trade-properties__coin-name">${tradeValue.name}</div>
        <div class="trade-properties">

        <div class = "trade-properties__coins">
          <div class="trade-properties__show-coin">
            <img class="coin-logo" src="${logo1}" alt="logo" />
            <p>${tradeValue.pair_base}</p>
          </div>

          <div class="trade-properties__show-coin">
            <img class="coin-logo" src="${logo2}" alt="logo" />

            <p>${tradeValue.pair_2}</p>
          </div>

          </div>
      <div class  = "trade-properties__prices">
          <div class="trade-properties__show-price"><span class = "trade-properties__price-report">Min Price : </span> ${tradeValue.min_price}$</div>
          <div class="trade-properties__show-price"> <span class = "trade-properties__price-report">Max Price : </span> ${tradeValue.max_price}$</div>
        </div>
          </div>
      </button>
      `;

    tradeCardEl.addEventListener("click", () => {
      if (showChartEl.hasAttribute("hideChart")) {
        showChart(tradeValue, showChartEl);
      } else {
        const chartEl = document.getElementById(`TradeChart${tradeValue.id}`);

        const precisionEl = document.getElementById("showPrecision");
        if (chartEl) {
          precisionEl.removeChild(precisionEl.children[0]);
          precisionEl.removeChild(precisionEl.children[0]);
          showChartEl.removeChild(showChartEl.children[1]);

          showChartEl.setAttribute("hideChart", "");
        } else {
          precisionEl.removeChild(precisionEl.children[0]);
          precisionEl.removeChild(precisionEl.children[0]);
          showChartEl.removeChild(showChartEl.children[1]);

          showChart(tradeValue, showChartEl);
        }
      }
    });

    tradeTableEl.appendChild(tradeCardEl);
  }
}

function showChart(tradeValue, showChartEl) {
  const chartEl = document.createElement("div");
  const precisionEl = document.getElementById("showPrecision");
  const { inputEl, lableEl } = getInputLableTag(tradeValue);
  chartEl.classList.add("chart-card");
  chartEl.setAttribute("id", `TradeChart${tradeValue.id}`);
  chartEl.innerHTML = ` <canvas id="myChart${tradeValue.id}" ></canvas>`;

  showChartEl.appendChild(chartEl);
  precisionEl.appendChild(lableEl);
  precisionEl.appendChild(inputEl);

  fetchTradeChart(`${tradeValue.name}`, tradeValue.id, 1);
  showChartEl.removeAttribute("hideChart");
}

function getInputLableTag(tradeValue) {
  const inputEl = document.createElement("input");
  const lableEl = document.createElement("lable");
  inputEl.setAttribute("name", "precision");
  lableEl.setAttribute("for", "precision");

  lableEl.innerText = "Precision ( day )";
  lableEl.classList.add("show-chart__precision-lable");

  inputEl.addEventListener("change", (e) => {
    fetchTradeChart(tradeValue.name, tradeValue.id, +e.target.value);
  });

  inputEl.classList.add("show-chart__input");

  return { inputEl, lableEl };
}

function makeChart(tradeID, xLables, tradePair, chartData) {
  new Chart(`myChart${tradeID}`, {
    type: "line",
    data: {
      labels: xLables,
      datasets: [
        {
          label: `${tradePair}`,

          pointRadius: 2,
          pointBackgroundColor: "rgba(0,0,0,1)",
          data: chartData,
          fill: true,
          backgroundColor: "rgba(0, 0, 254, 0.8)",
        },
      ],
    },
    options: {
      scales: {
        xAxes: [
          {
            ticks: {
              padding: 10,
            },
          },
        ],
      },
    },
  });
}

function getXaxisLables(data, precision) {
  return data
    .filter((item, index) => {
      return (index + 1) % precision === 0;
    })
    .map((item) => {
      return moment(item.time).format("YYYY/MM/DD");
    });
}

function getChartData(data, precision) {
  console.log(data);

  let tempYvalue = 0;
  let tempItem;
  let count = 0;
  let newData = [];

  console.log(count);
  console.log(newData);
  if (precision > 1) {
    for (let index = 0; index < data.length; index++) {
      if (count < precision - 1) {
        tempYvalue += data[index].volume;
        count++;
      } else if (count === precision - 1) {
        tempYvalue += data[index].volume;
        newData.push({
          x: moment(data[index].time).format("YYYY/MM/DD"),
          y: tempYvalue / precision,
        });

        count = 0;

        tempYvalue = 0;
      }
    }
  } else {
    newData = data.map((item) => {
      return {
        x: moment(item.time).format("YYYY/MM/DD"),
        y: item.volume,
      };
    });
  }

  return newData;
}
