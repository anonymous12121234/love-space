const startDate = new Date(2025, 10, 25, 0, 0, 0);
const SECONDS_PER_DAY = 24 * 60 * 60;
const MS_PER_DAY = SECONDS_PER_DAY * 1000;
const MANUAL_THEME_KEY = "manual_home_theme";
const MANUAL_THEME_EXPIRES_KEY = "manual_home_theme_expires_at";
const beijingTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  hour12: false,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
});

function getTodayDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getTogetherDays(todayDate) {
  return Math.floor((todayDate - startDate) / MS_PER_DAY);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

function setTextById(id, text) {
  const el = document.getElementById(id);
  if (el) {
    el.innerText = text;
  }
}

function updateTogetherTime() {
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = getTogetherDays(todayDate);

  const totalSeconds = Math.floor((now - startDate) / 1000);
  let remainder = totalSeconds - days * SECONDS_PER_DAY;
  remainder = ((remainder % SECONDS_PER_DAY) + SECONDS_PER_DAY) % SECONDS_PER_DAY;

  const hours = Math.floor(remainder / 3600);
  const minutes = Math.floor((remainder % 3600) / 60);
  const seconds = remainder % 60;

  const daysEl = document.getElementById("days");
  if (daysEl) {
    daysEl.innerText = `\u5df2\u7ecf\u5728\u4e00\u8d77 ${days} \u5929\u5566 \ud83d\udc95`;
  }

  const detailEl = document.getElementById("time_detail");
  if (detailEl) {
    detailEl.innerText = `${days}\u5929 ${hours}\u5c0f\u65f6 ${minutes}\u5206\u949f ${seconds}\u79d2`;
  }
}

function getNextBirthdayTarget(todayDate, month, day) {
  const currentYear = todayDate.getFullYear();
  let target = new Date(currentYear, month - 1, day);
  if (target < todayDate) {
    target = new Date(currentYear + 1, month - 1, day);
  }
  return target;
}

function updateCountdowns() {
  const todayDate = getTodayDate();
  const togetherDays = getTogetherDays(todayDate);

  const nextMilestone = (Math.floor(togetherDays / 100) + 1) * 100;
  const milestoneTarget = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate() + nextMilestone
  );
  const milestoneRemaining = Math.max(
    0,
    Math.round((milestoneTarget - todayDate) / MS_PER_DAY)
  );

  const linBirthdayTarget = getNextBirthdayTarget(todayDate, 5, 18);
  const linBirthdayRemaining = Math.max(
    0,
    Math.round((linBirthdayTarget - todayDate) / MS_PER_DAY)
  );

  const yuBirthdayTarget = getNextBirthdayTarget(todayDate, 1, 4);
  const yuBirthdayRemaining = Math.max(
    0,
    Math.round((yuBirthdayTarget - todayDate) / MS_PER_DAY)
  );
  const anniversaryTarget = getNextBirthdayTarget(todayDate, 11, 25);
  const anniversaryRemaining = Math.max(
    0,
    Math.round((anniversaryTarget - todayDate) / MS_PER_DAY)
  );

  setTextById("countdown_anniversary_days", `还有 ${anniversaryRemaining} 天`);
  setTextById(
    "countdown_anniversary_target",
    `目标日期：${formatDate(anniversaryTarget)}`
  );

  setTextById(
    "countdown_milestone_days",
    `还有 ${milestoneRemaining} 天（第 ${nextMilestone} 天）`
  );
  setTextById(
    "countdown_milestone_target",
    `目标日期：${formatDate(milestoneTarget)}`
  );

  setTextById("countdown_lin_days", `还有 ${linBirthdayRemaining} 天`);
  setTextById(
    "countdown_lin_target",
    `目标日期：${formatDate(linBirthdayTarget)}`
  );

  setTextById("countdown_yu_days", `还有 ${yuBirthdayRemaining} 天`);
  setTextById(
    "countdown_yu_target",
    `目标日期：${formatDate(yuBirthdayTarget)}`
  );
}

function initCarousel() {
  const track = document.getElementById("carouselTrack");
  const dotsContainer = document.getElementById("carouselDots");
  if (!track || !dotsContainer) return;

  const slides = Array.from(track.querySelectorAll("img"));
  if (slides.length <= 1) return;

  let currentIndex = 0;
  let timer = null;

  slides.forEach((_, index) => {
    const dot = document.createElement("span");
    dot.addEventListener("click", () => {
      currentIndex = index;
      render();
      restart();
    });
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.children);

  function render() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
    });
  }

  function start() {
    timer = setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      render();
    }, 6000);
  }

  function restart() {
    clearInterval(timer);
    start();
  }

  slides.forEach((slide) => {
    slide.addEventListener("click", () => {
      const originalSrc = slide.getAttribute("src");
      if (originalSrc) {
        openImagePreview(originalSrc, slide.getAttribute("alt") || "预览图");
      }
    });
  });

  track.addEventListener("mouseenter", () => {
    clearInterval(timer);
  });

  track.addEventListener("mouseleave", () => {
    start();
  });

  render();
  start();
}

function openImagePreview(src, alt) {
  const overlay = document.createElement("div");
  overlay.className = "preview-overlay";
  overlay.innerHTML = `
    <div class="preview-box">
      <img src="${src}" alt="${alt}">
      <span class="close-btn" aria-label="关闭预览">&times;</span>
    </div>
  `;

  const close = () => {
    if (overlay.parentNode) {
      document.body.removeChild(overlay);
    }
  };

  overlay.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.classList.contains("preview-overlay") || target.classList.contains("close-btn")) {
      close();
    }
  });

  document.body.appendChild(overlay);
}

function initMusic() {
  const music = document.getElementById("ourMusic");
  const panel = document.getElementById("musicPanel");
  const trackName = document.getElementById("musicTrackName");
  const prevBtn = document.getElementById("musicPrev");
  const playPauseBtn = document.getElementById("musicPlayPause");
  const nextBtn = document.getElementById("musicNext");
  const musicToggle = document.getElementById("musicToggle");
  if (!music || !musicToggle || !panel || !trackName || !prevBtn || !playPauseBtn || !nextBtn) return;

  music.volume = 0.55;
  const playlist = [
    { src: "audio/our-song.mp3", name: "我们的歌 1" },
    { src: "audio/our-song-2.mp3", name: "我们的歌 2" },
    { src: "audio/our-song-3.mp3", name: "我们的歌 3" }
  ];
  let currentIndex = 0;
  let recentErrorCount = 0;

  function syncPlayPauseIcon() {
    playPauseBtn.textContent = music.paused ? "▶" : "⏸";
  }

  async function loadTrack(index, autoPlay = false) {
    currentIndex = (index + playlist.length) % playlist.length;
    const currentTrack = playlist[currentIndex];
    music.src = currentTrack.src;
    trackName.textContent = currentTrack.name;
    music.load();

    if (autoPlay) {
      try {
        await music.play();
      } catch (_) {
        music.pause();
      }
    }
    syncPlayPauseIcon();
  }

  musicToggle.addEventListener("click", () => {
    const willOpen = panel.hidden;
    panel.hidden = !willOpen;
    musicToggle.setAttribute("aria-expanded", String(willOpen));
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    const clickedInsidePanel = panel.contains(target);
    const clickedToggle = musicToggle.contains(target);
    if (!clickedInsidePanel && !clickedToggle) {
      panel.hidden = true;
      musicToggle.setAttribute("aria-expanded", "false");
    }
  });

  playPauseBtn.addEventListener("click", async () => {
    try {
      if (music.paused) {
        await music.play();
        musicToggle.classList.add("playing");
      } else {
        music.pause();
        musicToggle.classList.remove("playing");
      }
      syncPlayPauseIcon();
    } catch (_) {
      musicToggle.classList.remove("playing");
      syncPlayPauseIcon();
    }
  });

  prevBtn.addEventListener("click", () => {
    const autoPlay = !music.paused;
    loadTrack(currentIndex - 1, autoPlay);
    if (autoPlay) musicToggle.classList.add("playing");
  });

  nextBtn.addEventListener("click", () => {
    const autoPlay = !music.paused;
    loadTrack(currentIndex + 1, autoPlay);
    if (autoPlay) musicToggle.classList.add("playing");
  });

  music.addEventListener("ended", () => {
    loadTrack(currentIndex + 1, true);
    musicToggle.classList.add("playing");
  });

  music.addEventListener("play", () => {
    musicToggle.classList.add("playing");
    syncPlayPauseIcon();
  });

  music.addEventListener("pause", () => {
    musicToggle.classList.remove("playing");
    syncPlayPauseIcon();
  });

  music.addEventListener("error", () => {
    recentErrorCount += 1;
    if (recentErrorCount >= playlist.length) {
      recentErrorCount = 0;
      music.pause();
      return;
    }
    loadTrack(currentIndex + 1, true);
  });

  loadTrack(0, false);
}

function updateThemeButtonLabel(isNightMode) {
  const themeToggle = document.getElementById("themeToggle");
  if (!themeToggle) return;
  themeToggle.textContent = isNightMode
    ? "\u2600\ufe0f"
    : "\ud83c\udf19";
}

function applyTheme(theme) {
  const isNightMode = theme === "night";
  document.body.classList.toggle("theme-night", isNightMode);
  updateThemeButtonLabel(isNightMode);
}

function getBeijingTimeParts() {
  const parts = beijingTimeFormatter.formatToParts(new Date());
  const valueMap = {};
  parts.forEach((part) => {
    if (part.type !== "literal") {
      valueMap[part.type] = Number(part.value);
    }
  });

  return {
    hour: valueMap.hour || 0,
    minute: valueMap.minute || 0,
    second: valueMap.second || 0
  };
}

function getAutoThemeByBeijingTime() {
  const { hour, minute } = getBeijingTimeParts();
  const totalMinutes = hour * 60 + minute;
  const nightStartMinutes = 18 * 60 + 30;
  const dayStartMinutes = 6 * 60 + 30;

  return totalMinutes >= nightStartMinutes || totalMinutes < dayStartMinutes
    ? "night"
    : "day";
}

function getMillisecondsUntilNextSwitch() {
  const { hour, minute, second } = getBeijingTimeParts();
  const totalSeconds = hour * 3600 + minute * 60 + second;
  const dayStartSeconds = (6 * 60 + 30) * 60;
  const nightStartSeconds = (18 * 60 + 30) * 60;
  let targetSeconds;

  if (totalSeconds < dayStartSeconds) {
    targetSeconds = dayStartSeconds;
  } else if (totalSeconds < nightStartSeconds) {
    targetSeconds = nightStartSeconds;
  } else {
    targetSeconds = dayStartSeconds + 24 * 3600;
  }

  return Math.max((targetSeconds - totalSeconds) * 1000, 1000);
}

function getManualThemeOverride() {
  const manualTheme = localStorage.getItem(MANUAL_THEME_KEY);
  const expiresAt = Number(localStorage.getItem(MANUAL_THEME_EXPIRES_KEY));

  if (!manualTheme || Number.isNaN(expiresAt)) {
    return null;
  }

  if (Date.now() >= expiresAt) {
    localStorage.removeItem(MANUAL_THEME_KEY);
    localStorage.removeItem(MANUAL_THEME_EXPIRES_KEY);
    return null;
  }

  return manualTheme;
}

function setManualThemeOverride(theme) {
  const expiresAt = Date.now() + getMillisecondsUntilNextSwitch();
  localStorage.setItem(MANUAL_THEME_KEY, theme);
  localStorage.setItem(MANUAL_THEME_EXPIRES_KEY, String(expiresAt));
}

function applyCurrentTheme() {
  const manualTheme = getManualThemeOverride();
  if (manualTheme) {
    applyTheme(manualTheme);
    return;
  }

  applyTheme(getAutoThemeByBeijingTime());
}

function initTheme() {
  applyCurrentTheme();

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isNightMode = document.body.classList.contains("theme-night");
      const nextTheme = isNightMode ? "day" : "night";
      applyTheme(nextTheme);
      setManualThemeOverride(nextTheme);
    });
  }

  setInterval(applyCurrentTheme, 30 * 1000);
}

updateTogetherTime();
updateCountdowns();
initCarousel();
initMusic();
initTheme();
setInterval(updateTogetherTime, 1000);
setInterval(updateCountdowns, 60 * 1000);
