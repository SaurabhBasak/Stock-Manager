chrome.tabs.onUpdated.addListener( async (tabId, changeInfo) => {
    if (changeInfo.status === "complete") {
        chrome.tabs.get(tabId, function (tab) {
            if (tab.url && tab.url.includes("google.com/search")) {
                const queryParameters = tab.url.split("?")[1];
                const urlParameters = new URLSearchParams(queryParameters);

                console.log(urlParameters.get("q"));
                chrome.tabs.sendMessage(tabId, {
                    type: "NEW",
                    stockId: urlParameters.get("q"),
                });
            }
        });
    }
});
