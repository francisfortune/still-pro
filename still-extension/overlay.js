chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.type === "SHOW_STILL_OVERLAY") {
    injectOverlay(req.intention);
  }
});

function injectOverlay(intentionLabel) {
  if (document.getElementById("still-overlay-root")) return;

  const overlayDiv = document.createElement("div");
  overlayDiv.id = "still-overlay-root";
  
  overlayDiv.innerHTML = `
    <div class="still-card">
      <div class="still-header">STILL</div>
      <p class="still-prompt">You said you wanted to <strong>${intentionLabel || "stay focused"}</strong>.</p>
      <p class="still-sub">You've been away from your intention for a moment. Is this still what you want to be doing?</p>
      
      <div id="still-step-1">
        <button class="still-btn still-primary" id="still-btn-return">← Return to my intention</button>
        <button class="still-btn still-secondary" id="still-btn-intentional">I'm here intentionally</button>
        <button class="still-btn still-tertiary" id="still-btn-break">☕ I need a break</button>
      </div>

      <div id="still-step-2" style="display:none;">
        <p class="still-prompt" style="font-size:14px; margin-bottom:12px;">Why are you here?</p>
        <div class="still-chip-grid">
          <button class="still-chip" data-cat="Research">Research</button>
          <button class="still-chip" data-cat="Work">Work</button>
          <button class="still-chip" data-cat="Communication">Communication</button>
          <button class="still-chip" data-cat="Entertainment">Entertainment</button>
          <button class="still-chip" data-cat="Something else">Something else</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlayDiv);

  // Button Listeners
  document.getElementById("still-btn-return").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "RETURN_TO_INTENTION" });
    removeOverlay();
  });

  document.getElementById("still-btn-break").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "TAKE_BREAK" });
    removeOverlay();
  });

  document.getElementById("still-btn-intentional").addEventListener("click", () => {
    document.getElementById("still-step-1").style.display = "none";
    document.getElementById("still-step-2").style.display = "block";
  });

  // Handle temporary activity categorization
  const chips = overlayDiv.querySelectorAll(".still-chip");
  chips.forEach(chip => {
    chip.addEventListener("click", (e) => {
      const category = e.target.getAttribute("data-cat");
      chrome.runtime.sendMessage({ type: "SET_NEW_TEMP_ACTIVITY", category }, () => {
        removeOverlay();
      });
    });
  });
}

function removeOverlay() {
  const el = document.getElementById("still-overlay-root");
  if (el) el.remove();
}