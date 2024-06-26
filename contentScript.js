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

    async function fetchStocks() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(["currentStocks"], (obj) => {
                resolve(
                    obj["currentStocks"] ? JSON.parse(obj["currentStocks"]) : {}
                );
            });
        });
    }

    async function updateStocks(data) {
        await new Promise((resolve, reject) => {
            chrome.storage.sync.set({ currentStocks: JSON.stringify(data) }, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    }

    setInterval(async () => {
        currentStocks = await fetchStocks();

        if (Object.keys(currentStocks).length > 0) {
            const tickersString = Object.keys(currentStocks).join(" ");
            let allPrices = await fetchMassStockData(tickersString);
            console.log(allPrices);

            for (let ticker in currentStocks) {
                console.log(ticker, currentStocks[ticker]);
                let currentPrice = parseFloat(allPrices[ticker]); // Ensure price is a number
                currentStocks[ticker].price = currentPrice.toFixed(2);

                if ((currentPrice < currentStocks[ticker].low || currentPrice > currentStocks[ticker].high) && currentStocks[ticker].notified === false) {
                    // Defining the email inside the loop, where it has access to the current ticker's data
                    currentStocks[ticker].notified = true;
                    console.log("Notified", ticker, currentStocks[ticker].notified);
                    let emailPayload = {
                        symbol: ticker,
                        currentPrice: currentStocks[ticker].price,
                        targetLow: currentStocks[ticker].low,
                        targetHigh: currentStocks[ticker].high,
                    };

                    // Calling  Flask endpoint to check the condition and send an email
                    fetch("http://127.0.0.1:5000/check-and-send-email", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(emailPayload),
                    })
                        .then((response) => response.json())
                        .then((data) => console.log(data.message))
                        .catch((error) => console.error("Error:", error));

                    // Log a message about the stock meeting the condition
                    console.log(
                        `Condition met for ${ticker}. Email payload sent.`
                    );
                }
            }

            await updateStocks(currentStocks);
        }
    }, 10000); // This sets up the code to run every 60 seconds

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
