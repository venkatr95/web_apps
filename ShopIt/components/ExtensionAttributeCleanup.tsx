"use client";

import { useEffect } from "react";

/**
 * Component to continuously monitor and remove browser extension attributes
 * that can cause hydration mismatches
 */
export default function ExtensionAttributeCleanup() {
  useEffect(() => {
    // List of problematic extension attributes
    const extensionAttributes = [
      "cz-shortcut-listen", // ColorZilla
      "data-new-gr-c-s-check-loaded", // Grammarly
      "data-gr-ext-installed", // Grammarly
      "data-adblockkey", // AdBlock
      "spellcheck", // Various extensions
      "data-gramm", // Grammarly alternative
      "data-gramm_editor", // Grammarly editor
    ];

    function cleanupAttributes() {
      // Clean body element
      const body = document.body;
      if (body) {
        extensionAttributes.forEach((attr) => {
          if (body.hasAttribute(attr)) {
            body.removeAttribute(attr);
          }
        });
      }

      // Clean html element and remove VS Code styles
      const html = document.documentElement;
      if (html) {
        const style = html.getAttribute("style");
        if (style && style.includes("--vsc-domain")) {
          html.removeAttribute("style");
        }

        extensionAttributes.forEach((attr) => {
          if (html.hasAttribute(attr)) {
            html.removeAttribute(attr);
          }
        });
      }
    }

    // Initial cleanup
    cleanupAttributes();

    // Set up mutation observer to watch for extension attribute additions
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes") {
          const target = mutation.target as Element;
          const attributeName = mutation.attributeName;

          if (attributeName && extensionAttributes.includes(attributeName)) {
            target.removeAttribute(attributeName);
          }

          // Special handling for style attribute with VS Code extensions
          if (
            attributeName === "style" &&
            target === document.documentElement
          ) {
            const style = target.getAttribute("style");
            if (style && style.includes("--vsc-domain")) {
              target.removeAttribute("style");
            }
          }
        }
      });
    });

    // Start observing
    observer.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: [...extensionAttributes, "style"],
    });

    // Cleanup on unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  // This component doesn't render anything
  return null;
}
