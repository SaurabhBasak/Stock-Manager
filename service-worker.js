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

async function fetchStocks() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(["currentStocks"], (obj) => {
            resolve(
                obj["currentStocks"] ? JSON.parse(obj["currentStocks"]) : {}
            );
        });
    });
};

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
    console.log(currentStocks);
    for (let ticker in currentStocks) {
        currentStocks[ticker].notified = false;
        console.log("Changed", ticker, currentStocks[ticker].notified);
    }
    await updateStocks(currentStocks);
    currentStocks = {};
    console.log(currentStocks);
    currentStocks = await fetchStocks();
    console.log(currentStocks);
}, 30000);

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
    tickerPrice = parseFloat(tickerPrice);
    const roundedPrice = tickerPrice.toFixed(2); // Convert to string representation
    const low = parseFloat(roundedPrice) - 10; // Perform arithmetic operation first
    const high = parseFloat(roundedPrice) + 10;
    const newStockDetails = {
        price: roundedPrice,
        low: low,
        high: high,
        notified: false,
    };

    const currentStocks = await fetchStocks();

    console.log(newStockDetails);

    if (!currentStocks[ticker]) {
        currentStocks[ticker] = newStockDetails;
        chrome.storage.sync.set({
            currentStocks: JSON.stringify(currentStocks),
        });
    }
};


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
