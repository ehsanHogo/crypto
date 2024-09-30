// Show coins and trades
const coinsTableEl = document.getElementById("CoinsTable");

const tradeTableEl = document.getElementById("TradeTable");

let fetchedData = [];

let filteredCoins = [];

let filteredTrades = [];

let findLogoOfCoin = new Map();

async function fetchData() {
  try {
    const response = await fetch("https://api.exir.io/v2/constants");

    const data = await response.json();

    fetchedData = Object.entries(data.coins);
    filteredCoins = Object.entries(data.coins).slice(0, 30);
    filteredTrades = Object.values(data.pairs).slice(0, 30);

    // console.log(filteredCoins);
    // console.log(filteredTrades);

    fetchedData.map((coin) => {
      findLogoOfCoin.set(coin[0], coin[1].logo);
    });

    filteredCoins.map((coin) => {
      const coinCardEl = document.createElement("div");
      coinCardEl.innerHTML = `     
         <div class="coinCard">
          <div class="coinName">${coin[1].fullname}</div>
          <div class="coinLogo">
            <img class="logoPic" src="${coin[1].logo}" alt="${coin[1].fullname}" />
          </div>
        </div>`;

      coinsTableEl.appendChild(coinCardEl);
    });

    filteredTrades.map((trade) => {
      const tradeCard = document.createElement("div");
      tradeCard.innerHTML = `
                <div class="pairCard">
          <div class="pairName">${trade.name}</div>
          <div class="tradeCard">
            <div class="pairOne">
              <img class="coinLogo" src="${findLogoOfCoin.get(
                trade.pair_base
              )}" alt="logo" />
              <p>${trade.pair_base}</p>
            </div>

            <div class="pairTwo">
              <img class="coinLogo" src="${findLogoOfCoin.get(
                trade.pair_2
              )}" alt="logo" />

              <p>${trade.pair_2}</p>
            </div>

            <div class="pairPrice">${trade.min_price}$</div>
            <div class="pairPrice">${trade.max_price}$</div>
          </div>
        </div>
        `;

      tradeTableEl.appendChild(tradeCard);
    });
  } catch (e) {
    console.log(e);
  }
}

fetchData();
//Show Chart for trade

async function fetchTradeChart() {
  const res = await fetch(
    "https://api.exir.io/v2/chart?symbol=btc-usdt&resolution=1D&from=1616987453&to=1619579513"
  );

  if (!res.ok) {
    throw new Error("http request faild");
  } else {
    const data = await res.json();
    const cahrtData = data.map((item) => {
      //  return { x: item ,,y: item.volume}
    });

    console.log(data);
  }
}

fetchTradeChart();

const xyValues = [
  { x: 50, y: 7 },
  { x: 60, y: 8 },
  { x: 70, y: 8 },
  { x: 80, y: 9 },
  { x: 90, y: 9 },
  { x: 100, y: 9 },
  { x: 110, y: 10 },
  { x: 120, y: 11 },
  { x: 130, y: 14 },
  { x: 140, y: 14 },
  { x: 150, y: 15 },
];

new Chart("myChart", {
  type: "scatter",
  data: {
    datasets: [
      {
        pointRadius: 4,
        pointBackgroundColor: "rgba(0,0,255,1)",
        data: xyValues,
      },
    ],
  },
  options: {},
});

console.log(moment().format("MMMM Do YYYY, h:mm:ss a"));
