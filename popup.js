function updateView() {
    chrome.storage.sync.get(["currentStocks"], (obj) => {
        const currentStocks = obj["currentStocks"]
            ? JSON.parse(obj["currentStocks"])
            : {};

        const stockList = document.getElementById("stock-list");
        let index = 0;
        for (const ticker in currentStocks) {
            index++;
            const stockItem = document.createElement("div");
            stockItem.className = `${ticker}-stock`;
            const stockTicker = document.createElement("h3");
            stockItem.appendChild(stockTicker);
            stockTicker.innerHTML = `${ticker}: ${currentStocks[ticker].price}`;

            if (index === 1) {            
                const priceRangeExplain = document.createElement("div");
                priceRangeExplain.style.position = "relative";
                priceRangeExplain.style.left = "22vw";
                priceRangeExplain.style.fontFamily = "Google Sans,Roboto,Helvetica,Arial,sans-serif";

                const priceRangeExplainText = document.createElement("p");
                priceRangeExplainText.innerHTML = "Preferred range";
                priceRangeExplainText.style.fontWeight = "500";

                const priceRangeExplainInfo = document.createElement("span");
                priceRangeExplainInfo.innerHTML = "ⓘ";
                priceRangeExplainInfo.style.fontSize = "15px";
                priceRangeExplainInfo.style.color = "#026b9c";
                priceRangeExplainInfo.style.position = "relative";
                priceRangeExplainInfo.style.top = "1px";
                priceRangeExplainInfo.style.left = "5px";
                priceRangeExplainInfo.style.cursor = "pointer";
                priceRangeExplainText.appendChild(priceRangeExplainInfo);

                const priceRangeExplainHover = document.createElement("div");
                priceRangeExplainHover.style.position = "absolute";
                priceRangeExplainHover.style.top = "-115%";
                priceRangeExplainHover.style.right = "28vw";
                priceRangeExplainHover.style.width = "70vw";
                priceRangeExplainHover.style.padding = "0 10px";
                priceRangeExplainHover.style.backgroundColor = "white";
                priceRangeExplainHover.style.border = "1px solid black";
                priceRangeExplainHover.style.borderRadius = "4px";
                priceRangeExplainHover.style.display = "none";
                priceRangeExplainHover.style.opacity = "0";
                priceRangeExplainHover.style.zIndex = "100";
                priceRangeExplainHover.style.boxShadow = "0 2px 10px 10px rgba(0, 0, 0, 0.3)";

                const priceRangeExplainHoverText = document.createElement("p");
                priceRangeExplainHoverText.innerHTML = "Once you set your preferred price range, we will notify you when the stock price falls out of the range.";
                priceRangeExplainHoverText.style.color = "#333";
                priceRangeExplainHoverText.style.fontFamily = "Arial, sans-serif";
                priceRangeExplainHoverText.style.lineHeight = "1.5";

                priceRangeExplainHover.appendChild(priceRangeExplainHoverText);
                priceRangeExplain.appendChild(priceRangeExplainHover);

                priceRangeExplainInfo.addEventListener("mouseover", () => {
                    priceRangeExplainHover.style.display = "block";
                    priceRangeExplainHover.style.opacity = "1";
                });

                priceRangeExplainInfo.addEventListener("mouseout", () => {
                    priceRangeExplainHover.style.opacity = "0";
                    priceRangeExplainHover.style.display = "none";
                });
                
                priceRangeExplainHover.addEventListener("mouseover", () => {
                    priceRangeExplainHover.style.display = "block";
                    priceRangeExplainHover.style.opacity = "1";
                });
                
                priceRangeExplainHover.addEventListener("mouseout", async () => {
                    priceRangeExplainHover.style.opacity = "0";
                    priceRangeExplainHover.style.display = "none";
                });

                priceRangeExplain.appendChild(priceRangeExplainText);
                stockItem.appendChild(priceRangeExplain);
            }

            const stockPriceRange = document.createElement("div");

            stockPriceRange.className = `${ticker}-price-range`;

            const lowPriceDiv = document.createElement("div");

            const startLabel = document.createElement("label");

            startLabel.innerHTML = "↓";
            startLabel.style.fontSize = "20px";
            startLabel.style.lineHeight = "2px";

            const startRange = document.createElement("input");
            startRange.type = "number";
            startRange.placeholder = "Lower bound";
            startRange.style.border = "1px solid black";
            startRange.value = currentStocks[ticker].low;

            lowPriceDiv.appendChild(startLabel);
            lowPriceDiv.appendChild(startRange);

            startRange.addEventListener("input", (event) => {
                const newValue = parseFloat(event.target.value).toFixed(2);
                currentStocks[ticker].low = newValue;
                currentStocks[ticker].notified = false;
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
            endRange.type = "number"
            endRange.placeholder = "Upper bound";
            endRange.style.border = "1px solid black";
            endRange.value = currentStocks[ticker].high;

            highPriceDiv.appendChild(endLabel);
            highPriceDiv.appendChild(endRange);

            endRange.addEventListener("input", (event) => {
                const newValue = parseFloat(event.target.value).toFixed(2);
                currentStocks[ticker].high = newValue;
                currentStocks[ticker].notified = false;
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
            deleteStock.style.cursor = "pointer";
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

            stockPriceRange.style.marginTop = "-21px";
            stockTicker.style.textAlign = "center";
            stockPriceRange.style.display = "flex";
            stockPriceRange.style.gap = "30px";
            startLabel.style.position = "relative";
            startLabel.style.top = "21px";
            startLabel.style.right = "7px";
            startLabel.style.color = "red";
            startLabel.style.fontWeight = "900";
            
            startRange.style.position = "relative";
            startRange.style.width = "80px";
            startRange.style.left = "4px";
            startRange.style.borderRadius = "3px";

            endLabel.style.position = "relative";
            endLabel.style.top = "21px";
            endLabel.style.right = "11px";
            endLabel.style.color = "green";
            endLabel.style.fontWeight = "900";
            endRange.style.position = "relative";
            endRange.style.width = "80px";
            endRange.style.borderRadius = "5px";

            deleteStock.style.marginTop = "10px";
            deleteStock.style.position = "relative";
            deleteStock.style.left = "32vw";
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
