(() => {
  "use strict";

  const GISCUS_ORIGIN = "https://giscus.app";
  const GISCUS_CONFIG = {
    repo: "tangmubai/SJTU-AI-Course",
    repoId: "R_kgDOTJHrpg",
    category: "Announcements",
    categoryId: "DIC_kwDOTJHrps4DAMXm",
  };

  function theme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark_dimmed" : "light";
  }

  function mountDiscussion(host, mapping, term) {
    if (!host || host.dataset.giscusMounted === "true") return;
    host.dataset.giscusMounted = "true";

    const script = document.createElement("script");
    script.src = `${GISCUS_ORIGIN}/client.js`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.repo = GISCUS_CONFIG.repo;
    script.dataset.repoId = GISCUS_CONFIG.repoId;
    script.dataset.category = GISCUS_CONFIG.category;
    script.dataset.categoryId = GISCUS_CONFIG.categoryId;
    script.dataset.mapping = mapping;
    script.dataset.term = term;
    script.dataset.strict = "1";
    script.dataset.reactionsEnabled = "1";
    script.dataset.emitMetadata = "0";
    script.dataset.inputPosition = "top";
    script.dataset.theme = theme();
    script.dataset.lang = "zh-CN";
    script.dataset.loading = "lazy";
    host.append(script);
  }

  function updateTheme(nextTheme) {
    document.querySelectorAll(".giscus-frame").forEach((frame) => {
      frame.contentWindow?.postMessage({
        giscus: { setConfig: { theme: nextTheme === "dark" ? "dark_dimmed" : "light" } },
      }, GISCUS_ORIGIN);
    });
  }

  mountDiscussion(document.getElementById("homeDiscussionEmbed"), "number", "7");
  window.addEventListener("ai-course-theme-change", (event) => updateTheme(event.detail));
  window.addEventListener("ai-course-open-chapter-discussion", (event) => {
    const { hostId, term } = event.detail || {};
    mountDiscussion(document.getElementById(hostId), "specific", term);
  });
})();
