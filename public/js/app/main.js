import { utils } from "./utils.js";

const initHeroContainerAnimation = () => {
  const heroContainer = document.querySelector(".hero__container");
  if (!heroContainer) return;

  const getInitialTop = () => {
    const breakpoint = utils.getCurrentBreakpoint();
    return breakpoint === "xs" || breakpoint === "sm" ? 85 : 76.5;
  };
  const initialWidth = 95;

  const computeInitialTopPx = () => (getInitialTop() / 100) * window.innerHeight;

  gsap.set(heroContainer, {
    top: `${computeInitialTopPx()}px`,
    width: `${initialWidth}%`,
    opacity: 0,
    y: 30,
  });

  gsap.to(heroContainer, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "linear",
  });

  let wasAtTarget = false;

  ScrollTrigger.create({
    trigger: ".hero",
    start: "top top",
    end: "bottom top",
    start: "top top",
    end: "+=100%",
    scrub: 1,
    pin: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const progress = self.progress;
      const breakpoint = utils.getCurrentBreakpoint();
      const initialTop = getInitialTop();

      if (breakpoint === "md" || breakpoint === "lg") {
        const currentWidth = initialWidth - (initialWidth - (135 / window.innerWidth) * 100) * progress;
        heroContainer.style.width = `${Math.max(135, (currentWidth * window.innerWidth) / 100)}px`;
      } else {
        heroContainer.style.width = `${initialWidth}%`;
      }

      let targetTopPx = 0;
      if (breakpoint === "xs" || breakpoint === "sm") {
        const trigger = document.querySelector(".header__trigger");
        if (trigger) {
          const rect = trigger.getBoundingClientRect();
          targetTopPx = rect.bottom + 12;
        } else {
          targetTopPx = 0;
        }
      } else {
        const headerElement = document.querySelector(".header");
        targetTopPx = headerElement ? headerElement.offsetHeight / 2 : 0;
      }

      const initialTopPx = (initialTop / 100) * window.innerHeight;
      const currentTopPx = initialTopPx + (targetTopPx - initialTopPx) * progress;

      if (currentTopPx <= targetTopPx) {
        wasAtTarget = true;
        heroContainer.style.top = `${targetTopPx}px`;
        utils.addClassname(".hero__container", "is-fade-out");
        utils.removeClassname(".hero__container", "is-fade-in");
      } else {
        heroContainer.style.top = `${currentTopPx}px`;
        if (wasAtTarget) {
          utils.removeClassname(".hero__container", "is-fade-out");
          utils.addClassname(".hero__container", "is-fade-in");
        }
        wasAtTarget = false;
      }
    },
    onRefresh: () => {
      const breakpoint = utils.getCurrentBreakpoint();
      const initialTop = getInitialTop();
      if (breakpoint === "md" || breakpoint === "lg") {
        const currentWidth = initialWidth - (initialWidth - (135 / window.innerWidth) * 100) * 0;
        heroContainer.style.width = `${Math.max(135, (currentWidth * window.innerWidth) / 100)}px`;
      } else {
        heroContainer.style.width = `${initialWidth}%`;
      }
      heroContainer.style.top = `${computeInitialTopPx()}px`;
      utils.removeClassname(".hero__container", "is-fade-out");
      utils.removeClassname(".hero__container", "is-fade-in");
    },
  });
};

const initFadeInTextProgressHighlight = () => {
  const fadeInTextElements = gsap.utils.toArray(".fade-in-text");
  if (!fadeInTextElements.length) return;

  fadeInTextElements.forEach((fadeInElement, index) => {
    const defaultColor = "#5A432F";
    const highlightColor = "#ffffff";
    const wordElements = gsap.utils.toArray(".fade-in-text__word", fadeInElement);
    if (!wordElements.length) return;

    const START_HIGHLIGHT_INDEX = 2;
    let lastIndex = START_HIGHLIGHT_INDEX;

    const setRangeColor = (from, to, color) => {
      for (let i = from; i <= to; i++) {
        if (wordElements[i]) wordElements[i].style.color = color;
      }
    };

    // 초기 색상 설정
    setRangeColor(0, wordElements.length - 1, defaultColor);
    if (lastIndex >= 0) setRangeColor(0, lastIndex, highlightColor);

    ScrollTrigger.create({
      trigger: fadeInElement,
      start: "top top",
      end: "+=200%",
      scrub: 1,
      pin: true,
      // pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const total = wordElements.length;
        if (!total) return;

        const targetIndex = Math.floor(self.progress * (total - 1) + 0.00001);
        if (targetIndex === lastIndex || targetIndex < START_HIGHLIGHT_INDEX) return;
        if (targetIndex > lastIndex) {
          setRangeColor(lastIndex + 1, targetIndex, highlightColor);
        } else {
          setRangeColor(targetIndex + 1, lastIndex, defaultColor);
        }
        lastIndex = targetIndex;
      },
    });
  });
};

const initHorizontalSectionsReveal = () => {
  const itemElements = gsap.utils.toArray(".horizontal-scroll__item");
  const contentElements = gsap.utils.toArray(".horizontal-scroll__content");
  if (!itemElements.length) return;

  itemElements.forEach((el, index) => {
    gsap.set(el, { zIndex: (itemElements.length - index) * 5 });
  });

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".horizontal-scroll",
      start: "top top",
      end: () => `+=${itemElements.length * 100}%`,
      scrub: 1,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      fastScrollEnd: true,
      invalidateOnRefresh: true,
    },
  });

  const total = itemElements.length;
  const getTimelinePositionForIndex = (i) => {
    if (total <= 1) return 0;
    return `${(i * 100) / (total - 1)}%`;
  };

  for (let i = 0; i < total - 1; i++) {
    const itemElement = itemElements[i];
    const contentElement = contentElements[i];
    const at = getTimelinePositionForIndex(i);

    timeline.to(itemElement, { clipPath: "inset(0 100% 0 0)", ease: "power2.inOut" }, at);
    if (contentElement) {
      timeline.to(contentElement, { x: "-150%", ease: "power2.inOut" }, at);
    }
  }
};

const initSlideUpTextReveal = () => {
  gsap.set([".slide-up-text__main-title", ".slide-up-text__paragraph"], {
    y: 30,
    opacity: 0,
  });

  const timeline = gsap.timeline({ paused: true });

  timeline.to(".slide-up-text__main-title", {
    y: 0,
    opacity: 1,
    duration: 1,
    ease: "power2.out",
  });

  timeline.to(
    ".slide-up-text__paragraph",
    {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: "power2.out",
    },
    "-=0.7"
  );

  // 텍스트 애니메이션 트리거
  ScrollTrigger.create({
    trigger: ".slide-up-text",
    start: "top 30%",
    onEnter: () => {
      timeline.play();
    },
    onLeaveBack: () => {
      timeline.reverse();
    },
  });

  // 동영상 자동 재생 트리거 (섹션 최상단이 뷰포트 하단에 위치할 때)
  const videoElement = document.querySelector(".slide-up-text__video");
  if (videoElement) {
    // 해당 비디오의 플레이어 인스턴스 찾기
    const getVideoPlayer = () => {
      if (window.videoPlayers) {
        return window.videoPlayers.find((player) => player.videoElement === videoElement);
      }
      return null;
    };

    ScrollTrigger.create({
      trigger: ".slide-up-text",
      start: "top bottom", // 섹션 최상단이 뷰포트 하단에 위치할 때
      end: "bottom top", // 섹션 하단이 뷰포트 상단에 위치할 때
      onEnter: () => {
        // 비디오 플레이어 인스턴스를 통해 재생 (상태 관리 포함)
        const player = getVideoPlayer();
        if (player && player.play) {
          player.play();
        } else {
          // 플레이어 인스턴스가 없으면 직접 재생
          utils.playVideoSafely(videoElement);
        }
      },
      onLeave: () => {
        // 비디오 플레이어 인스턴스를 통해 일시정지 (상태 관리 포함)
        const player = getVideoPlayer();
        if (player && player.pause) {
          player.pause();
        } else {
          // 플레이어 인스턴스가 없으면 직접 일시정지
          videoElement.pause();
        }
      },
      onEnterBack: () => {
        // 스크롤을 되돌려서 다시 진입할 때 재생
        const player = getVideoPlayer();
        if (player && player.play) {
          player.play();
        } else {
          utils.playVideoSafely(videoElement);
        }
      },
      onLeaveBack: () => {
        // 스크롤을 되돌려서 섹션을 벗어날 때 일시정지
        const player = getVideoPlayer();
        if (player && player.pause) {
          player.pause();
        } else {
          videoElement.pause();
        }
      },
    });
  }
};

const initCarouselScrollAndControls = () => {
  const carouselElement = document.querySelector(".carousel");
  const draggableElement = document.querySelector(".carousel__draggable");
  const listElement = document.querySelector(".carousel__list");
  const lastItemElement = document.querySelector(".carousel__item:last-child");
  const prevButtonElement = document.querySelector(".carousel__control--prev");
  const nextButtonElement = document.querySelector(".carousel__control--next");

  if (!carouselElement || !listElement || !lastItemElement) return;

  const itemElements = gsap.utils.toArray(".carousel__item");

  const computeItemCenterOffsetX = (index) => {
    const itemElement = itemElements[index];
    if (!itemElement) return 0;

    const itemOffsetLeft = itemElement.offsetLeft;
    const itemWidth = itemElement.offsetWidth;

    if (index === 0) {
      return 0;
    }

    if (index === itemElements.length - 1) {
      return -(itemOffsetLeft - window.innerWidth + itemWidth);
    }

    return -(itemOffsetLeft - window.innerWidth / 2 + itemWidth / 2);
  };

  const scrollCarouselToIndex = (index) => {
    if (index < 0 || index >= itemElements.length) return;

    currentIndex = index;
    const targetX = computeItemCenterOffsetX(index);

    gsap.to(listElement, { x: targetX, duration: 0.8, ease: "power2.out" });
  };

  const computeCarouselEndOffsetX = () => {
    const lastItemOffsetLeft = lastItemElement.offsetLeft;
    const lastItemWidth = lastItemElement.offsetWidth;
    return -(lastItemOffsetLeft - window.innerWidth / 2 + lastItemWidth / 2);
  };

  const animateButtonVisibility = (button, shouldShow, duration = 0.3) => {
    if (!button) return;

    const opacity = shouldShow ? 1 : 0;
    const pointerEvents = shouldShow ? "auto" : "none";

    gsap.to(button, {
      opacity,
      duration,
      ease: "power2.out",
      onStart: () => {
        if (shouldShow) button.style.pointerEvents = pointerEvents;
      },
      onComplete: () => {
        if (!shouldShow) button.style.pointerEvents = pointerEvents;
      },
    });
  };

  const updateCarouselButtonStates = (index) => {
    const isFirst = index === 0;
    const isLast = index === itemElements.length - 1;

    animateButtonVisibility(prevButtonElement, !isFirst);
    animateButtonVisibility(nextButtonElement, !isLast);
  };

  const initializeCarouselButtonStates = () => {
    updateCarouselButtonStates(currentIndex);
  };

  let tween;
  let combinedST;
  let pinST;
  let itemSTs = [];
  let currentIndex = 0;

  const initializeCarouselScrollTriggers = () => {
    const matchMediaQuery = utils.getCurrentBreakpoint();

    tween = utils.disposeInstance(tween);
    combinedST = utils.disposeInstance(combinedST);
    pinST = utils.disposeInstance(pinST);
    if (itemSTs && itemSTs.length) {
      itemSTs.forEach((st) => st.kill());
      itemSTs = [];
    }

    pinST = ScrollTrigger.create({
      trigger: carouselElement,
      start: "top top",
      end: () => `+=${Math.abs(computeCarouselEndOffsetX())}`,
      pin: matchMediaQuery === "xs" ? false : true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      fastScrollEnd: true,
      onEnter: () => {
        utils.addClassname(".discover", "is-sticky");
        utils.addClassname(".breadcrumb", "is-sticky");
        utils.addClassname(".footer", "is-sticky");
      },
      onEnterBack: () => {
        utils.addClassname(".discover", "is-sticky");
        utils.addClassname(".breadcrumb", "is-sticky");
        utils.addClassname(".footer", "is-sticky");
      },
    });

    itemElements.forEach((itemElement) => {
      const st = ScrollTrigger.create({
        trigger: itemElement,
        start: "left right",
        end: "right left",
        containerAnimation: tween,
        onEnter: () => {
          const videoElement = itemElement.querySelector("video");
          if (!videoElement) return;
          utils.playVideoSafely(videoElement);
        },
        onEnterBack: () => {
          const videoElement = itemElement.querySelector("video");
          if (!videoElement) return;
          utils.playVideoSafely(videoElement);
        },
      });
      itemSTs.push(st);
    });
  };

  const computeCarouselMaxDragDistance = () => {
    // 리스트의 전체 너비에서 뷰포트 너비를 뺀 값이 최대 드래그 거리
    const listTotalWidth = listElement.scrollWidth;
    const viewportWidth = window.innerWidth;
    return Math.max(0, listTotalWidth - viewportWidth);
  };

  const enableCarouselDragForXS = () => {
    tween = utils.disposeInstance(tween);
    combinedST = utils.disposeInstance(combinedST);

    gsap.set(carouselElement, { clearProps: "all" });
    gsap.set(listElement, { clearProps: "all" });

    const maxDragDistance = computeCarouselMaxDragDistance();

    const draggableInstance = Draggable.create(listElement, {
      type: "x",
      allowContextMenu: true,
      dragClickables: true,
      cursor: "grab",
      activeCursor: "grabbing",
      bounds: { minX: -maxDragDistance, maxX: 0 },
      inertia: true,
      onDrag: function () {
        const currentX = this.x;
        let closestIndex = 0;
        let minDistance = Math.abs(currentX - computeItemCenterOffsetX(0));

        for (let i = 1; i < itemElements.length; i++) {
          const distance = Math.abs(currentX - computeItemCenterOffsetX(i));
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = i;
          }
        }

        if (closestIndex !== currentIndex) {
          currentIndex = closestIndex;
          updateCarouselButtonStates(currentIndex);
        }
      },
      onThrowUpdate: function () {
        const currentX = this.x;
        let closestIndex = 0;
        let minDistance = Math.abs(currentX - computeItemCenterOffsetX(0));

        for (let i = 1; i < itemElements.length; i++) {
          const distance = Math.abs(currentX - computeItemCenterOffsetX(i));
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = i;
          }
        }

        if (closestIndex !== currentIndex) {
          currentIndex = closestIndex;
          updateCarouselButtonStates(currentIndex);
        }
      },
    })[0];

    initializeCarouselButtonStates();

    if (prevButtonElement) {
      prevButtonElement.addEventListener("click", () => {
        const prevIndex = currentIndex - 1;
        if (prevIndex >= 0) {
          const targetX = computeItemCenterOffsetX(prevIndex);
          gsap.to(listElement, {
            x: targetX,
            duration: 0.8,
            ease: "power2.out",
            onUpdate: () => {
              draggableInstance.update();
            },
            onComplete: () => {
              currentIndex = prevIndex;
              updateCarouselButtonStates(prevIndex);
            },
          });
        }
      });
    }

    if (nextButtonElement) {
      nextButtonElement.addEventListener("click", () => {
        const nextIndex = currentIndex + 1;
        if (nextIndex < itemElements.length) {
          const targetX = computeItemCenterOffsetX(nextIndex);
          gsap.to(listElement, {
            x: targetX,
            duration: 0.8,
            ease: "power2.out",
            onUpdate: () => {
              draggableInstance.update();
            },
            onComplete: () => {
              currentIndex = nextIndex;
              updateCarouselButtonStates(nextIndex);
            },
          });
        }
      });
    }
  };

  const enableCarouselScrollAnimationForSMAndUp = () => {
    Draggable.get(draggableElement)?.kill();

    const toX = computeCarouselEndOffsetX();

    tween = gsap.fromTo(listElement, { x: 0 }, { x: toX, ease: "linear", duration: 0.05, paused: true });

    combinedST = ScrollTrigger.create({
      trigger: carouselElement,
      start: "top bottom",
      end: () => `+=${window.innerHeight + Math.abs(computeCarouselEndOffsetX())}`,
      scrub: 1,
      invalidateOnRefresh: true,
      fastScrollEnd: true,
      onUpdate: (self) => {
        tween.progress(self.progress);
      },
    });
  };

  initializeCarouselScrollTriggers();

  window.addEventListener(
    "resize",
    utils.debounce(() => {
      initializeCarouselScrollTriggers();
    }, 400)
  );

  utils.onBreakpointChange({
    onXs: enableCarouselDragForXS,
    onSm: enableCarouselScrollAnimationForSMAndUp,
    onMd: enableCarouselScrollAnimationForSMAndUp,
    onLg: enableCarouselScrollAnimationForSMAndUp,
  });
};

document.addEventListener("DOMContentLoaded", (event) => {
  initHeroContainerAnimation();
  initFadeInTextProgressHighlight();
  initHorizontalSectionsReveal();
  initSlideUpTextReveal();
  initCarouselScrollAndControls();
});
