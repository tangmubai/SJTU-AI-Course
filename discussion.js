(() => {
  "use strict";

  const GISCUS_ORIGIN = "https://giscus.app";
  const container = document.getElementById("discussionEmbed");
  const status = document.getElementById("discussionStatus");

  if (!container || !status) return;

  function giscusTheme(theme = document.documentElement.getAttribute("data-theme")) {
    return theme === "dark" ? "dark_dimmed" : "light";
  }

  function setStatus(message, type = "") {
    status.textContent = message;
    status.className = `discussion-status${type ? ` ${type}` : ""}`;
  }

  function updateTheme(theme) {
    const frame = container.querySelector(".giscus-frame");
    if (!frame?.contentWindow) return;
    frame.contentWindow.postMessage({ giscus: { setConfig: { theme: giscusTheme(theme) } } }, GISCUS_ORIGIN);
  }

  function mountDiscussion() {
    const script = document.createElement("script");
    script.src = `${GISCUS_ORIGIN}/client.js`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.repo = "tangmubai/SJTU-AI-Course";
    script.dataset.repoId = "R_kgDOTJHrpg";
    script.dataset.category = "Announcements";
    script.dataset.categoryId = "DIC_kwDOTJHrps4DAMXm";
    script.dataset.mapping = "pathname";
    script.dataset.strict = "1";
    script.dataset.reactionsEnabled = "1";
    script.dataset.emitMetadata = "0";
    script.dataset.inputPosition = "top";
    script.dataset.theme = giscusTheme();
    script.dataset.lang = "zh-CN";
    script.dataset.loading = "lazy";
    script.addEventListener("load", () => {
      setStatus("此页面有独立讨论帖；也可通过上方入口浏览或发起其他主题。", "hidden");
    });
    script.addEventListener("error", () => {
      setStatus("嵌入式讨论暂时无法加载，请前往 GitHub Discussions 参与交流。", "error");
    });
    container.append(script);
  }

  window.addEventListener("ai-course-theme-change", (event) => updateTheme(event.detail));
  window.addEventListener("message", (event) => {
    if (event.origin !== GISCUS_ORIGIN || !event.data?.giscus?.error) return;
    setStatus(`嵌入式讨论暂时无法加载，请前往 GitHub Discussions 参与交流。`, "error");
    console.warn("[discussion]", event.data.giscus.error);
  });

  mountDiscussion();
})();
