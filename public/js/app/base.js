import { utils } from "./utils.js";

const enableImageLazyLoading = () => {
  const images = Array.from(document.querySelectorAll("img"));

  images.forEach((img) => img.setAttribute("loading", "lazy"));

  if (!("IntersectionObserver" in window)) return;

  const onIntersect = (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const img = entry.target;

      if (img.dataset.srcset) img.setAttribute("srcset", img.dataset.srcset);
      if (img.dataset.sizes) img.setAttribute("sizes", img.dataset.sizes);
      if (img.dataset.src) img.setAttribute("src", img.dataset.src);

      if (!img.getAttribute("src") && !img.getAttribute("srcset")) {
        const picture = img.closest("picture");
        if (picture) {
          const firstSource = picture.querySelector("source[srcset]");
          if (firstSource) {
            img.setAttribute("src", firstSource.getAttribute("srcset"));
          }
        }
      }

      const refresh = () => ScrollTrigger.refresh();
      img.addEventListener("load", refresh, { once: true });
      img.addEventListener("error", refresh, { once: true });

      observer.unobserve(img);
    });
  };

  const observer = new IntersectionObserver(onIntersect, {
    root: null,
    rootMargin: `${window.innerHeight}px 0px`,
    threshold: 0.01,
  });

  images.forEach((img) => observer.observe(img));
};

const enableVideoLazyLoading = () => {
  const videos = Array.from(document.querySelectorAll("video"));
  if (!("IntersectionObserver" in window)) return;

  videos.forEach((video) => {
    const src = video.getAttribute("src");
    if (src && !video.dataset.src) {
      video.dataset.src = src;
      video.removeAttribute("src");
    }
    video.setAttribute("preload", "none");
  });

  const onIntersect = (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const video = entry.target;

      utils.setAttributes(video, { preload: "auto" });

      if (!video.getAttribute("src") && video.dataset.src) {
        utils.setAttributes(video, { src: video.dataset.src });
      }

      try {
        video.load();
      } catch (_) {}

      const refresh = () => ScrollTrigger.refresh();
      video.addEventListener("loadedmetadata", refresh, { once: true });
      video.addEventListener("canplay", refresh, { once: true });

      if (video.autoplay || video.getAttribute("autoplay") !== null) {
        utils.playVideoSafely(video);
      }

      observer.unobserve(video);
    });
  };

  const observer = new IntersectionObserver(onIntersect, {
    root: null,
    rootMargin: `${window.innerHeight}px 0px`,
    threshold: 0.01,
  });

  videos.forEach((video) => observer.observe(video));
};

const setupAccessibleVideoPlayers = () => {
  const containers = document.querySelectorAll(".video-player");
  const players = [];

  containers.forEach((playerElement) => {
    const videoElement = playerElement.querySelector(".video-player__video");
    const controlElement = playerElement.querySelector(
      ".video-player__control",
    );
    const iconPause = playerElement.querySelector(
      ".video-player__icon--pressed",
    );
    const iconPlay = playerElement.querySelector(
      ".video-player__icon--not-pressed",
    );

    if (!videoElement) {
      console.warn(
        "VideoPlayer: .video-player__video not found",
        playerElement,
      );
      return;
    }

    const hasControl = !!controlElement;
    const state = { isPlaying: false };

    const applyStatus = () => {
      const status = state.isPlaying ? "pause" : "play";
      utils.setAttributes(playerElement, { "data-player-status": status });
      if (hasControl)
        utils.setAttributes(controlElement, { "data-player-status": status });

      if (iconPause) iconPause.classList.toggle("is-visible", state.isPlaying);
      if (iconPlay) iconPlay.classList.toggle("is-visible", !state.isPlaying);

      if (hasControl) {
        utils.setAttributes(controlElement, {
          "aria-pressed": state.isPlaying ? "true" : "false",
          "aria-label": state.isPlaying ? "Video Pause" : "Video Play",
        });
      } else {
        utils.setAttributes(videoElement, {
          "aria-label": state.isPlaying ? "Video Pause" : "Video Play",
        });
      }
    };

    const play = () => {
      const p = videoElement.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          state.isPlaying = true;
          applyStatus();
        }).catch(() => {
          state.isPlaying = false;
          applyStatus();
        });
      }
    };

    const pause = () => {
      videoElement.pause();
      state.isPlaying = false;
      applyStatus();
    };

    const toggle = () => {
      state.isPlaying ? pause() : play();
    };

    utils.setAttributes(videoElement, { "aria-label": "Video Player" });

    if (hasControl) {
      utils.setAttributes(controlElement, {
        "aria-label": "Video Play/Pause",
        role: "button",
        tabindex: "0",
      });
      controlElement.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
      controlElement.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      });
    } else {
      utils.setAttributes(videoElement, { tabindex: "0" });
      videoElement.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
    }

    videoElement.addEventListener("click", () => toggle());

    const showVideo = () => {
      utils.setAttributes(playerElement, { "data-player-visible": "true" });
    };

    videoElement.addEventListener("loadeddata", showVideo, { once: true });
    videoElement.addEventListener("canplay", showVideo, { once: true });

    videoElement.addEventListener("play", () => {
      state.isPlaying = true;
      applyStatus();
    });
    videoElement.addEventListener("pause", () => {
      state.isPlaying = false;
      applyStatus();
    });
    videoElement.addEventListener("ended", () => {
      state.isPlaying = false;
      applyStatus();
    });

    videoElement.addEventListener("loadstart", () => {
      if (hasControl) {
        utils.setAttributes(controlElement, {
          "aria-label": "video loading",
          disabled: "true",
        });
      } else {
        utils.setAttributes(videoElement, { "aria-label": "video loading" });
      }
    });
    videoElement.addEventListener("canplay", () => {
      if (hasControl) controlElement.removeAttribute("disabled");
      applyStatus();
    });
    videoElement.addEventListener("error", () => {
      if (hasControl) {
        utils.setAttributes(controlElement, {
          "aria-label": "video loading error",
          disabled: "true",
        });
      } else {
        utils.setAttributes(videoElement, {
          "aria-label": "video loading error",
        });
      }
    });

    state.isPlaying = !videoElement.paused && !videoElement.ended;
    applyStatus();

    players.push({
      container: playerElement,
      video: videoElement,
      control: controlElement,
      play,
      pause,
      toggle,
      getPlayingState: () => state.isPlaying,
    });
  });

  window.videoPlayers = players;
  return players;
};

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(EaselPlugin, ScrollTrigger, ScrollToPlugin, Draggable);

  ScrollTrigger.config({
    ignoreMobileResize: true,
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
  });

  ScrollTrigger.refresh();

  window.addEventListener(
    "resize",
    utils.debounce(() => {
      ScrollTrigger.refresh();
    }, 400),
  );

  document.documentElement.style.setProperty(
    "--vh",
    `${window.innerHeight * 0.01}px`,
  );

  enableImageLazyLoading();
  setupAccessibleVideoPlayers();
});
