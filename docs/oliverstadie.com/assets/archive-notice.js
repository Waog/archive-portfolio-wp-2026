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

// ── Disable archived contact forms ──────────────────────────────
(function () {
  function createArchiveOverlay(options) {
    var overlay = document.createElement("div");
    overlay.className = "archived-form-overlay";

    var stamp = document.createElement("div");
    stamp.className = "archived-form-stamp";
    stamp.innerHTML =
      "🗃️ " +
      options.title +
      '<div class="archived-form-note">' +
      options.note +
      "</div>" +
      '<a class="archived-form-link" href="https://oliverstadie.com">Visit Current Portfolio</a>';

    overlay.appendChild(stamp);
    return overlay;
  }

  function createSearchOverlay() {
    var overlay = document.createElement("div");
    overlay.className = "archived-search-overlay";
    overlay.hidden = true;

    var badge = document.createElement("div");
    badge.className = "archived-search-badge";
    badge.innerHTML =
      "🗃️ Archived mode: search is unavailable." +
      '<span class="archived-search-note">For current content and contact details, please visit my live portfolio.</span>' +
      '<a class="archived-search-link" href="https://oliverstadie.com">Visit Current Portfolio</a>';

    overlay.appendChild(badge);
    document.body.appendChild(overlay);
    return overlay;
  }

  function syncSearchOverlay(wrapper) {
    var overlay = wrapper._archivedSearchOverlay;
    var rect;
    var isVisible;

    if (!overlay) {
      return;
    }

    rect = wrapper.getBoundingClientRect();
    isVisible =
      rect.width > 0 &&
      rect.height > 0 &&
      window.getComputedStyle(wrapper).display !== "none";

    if (!isVisible) {
      overlay.hidden = true;
      return;
    }

    overlay.hidden = false;
    overlay.style.left = rect.left + "px";
    overlay.style.top = rect.top + "px";
    overlay.style.width = rect.width + "px";
    overlay.style.height = rect.height + "px";
    overlay.style.borderRadius = window.getComputedStyle(wrapper).borderRadius;
  }

  function scheduleSearchOverlaySync(wrapper) {
    window.requestAnimationFrame(function () {
      syncSearchOverlay(wrapper);
      window.setTimeout(function () {
        syncSearchOverlay(wrapper);
      }, 450);
      window.setTimeout(function () {
        syncSearchOverlay(wrapper);
      }, 700);
    });
  }

  function lockControl(el) {
    el.setAttribute("aria-disabled", "true");
    el.tabIndex = -1;

    if (
      "readOnly" in el &&
      !/^(button|submit|reset|checkbox|radio|range|file|color|hidden)$/i.test(
        el.type || "",
      )
    ) {
      el.readOnly = true;
    }
  }

  function disableControls(container, selector) {
    container.querySelectorAll(selector).forEach(function (el) {
      lockControl(el);
    });
  }

  function preventSubmission(form) {
    if (!form || form.getAttribute("data-archived-submit-locked") === "true") {
      return;
    }

    form.setAttribute("data-archived-submit-locked", "true");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      event.stopPropagation();
    });
  }

  function disableForms() {
    var wrappers = document.querySelectorAll(".cb_form_wrapper");
    wrappers.forEach(function (wrapper) {
      if (wrapper.querySelector(".archived-form-overlay")) {
        return;
      }

      wrapper.classList.add("archived-overlay-host");
      disableControls(wrapper, "input, textarea, select, button");
      preventSubmission(wrapper.querySelector("form"));
      wrapper.appendChild(
        createArchiveOverlay({
          title: "Archived mode: this contact form is unavailable",
          note: "To get in touch, please visit my current portfolio.",
        }),
      );
    });
  }

  function disableSearchForms() {
    var wrappers = document.querySelectorAll(".header-search-block");
    wrappers.forEach(function (wrapper) {
      disableControls(wrapper, "input, textarea, select, button");
      preventSubmission(wrapper.querySelector("form"));

      if (!wrapper._archivedSearchOverlay) {
        wrapper._archivedSearchOverlay = createSearchOverlay();
      }

      if (wrapper.getAttribute("data-archived-search-observed") !== "true") {
        wrapper.setAttribute("data-archived-search-observed", "true");

        var observer = new MutationObserver(function () {
          scheduleSearchOverlaySync(wrapper);
        });

        observer.observe(wrapper, {
          attributes: true,
          attributeFilter: ["class", "style"],
        });
      }

      scheduleSearchOverlaySync(wrapper);
    });

    document.querySelectorAll(".search-toggle").forEach(function (toggle) {
      if (toggle.getAttribute("data-archived-search-bound") === "true") {
        return;
      }

      toggle.setAttribute("data-archived-search-bound", "true");
      toggle.addEventListener("click", function () {
        document
          .querySelectorAll(".header-search-block")
          .forEach(function (wrapper) {
            scheduleSearchOverlaySync(wrapper);
          });
      });
    });

    window.addEventListener("resize", function () {
      document
        .querySelectorAll(".header-search-block")
        .forEach(function (wrapper) {
          scheduleSearchOverlaySync(wrapper);
        });
    });

    window.addEventListener("scroll", function () {
      document
        .querySelectorAll(".header-search-block")
        .forEach(function (wrapper) {
          syncSearchOverlay(wrapper);
        });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      disableForms();
      disableSearchForms();
    });
  } else {
    disableForms();
    disableSearchForms();
  }
})();
