let newTicker = "";
let currentStocks = [];


chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
    if (changeInfo.status === "complete") {
        chrome.tabs.get(tabId, async function (tab) {
            if (tab.url && tab.url.includes("google.com/search")) {
                const queryParameters = tab.url.split("?")[1];
                const urlParameters = new URLSearchParams(queryParameters);

                // console.log(urlParameters.get("q"));
                const parameters = urlParameters.get("q");
                const ticker = await sendSearchParams(parameters, tabId);

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
        chrome.storage.sync.get([newTicker], (obj) => {
            resolve(obj[newTicker] ? JSON.parse(obj[newTicker]) : []);
        });
    });
};


async function sendSearchParams(parameters, tabId) {
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
        ticker,
        tickerPrice,
    };

    currentStocks = await fetchStocks();

    console.log(newStockDetails);
    console.log(currentStocks);

    if (!currentStocks.find((stock) => stock["ticker"] === newStockDetails["ticker"])){
        chrome.storage.sync.set({
            [newTicker]: JSON.stringify([...currentStocks, newStockDetails]),
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
