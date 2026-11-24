import { initializeVisibility } from "./features/visibility.js";
import { initializeGrouping } from "./features/grouping.js";

Hooks.on("renderApplicationV2", async (app, element) => {
    const actor = app.actor ?? app.document ?? app.object;
    if (actor?.documentName !== "Actor") return;

    const featuresTab = element.querySelector(
        'section[data-tab="features"]'
    );
    if (!featuresTab) return;

    const featureList = featuresTab.querySelector(".features-list");
    if (!featureList) return;

    await initializeVisibility(actor, featuresTab, featureList);
});