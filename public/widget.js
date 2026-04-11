/**
 * ChatBotWidget — Embeddable chat widget
 * Drop-in integration for any website. No framework, no build step.
 *
 * Usage:
 *   <script src="https://yourdomain.com/widget.js"></script>
 *   <script>
 *     ChatBotWidget.init({
 *       apiUrl: "https://yourdomain.com/api/chat",
 *       userId: "guest_123",
 *       botName: "Support Bot",
 *       primaryColor: "#2563eb",
 *       position: "right"
 *     });
 *   </script>
 */

(function () {
  "use strict";

  // ── Namespace guard ────────────────────────────────────────────────────────
  // Prevent double-initialisation if script is loaded more than once
  if (window.ChatBotWidget && window.ChatBotWidget._initialised) return;

  // ── Default configuration ─────────────────────────────────────────────────
  const DEFAULTS = {
    apiUrl: "http://localhost:5000/api/chat",
    userId: "guest_" + Math.random().toString(36).slice(2, 9),
    botName: "Support Bot",
    welcomeMessage: "👋 Hi there! How can I help you today?",
    primaryColor: "#2563eb",
    position: "right", // "left" or "right"
  };

  // ── State ─────────────────────────────────────────────────────────────────
  let config = {};
  let isOpen = false;
  let isTyping = false;

  // ── DOM refs (populated during build) ────────────────────────────────────
  let widgetRoot, chatWindow, messagesContainer, inputField, sendButton, toggleButton;

  // ═════════════════════════════════════════════════════════════════════════
  // STYLES — injected as a <style> tag so they're scoped to our class names
  // All class names are prefixed with cbw- to avoid conflicts with host site
  // ═════════════════════════════════════════════════════════════════════════

  function injectStyles(primaryColor) {
    const style = document.createElement("style");
    style.id = "cbw-styles";
    style.textContent = `
      /* ── Reset for widget elements only ── */
      .cbw-root * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }

      /* ── Floating toggle button ── */
      .cbw-toggle {
        position: fixed;
        bottom: 24px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: ${primaryColor};
        color: #fff;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2147483646;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .cbw-toggle:hover {
        transform: scale(1.08);
        box-shadow: 0 6px 24px rgba(0,0,0,0.3);
      }
      .cbw-toggle svg {
        width: 26px;
        height: 26px;
        fill: #fff;
        transition: opacity 0.2s;
      }

      /* ── Chat window ── */
      .cbw-window {
        position: fixed;
        bottom: 92px;
        width: 360px;
        max-width: calc(100vw - 32px);
        height: 500px;
        max-height: calc(100vh - 120px);
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 8px 40px rgba(0,0,0,0.18);
        display: flex;
        flex-direction: column;
        z-index: 2147483645;
        overflow: hidden;
        transform: translateY(16px);
        opacity: 0;
        pointer-events: none;
        transition: transform 0.25s ease, opacity 0.25s ease;
      }
      .cbw-window.cbw-open {
        transform: translateY(0);
        opacity: 1;
        pointer-events: auto;
      }

      /* ── Position variants ── */
      .cbw-pos-right .cbw-toggle { right: 24px; }
      .cbw-pos-right .cbw-window { right: 24px; }
      .cbw-pos-left  .cbw-toggle { left: 24px; }
      .cbw-pos-left  .cbw-window { left: 24px; }

      /* ── Header ── */
      .cbw-header {
        background: ${primaryColor};
        color: #fff;
        padding: 14px 16px;
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
      }
      .cbw-header-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(255,255,255,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        flex-shrink: 0;
      }
      .cbw-header-info { flex: 1; }
      .cbw-header-name { font-weight: 600; font-size: 15px; }
      .cbw-header-status { font-size: 12px; opacity: 0.85; }
      .cbw-close-btn {
        background: none;
        border: none;
        color: #fff;
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
        display: flex;
        opacity: 0.8;
        transition: opacity 0.15s;
      }
      .cbw-close-btn:hover { opacity: 1; }
      .cbw-close-btn svg { width: 20px; height: 20px; fill: #fff; }

      /* ── Messages area ── */
      .cbw-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: #f8f9fb;
        scroll-behavior: smooth;
      }
      .cbw-messages::-webkit-scrollbar { width: 4px; }
      .cbw-messages::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }

      /* ── Individual message bubbles ── */
      .cbw-msg {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        max-width: 88%;
        animation: cbw-fadein 0.2s ease;
      }
      .cbw-msg-bot { align-self: flex-start; }
      .cbw-msg-user { align-self: flex-end; flex-direction: row-reverse; }

      .cbw-bubble {
        padding: 10px 14px;
        border-radius: 18px;
        font-size: 14px;
        line-height: 1.5;
        word-break: break-word;
      }
      .cbw-msg-bot .cbw-bubble {
        background: #fff;
        color: #111827;
        border-bottom-left-radius: 4px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      }
      .cbw-msg-user .cbw-bubble {
        background: ${primaryColor};
        color: #fff;
        border-bottom-right-radius: 4px;
      }

      /* ── Typing indicator ── */
      .cbw-typing .cbw-bubble {
        padding: 12px 16px;
      }
      .cbw-typing-dots {
        display: flex;
        gap: 4px;
        align-items: center;
      }
      .cbw-typing-dots span {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #9ca3af;
        animation: cbw-bounce 1.2s infinite ease-in-out;
      }
      .cbw-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
      .cbw-typing-dots span:nth-child(3) { animation-delay: 0.4s; }

      /* ── Error message ── */
      .cbw-error .cbw-bubble {
        background: #fee2e2;
        color: #b91c1c;
        font-size: 13px;
      }

      /* ── Input area ── */
      .cbw-input-area {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        border-top: 1px solid #e5e7eb;
        background: #fff;
        flex-shrink: 0;
      }
      .cbw-input {
        flex: 1;
        border: 1.5px solid #e5e7eb;
        border-radius: 24px;
        padding: 9px 16px;
        font-size: 14px;
        outline: none;
        resize: none;
        line-height: 1.4;
        color: #111827;
        background: #f9fafb;
        transition: border-color 0.2s;
        max-height: 80px;
        overflow-y: auto;
      }
      .cbw-input:focus { border-color: ${primaryColor}; background: #fff; }
      .cbw-input::placeholder { color: #9ca3af; }
      .cbw-send-btn {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: ${primaryColor};
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: opacity 0.2s, transform 0.15s;
      }
      .cbw-send-btn:hover { opacity: 0.88; transform: scale(1.05); }
      .cbw-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
      .cbw-send-btn svg { width: 18px; height: 18px; fill: #fff; }

      /* ── Animations ── */
      @keyframes cbw-fadein {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes cbw-bounce {
        0%, 60%, 100% { transform: translateY(0); }
        30%           { transform: translateY(-5px); }
      }

      /* ── Mobile adjustments ── */
      @media (max-width: 480px) {
        .cbw-window {
          width: calc(100vw - 16px);
          bottom: 82px;
          left: 8px !important;
          right: 8px !important;
        }
        .cbw-toggle { bottom: 16px; }
        .cbw-pos-right .cbw-toggle { right: 16px; }
        .cbw-pos-left  .cbw-toggle { left: 16px; }
      }
    `;
    document.head.appendChild(style);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // SVG ICONS
  // ═════════════════════════════════════════════════════════════════════════

  const ICON_CHAT = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.792 1.32 5.29 3.407 6.969L4.5 21.5l4.103-1.98A10.7 10.7 0 0012 20.486c5.523 0 10-4.145 10-9.243S17.523 2 12 2z"/>
  </svg>`;

  const ICON_CLOSE = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6l12 12" stroke="#fff" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  </svg>`;

  const ICON_SEND = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`;

  // ═════════════════════════════════════════════════════════════════════════
  // DOM BUILDER
  // ═════════════════════════════════════════════════════════════════════════

  function buildDOM() {
    // Root wrapper — holds position class and contains everything
    widgetRoot = document.createElement("div");
    widgetRoot.className = `cbw-root cbw-pos-${config.position}`;

    // ── Toggle button (floating bubble) ──────────────────────────────────
    toggleButton = document.createElement("button");
    toggleButton.className = "cbw-toggle";
    toggleButton.setAttribute("aria-label", "Open chat");
    toggleButton.innerHTML = ICON_CHAT;
    toggleButton.addEventListener("click", toggleChat);

    // ── Chat window ───────────────────────────────────────────────────────
    chatWindow = document.createElement("div");
    chatWindow.className = "cbw-window";
    chatWindow.setAttribute("role", "dialog");
    chatWindow.setAttribute("aria-label", config.botName);

    // Header
    const header = document.createElement("div");
    header.className = "cbw-header";
    header.innerHTML = `
      <div class="cbw-header-avatar">🤖</div>
      <div class="cbw-header-info">
        <div class="cbw-header-name">${escapeHtml(config.botName)}</div>
        <div class="cbw-header-status">Online · Ready to help</div>
      </div>
    `;
    const closeBtn = document.createElement("button");
    closeBtn.className = "cbw-close-btn";
    closeBtn.setAttribute("aria-label", "Close chat");
    closeBtn.innerHTML = ICON_CLOSE;
    closeBtn.addEventListener("click", closeChat);
    header.appendChild(closeBtn);

    // Messages container
    messagesContainer = document.createElement("div");
    messagesContainer.className = "cbw-messages";
    messagesContainer.setAttribute("aria-live", "polite");

    // Input area
    const inputArea = document.createElement("div");
    inputArea.className = "cbw-input-area";

    inputField = document.createElement("textarea");
    inputField.className = "cbw-input";
    inputField.placeholder = "Type a message…";
    inputField.rows = 1;
    inputField.setAttribute("aria-label", "Chat message");
    inputField.addEventListener("keydown", handleKeydown);
    inputField.addEventListener("input", autoResizeTextarea);

    sendButton = document.createElement("button");
    sendButton.className = "cbw-send-btn";
    sendButton.setAttribute("aria-label", "Send message");
    sendButton.innerHTML = ICON_SEND;
    sendButton.addEventListener("click", handleSend);

    inputArea.appendChild(inputField);
    inputArea.appendChild(sendButton);

    // Assemble window
    chatWindow.appendChild(header);
    chatWindow.appendChild(messagesContainer);
    chatWindow.appendChild(inputArea);

    // Assemble root
    widgetRoot.appendChild(chatWindow);
    widgetRoot.appendChild(toggleButton);

    document.body.appendChild(widgetRoot);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // CHAT LOGIC
  // ═════════════════════════════════════════════════════════════════════════

  function toggleChat() {
    isOpen ? closeChat() : openChat();
  }

  function openChat() {
    isOpen = true;
    chatWindow.classList.add("cbw-open");
    toggleButton.setAttribute("aria-label", "Close chat");
    toggleButton.innerHTML = ICON_CLOSE;
    // Focus input for accessibility
    setTimeout(() => inputField.focus(), 250);
  }

  function closeChat() {
    isOpen = false;
    chatWindow.classList.remove("cbw-open");
    toggleButton.setAttribute("aria-label", "Open chat");
    toggleButton.innerHTML = ICON_CHAT;
  }

  /** Enter sends; Shift+Enter adds a newline */
  function handleKeydown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  /** Auto-grow textarea up to ~3 lines */
  function autoResizeTextarea() {
    inputField.style.height = "auto";
    inputField.style.height = Math.min(inputField.scrollHeight, 80) + "px";
  }

  async function handleSend() {
    const text = inputField.value.trim();
    if (!text || isTyping) return;

    // Render user message
    appendMessage("user", text);
    inputField.value = "";
    inputField.style.height = "auto";

    // Show typing indicator
    const typingEl = showTypingIndicator();
    setInputDisabled(true);

    try {
      const data = await sendToAPI(text);
      typingEl.remove();
      appendMessage("bot", data.reply);
    } catch (err) {
      typingEl.remove();
      appendMessage("error", "⚠️ Couldn't reach the server. Please try again.");
    } finally {
      setInputDisabled(false);
      inputField.focus();
    }
  }

  async function sendToAPI(message) {
    const response = await fetch(config.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: config.userId, message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "API error");
    }

    return data;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // MESSAGE RENDERING
  // ═════════════════════════════════════════════════════════════════════════

  function appendMessage(type, text) {
    const wrapper = document.createElement("div");

    if (type === "user") {
      wrapper.className = "cbw-msg cbw-msg-user";
      wrapper.innerHTML = `<div class="cbw-bubble">${escapeHtml(text)}</div>`;
    } else if (type === "bot") {
      wrapper.className = "cbw-msg cbw-msg-bot";
      wrapper.innerHTML = `<div class="cbw-bubble">${escapeHtml(text)}</div>`;
    } else if (type === "error") {
      wrapper.className = "cbw-msg cbw-msg-bot cbw-error";
      wrapper.innerHTML = `<div class="cbw-bubble">${escapeHtml(text)}</div>`;
    }

    messagesContainer.appendChild(wrapper);
    scrollToBottom();
  }

  function showTypingIndicator() {
    const el = document.createElement("div");
    el.className = "cbw-msg cbw-msg-bot cbw-typing";
    el.innerHTML = `
      <div class="cbw-bubble">
        <div class="cbw-typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>`;
    messagesContainer.appendChild(el);
    scrollToBottom();
    return el;
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═════════════════════════════════════════════════════════════════════════

  function setInputDisabled(disabled) {
    isTyping = disabled;
    inputField.disabled = disabled;
    sendButton.disabled = disabled;
  }

  /** Prevent XSS — always escape user-controlled text before inserting as HTML */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PUBLIC API — window.ChatBotWidget
  // ═════════════════════════════════════════════════════════════════════════

  window.ChatBotWidget = {
    _initialised: false,

    /**
     * Initialises and mounts the chat widget.
     * @param {object} userConfig - Overrides for default configuration
     */
    init(userConfig = {}) {
      if (this._initialised) {
        console.warn("ChatBotWidget: already initialised. Call destroy() first.");
        return;
      }

      // Merge user config over defaults
      config = Object.assign({}, DEFAULTS, userConfig);

      // Validate position
      if (!["left", "right"].includes(config.position)) {
        config.position = "right";
      }

      // Inject CSS
      injectStyles(config.primaryColor);

      // Build and mount the widget DOM
      buildDOM();

      // Show the welcome message
      appendMessage("bot", config.welcomeMessage);

      this._initialised = true;
    },

    /** Programmatically open the chat window */
    open() { if (isOpen === false) openChat(); },

    /** Programmatically close the chat window */
    close() { if (isOpen === true) closeChat(); },

    /** Remove the widget entirely from the page */
    destroy() {
      if (widgetRoot) widgetRoot.remove();
      const styleEl = document.getElementById("cbw-styles");
      if (styleEl) styleEl.remove();
      this._initialised = false;
    },
  };
})();
