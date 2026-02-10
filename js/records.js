function buildConfig() {
  const body = document.body;
  return {
    jsonPath: body.dataset.jsonPath || "",
    subtitle: body.dataset.subtitle || "",
    countTemplate: body.dataset.countTemplate || "共 {count} 条记录",
    emptyMain: body.dataset.emptyMain || "暂无记录",
    emptySub: body.dataset.emptySub || "",
    errorMain: body.dataset.errorMain || "数据加载失败",
    errorSub: body.dataset.errorSub || "",
    footerTemplate: body.dataset.footerTemplate || "共 {count} 条记录",
    showThumb: body.dataset.showThumb === "true",
    primaryMeta: body.dataset.primaryMeta || "",
    secondaryMeta: body.dataset.secondaryMeta || "",
    detailKey: body.dataset.detailKey || ""
  };
}

async function loadItems(path) {
  if (!path) throw new Error("json path is missing");
  const resp = await fetch(path, { cache: "no-store" });
  if (!resp.ok) throw new Error(`failed to load ${path}`);
  const data = await resp.json();
  if (!Array.isArray(data)) throw new Error(`${path} must be an array`);
  return data;
}

function updateText(config, count) {
  const subtitleEl = document.getElementById("page_subtitle");
  if (subtitleEl) subtitleEl.innerText = config.subtitle;

  const countEl = document.getElementById("record_count");
  if (countEl) countEl.innerText = config.countTemplate.replace("{count}", String(count));
}

function compareByTimeDesc(a, b) {
  const ta = Date.parse(a.time || "");
  const tb = Date.parse(b.time || "");
  if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
  if (Number.isNaN(ta)) return 1;
  if (Number.isNaN(tb)) return -1;
  return tb - ta;
}

function getMetaValue(item, key) {
  if (!key) return "";
  const value = item[key];
  if (!value) return "";
  if (key === "location") return `地点：${value}`;
  return `${value}`;
}

function getStatusBadge(value) {
  const statusCode = Number(value);
  if (![1, 2, 3].includes(statusCode)) return "";

  let statusClass = "status-pending";
  let statusText = "待完成";

  if (statusCode === 2) {
    statusClass = "status-progress";
    statusText = "进行中";
  } else if (statusCode === 3) {
    statusClass = "status-done";
    statusText = "已完成";
  }

  return `<span class="status-badge ${statusClass}">${statusText}</span>`;
}

function renderEmpty(listEl, config, isError) {
  const cls = isError ? "error-state" : "empty-state";
  const main = isError ? config.errorMain : config.emptyMain;
  const sub = isError ? config.errorSub : config.emptySub;
  listEl.innerHTML = `<li class="${cls}"><p>${main}</p><p>${sub}</p></li>`;
}

function openDetailModal(item, config) {
  if (!config.detailKey) return;
  const detail = item[config.detailKey];
  if (!detail) return;

  const overlay = document.createElement("div");
  overlay.className = "detail-overlay";
  const badge = item.status ? getStatusBadge(item.status) : "";
  overlay.innerHTML = `
    <div class="detail-modal">
      <div class="detail-head">
        <h3 class="detail-title">${item.title || "Untitled"}</h3>
        ${badge}
      </div>
      <p class="detail-time">${item.time || "未知时间"}</p>
      <p class="detail-content">${detail}</p>
      <button class="detail-close" type="button">关闭</button>
    </div>
  `;

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay || event.target.classList.contains("detail-close")) {
      document.body.removeChild(overlay);
    }
  });

  document.body.appendChild(overlay);
}

function renderList(listEl, items, config) {
  if (!items.length) {
    renderEmpty(listEl, config, false);
    return;
  }

  const sorted = [...items].sort(compareByTimeDesc);
  listEl.innerHTML = "";

  sorted.forEach((item) => {
    const li = document.createElement("li");
    li.className = `record-item${config.showThumb && item.imageUrl ? " record-has-thumb" : ""}`;

    const thumb = config.showThumb && item.imageUrl
      ? `<img class="record-thumb" src="${item.imageUrl}" alt="${item.alt || item.title || "记录图片"}" loading="lazy">`
      : "";

    const primaryMeta = getMetaValue(item, config.primaryMeta);
    const secondaryMeta = getMetaValue(item, config.secondaryMeta);
    const statusBadge = config.primaryMeta === "status" ? getStatusBadge(item.status) : "";
    const metaLine = config.primaryMeta === "status" ? "" : primaryMeta;
    const hasDetail = Boolean(config.detailKey && item[config.detailKey]);

    li.innerHTML = `
      <div class="record-main">
        ${thumb}
        <div class="record-content">
          <div class="record-head">
            <h3 class="record-title">${item.title || "Untitled"}</h3>
            ${statusBadge}
          </div>
          <p class="record-time-line">${item.time || "未知时间"}</p>
          ${metaLine ? `<p class="record-meta">${metaLine}</p>` : ""}
          ${secondaryMeta ? `<p class="record-note">${secondaryMeta}</p>` : ""}
        </div>
      </div>
    `;

    if (hasDetail) {
      li.classList.add("record-clickable");
      li.addEventListener("click", () => openDetailModal(item, config));
    }

    listEl.appendChild(li);
  });
}

function renderFooter(config, count) {
  const footer = document.createElement("div");
  footer.className = "footer";
  footer.innerText = config.footerTemplate.replace("{count}", String(count));

  const backLink = document.querySelector(".back-link");
  if (backLink && backLink.parentNode) {
    backLink.parentNode.insertBefore(footer, backLink.nextSibling);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const listEl = document.getElementById("recordList");
  if (!listEl) return;

  const config = buildConfig();

  try {
    const items = await loadItems(config.jsonPath);
    updateText(config, items.length);
    renderList(listEl, items, config);
    renderFooter(config, items.length);
  } catch (err) {
    console.error(err);
    updateText(config, 0);
    renderEmpty(listEl, config, true);
  }
});
