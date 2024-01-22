

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    chrome.tabs.captureVisibleTab(null, {format: "jpeg"}, function(dataUrl) { 
        
                   sendResponse({dataUrl});
        
    });
    return true;
});
