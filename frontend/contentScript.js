(() => {
    let topLeftPanel;
    let currectStock = "";

    chrome.runtime.onMessage.addListener((object, sender, response) => {
        const { type, value, stockId } = object;

        if (type === "NEW") {
            currectStock = stockId;
            newStockAdded();
        }
    });

    const newStockAdded = async () => {
        const addStockBtnExists =
            document.getElementsByClassName("add-stock-btn")[0];
        const isStock = document.getElementsByClassName("REySof")[0];

        if (!addStockBtnExists && isStock) {
            const addStockBtn = document.createElement("button");

            addStockBtn.className = "add-stock-btn";
            addStockBtn.title = "Add stock to track it";
            addStockBtn.innerHTML = "Add stock";

            topLeftPanel = document.getElementsByClassName("gb_Ud")[0];
            topLeftPanel.appendChild(addStockBtn);
            // addStockBtn.addEventListener("click", addStockEventHandler);
        }
    };
})();
