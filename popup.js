function updateView() {
    chrome.storage.sync.get(["currentStocks"], (obj) => {
        const currentStocks = obj["currentStocks"] ? JSON.parse(obj["currentStocks"]) : {};
        // console.log("Popup", currentStocks);
        // const currentStocks = {};
        const stockList = document.getElementById("stock-list");
        for (const ticker in currentStocks) {
            const stockItem = document.createElement("div");
            stockItem.className = `${ticker}-stock`;
            const stockTicker = document.createElement("h3");
            stockItem.appendChild(stockTicker);
            stockTicker.innerHTML = `${ticker}: ${currentStocks[ticker].price}`;

            const stockPriceRange = document.createElement("div");

            stockPriceRange.className = `${ticker}-price-range`;
            const startLabel = document.createElement("label");
            startLabel.innerHTML = "Low";
            const startRange = document.createElement("input");
            startRange.placeholder = "Low";
            startRange.value = currentStocks[ticker].low;

            const endLabel = document.createElement("label");
            endLabel.innerHTML = "High";
            const endRange = document.createElement("input");
            endRange.placeholder = "High";
            endRange.value = currentStocks[ticker].high;

            stockPriceRange.appendChild(startLabel);
            stockPriceRange.appendChild(startRange);
            stockPriceRange.appendChild(endLabel);
            stockPriceRange.appendChild(endRange);
            stockItem.appendChild(stockPriceRange);
            
            stockItem.appendChild(document.createElement("br"));
            stockItem.appendChild(document.createElement("hr"));
            stockList.appendChild(stockItem);
        }
    });

}

document.addEventListener("DOMContentLoaded", updateView);