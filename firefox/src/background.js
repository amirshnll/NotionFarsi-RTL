firefox.runtime.onInstalled.addListener(() => {
  console.log("NotionFarsi-RTL Extension Installed.");
});

// Handle toolbar icon click to open donation page
browser.browserAction.onClicked.addListener(() => {
  browser.tabs.create({ url: "https://ashokri.com/donate" });
});
