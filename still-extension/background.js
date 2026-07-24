// background.js

const DEFAULT_STATE = {
  activeIntention: null, // { label: string, startTime: number }
  intentionalSubGoal: null, // Temporary goal when browsing with intent
  distractingDomains: ["youtube.com", "instagram.com", "twitter.com", "x.com", "reddit.com", "tiktok.com"]
};

async function getState() {
  const data = await chrome.storage.local.get("still_state");
  return data.still_state || DEFAULT_STATE;
}

async function setState(newState) {
  await chrome.storage.local.set({ still_state: newState });
}

// Listen for messages from popup and overlay
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SET_INTENTION") {
    (async () => {
      const state = await getState();
      state.activeIntention = {
        label: message.label,
        startTime: Date.now()
      };
      state.intentionalSubGoal = null;
      await setState(state);
      sendResponse({ status: "SUCCESS", state });
    })();
    return true;
  }

  if (message.type === "GET_STATE") {
    getState().then((state) => sendResponse({ state }));
    return true;
  }

  if (message.type === "SET_INTENTIONAL_SUBGOAL") {
    (async () => {
      const state = await getState();
      state.intentionalSubGoal = message.subGoal;
      await setState(state);

      // Trigger check-in alarm after 10 minutes
      chrome.alarms.create("stillSubGoalCheck", { delayInMinutes: 10 });
      sendResponse({ status: "SUBGOAL_SET" });
    })();
    return true;
  }

  if (message.type === "CLEAR_INTENTION") {
    (async () => {
      const state = await getState();
      state.activeIntention = null;
      state.intentionalSubGoal = null;
      await setState(state);
      await chrome.alarms.clearAll();
      sendResponse({ status: "CLEARED" });
    })();
    return true;
  }
});

// Detect when navigating to potential distraction sites
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const state = await getState();
    if (!state.activeIntention) return; // No active intention set

    const url = new URL(tab.url);
    const domain = url.hostname.replace("www.", "");

    const isDistracting = state.distractingDomains.some((d) => domain.includes(d));

    if (isDistracting && !state.intentionalSubGoal) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["content.js"]
        });

        chrome.tabs.sendMessage(tabId, {
          type: "SHOW_REFLECTOR",
          intention: state.activeIntention.label,
          domain: domain
        });
      } catch (err) {
        console.warn("Could not inject Still reflector:", err);
      }
    }
  }
});

// Check-in alarm for intentional sub-goals
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "stillSubGoalCheck") {
    const state = await getState();
    if (!state.activeIntention || !state.intentionalSubGoal) return;

    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab?.id) {
      chrome.tabs.sendMessage(activeTab.id, {
        type: "SHOW_CHECK_IN",
        intention: state.activeIntention.label,
        subGoal: state.intentionalSubGoal
      });
    }
  }
});