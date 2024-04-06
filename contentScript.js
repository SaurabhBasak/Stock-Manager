(() => {
    let topLeftPanel;

    chrome.runtime.onMessage.addListener((object, sender, response) => {
        const { type, ticker } = object;
        console.log(ticker);

        if (type === "NEW") {
            console.log("Ticker", ticker);
            newStockAdded(ticker);
        }
    });

    const newStockAdded = async (ticker) => {
        const addStockBtnExists =
            document.getElementsByClassName("add-stock-btn")[0];
        const isStock = document.getElementsByClassName("REySof")[0];

        if (!addStockBtnExists && isStock) {
            const addStockBtn = document.createElement("button");

            addStockBtn.className = "add-stock-btn";
            addStockBtn.title = "Add stock to track it";
            addStockBtn.innerHTML = `Add ${ticker}`;

            topLeftPanel = document.getElementsByClassName("gb_a gb_i gb_ld")[0];
            const newDiv = topLeftPanel.appendChild(document.createElement("div"));
            newDiv.appendChild(addStockBtn);
            addStockBtn.addEventListener("click", () =>
                chrome.runtime.sendMessage({
                    action: "addStock",
                    ticker: ticker,
                })
            );
        }
    };
})();
