// Show coins and trades

async function fetchData() {
  const coinsTableEl = document.getElementById("CoinsTable");
  const tradeTableEl = document.getElementById("TradeTable");

  let filteredTrades = [];
  let filteredCoins = [];

  try {
    const response = await fetch("https://api.exir.io/v2/constants");

    const data = await response.json();

    filteredCoins = data.coins;

    filteredTrades = data.pairs;

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

    for (const trade in filteredTrades) {
      const tradeCardEl = document.createElement("div");
      tradeCardEl.classList.add("pairCard");
      tradeCardEl.setAttribute("hideChart", "");

      const tradeValue = filteredTrades[trade];
      const { logo1, logo2 } = findLogo(
        data,
        tradeValue.name.split("-")[0],
        tradeValue.name.split("-")[1]
      );
      tradeCardEl.innerHTML = `
        <button class="tradeButtom" key="${tradeValue.id}" name=         "tradeCard${tradeValue.id}">
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
        if (tradeCardEl.hasAttribute("hideChart")) {
          fetchTradeChart(`${tradeValue.name}`, tradeValue.id);
          const chartEl = document.createElement("div");
          chartEl.classList.add("chartCard");
          chartEl.setAttribute("id", `TradeChart${tradeValue.id}`);
          chartEl.innerHTML = `    <canvas id="myChart${tradeValue.id}" style="width: 100%; max-width: 700px"></canvas>`;

          tradeCardEl.appendChild(chartEl);
          tradeCardEl.removeAttribute("hideChart");
        } else {
          const chartEl = document.getElementById(`TradeChart${tradeValue.id}`);
          chartEl.remove();
          tradeCardEl.setAttribute("hideChart", "");
        }
      });

      tradeTableEl.appendChild(tradeCardEl);
    }
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
    const chartData = data.map((item) => {
      return { x: moment(item.time).format("D"), y: item.volume };
    });

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
          },
        ],
      },
      options: {},
    });

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
