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

            startRange.addEventListener("input", (event) => {
                const newValue = event.target.value;
                currentStocks[ticker].low = newValue;
                chrome.storage.sync.set({ currentStocks: JSON.stringify(currentStocks) });
            });

            const endLabel = document.createElement("label");
            endLabel.innerHTML = "High";
            const endRange = document.createElement("input");
            endRange.placeholder = "High";
            endRange.value = currentStocks[ticker].high;

            endRange.addEventListener("input", (event) => {
                const newValue = event.target.value;
                currentStocks[ticker].high = newValue;
                chrome.storage.sync.set({ currentStocks: JSON.stringify(currentStocks) });
            });

            stockPriceRange.appendChild(startLabel);
            stockPriceRange.appendChild(startRange);
            stockPriceRange.appendChild(endLabel);
            stockPriceRange.appendChild(endRange);
            stockItem.appendChild(stockPriceRange);

            const deleteStock = document.createElement("button");
            deleteStock.innerHTML = "Delete";
            deleteStock.style.color = "red";
            deleteStock.addEventListener("click", () => {
                deleteStock.innerHTML = "Deleted";
                deleteStock.style.color = "green";
                delete currentStocks[ticker];
                chrome.storage.sync.set({ currentStocks: JSON.stringify(currentStocks) });
            });
            stockItem.appendChild(deleteStock);
            
            stockItem.appendChild(document.createElement("br"));
            stockItem.appendChild(document.createElement("hr"));
            stockList.appendChild(stockItem);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    updateView();
});