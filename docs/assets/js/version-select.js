/**
 * Model Release Version Selector Handler
 * Persists selected model version across universal pages (Home & References)
 * and dynamically synchronizes navigation tabs and action cards.
 */
document.addEventListener("DOMContentLoaded", function () {
    const select = document.getElementById("header-version-select");
    if (!select) return;

    function getSiteBase() {
        const homeAnchor = document.querySelector('.md-tabs__link[data-tab="home"]') || document.querySelector('a.md-logo');
        let siteBase = homeAnchor ? homeAnchor.href : window.location.origin + "/";
        if (!siteBase.endsWith("/")) siteBase += "/";
        return siteBase;
    }

    const currentUrl = window.location.href;
    const isV1Url = currentUrl.includes("/v1.0/");
    const siteBase = getSiteBase();

    let subPath = currentUrl.startsWith(siteBase) ? currentUrl.substring(siteBase.length) : "";
    subPath = subPath.split("?")[0].split("#")[0].replace(/^index\.html$/, "");
    const isSharedPage = (subPath === "" || subPath === "/" || subPath.startsWith("references"));

    let activeVersion = "v2.06";

    if (isV1Url) {
        activeVersion = "v1.0";
        localStorage.setItem("ml_web_version", "v1.0");
    } else if (isSharedPage) {
        const savedVersion = localStorage.getItem("ml_web_version");
        if (savedVersion === "v1.0") {
            activeVersion = "v1.0";
        } else {
            activeVersion = "v2.06";
        }
    } else {
        activeVersion = "v2.06";
        localStorage.setItem("ml_web_version", "v2.06");
    }

    // Set dropdown visual value
    select.value = activeVersion;

    function applyVersionState(version) {
        const tabOverview = document.querySelector('.md-tabs__link[data-tab="overview"]');
        const tabTW = document.querySelector('.md-tabs__link[data-tab="tw"]');
        const tabY = document.querySelector('.md-tabs__link[data-tab="y"]');
        const tabR = document.querySelector('.md-tabs__link[data-tab="r"]');
        const tabN = document.querySelector('.md-tabs__link[data-tab="n"]');

        if (version === "v1.0") {
            if (tabOverview) tabOverview.href = siteBase + "v1.0/overview/";
            if (tabTW) tabTW.href = siteBase + "v1.0/tw/";
            if (tabY) tabY.href = siteBase + "v1.0/y/";
            if (tabR) tabR.href = siteBase + "v1.0/r/";
            if (tabN) tabN.href = siteBase + "v1.0/n/";
        } else {
            if (tabOverview) tabOverview.href = siteBase + "overview/";
            if (tabTW) tabTW.href = siteBase + "tw/";
            if (tabY) tabY.href = siteBase + "y/";
            if (tabR) tabR.href = siteBase + "r/";
            if (tabN) tabN.href = siteBase + "n/";
        }

        const heroCta = document.querySelector('.hero-cta');
        if (heroCta) {
            heroCta.href = (version === "v1.0") ? (siteBase + "v1.0/overview/") : (siteBase + "overview/");
        }

        const cardLinks = document.querySelectorAll('.pipeline-card a');
        cardLinks.forEach(link => {
            const href = link.getAttribute('href') || "";
            if (version === "v1.0") {
                if (href.includes("tw") && !href.includes("v1.0")) link.href = siteBase + "v1.0/tw/";
                else if (href.includes("y") && !href.includes("v1.0")) link.href = siteBase + "v1.0/y/";
                else if (href.includes("r") && !href.includes("v1.0")) link.href = siteBase + "v1.0/r/";
                else if (href.includes("n") && !href.includes("v1.0")) link.href = siteBase + "v1.0/n/";
            } else {
                if (href.includes("tw")) link.href = siteBase + "tw/";
                else if (href.includes("y")) link.href = siteBase + "y/";
                else if (href.includes("r")) link.href = siteBase + "r/";
                else if (href.includes("n")) link.href = siteBase + "n/";
            }
        });
    }

    if (isSharedPage) {
        applyVersionState(activeVersion);
    }

    select.addEventListener("change", function (e) {
        const targetVersion = e.target.value;
        localStorage.setItem("ml_web_version", targetVersion);

        if (isSharedPage) {
            applyVersionState(targetVersion);
            return;
        }

        if (targetVersion === "v1.0" && !isV1Url) {
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
        } else if (targetVersion === "v2.06" && isV1Url) {
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
