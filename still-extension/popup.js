// popup.js

let timerInterval = null;

function updateUI() {
  chrome.runtime.sendMessage({ type: "GET_STATE" }, (res) => {
    if (!res || !res.state) return;
    const { activeIntention } = res.state;

    const activeContainer = document.getElementById("activeContainer");
    const inputContainer = document.getElementById("inputContainer");

    if (activeIntention) {
      activeContainer.style.display = "block";
      inputContainer.style.display = "none";
      document.getElementById("intentionLabel").innerText = activeIntention.label;

      if (timerInterval) clearInterval(timerInterval);

      timerInterval = setInterval(() => {
        const totalSeconds = Math.floor((Date.now() - activeIntention.startTime) / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const h = String(hours).padStart(2, '0');
        const m = String(minutes).padStart(2, '0');
        const s = String(seconds).padStart(2, '0');

        document.getElementById("timer").innerText = `${h}:${m}:${s}`;
      }, 1000);
    } else {
      activeContainer.style.display = "none";
      inputContainer.style.display = "block";
      if (timerInterval) clearInterval(timerInterval);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const setBtn = document.getElementById("setBtn");
  if (setBtn) {
    setBtn.addEventListener("click", () => {
      const val = document.getElementById("intentionInput").value.trim();
      if (!val) return;

      chrome.runtime.sendMessage({
        type: "SET_INTENTION",
        label: val
      }, () => {
        document.getElementById("intentionInput").value = "";
        updateUI();
      });
    });
  }

  const finishBtn = document.getElementById("finishBtn");
  if (finishBtn) {
    finishBtn.addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "CLEAR_INTENTION" }, () => {
        updateUI();
      });
    });
  }

  updateUI();
});