chrome.runtime.onInstalled.addListener(() => {
  console.log("NotionFarsi-RTL Extension Installed.");
});

// Handle toolbar icon click to open donation page
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: "https://ashokri.com/donate" });
});
