/**
 * Scroll the app panel containers (desktop + mobile) back to the top.
 * Used on tab switch and when a ride offer lands so Accept/Reject is visible.
 */
export function scrollPanelToTop() {
  if (typeof document === "undefined") return;
  const run = () => {
    document.querySelectorAll<HTMLElement>("[data-panel-scroll]").forEach((el) => {
      el.scrollTop = 0;
    });
  };
  // Immediate + after layout (tab content swap / sheet expand)
  run();
  requestAnimationFrame(() => {
    run();
    requestAnimationFrame(run);
  });
}
