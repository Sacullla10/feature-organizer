

// Remembers the checkbox state during the current browser session.
const showHiddenByActor = new Map();


export async function initializeVisibility(actor, featuresTab, featureList) {

    // Create the organizer interface if it doesn't exist.
    if (!featuresTab.querySelector(".feature-organizer")) {

        const html = await renderTemplate(
            "modules/feature-organizer/templates/organizer.hbs",
            { actor }
        );

        featureList.insertAdjacentHTML("beforebegin", html);
    }

    const organizer = featuresTab.querySelector(".feature-organizer");

    const showHidden = organizer.querySelector(
        '[data-action="show-hidden"]'
    );

    // Restore checkbox state.
    showHidden.checked = showHiddenByActor.get(actor.id) ?? false;


    // Get all feature entries.
    const entries = [
        ...featureList.querySelectorAll(".item[data-item-id]")
    ];


    // Create eye buttons.
    for (const entry of entries) {

        const itemName = entry.querySelector(".item-name");

        if (!itemName) continue;

        // Avoid creating duplicate buttons.
        if (entry.querySelector('[data-action="toggle-hidden"]')) continue;

        const button = document.createElement("button");

        button.type = "button";
        button.classList.add("feature-organizer-toggle");
        button.dataset.action = "toggle-hidden";

        itemName.insertAdjacentElement("afterend", button);
    }


    // Refresh feature visibility and icons.
    async function refreshFeatures() {

        for (const entry of entries) {

            const item = actor.items.get(entry.dataset.itemId);

            if (!item) continue;

            const hidden = item.getFlag(
                "feature-organizer",
                "hidden"
            ) ?? false;

            entry.hidden = hidden && !showHidden.checked;

            entry.classList.toggle("is-hidden-feature", hidden);

            const button = entry.querySelector(
                '[data-action="toggle-hidden"]'
            );

            if (!button) continue;

            button.innerHTML = hidden
                ? '<i class="fa-solid fa-eye-slash"></i>'
                : '<i class="fa-solid fa-eye"></i>';

            button.title = hidden ? "Show feature" : "Hide feature";

            button.setAttribute("aria-label", button.title);
        }
    }


    // Checkbox event.
    showHidden.addEventListener("change", () => {

        showHiddenByActor.set(actor.id, showHidden.checked);

        refreshFeatures();
    });


    // Avoid registering the delegated click handler more than once.
    if (!featureList.dataset.visibilityInitialized) {

        featureList.addEventListener("click", async (event) => {

            const button = event.target.closest(
                '[data-action="toggle-hidden"]'
            );

            if (!button) return;

            event.preventDefault();
            event.stopPropagation();

            const entry = button.closest(".item");

            const item = actor.items.get(entry?.dataset.itemId);

            if (!item) return;

            const hidden = item.getFlag(
                "feature-organizer",
                "hidden"
            ) ?? false;

            await item.setFlag(
                "feature-organizer",
                "hidden",
                !hidden
            );

            await refreshFeatures();
        });

        featureList.dataset.visibilityInitialized = "true";
    }


    await refreshFeatures();
}
