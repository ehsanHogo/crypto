const coinsTableEl = document.getElementById("CoinsTable");

let filteredCoins = [];

async function fetchData() {
  try {
    const response = await fetch("https://api.exir.io/v2/constants");

    const data = await response.json();

    filteredCoins = Object.values(data.coins).slice(0, 30);

    console.log(filteredCoins);

    filteredCoins.map((coin) => {
      const coinCardEl = document.createElement("div");
      coinCardEl.innerHTML = `     
         <div class="coinCard">
          <div class="coinName">${coin.fullname}</div>
          <div class="coinLogo">
            <img class="logoPic" src="${coin.logo}" alt="${coin.fullname}" />
          </div>
        </div>`;

      coinsTableEl.appendChild(coinCardEl);
    });
  } catch (e) {
    console.log(e);
  }
}

fetchData();
