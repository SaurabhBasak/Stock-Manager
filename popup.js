function updateView() {
    chrome.storage.sync.get(["currentStocks"], (obj) => {
        const currentStocks = obj["currentStocks"] ? JSON.parse(obj["currentStocks"]) : {};
        // console.log("Popup", currentStocks);
        const stockList = document.getElementById("stock-list");
        for (const ticker in currentStocks) {
            const stockItem = document.createElement("div").appendChild(document.createElement("h2"));
            stockItem.className = `${ticker} stock`;
            stockItem.innerHTML = `${ticker}: ${currentStocks[ticker].price}`;
            stockList.appendChild(stockItem);
        }
    });

}

document.addEventListener("DOMContentLoaded", updateView);