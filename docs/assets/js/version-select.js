/**
 * Model Release Version Selector Handler
 * Persists selected version in localStorage across navigation (including Home & References)
 * and dynamically synchronizes top navigation tab links.
 */
document.addEventListener("DOMContentLoaded", function () {
    const select = document.getElementById("header-version-select");
    if (!select) return;

    const path = window.location.pathname;
    let basePath = "/";
    const metaBase = document.querySelector("base");
    if (metaBase && metaBase.getAttribute("href")) {
        basePath = metaBase.getAttribute("href");
    } else if (path.includes("/channel-shape-ML/")) {
        basePath = "/channel-shape-ML/";
    }

    // Relative path within site
    let relPath = path;
    if (basePath !== "/" && relPath.startsWith(basePath)) {
        relPath = relPath.substring(basePath.length);
    } else if (relPath.startsWith("/")) {
        relPath = relPath.substring(1);
    }

    const isV1Url = relPath.startsWith("v1.0/");
    const isSharedPage = relPath === "" || relPath === "index.html" || relPath.startsWith("references");

    let savedVersion = localStorage.getItem("ml_version");
    let activeVersion = "v2.06";

    if (isV1Url) {
        activeVersion = "v1.0";
        localStorage.setItem("ml_version", "v1.0");
    } else if (isSharedPage) {
        if (savedVersion === "v1.0") {
            activeVersion = "v1.0";
        } else {
            activeVersion = "v2.06";
        }
    } else {
        activeVersion = "v2.06";
        localStorage.setItem("ml_version", "v2.06");
    }

    // Set dropdown visual value
    select.value = activeVersion;

    // Dynamically update tab links to match active version
    function updateTabs(version) {
        const tabOverview = document.querySelector('.md-tabs__link[data-tab="overview"]');
        const tabTW = document.querySelector('.md-tabs__link[data-tab="tw"]');
        const tabY = document.querySelector('.md-tabs__link[data-tab="y"]');
        const tabR = document.querySelector('.md-tabs__link[data-tab="r"]');
        const tabN = document.querySelector('.md-tabs__link[data-tab="n"]');

        if (version === "v1.0") {
            if (tabOverview) tabOverview.setAttribute("href", basePath + "v1.0/overview/");
            if (tabTW) tabTW.setAttribute("href", basePath + "v1.0/tw/");
            if (tabY) tabY.setAttribute("href", basePath + "v1.0/y/");
            if (tabR) tabR.setAttribute("href", basePath + "v1.0/r/");
            if (tabN) tabN.setAttribute("href", basePath + "v1.0/n/");
        } else {
            if (tabOverview) tabOverview.setAttribute("href", basePath + "overview/");
            if (tabTW) tabTW.setAttribute("href", basePath + "tw/");
            if (tabY) tabY.setAttribute("href", basePath + "y/");
            if (tabR) tabR.setAttribute("href", basePath + "r/");
            if (tabN) tabN.setAttribute("href", basePath + "n/");
        }
    }

    updateTabs(activeVersion);

    select.addEventListener("change", function (e) {
        const targetVersion = e.target.value;
        localStorage.setItem("ml_version", targetVersion);

        if (isSharedPage) {
            updateTabs(targetVersion);
            return;
        }

        if (targetVersion === "v1.0" && !isV1Url) {
            // Switching from v2.06 to v1.0 on a versioned sub-page
            if (relPath.startsWith("tw/")) {
                if (relPath.includes("models")) window.location.href = basePath + "v1.0/tw/models/";
                else if (relPath.includes("skill")) window.location.href = basePath + "v1.0/tw/skill/";
                else if (relPath.includes("xai")) window.location.href = basePath + "v1.0/tw/xai/";
                else window.location.href = basePath + "v1.0/tw/";
            } else if (relPath.startsWith("y/")) {
                if (relPath.includes("models")) window.location.href = basePath + "v1.0/y/models/";
                else if (relPath.includes("skill")) window.location.href = basePath + "v1.0/y/skill/";
                else if (relPath.includes("xai")) window.location.href = basePath + "v1.0/y/xai/";
                else window.location.href = basePath + "v1.0/y/";
            } else if (relPath.startsWith("r/")) {
                if (relPath.includes("models")) window.location.href = basePath + "v1.0/r/models/";
                else if (relPath.includes("skill")) window.location.href = basePath + "v1.0/r/skill/";
                else if (relPath.includes("xai")) window.location.href = basePath + "v1.0/r/xai/";
                else window.location.href = basePath + "v1.0/r/";
            } else if (relPath.startsWith("n/")) {
                window.location.href = basePath + "v1.0/n/";
            } else if (relPath.startsWith("overview/")) {
                if (relPath.includes("data-sources")) window.location.href = basePath + "v1.0/overview/data-sources/";
                else if (relPath.includes("feature-engineering") || relPath.includes("methods")) window.location.href = basePath + "v1.0/overview/methods/";
                else window.location.href = basePath + "v1.0/overview/";
            } else {
                window.location.href = basePath + "v1.0/overview/";
            }
        } else if (targetVersion === "v2.06" && isV1Url) {
            // Switching from v1.0 to v2.06 on a versioned sub-page
            let v2Rel = relPath.replace(/^v1\.0\//, "");
            if (v2Rel.startsWith("tw/")) {
                if (v2Rel.includes("models")) window.location.href = basePath + "tw/models/";
                else if (v2Rel.includes("skill")) window.location.href = basePath + "tw/skill/";
                else if (v2Rel.includes("xai")) window.location.href = basePath + "tw/xai/";
                else window.location.href = basePath + "tw/";
            } else if (v2Rel.startsWith("y/")) {
                if (v2Rel.includes("models")) window.location.href = basePath + "y/models/";
                else if (v2Rel.includes("skill")) window.location.href = basePath + "y/skill/";
                else if (v2Rel.includes("xai")) window.location.href = basePath + "y/xai/";
                else window.location.href = basePath + "y/";
            } else if (v2Rel.startsWith("r/")) {
                if (v2Rel.includes("models")) window.location.href = basePath + "r/models/";
                else if (v2Rel.includes("skill")) window.location.href = basePath + "r/skill/";
                else if (v2Rel.includes("xai")) window.location.href = basePath + "r/xai/";
                else window.location.href = basePath + "r/";
            } else if (v2Rel.startsWith("n/")) {
                window.location.href = basePath + "n/";
            } else if (v2Rel.startsWith("overview/")) {
                if (v2Rel.includes("data-sources")) window.location.href = basePath + "overview/data-sources/";
                else if (v2Rel.includes("methods")) window.location.href = basePath + "overview/feature-engineering/";
                else window.location.href = basePath + "overview/";
            } else {
                window.location.href = basePath;
            }
        }
    });
});
