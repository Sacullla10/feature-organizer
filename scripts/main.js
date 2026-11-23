
// Stores the "Show hidden features" checkbox state.
// The key is the Actor ID; the value is true or false.
const showHiddenByActor = new Map();


Hooks.on("renderApplicationV2", async (app, element) => {

    // 1. Identify the Actor associated with this application.
    const actor = app.actor ?? app.document ?? app.object;

    // Ignore applications that aren't Actor sheets.
    if (actor?.documentName !== "Actor") return;


    // 2. Find the Features tab and its existing list.
    const featuresTab = element.querySelector(
        'section[data-tab="features"]'
    );

    if (!featuresTab) return;

    // Prevent adding our interface twice.
    if (featuresTab.querySelector(".feature-organizer")) return;

    const featureList = featuresTab.querySelector(".features-list");

    if (!featureList) return;


    // 3. Render our Handlebars template.
    const html = await renderTemplate(
        "modules/feature-organizer/templates/organizer.hbs",
        { actor }
    );

    // Insert our interface before the existing feature list.
    featureList.insertAdjacentHTML("beforebegin", html);

    const organizer = featuresTab.querySelector(".feature-organizer");

    const showHidden = organizer.querySelector(
        '[data-action="show-hidden"]'
    );


    // 4. Restore the checkbox state after a sheet rerender.
    showHidden.checked = showHiddenByActor.get(actor.id) ?? false;


    // 5. Find all rendered feature entries.
    const entries = [
        ...featureList.querySelectorAll(".item[data-item-id]")
    ];


    // 6. Add an eye button to every feature.
    for (const entry of entries) {

        const itemName = entry.querySelector(".item-name");

        if (!itemName) continue;

        const button = document.createElement("button");

        button.type = "button";
        button.classList.add("feature-organizer-toggle");
        button.dataset.action = "toggle-hidden";

        // Prevent the button from triggering other sheet interactions.
        // button.addEventListener("click", event => {
        //     event.preventDefault();
        //     event.stopPropagation();
        // });

        itemName.insertAdjacentElement("afterend", button);
    }


    // 7. Update the visibility and icons of all features.
    async function refreshFeatures() {

        for (const entry of entries) {

            const item = actor.items.get(entry.dataset.itemId);

            if (!item) continue;

            // Read the saved hidden flag.
            const hidden = item.getFlag(
                "feature-organizer",
                "hidden"
            ) ?? false;

            // Hide the entry unless the filter is enabled.
            entry.hidden = hidden && !showHidden.checked;

            // Apply a visual distinction to hidden entries.
            entry.classList.toggle("is-hidden-feature", hidden);

            // Find this feature's eye button.
            const button = entry.querySelector(
                '[data-action="toggle-hidden"]'
            );

            if (!button) continue;

            // Show a crossed eye when hidden, normal eye otherwise.
            button.innerHTML = hidden
                ? '<i class="fa-solid fa-eye-slash"></i>'
                : '<i class="fa-solid fa-eye"></i>';

            button.title = hidden
                ? "Show feature"
                : "Hide feature";

            button.setAttribute(
                "aria-label",
                button.title
            );
        }
    }


    // 8. Remember changes to the checkbox.
    showHidden.addEventListener("change", () => {

        showHiddenByActor.set(actor.id, showHidden.checked);

        refreshFeatures();
    });


    // 9. Handle clicks on the eye buttons.
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

        // Read the current state.
        const hidden = item.getFlag(
            "feature-organizer",
            "hidden"
        ) ?? false;

        // Save the opposite state.
        await item.setFlag(
            "feature-organizer",
            "hidden",
            !hidden
        );

        // Update the current list.
        await refreshFeatures();
    });


    // 10. Apply the initial visibility.
    await refreshFeatures();

    console.log(
        "Feature Organizer | Initialized:",
        actor.name
    );
});
