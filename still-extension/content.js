// content.js

function removeExistingOverlay() {
  const existing = document.getElementById("still-overlay-root");
  if (existing) existing.remove();
}

function createReflectorOverlay(intentionText, domain) {
  removeExistingOverlay();

  // Full-screen backdrop
  const overlay = document.createElement("div");
  overlay.id = "still-overlay-root";
  overlay.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background-color: rgba(255, 255, 255, 0.98) !important;
    z-index: 2147483647 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    color: #0f172a !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    box-sizing: border-box !important;
    padding: 20px !important;
  `;

  // Center card
  const card = document.createElement("div");
  card.style.cssText = `
    text-align: center !important;
    max-width: 440px !important;
    width: 100% !important;
    padding: 40px !important;
    background-color: #ffffff !important;
    border: 1.5px solid #e2e8f0 !important;
    border-radius: 24px !important;
    box-shadow: 0 20px 40px rgba(37, 99, 235, 0.08) !important;
  `;

  // Header tag
  const tag = document.createElement("div");
  tag.innerText = "WAIT A MOMENT";
  tag.style.cssText = `
    font-size: 11px !important;
    font-weight: 800 !important;
    letter-spacing: 1.5px !important;
    color: #2563eb !important;
    margin-bottom: 12px !important;
  `;

  // Prompt Question
  const title = document.createElement("h2");
  title.innerText = `You said you were ${intentionText}.`;
  title.style.cssText = `
    font-size: 22px !important;
    font-weight: 800 !important;
    margin: 0 0 8px 0 !important;
    color: #0f172a !important;
    line-height: 1.3 !important;
  `;

  const subtitle = document.createElement("p");
  subtitle.innerText = `Why are you opening ${domain}?`;
  subtitle.style.cssText = `
    font-size: 15px !important;
    color: #64748b !important;
    margin: 0 0 28px 0 !important;
  `;

  // Dynamic Content View (Initial Options vs. Search Input)
  const actionContainer = document.createElement("div");

  function renderOptionsView() {
    actionContainer.innerHTML = "";

    // Button 1: Intentional Search
    const specificBtn = document.createElement("button");
    specificBtn.innerText = "I need something specific";
    specificBtn.style.cssText = `
      width: 100% !important;
      background-color: #2563eb !important;
      color: #ffffff !important;
      border: none !important;
      border-radius: 12px !important;
      padding: 14px 20px !important;
      font-weight: 700 !important;
      font-size: 14px !important;
      cursor: pointer !important;
      margin-bottom: 12px !important;
      transition: background-color 0.2s !important;
    `;
    specificBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      renderInputView();
    });

    // Button 2: Accidental Distraction
    const distractedBtn = document.createElement("button");
    distractedBtn.innerText = "I'm just distracted";
    distractedBtn.style.cssText = `
      width: 100% !important;
      background-color: #f1f5f9 !important;
      color: #334155 !important;
      border: 1px solid #cbd5e1 !important;
      border-radius: 12px !important;
      padding: 14px 20px !important;
      font-weight: 600 !important;
      font-size: 14px !important;
      cursor: pointer !important;
    `;
    distractedBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      renderDistractedView();
    });

    actionContainer.appendChild(specificBtn);
    actionContainer.appendChild(distractedBtn);
  }

  function renderInputView() {
    actionContainer.innerHTML = "";

    const inputLabel = document.createElement("div");
    inputLabel.innerText = "What are you looking for?";
    inputLabel.style.cssText = `
      font-size: 13px !important;
      font-weight: 700 !important;
      color: #2563eb !important;
      text-align: left !important;
      margin-bottom: 8px !important;
    `;

    const subInput = document.createElement("input");
    subInput.type = "text";
    subInput.placeholder = "e.g. React tutorial for beginners";
    subInput.style.cssText = `
      width: 100% !important;
      box-sizing: border-box !important;
      background: #ffffff !important;
      border: 1.5px solid #2563eb !important;
      border-radius: 10px !important;
      padding: 12px !important;
      font-size: 14px !important;
      color: #0f172a !important;
      outline: none !important;
      margin-bottom: 12px !important;
    `;

    const confirmBtn = document.createElement("button");
    confirmBtn.innerText = "Find it";
    confirmBtn.style.cssText = `
      width: 100% !important;
      background-color: #2563eb !important;
      color: #ffffff !important;
      border: none !important;
      border-radius: 10px !important;
      padding: 12px !important;
      font-weight: 700 !important;
      font-size: 14px !important;
      cursor: pointer !important;
    `;

    confirmBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const val = subInput.value.trim();
      if (!val) return;

      chrome.runtime.sendMessage({
        type: "SET_INTENTIONAL_SUBGOAL",
        subGoal: val
      }, () => {
        overlay.remove();
      });
    });

    actionContainer.appendChild(inputLabel);
    actionContainer.appendChild(subInput);
    actionContainer.appendChild(confirmBtn);
  }

  function renderDistractedView() {
    actionContainer.innerHTML = "";

    const note = document.createElement("p");
    note.innerText = "That's okay. Do you want to go back to what you were doing?";
    note.style.cssText = `
      font-size: 14px !important;
      color: #64748b !important;
      margin-bottom: 20px !important;
    `;

    const backBtn = document.createElement("button");
    backBtn.innerText = "Go back to " + intentionText;
    backBtn.style.cssText = `
      width: 100% !important;
      background-color: #2563eb !important;
      color: #ffffff !important;
      border: none !important;
      border-radius: 12px !important;
      padding: 14px 20px !important;
      font-weight: 700 !important;
      font-size: 14px !important;
      cursor: pointer !important;
    `;

    backBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.history.back();
      overlay.remove();
    });

    actionContainer.appendChild(note);
    actionContainer.appendChild(backBtn);
  }

  renderOptionsView();

  card.appendChild(tag);
  card.appendChild(title);
  card.appendChild(subtitle);
  card.appendChild(actionContainer);
  overlay.appendChild(card);

  (document.body || document.documentElement).appendChild(overlay);
}

// Receive triggers from background service worker
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SHOW_REFLECTOR") {
    createReflectorOverlay(message.intention, message.domain);
  }
});