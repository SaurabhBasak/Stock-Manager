function updateView() {
    chrome.storage.sync.get(["currentStocks"], (obj) => {
        const currentStocks = obj["currentStocks"]
            ? JSON.parse(obj["currentStocks"])
            : {};

        const stockList = document.getElementById("stock-list");
        for (const ticker in currentStocks) {
            const stockItem = document.createElement("div");
            stockItem.className = `${ticker}-stock`;
            const stockTicker = document.createElement("h3");
            stockItem.appendChild(stockTicker);
            stockTicker.innerHTML = `${ticker}: ${currentStocks[ticker].price}`;

            const stockPriceRange = document.createElement("div");

            stockPriceRange.className = `${ticker}-price-range`;

            const lowPriceDiv = document.createElement("div");

            const startLabel = document.createElement("label");
            const lowSvg = document.createElement("svg");

            startLabel.innerHTML = "↓";
            startLabel.style.fontSize = "20px";
            startLabel.style.lineHeight = "2px";
            const startRange = document.createElement("input");
            startRange.placeholder = "Enter Lower Price";
            startRange.value = currentStocks[ticker].low;

            lowPriceDiv.appendChild(startLabel);
            lowPriceDiv.appendChild(startRange);

            startRange.addEventListener("input", (event) => {
                const newValue = event.target.value;
                currentStocks[ticker].low = newValue;
                chrome.storage.sync.set({
                    currentStocks: JSON.stringify(currentStocks),
                });
            });

            const highPriceDiv= document.createElement("div");

            const endLabel = document.createElement("label");
            endLabel.innerHTML = "↑";
            endLabel.style.fontSize = "20px";
            endLabel.style.lineHeight = "2px";

            const endRange = document.createElement("input");
            endRange.placeholder = `${currentStocks[ticker].high}`;
            endRange.value = currentStocks[ticker].high;

            highPriceDiv.appendChild(endLabel);
            highPriceDiv.appendChild(endRange);

            endRange.addEventListener("input", (event) => {
                const newValue = event.target.value;
                currentStocks[ticker].high = newValue;
                chrome.storage.sync.set({
                    currentStocks: JSON.stringify(currentStocks),
                });
            });

            stockPriceRange.appendChild(lowPriceDiv);
            stockPriceRange.appendChild(highPriceDiv);
            stockItem.appendChild(stockPriceRange);

            const deleteStock = document.createElement("button");
            deleteStock.innerHTML = "Delete";
            deleteStock.style.color = "red";
            stockItem.appendChild(deleteStock);

            deleteStock.addEventListener("click", () => {
                stockItem.remove();
                delete currentStocks[ticker];
                chrome.storage.sync.set({
                    currentStocks: JSON.stringify(currentStocks),
                });
                chrome.tabs.query(
                    { active: true, currentWindow: true },
                    (tabs) => {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            type: "RENEW",
                            ticker,
                        });
                    }
                );
            });

            stockPriceRange.style.marginTop = "-15px";
            stockTicker.style.textAlign = "center";
            stockPriceRange.style.display = "flex";
            stockPriceRange.style.gap = "20px";
            startLabel.style.position = "relative";
            startLabel.style.top = "21px";
            startLabel.style.right = "7px";
            startLabel.style.color = "red";
            startLabel.style.fontWeight = "900";
            
            startRange.style.position = "relative";
            startRange.style.width = "100px";
            startRange.style.left = "4px";
            startRange.style.borderRadius = "3px";

            endLabel.style.position = "relative";
            endLabel.style.top = "21px";
            endLabel.style.right = "11px";
            endLabel.style.color = "green";
            endLabel.style.fontWeight = "900";
            endRange.style.position = "relative";
            endRange.style.width = "100px";
            endRange.style.borderRadius = "5px";

            
            deleteStock.style.marginTop = "10px";
            deleteStock.style.position = "relative";
            deleteStock.style.left = "35vw";
            deleteStock.style.fontWeight = "bold";

            stockItem.appendChild(document.createElement("br"));
            stockItem.appendChild(document.createElement("hr"));
            stockList.appendChild(stockItem);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    updateView();
});
