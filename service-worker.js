let newTicker = "";
let currentStocks = {};

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
    if (changeInfo.status === "complete") {
        chrome.tabs.get(tabId, async function (tab) {
            if (tab.url && tab.url.includes("google.com/search")) {
                const queryParameters = tab.url.split("?")[1];
                const urlParameters = new URLSearchParams(queryParameters);

                const parameters = urlParameters.get("q");
                const ticker = await sendSearchParams(parameters);

                chrome.tabs.sendMessage(tabId, {
                    type: "NEW",
                    ticker,
                });
            }
        });
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


async function sendSearchParams(parameters) {
    try {
        const response = await fetch("http://127.0.0.1:5000/searchParams", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ parameters: parameters }),
        });
        if (!response.ok) {
            throw new Error("Failed to send data to backend");
        }
        const responseData = await response.json();
        console.log("Response from backend:", responseData);
        return responseData["ticker"];
    } catch (error) {
        console.error("Error in sending search params: ", error);
    }
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { action, ticker } = request;
    if (action === "addStock") {
        addStockEventHandler(ticker);
    }
});


const addStockEventHandler = async (ticker) => {
    let tickerPrice = await fetchStockData(ticker);
    tickerPrice = tickerPrice.toFixed(2);
    const newStockDetails = {
        price: tickerPrice,
        low: tickerPrice - 10,
        high: tickerPrice,
        notified: false,
    };

    currentStocks = await fetchStocks();

    console.log(newStockDetails);

    if (!currentStocks[ticker]) {
        currentStocks[ticker] = newStockDetails;
        chrome.storage.sync.set({
            currentStocks: JSON.stringify(currentStocks),
        });
    }
};


setInterval(async () => {
    const currentStocks = await fetchStocks(); 

    if (Object.keys(currentStocks).length > 0) {
        const tickersString = Object.keys(currentStocks).join(" ");
        let allPrices = await fetchMassStockData(tickersString); 
        console.log(allPrices);

        for (let ticker in currentStocks) {
            let currentPrice = parseFloat(allPrices[ticker]); // Ensure price is a number
            currentStocks[ticker].price = currentPrice.toFixed(2);

            if (currentPrice < currentStocks[ticker].low || currentPrice > currentStocks[ticker].high) {
                // Defining the email inside the loop, where it has access to the current ticker's data
                let emailPayload = {
                    symbol: ticker,
                    currentPrice: currentPrice,
                    targetLow: currentStocks[ticker].low,
                    targetHigh: currentStocks[ticker].high
                };

                // Calling  Flask endpoint to check the condition and send an email
                fetch('http://127.0.0.1:5000/check-and-send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(emailPayload),
                })
                .then(response => response.json())
                .then(data => console.log(data.message))
                .catch(error => console.error('Error:', error));

                // Log a message about the stock meeting the condition
                console.log(`Condition met for ${ticker}. Email payload sent.`);
            }
        }

        // Update Chrome storage outside the loop, after all conditions are checked
        chrome.storage.sync.set({
            currentStocks: JSON.stringify(currentStocks),
        });
    }
}, 60000); // This sets up the code to run every 60 seconds


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


async function fetchStockData(ticker) {
    try {
        const response = await fetch("http://127.0.0.1:5000/stock", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ticker: ticker }),
        });
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return data.currentPrice;
    } catch (error) {
        console.error("Error fetching stock data:", error);
        throw error;
    }
}
