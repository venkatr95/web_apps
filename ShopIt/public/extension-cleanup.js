// Browser extension attribute cleanup script
// This script runs before React hydration to remove browser extension attributes
// that cause hydration mismatches

(function () {
  "use strict";

  function removeExtensionAttributes() {
    // List of common browser extension attributes that cause hydration issues
    const extensionAttributes = [
      "cz-shortcut-listen", // ColorZilla
      "data-new-gr-c-s-check-loaded", // Grammarly
      "data-gr-ext-installed", // Grammarly
      "data-adblockkey", // AdBlock
      "spellcheck", // Various extensions
      "data-gramm", // Grammarly alternative
      "data-gramm_editor", // Grammarly editor
    ];

    // Clean body element
    const body = document.body;
    if (body) {
      extensionAttributes.forEach((attr) => {
        if (body.hasAttribute(attr)) {
          body.removeAttribute(attr);
        }
      });
    }

    // Clean html element
    const html = document.documentElement;
    if (html) {
      // Remove extension-added styles
      const style = html.getAttribute("style");
      if (style && style.includes("--vsc-domain")) {
        html.removeAttribute("style");
      }

      // Remove other extension attributes
      extensionAttributes.forEach((attr) => {
        if (html.hasAttribute(attr)) {
          html.removeAttribute(attr);
        }
      });
    }

    // Clean any other elements with extension attributes
    extensionAttributes.forEach((attr) => {
      try {
        const elements = document.querySelectorAll(`[${attr}]`);
        elements.forEach((el) => el.removeAttribute(attr));
      } catch (e) {
        // Ignore errors for invalid selectors
      }
    });
  }

  // Run immediately if document is already loaded
  if (document.readyState === "loading") {
    // Run as soon as DOM is ready but before React hydration
    document.addEventListener("DOMContentLoaded", removeExtensionAttributes);
  } else {
    removeExtensionAttributes();
  }

  // Also run when the page fully loads as a backup
  window.addEventListener("load", removeExtensionAttributes);
})();
