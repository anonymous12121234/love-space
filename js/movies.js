const MOVIES_JSON_PATH = "data/movies.json";

async function loadMovies() {
  const response = await fetch(MOVIES_JSON_PATH, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load movies.json");
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error("movies.json must be an array");
  }

  return payload;
}

function updateMovieCount(count) {
  const movieNumEl = document.getElementById("movie_num");
  if (!movieNumEl) return;
  movieNumEl.innerText = `林鱼在一起看了 ${count} 部作品！💕`;
}

function renderEmptyState(gallery) {
  gallery.innerHTML = `
    <div class="empty-state">
      <p>还没有添加影片咧~</p>
      <p>快去添加吧！</p>
    </div>
  `;
}

function renderErrorState(gallery) {
  gallery.innerHTML = `
    <div class="empty-state">
      <p>影片数据加载失败</p>
      <p>请检查 data/movies.json 是否可访问</p>
    </div>
  `;
}

function openImagePreview(url, title, time) {
  const overlay = document.createElement("div");
  overlay.className = "image-preview-overlay";

  overlay.innerHTML = `
    <div class="preview-content">
      <img src="${url}" alt="${title}">
      <p>影片名为${title}，观看于${time || "未知时间"}。</p>
      <span class="close-btn">&times;</span>
    </div>
  `;

  overlay.onclick = () => document.body.removeChild(overlay);
  document.body.appendChild(overlay);
}

function renderMovies(gallery, movies) {
  gallery.innerHTML = "";

  if (movies.length === 0) {
    renderEmptyState(gallery);
    return;
  }

  movies.forEach((movie) => {
    const movieCard = document.createElement("div");
    movieCard.className = "movie-card";
    movieCard.innerHTML = `
      <img src="${movie.imageUrl}" alt="${movie.alt || movie.title || "movie"}" class="movie-poster" loading="lazy">
      <div class="movie-info">
        <h3 class="movie-title">${movie.title || "Untitled"}</h3>
      </div>
    `;

    movieCard.addEventListener("click", () => {
      openImagePreview(movie.imageUrl, movie.title || "Untitled", movie.time);
    });

    gallery.appendChild(movieCard);
  });
}

function renderFooter(movieCount) {
  const footer = document.createElement("div");
  footer.className = "footer";
  footer.innerHTML = `
    <p>🎞️ 已记录 ${movieCount} 部影片 | 💕 林鱼的观影回忆</p>
    <p>点击电影卡片可以查看详情哦~</p>
  `;

  const backLink = document.querySelector(".back-link");
  if (backLink && backLink.parentNode) {
    backLink.parentNode.insertBefore(footer, backLink.nextSibling);
  } else {
    document.body.appendChild(footer);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const gallery = document.getElementById("movieGallery");
  if (!gallery) return;

  try {
    const movies = await loadMovies();
    updateMovieCount(movies.length);
    renderMovies(gallery, movies);
    renderFooter(movies.length);
  } catch (error) {
    console.error(error);
    updateMovieCount(0);
    renderErrorState(gallery);
  }
});

document.addEventListener("mousemove", (e) => {
  const cards = document.querySelectorAll(".movie-card");

  cards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = x / rect.width;
    const yPercent = y / rect.height;

    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      card.style.setProperty("--mouse-x", `${xPercent * 100}%`);
      card.style.setProperty("--mouse-y", `${yPercent * 100}%`);
    }
  });
});
