// Show coins and trades

const plugin = {
  id: "customCanvasBackgroundColor",
  beforeDraw: (chart, args, options) => {
    const { ctx } = chart;
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = options.color || "#99ffff";
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  },
};

async function fetchData() {
  const coinsTableEl = document.getElementById("CoinsTable");
  const tradeTableEl = document.getElementById("TradeTable");
  const showChartEl = document.getElementById("ShowChart");

  showChartEl.setAttribute("hideChart", "");
  // const bodyEl = document.querySelector("body");

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
  // console.log("precision : ", precision);s
  const res = await fetch(
    `https://api.exir.io/v2/chart?symbol=${tradePair}&resolution=1D&from=1711917000&to=1714509000`
  );

  if (!res.ok) {
    throw new Error("http request faild");
  } else {
    const data = await res.json();
    const xLables = getXaxislables(data, precision);
    const chartData = getChartData(data, precision);

    makeChart(tradeID, xLables, tradePair, chartData);

    // console.log(data);
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
       <div class="coinCard">
        <div class="coinName">${coinValue.fullname}</div>
        <div class="coinLogo">
          <img class="logoPic" src="${coinValue.logo}" alt="${coinValue.fullname}" />
        </div>
      </div>`;

    coinsTableEl.appendChild(coinCardEl);
  }
}

function showTrades(filteredTrades, tradeTableEl, data, showChartEl) {
  for (const trade in filteredTrades) {
    const tradeCardEl = document.createElement("div");
    tradeCardEl.classList.add("pairCard");
    // tradeCardEl.setAttribute("hideChart", "");

    const tradeValue = filteredTrades[trade];
    const { logo1, logo2 } = findLogo(
      data,
      tradeValue.pair_base,
      tradeValue.pair_2
    );

    // console.log(tradeValue);
    tradeCardEl.innerHTML = `
      <button class="tradeButtom" key="${tradeValue.id}" name="tradeCard${tradeValue.id}">
        <div class="pairName">${tradeValue.name}</div>
        <div class="tradeCard">

        <div class = "coinsPart">
          <div class="pairOne">
            <img class="coinLogo" src="${logo1}" alt="logo" />
            <p>${tradeValue.pair_base}</p>
          </div>

          <div class="pairTwo">
            <img class="coinLogo" src="${logo2}" alt="logo" />

            <p>${tradeValue.pair_2}</p>
          </div>

          </div>
      <div class  = "pricePart">
          <div class="pairPrice"><span class = "priceReport">Min Price : </span> ${tradeValue.min_price}$</div>
          <div class="pairPrice"> <span class = "priceReport">Max Price : </span> ${tradeValue.max_price}$</div>
        </div>
          </div>
      </button>
      `;

    tradeCardEl.addEventListener("click", () => {
      if (showChartEl.hasAttribute("hideChart")) {
        showChart(tradeValue, showChartEl);
      } else {
        const chartEl = document.getElementById(`TradeChart${tradeValue.id}`);
        // chartEl.remove();
        if (chartEl) {
          showChartEl.removeChild(showChartEl.children[0]);
          showChartEl.removeChild(showChartEl.children[0]);
          showChartEl.removeChild(showChartEl.children[0]);
          // showChartEl.removeChild(showChartEl.firstChild);
          // showChartEl.removeChild(showChartEl.firstChild);
          // showChartEl.removeChild(showChartEl.firstChild);
          // showChartEl.removeChild(showChartEl.firstChild);
          // showChartEl.removeChild(showChartEl.children[0]);
          // showChartEl.removeChild(showChartEl.children[1]);
          showChartEl.setAttribute("hideChart", "");
        } else {
          showChartEl.removeChild(showChartEl.children[0]);
          showChartEl.removeChild(showChartEl.children[0]);
          showChartEl.removeChild(showChartEl.children[0]);

          // showChartEl.removeChild(showChartEl.firstChild);
          // showChartEl.removeChild(showChartEl.firstChild);
          // showChartEl.removeChild(showChartEl.firstChild);
          // showChartEl.removeChild(showChartEl.firstChild);
          // showChartEl.removeChild(showChartEl.children[1]);
          showChart(tradeValue, showChartEl);
        }
      }
    });

    tradeTableEl.appendChild(tradeCardEl);
  }
}

function showChart(tradeValue, showChartEl) {
  const chartEl = document.createElement("div");
  // const precisionEl = document.getElementById("showPrecision")
  const { inputEl, lableEl } = getInputTag(tradeValue);
  chartEl.classList.add("chartCard");
  chartEl.setAttribute("id", `TradeChart${tradeValue.id}`);
  chartEl.innerHTML = ` <canvas id="myChart${tradeValue.id}" ></canvas>`;

  showChartEl.appendChild(chartEl);
  showChartEl.appendChild(lableEl);
  showChartEl.appendChild(inputEl);

  fetchTradeChart(`${tradeValue.name}`, tradeValue.id, 1);
  showChartEl.removeAttribute("hideChart");
}

function getInputTag(tradeValue) {
  const inputEl = document.createElement("input");
  const lableEl = document.createElement("lable");
  inputEl.setAttribute("name", "precision");
  lableEl.setAttribute("for", "precision");

  lableEl.innerText = "Precision";
  lableEl.classList.add("precisionLable");

  inputEl.addEventListener("change", (e) => {
    // console.log(e.target.value);

    fetchTradeChart(tradeValue.name, tradeValue.id, +e.target.value);
  });

  // inputEl.innerHTML = '<input class = "showChart--input" type= "text" />';
  inputEl.classList.add("showChart--input");

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
          pointBackgroundColor: "rgba(0,0,255,1)",
          data: chartData,
          fill: true,
          backgroundColor: "rgb(54, 162, 235)",
        },
      ],
    },
    options: {
      // plugins: {
      //   customCanvasBackgroundColor: {
      //     color: "white",
      //   },
      // },
      scales: {
        xAxes: [
          {
            // position: "top",
            ticks: {
              padding: 10,
              // callback: function (value, index, ticks) {
              //   return "    " + value + "   ";
              // },
            },
          },
        ],
      },
    },
  });
}

function getXaxislables(data, precision) {
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
        // console.log("here");
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

  // console.log(newData);

  return newData;
}
