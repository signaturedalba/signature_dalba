// Blob URL 캐시 (동일 소스 재요청 방지 및 해제 관리)
const videoBlobUrlCache = new Map(); // key: original url, value: blob url

const getVideoBlobUrl = async (originalUrl) => {
  try {
    if (videoBlobUrlCache.has(originalUrl)) {
      return videoBlobUrlCache.get(originalUrl);
    }
    const response = await fetch(originalUrl, { credentials: "same-origin" });
    if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    videoBlobUrlCache.set(originalUrl, blobUrl);
    return blobUrl;
  } catch (e) {
    console.error("LazyVideo: blob fetch error", originalUrl, e);
    return originalUrl; // 폴백: 원본 URL 사용
  }
};

const revokeAllVideoBlobUrls = () => {
  try {
    videoBlobUrlCache.forEach((blobUrl) => URL.revokeObjectURL(blobUrl));
    videoBlobUrlCache.clear();
  } catch (_) {}
};

const initPortalTriggers = () => {
  const portalTriggersElements = document.querySelectorAll(".portal-trigger");
  portalTriggersElements.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = trigger.getAttribute("data-trigger");

      if (targetId) {
        const portalElement = document.getElementById(targetId);
        const videoElement = portalElement.querySelector("video");
        if (portalElement) {
          portalElement.classList.add("is-active");
          document.body.style.overflow = "hidden";
        }
        if (videoElement) {
          const prepareAndPlay = async () => {
            try {
              videoElement.setAttribute("preload", "auto");
              if (
                !videoElement.getAttribute("src") &&
                videoElement.dataset.src
              ) {
                const blobUrl = await getVideoBlobUrl(videoElement.dataset.src);
                videoElement.setAttribute("src", blobUrl);
              }
              const onCanPlay = () => {
                videoElement.removeEventListener("canplay", onCanPlay);
                try {
                  const p = videoElement.play();
                  if (p && typeof p.then === "function") p.catch(() => {});
                } catch (_) {}
              };
              videoElement.addEventListener("canplay", onCanPlay, {
                once: true,
              });
              try {
                videoElement.load();
              } catch (_) {}
            } catch (_) {
              try {
                const p = videoElement.play();
                if (p && typeof p.then === "function") p.catch(() => {});
              } catch (_) {}
            }
          };
          prepareAndPlay();
        }
      }
    });
  });

  const portalCloseButtonsElements =
    document.querySelectorAll(".portal__close");
  portalCloseButtonsElements.forEach((closeButton) => {
    closeButton.addEventListener("click", (e) => {
      e.preventDefault();
      const portalElement = closeButton.closest(".portal");
      const videoElement = portalElement.querySelector("video");
      if (portalElement) {
        portalElement.classList.remove("is-active");
        document.body.style.overflow = "auto";
      }
      if (videoElement) {
        videoElement.pause();
        videoElement.currentTime = 0;
      }
    });
  });
};

// img 전용 레이지 로드
const initLazyLoadImages = () => {
  const images = Array.from(document.querySelectorAll("img"));

  // 브라우저 네이티브 힌트
  images.forEach((img) => img.setAttribute("loading", "lazy"));

  if (!("IntersectionObserver" in window)) return;

  const onIntersect = (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const img = entry.target;

      // data-* 우선 주입
      if (img.dataset.srcset) img.setAttribute("srcset", img.dataset.srcset);
      if (img.dataset.sizes) img.setAttribute("sizes", img.dataset.sizes);
      if (img.dataset.src) img.setAttribute("src", img.dataset.src);

      // <picture> 사용 시, <img>에 소스가 없으면 첫 번째 <source>의 srcset으로 주입
      if (!img.getAttribute("src") && !img.getAttribute("srcset")) {
        const picture = img.closest("picture");
        if (picture) {
          const firstSource = picture.querySelector("source[srcset]");
          if (firstSource) {
            img.setAttribute("src", firstSource.getAttribute("srcset"));
          }
        }
      }

      // 이미지가 실제 로드되어 레이아웃이 변하면 ST 갱신
      const onceRefresh = () => {
        img.removeEventListener("load", onceRefresh);
        img.removeEventListener("error", onceRefresh);
        ScrollTrigger.refresh();
      };
      img.addEventListener("load", onceRefresh);
      img.addEventListener("error", onceRefresh);

      observer.unobserve(img);
    });
  };

  const observer = new IntersectionObserver(onIntersect, {
    root: null,
    rootMargin: `${window.innerWidth}px 0px`,
    threshold: 0.01,
  });

  images.forEach((img) => observer.observe(img));
};

// video 전용 레이지 로드
const initLazyLoadVideos = () => {
  const videos = Array.from(document.querySelectorAll("video"));

  if (!("IntersectionObserver" in window)) return;

  // 초기: 네트워크 선요청 억제
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

      const hydrate = async () => {
        try {
          video.setAttribute("preload", "auto");
          if (!video.getAttribute("src") && video.dataset.src) {
            const blobUrl = await getVideoBlobUrl(video.dataset.src);
            video.setAttribute("src", blobUrl);
          }
          try {
            video.load();
          } catch (_) {}
        } catch (e) {
          console.error("LazyVideo: hydrate error", e);
        }
      };
      hydrate();

      const onceRefresh = () => {
        video.removeEventListener("loadedmetadata", onceRefresh);
        video.removeEventListener("canplay", onceRefresh);
        ScrollTrigger.refresh();
      };
      video.addEventListener("loadedmetadata", onceRefresh);
      video.addEventListener("canplay", onceRefresh);

      if (video.autoplay || video.getAttribute("autoplay") !== null) {
        try {
          const p = video.play();
          if (p && typeof p.then === "function") p.catch(() => {});
        } catch (_) {}
      }

      observer.unobserve(video);
    });
  };

  const observer = new IntersectionObserver(onIntersect, {
    root: null,
    rootMargin: `${window.innerWidth}px 0px`,
    threshold: 0.01,
  });

  videos.forEach((video) => observer.observe(video));
};

const initVideoPlayer = () => {
  const containers = document.querySelectorAll(".video-player");
  const players = [];

  containers.forEach((container) => {
    const video = container.querySelector(".video-player__video");
    const control = container.querySelector(".video-player__control");
    const pauseIcon = container.querySelector(".video-player__icon--pressed");
    const playIcon = container.querySelector(
      ".video-player__icon--not-pressed",
    );

    if (!video) {
      console.warn("VideoPlayer: required video not found", container);
      return;
    }

    const hasControl = !!control;

    const state = { isPlaying: false };

    const update = () => {
      if (state.isPlaying) {
        pauseIcon && pauseIcon.classList.add("is-visible");
        playIcon && playIcon.classList.remove("is-visible");
        if (hasControl) {
          control.setAttribute("aria-pressed", "true");
          control.setAttribute("aria-label", "Video Pause");
        } else {
          video.setAttribute("aria-label", "Video Pause");
        }
      } else {
        pauseIcon && pauseIcon.classList.remove("is-visible");
        playIcon && playIcon.classList.add("is-visible");
        if (hasControl) {
          control.setAttribute("aria-pressed", "false");
          control.setAttribute("aria-label", "Video Play");
        } else {
          video.setAttribute("aria-label", "Video Play");
        }
      }
      container.setAttribute(
        "data-player-status",
        state.isPlaying ? "pause" : "play",
      );
      if (hasControl) {
        control.setAttribute(
          "data-player-status",
          state.isPlaying ? "pause" : "play",
        );
      }
    };

    const play = () => {
      try {
        const p = video.play();
        if (p !== undefined) {
          p.then(() => {
            state.isPlaying = true;
            update();
          }).catch((error) => {
            console.error("VideoPlayer: play error:", error);
            state.isPlaying = false;
            update();
          });
        }
      } catch (error) {
        console.error("VideoPlayer: play error:", error);
      }
    };

    const pause = () => {
      try {
        video.pause();
        state.isPlaying = false;
        update();
      } catch (error) {
        console.error("VideoPlayer: pause error:", error);
      }
    };

    const toggle = () => {
      try {
        if (state.isPlaying) {
          pause();
        } else {
          play();
        }
      } catch (error) {
        console.error("VideoPlayer: toggle error:", error);
      }
    };

    // 접근성 속성
    video.setAttribute("aria-label", "Video Player");
    if (hasControl) {
      control.setAttribute("aria-label", "Video Play/Pause");
      control.setAttribute("role", "button");
      control.setAttribute("tabindex", "0");
      control.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
    } else {
      // 컨트롤이 없으면 비디오 자체에 키보드 토글 제공
      video.setAttribute("tabindex", "0");
      video.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
    }

    // 상호작용 이벤트
    video.addEventListener("click", () => toggle());
    if (hasControl) {
      control.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      });
    }

    // 상태 이벤트
    video.addEventListener("play", () => {
      state.isPlaying = true;
      update();
    });
    video.addEventListener("pause", () => {
      state.isPlaying = false;
      update();
    });
    video.addEventListener("ended", () => {
      state.isPlaying = false;
      update();
    });

    // 로딩/네트워크/에러 상태
    video.addEventListener("loadstart", () => {
      if (hasControl) {
        control.setAttribute("aria-label", "video loading");
        control.setAttribute("disabled", "true");
      } else {
        video.setAttribute("aria-label", "video loading");
      }
    });
    video.addEventListener("canplay", () => {
      if (hasControl) {
        control.removeAttribute("disabled");
      }
      update();
    });
    video.addEventListener("error", (e) => {
      console.error("VideoPlayer: video loading error:", e);
      if (hasControl) {
        control.setAttribute("aria-label", "video loading error");
        control.setAttribute("disabled", "true");
      } else {
        video.setAttribute("aria-label", "video loading error");
      }
    });
    video.addEventListener("waiting", () => {
      if (hasControl) {
        control.setAttribute("aria-label", "video buffering");
      } else {
        video.setAttribute("aria-label", "video buffering");
      }
    });
    video.addEventListener("canplaythrough", () => {
      update();
    });

    // 초기 상태 반영
    state.isPlaying = !video.paused && !video.ended;
    update();

    // 컨트롤러 객체 저장(재사용성)
    players.push({
      container,
      video,
      control,
      play,
      pause,
      toggle,
      getPlayingState: () => state.isPlaying,
    });
  });

  window.videoPlayers = players;
  return players;
};

const initSmoothScroll = () => {
  const STEP_PX = window.innerHeight / 2.5; // 원하는 스텝(px)
  const DURATION_MS = 250; // 부드러운 이동 시간
  let isAnimating = false;

  const clamp = (n, min, max) => {
    return Math.max(min, Math.min(max, n));
  };

  const animateScroll = (start, target) => {
    const delta = target - start;
    const startTime = performance.now();

    const tick = (now) => {
      const t = clamp((now - startTime) / DURATION_MS, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      window.scrollTo(0, start + delta * eased);
      if (t < 1) requestAnimationFrame(tick);
      else isAnimating = false;
    };

    requestAnimationFrame(tick);
  };

  const handleWheel = (e) => {
    e.preventDefault(); // 브라우저 기본 스크롤 막기
    if (isAnimating) return;

    isAnimating = true;
    const direction = e.deltaY > 0 ? 1 : -1;
    const target = clamp(
      window.scrollY + direction * STEP_PX,
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );

    animateScroll(window.scrollY, target);
  };

  window.addEventListener("wheel", handleWheel, { passive: false });
};

document.addEventListener("DOMContentLoaded", (event) => {
  // GSAP 플러그인 등록
  gsap.registerPlugin(EaselPlugin, ScrollTrigger, ScrollToPlugin);
  // ScrollTrigger 전역 설정으로 성능 최적화
  ScrollTrigger.config({
    ignoreMobileResize: true, // 모바일 리사이즈 무시
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load", // 뷰포트 변경 시 재계산
  });

  // 모든 ScrollTrigger가 설정된 후 refresh 실행
  ScrollTrigger.refresh();

  // 윈도우 리사이즈 시 ScrollTrigger 재계산
  window.addEventListener("resize", () => {
    ScrollTrigger.refresh();
  });
  window.addEventListener("pagehide", revokeAllVideoBlobUrls);
  window.addEventListener("beforeunload", revokeAllVideoBlobUrls);

  // 비디오/이미지 레이지 로드 우선 적용
  initLazyLoadVideos();
  initLazyLoadImages();
  initPortalTriggers();
  initVideoPlayer();
  initSmoothScroll();
});
