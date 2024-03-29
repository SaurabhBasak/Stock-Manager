(() => {
    let topLeftPanel;
    let currectStock = "";

    chrome.runtime.onMessage.addListener((object, sender, response) => {
        const { type, value, stockId } = object;
        console.log(stockId);

        if (type === "NEW") {
            currectStock = stockId;
            sendSearchParams(stockId);
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
            // addStockBtn.addEventListener("click", addStockEventHandler);
        }
    };

    async function fetchStockData(ticker) {
        fetch("http://127.0.0.1:5000/stock", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ticker: ticker }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                console.log(data.currentPrice);
            })
            .catch((error) => {
                console.error(
                    "There was a problem with the fetch operation:",
                    error
                );
            });
    }

    // Call fetchStockData function when the content script is loaded
    fetchStockData("AAPL");
})();
