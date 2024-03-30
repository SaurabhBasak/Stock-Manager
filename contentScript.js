(() => {
    let topLeftPanel;
    let currectStock = "";

    chrome.runtime.onMessage.addListener((object, sender, response) => {
        const { type, value, stockId } = object;
        console.log(stockId);

        if (type === "NEW") {
            currectStock = stockId;
            sendSearchParams(stockId).then(async (ticker) => {
                let tickerPrice = await fetchStockData(ticker);
                console.log(tickerPrice);
                chrome.runtime.sendMessage({
                    action: "updatePopup",
                    ticker: ticker,
                    tickerPrice: tickerPrice,
                });
            });
        }
    });

    async function sendSearchParams(stockId) {
        try {
            const response = await fetch("http://127.0.0.1:5000/searchParams", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ stockId }),
            });
            if (!response.ok) {
                throw new Error("Failed to send data to backend");
            }
            const responseData = await response.json();
            console.log("Response from backend:", responseData);
            newStockAdded(responseData["ticker"]);
            return responseData["ticker"];
        } catch (error) {
            console.error("Error in sending search params: ", error);
        }
    }

    const newStockAdded = async (ticker) => {
        const addStockBtnExists =
            document.getElementsByClassName("add-stock-btn")[0];
        const isStock = document.getElementsByClassName("REySof")[0];

        if (!addStockBtnExists && isStock) {
            const addStockBtn = document.createElement("button");

            addStockBtn.className = "add-stock-btn";
            addStockBtn.title = "Add stock to track it";
            addStockBtn.innerHTML = `Add ${ticker}`;

            topLeftPanel = document.getElementsByClassName("gb_Ud")[0];
            topLeftPanel.appendChild(addStockBtn);
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
            throw error; // Rethrow the error to be caught in the caller
        }
    }
})();
