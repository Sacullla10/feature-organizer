export function initializeGrouping(featuresTab) {
    const button = featuresTab.querySelector(
        '[data-action="toggle-grouping"]'
    );

    const nativeControls = featuresTab.querySelector(
        'item-list-controls[for="features"]'
    );

    if (!button || !nativeControls || button.dataset.initialized) return;

    button.dataset.initialized = "true";

    function setGrouping(enabled) {
        button.setAttribute("aria-pressed", String(enabled));

        button.title = `Grouping by subtype: ${enabled ? "enabled" : "disabled"}`;

        const icon = button.querySelector("i");

        icon.classList.toggle("fa-toggle-on", enabled);
        icon.classList.toggle("fa-toggle-off", !enabled);
    }

    // Our custom grouping button.
    button.addEventListener("click", () => {
        const enabled = button.getAttribute("aria-pressed") !== "true";
        setGrouping(enabled);
    });

    // D&D5e's native grouping control.
    nativeControls.addEventListener("click", event => {
        const groupButton = event.target.closest('[data-action="group"]');

        if (!groupButton) return;

        setGrouping(false);
    });
}