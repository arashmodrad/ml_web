/**
 * Model Release Version Selector Handler
 * Uses browser-native anchor resolution for site base URL to ensure 100% reliable
 * routing across GitHub Pages (any subfolder), custom domains, and localhost.
 */
document.addEventListener("DOMContentLoaded", function () {
    const select = document.getElementById("header-version-select");
    if (!select) return;

    // Browser resolves relative href to full absolute URL automatically
    const homeAnchor = document.querySelector('.md-tabs__link[data-tab="home"]') || document.querySelector('a.md-logo');
    let siteBase = homeAnchor ? homeAnchor.href : window.location.origin + "/";
    if (!siteBase.endsWith("/")) siteBase += "/";

    const currentUrl = window.location.href;
    const isV1 = currentUrl.includes("/v1.0/");

    // Sync dropdown with active page version
    select.value = isV1 ? "v1.0" : "v2.06";

    // Handle user changing the dropdown
    select.addEventListener("change", function (e) {
        const targetVersion = e.target.value;

        if (targetVersion === "v1.0" && !isV1) {
            // Switching from v2.06 to v1.0
            if (currentUrl.includes("/tw/")) {
                if (currentUrl.includes("models")) window.location.href = siteBase + "v1.0/tw/models/";
                else if (currentUrl.includes("skill")) window.location.href = siteBase + "v1.0/tw/skill/";
                else if (currentUrl.includes("xai")) window.location.href = siteBase + "v1.0/tw/xai/";
                else window.location.href = siteBase + "v1.0/tw/";
            } else if (currentUrl.includes("/y/")) {
                if (currentUrl.includes("models")) window.location.href = siteBase + "v1.0/y/models/";
                else if (currentUrl.includes("skill")) window.location.href = siteBase + "v1.0/y/skill/";
                else if (currentUrl.includes("xai")) window.location.href = siteBase + "v1.0/y/xai/";
                else window.location.href = siteBase + "v1.0/y/";
            } else if (currentUrl.includes("/r/")) {
                if (currentUrl.includes("models")) window.location.href = siteBase + "v1.0/r/models/";
                else if (currentUrl.includes("skill")) window.location.href = siteBase + "v1.0/r/skill/";
                else if (currentUrl.includes("xai")) window.location.href = siteBase + "v1.0/r/xai/";
                else window.location.href = siteBase + "v1.0/r/";
            } else if (currentUrl.includes("/n/")) {
                window.location.href = siteBase + "v1.0/n/";
            } else if (currentUrl.includes("/overview/")) {
                if (currentUrl.includes("data-sources")) window.location.href = siteBase + "v1.0/overview/data-sources/";
                else if (currentUrl.includes("feature-engineering") || currentUrl.includes("methods")) window.location.href = siteBase + "v1.0/overview/methods/";
                else window.location.href = siteBase + "v1.0/overview/";
            } else {
                window.location.href = siteBase + "v1.0/overview/";
            }
        } else if (targetVersion === "v2.06" && isV1) {
            // Switching from v1.0 to v2.06
            if (currentUrl.includes("/tw/")) {
                if (currentUrl.includes("models")) window.location.href = siteBase + "tw/models/";
                else if (currentUrl.includes("skill")) window.location.href = siteBase + "tw/skill/";
                else if (currentUrl.includes("xai")) window.location.href = siteBase + "tw/xai/";
                else window.location.href = siteBase + "tw/";
            } else if (currentUrl.includes("/y/")) {
                if (currentUrl.includes("models")) window.location.href = siteBase + "y/models/";
                else if (currentUrl.includes("skill")) window.location.href = siteBase + "y/skill/";
                else if (currentUrl.includes("xai")) window.location.href = siteBase + "y/xai/";
                else window.location.href = siteBase + "y/";
            } else if (currentUrl.includes("/r/")) {
                if (currentUrl.includes("models")) window.location.href = siteBase + "r/models/";
                else if (currentUrl.includes("skill")) window.location.href = siteBase + "r/skill/";
                else if (currentUrl.includes("xai")) window.location.href = siteBase + "r/xai/";
                else window.location.href = siteBase + "r/";
            } else if (currentUrl.includes("/n/")) {
                window.location.href = siteBase + "n/";
            } else if (currentUrl.includes("/overview/")) {
                if (currentUrl.includes("data-sources")) window.location.href = siteBase + "overview/data-sources/";
                else if (currentUrl.includes("methods")) window.location.href = siteBase + "overview/feature-engineering/";
                else window.location.href = siteBase + "overview/";
            } else {
                window.location.href = siteBase;
            }
        }
    });
});
