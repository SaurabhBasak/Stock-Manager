chrome.runtime.onMessage.addListener((message, sender, response) => {
    if (message.action === "updatePopup") {
        const stockInfo = document.getElementById("stock-info");
        stockInfo.innerHTML = `${message.ticker} - ${message.tickerPrice}`;
    }
});