(() => {
    let topLeftPanel;
    let searchedStockTicker = "";

    chrome.runtime.onMessage.addListener((object, sender, response) => {
        const { type, ticker } = object;

        if (type === "NEW") {
            searchedStockTicker = ticker;
            newStockAdded(ticker);
        }
        else if (type === "RENEW") {
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

    const newStockAdded = async (ticker) => {
        const addStockBtnExists =
            document.getElementsByClassName("add-stock-btn")[0];
        const isStock = document.getElementsByClassName("REySof")[0];

        const currentStocks = await fetchStocks();

        if (currentStocks[ticker] !== undefined) {
            return;
        }

        if (!addStockBtnExists && isStock && ticker === searchedStockTicker) {
            
            const addStockBtn = document.createElement("button");

            addStockBtn.className = "add-stock-btn";
            addStockBtn.title = "Add stock to track it";
            addStockBtn.innerHTML = `Add ${ticker}`;
            addStockBtn.style.position = "relative";
            addStockBtn.style.marginTop = "6px";
            addStockBtn.style.height = "36px";
            addStockBtn.style.width = "100px";
            addStockBtn.style.borderRadius = "75px";
            addStockBtn.style.backgroundColor = "#58027a";
            addStockBtn.style.fontWeight = "500";
            addStockBtn.style.border = "none";

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
