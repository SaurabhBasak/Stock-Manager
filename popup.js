// chrome.runtime.onMessage.addListener((message, sender, response) => {
//     if (message.action === "addStock") {
//         addNewStock(message.ticker, message.tickerPrice);
//     }
// });

// const addNewStock = (ticker, tickerPrice) => {
//     const stockInfo = document.getElementById("stock-info");
//     const newStock = document.createElement("h2");
//     newStock.innerHTML = `${ticker} - ${tickerPrice}`;
//     stockInfo.appendChild(newStock);
// };