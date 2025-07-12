let currentTabId = null;
let currentDomain = null;
let startTime = Date.now(); // when you started watching the tab

// Function to get domain name from full URL
function extractDomain(url) {
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname;

    // Filter out chrome://, extensions, and newtab pages
    if (
      url.startsWith("chrome://") ||
      url.includes("chrome-extension://") ||
      domain === "newtab" ||
      domain === ""
    ) {
      return null;
    }

    return domain;
  } catch (e) {
    return null;
  }
}


// Function to store time spent
function updateTimeSpent() {
  if (!currentDomain) return; // skip invalid domains

  const timeSpent = Math.floor((Date.now() - startTime) / 1000);

  chrome.storage.local.get(["timeData"], (res) => {
    let timeData = res.timeData || {};
    if (!timeData[currentDomain]) timeData[currentDomain] = 0;

    timeData[currentDomain] += timeSpent;

    chrome.storage.local.set({ timeData });
    console.log(`⏱️ +${timeSpent}s on ${currentDomain}`);
  });
}


// When user switches tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  updateTimeSpent(); // store time for previous tab

  const tab = await chrome.tabs.get(activeInfo.tabId);
  currentTabId = tab.id;
  currentDomain = extractDomain(tab.url);
  startTime = Date.now(); // reset timer
});

// When a tab updates (like URL changes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.status === "complete") {
    updateTimeSpent();
    currentTabId = tab.id;
    currentDomain = extractDomain(tab.url);
    startTime = Date.now();
  }
});

// When user minimizes or switches away
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    updateTimeSpent();
  }
});
