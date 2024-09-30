// Show coins and trades

async function fetchData() {
  const coinsTableEl = document.getElementById("CoinsTable");
  const tradeTableEl = document.getElementById("TradeTable");
  let logoOfCoins = new Map();
  let filteredTrades = [];
  let filteredCoins = [];
  let fetchedData = [];

  try {
    const response = await fetch("https://api.exir.io/v2/constants");

    const data = await response.json();

    fetchedData = Object.entries(data.coins);
    filteredCoins = Object.entries(data.coins).slice(0, 30);
    filteredTrades = Object.values(data.pairs).slice(0, 30);

    fetchedData.forEach((coin) => {
      logoOfCoins.set(coin[0], coin[1].logo);
    });

    filteredCoins.forEach((coin) => {
      const coinCardEl = document.createElement("div");
      const coinValue = coin[1];
      coinCardEl.innerHTML = `     
         <div class="coinCard">
          <div class="coinName">${coinValue.fullname}</div>
          <div class="coinLogo">
            <img class="logoPic" src="${coinValue.logo}" alt="${coinValue.fullname}" />
          </div>
        </div>`;

      coinsTableEl.appendChild(coinCardEl);
    });

    filteredTrades.forEach((trade) => {
      const tradeCardEl = document.createElement("div");
      tradeCardEl.classList.add("pairCard");
      tradeCardEl.setAttribute("hideChart", "");

      tradeCardEl.innerHTML = `
        <button class="tradeButtom" key="${trade.id}" name=         "tradeCard${
        trade.id
      }">
          <div class="pairName">${trade.name}</div>
          <div class="tradeCard">
            <div class="pairOne">
              <img class="coinLogo" src="${logoOfCoins.get(
                trade.pair_base
              )}" alt="logo" />
              <p>${trade.pair_base}</p>
            </div>

            <div class="pairTwo">
              <img class="coinLogo" src="${logoOfCoins.get(
                trade.pair_2
              )}" alt="logo" />

              <p>${trade.pair_2}</p>
            </div>

            <div class="pairPrice">${trade.min_price}$</div>
            <div class="pairPrice">${trade.max_price}$</div>
          </div>
        </button>
        `;

      tradeCardEl.addEventListener("click", () => {
        if (tradeCardEl.hasAttribute("hideChart")) {
          fetchTradeChart(`${trade.name}`, trade.id);
          const chartEl = document.createElement("div");
          chartEl.classList.add("chartCard");
          chartEl.setAttribute("id", "TradeChart");
          chartEl.innerHTML = `    <canvas id="myChart${trade.id}" style="width: 100%; max-width: 700px"></canvas>`;

          tradeCardEl.appendChild(chartEl);
          tradeCardEl.removeAttribute("hideChart");
        } else {
          const chartEl = document.getElementById("TradeChart");
          chartEl.remove();
          tradeCardEl.setAttribute("hideChart", "");
        }
      });

      tradeTableEl.appendChild(tradeCardEl);
    });
  } catch (e) {
    console.log(e);
  }
}

fetchData();
//Show Chart for trade

async function fetchTradeChart(tradePair, tradeID) {
  const res = await fetch(
    `https://api.exir.io/v2/chart?symbol=${tradePair}&resolution=1D&from=1711917000&to=1714509000`
  );

  if (!res.ok) {
    throw new Error("http request faild");
  } else {
    const data = await res.json();
    const xLables = [...Array(32).keys()].slice(1);
    const chartData = datafilteredTrades.forEach((item) => {
      return { x: moment(item.time).format("D"), y: item.volume };
    });

    new Chart(`myChart${tradeID}`, {
      type: "line",
      data: {
        labels: xLables,
        datasets: [
          {
            label: `${tradePair}`,

            pointRadius: 4,
            pointBackgroundColor: "rgba(0,0,255,1)",
            data: chartData,
          },
        ],
      },
      options: {},
    });

    // console.log(data);
  }
}
