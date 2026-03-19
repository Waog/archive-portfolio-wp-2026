(function () {
  var STORAGE_KEY = "archiveNoticeDecisionV1";
  var TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

  function now() {
    return Date.now();
  }

  function readDecision() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }

      var data = JSON.parse(raw);
      if (
        !data ||
        data.decision !== "stay" ||
        typeof data.expiresAt !== "number"
      ) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      if (data.expiresAt <= now()) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return data;
    } catch (e) {
      return null;
    }
  }

  function writeDecision(decision) {
    if (decision !== "stay") {
      return;
    }

    try {
      var payload = {
        decision: decision,
        expiresAt: now() + TWENTY_FOUR_HOURS_MS,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      // Ignore storage errors and keep the modal functional.
    }
  }

  function closeModal(overlay) {
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
    document.body.classList.remove("archive-notice-open");
  }

  function openModal() {
    var overlay = document.createElement("div");
    overlay.className = "archive-notice-overlay";

    var modal = document.createElement("section");
    modal.className = "archive-notice-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "archive-notice-title");

    var content = document.createElement("div");
    content.className = "archive-notice-content";

    content.innerHTML =
      '<div class="archive-notice-hero">' +
      '  <div class="archive-notice-icon-wrap" aria-hidden="true">' +
      '    <span class="archive-notice-emoji">🗃️</span>' +
      "  </div>" +
      '  <div class="archive-notice-headline">' +
      '    <p class="archive-notice-badge">Archive Notice</p>' +
      '    <h2 id="archive-notice-title" class="archive-notice-title">This page is part of an outdated web archive.</h2>' +
      "  </div>" +
      "</div>" +
      '<p class="archive-notice-text">You can find the current portfolio at <strong>oliverstadie.com</strong>. This archived version may contain outdated content and links, and some features may no longer work or display correctly.</p>' +
      '<div class="archive-notice-actions">' +
      '  <button class="archive-notice-btn archive-notice-btn-secondary" type="button" data-archive-action="stay">Continue to archive</button>' +
      '  <a class="archive-notice-btn archive-notice-btn-primary" href="https://oliverstadie.com" data-archive-action="leave">Visit current portfolio</a>' +
      "</div>" +
      '<p class="archive-notice-footnote">Your choice is saved for 24 hours.</p>';

    modal.appendChild(content);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    document.body.classList.add("archive-notice-open");

    var leaveLink = overlay.querySelector('[data-archive-action="leave"]');
    var stayButton = overlay.querySelector('[data-archive-action="stay"]');

    leaveLink.addEventListener("click", function () {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        // Ignore storage errors.
      }
    });

    stayButton.addEventListener("click", function () {
      writeDecision("stay");
      closeModal(overlay);
    });
  }

  if (readDecision()) {
    return;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", openModal);
  } else {
    openModal();
  }
})();
