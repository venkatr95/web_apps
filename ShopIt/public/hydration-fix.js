// Client-side script to handle browser extension attributes
// This prevents hydration mismatches caused by browser extensions

(function () {
  "use strict";

  // Function to clean up browser extension attributes
  function cleanExtensionAttributes() {
    // Remove common browser extension attributes that cause hydration mismatches
    const attributesToRemove = [
      "cz-shortcut-listen",
      "data-new-gr-c-s-check-loaded",
      "data-gr-ext-installed",
      "data-adblockkey",
      "spellcheck",
    ];

    // Clean HTML element
    const htmlElement = document.documentElement;
    if (htmlElement) {
      // Remove problematic style attributes added by extensions
      const style = htmlElement.getAttribute("style");
      if (style && style.includes("--vsc-domain")) {
        htmlElement.removeAttribute("style");
      }
    }

    // Clean body element
    const bodyElement = document.body;
    if (bodyElement) {
      attributesToRemove.forEach((attr) => {
        if (bodyElement.hasAttribute(attr)) {
          bodyElement.removeAttribute(attr);
        }
      });
    }

    // Clean any other elements with extension attributes
    attributesToRemove.forEach((attr) => {
      const elements = document.querySelectorAll(`[${attr}]`);
      elements.forEach((el) => el.removeAttribute(attr));
    });
  }

  // Run cleanup before React hydration
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cleanExtensionAttributes);
  } else {
    cleanExtensionAttributes();
  }

  // Also run on window load as a safety net
  window.addEventListener("load", cleanExtensionAttributes);

  // Monitor for dynamic attribute additions by extensions
  if (typeof MutationObserver !== "undefined") {
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === "attributes") {
          const target = mutation.target;
          const attributeName = mutation.attributeName;

          // Remove problematic attributes as they're added
          if (
            attributeName === "cz-shortcut-listen" ||
            attributeName === "data-new-gr-c-s-check-loaded" ||
            attributeName === "data-gr-ext-installed"
          ) {
            target.removeAttribute(attributeName);
          }
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: [
        "cz-shortcut-listen",
        "data-new-gr-c-s-check-loaded",
        "data-gr-ext-installed",
        "style",
      ],
    });
  }
})();
