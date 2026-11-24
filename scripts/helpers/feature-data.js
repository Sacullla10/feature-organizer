export function getFeatureGroupInfo(item) {
    const type = item.system.type.value;
    const subtype = item.system.type.subtype;

    // Features without a subtype are kept in their own group.
    if (!subtype) {
        return {
            key: "uncategorized",
            label: "Uncategorized"
        };
    }

    const typeConfig = CONFIG.DND5E.featureTypes[type];
    const subtypeLabel = typeConfig?.subtypes?.[subtype];

    return {
        key: `${type}:${subtype}`,
        label: subtypeLabel
            ? game.i18n.localize(subtypeLabel)
            : subtype
    };
}