(() => {
    let topLeftPanel;
    let searchedStockTicker = "";
    let currentStocks = {};

    chrome.runtime.onMessage.addListener((object, sender, response) => {
        const { type, ticker } = object;

        if (type === "NEW") {
            searchedStockTicker = ticker;
            newStockAdded(ticker);
        } else if (type === "RENEW") {
            newStockAdded(ticker);
        }
    });

    const fetchStocks = async () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get(["currentStocks"], (obj) => {
                resolve(
                    obj["currentStocks"] ? JSON.parse(obj["currentStocks"]) : {}
                );
            });
        });
    };

    setInterval(async () => {
        currentStocks = await fetchStocks();

        if (Object.keys(currentStocks).length > 0) {
            const tickersString = Object.keys(currentStocks).join(" ");
            let allPrices = await fetchMassStockData(tickersString);
            console.log(allPrices);
            for (let ticker in currentStocks) {
                currentStocks[ticker].price = allPrices[ticker].toFixed(2);

                if (currentStocks[ticker].price < currentStocks[ticker].low) {
                    console.log(
                        `Price of ${ticker} is below the low price. Current price: ${currentStocks[ticker].price}, Low price: ${currentStocks[ticker].low}`
                    );
                } else if (
                    currentStocks[ticker].price > currentStocks[ticker].high
                ) {
                    console.log(
                        `Price of ${ticker} is above the high price. Current price: ${currentStocks[ticker].price}, High price: ${currentStocks[ticker].high}`
                    );
                }
            }

            chrome.storage.sync.set({
                currentStocks: JSON.stringify(currentStocks),
            });
        }
    }, 60000);

    async function fetchMassStockData(tickers) {
        try {
            const response = await fetch("http://127.0.0.1:5000/massStock", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ tickers: tickers }),
            });
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const prices = await response.json();
            return prices;
        } catch (error) {
            console.error("Error fetching stock data:", error);
            throw error;
        }
    }

    const newStockAdded = async (ticker) => {
        const addStockBtnExists =
            document.getElementsByClassName("add-stock-btn")[0];
        const isStock = document.getElementsByClassName("REySof")[0];

        currentStocks = await fetchStocks();

        if (currentStocks[ticker] !== undefined) {
            return;
        }

        if (!addStockBtnExists && isStock && ticker === searchedStockTicker) {
            const addStockBtn = document.createElement("button");

            addStockBtn.style.cursor = "pointer";
            addStockBtn.className = "add-stock-btn";
            addStockBtn.title = "Add stock to track it";
            addStockBtn.innerHTML = `Add ${ticker}`;
            addStockBtn.style.position = "relative";
            addStockBtn.style.marginTop = "6px";
            addStockBtn.style.height = "36px";
            addStockBtn.style.width = "80px";
            addStockBtn.style.borderRadius = "4px";
            addStockBtn.style.backgroundColor = "#81c995";
            addStockBtn.style.fontWeight = "500";
            addStockBtn.style.color = "#202124";
            addStockBtn.style.border = "none";
            addStockBtn.style.fontFamily =
                "Google Sans,Roboto,Helvetica,Arial,sans-serif";

            topLeftPanel =
                document.getElementsByClassName("gb_a gb_i gb_md")[0];

            const buttonDiv = topLeftPanel.appendChild(
                document.createElement("div")
            );
            buttonDiv.appendChild(addStockBtn);
            addStockBtn.addEventListener("click", () => {
                buttonDiv.remove();
                chrome.runtime.sendMessage({
                    action: "addStock",
                    ticker: ticker,
                });
            });
        }
    };
})();
