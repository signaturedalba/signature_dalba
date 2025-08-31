import { utils } from "./utils.js";

const initHeroTitleReveal = () => {
  const EASE_OUT = "power2.out";

  gsap.set([".hero__sub-title", ".hero__main-title"], { y: 30, opacity: 0 });

  const timeline = gsap.timeline({ delay: 0.5 });
  timeline
    .to(".hero__sub-title", {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: EASE_OUT,
    })
    .to(
      ".hero__main-title",
      { y: 0, opacity: 1, duration: 1, ease: EASE_OUT },
      "-=0.7",
    );
};

const initFadeInTextProgressHighlight = () => {
  const wordElements = gsap.utils.toArray(".fade-in-text__word");
  if (!wordElements.length) return;

  const START_HIGHLIGHT_INDEX = 2;
  let lastIndex = START_HIGHLIGHT_INDEX;

  const setRangeColor = (from, to, color) => {
    for (let i = from; i <= to; i++) {
      if (wordElements[i]) wordElements[i].style.color = color;
    }
  };
  if (lastIndex >= 0) setRangeColor(0, lastIndex, "#a42135");

  ScrollTrigger.create({
    trigger: ".fade-in-text",
    start: "top top",
    end: "+=200%",
    scrub: 1,
    pin: true,
    pinSpacing: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const total = wordElements.length;
      if (!total) return;

      const targetIndex = Math.floor(self.progress * (total - 1) + 0.00001);
      if (targetIndex === lastIndex || targetIndex < START_HIGHLIGHT_INDEX)
        return;
      if (targetIndex > lastIndex) {
        setRangeColor(lastIndex + 1, targetIndex, "#a42135");
      } else {
        setRangeColor(targetIndex + 1, lastIndex, "#d8d8d8");
      }
      lastIndex = targetIndex;
    },
  });
};

const initParallaxImageScroll = () => {
  gsap.to(".parallax__image", {
    yPercent: -10,
    ease: "none",
    scrollTrigger: {
      trigger: ".parallax",
      start: "top bottom",
      end: "bottom 50%",
      scrub: 1,
    },
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

    timeline.to(
      itemElement,
      { clipPath: "inset(0 100% 0 0)", ease: "power2.inOut" },
      at,
    );
    if (contentElement) {
      timeline.to(contentElement, { x: "-150%", ease: "power2.inOut" }, at);
    }
  }
};

const initExtensionMaskReveal = () => {
  gsap.set(".extension__container", {
    clipPath: "rect(20% 80% 50% 20%)",
  });

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".extension",
      start: "top bottom",
      end: "center center",
      scrub: 1,
    },
  });

  timeline.to(".extension__container", {
    clipPath: "rect(0% 100% 100% 0%)",
    ease: "power2.in",
    duration: 1,
  });
};

const initSlideUpTextReveal = () => {
  gsap.set([".slide-up-text__effect", ".slide-up-text__accent"], {
    y: 30,
    opacity: 0,
  });

  const timeline = gsap.timeline({ paused: true });

  timeline.to(".slide-up-text__effect", {
    y: 0,
    opacity: 1,
    duration: 1,
    ease: "power2.out",
  });

  timeline.to(
    ".slide-up-text__accent",
    {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: "power2.out",
    },
    "-=0.7",
  );

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
};

const initCarouselScrollAndControls = () => {
  const carouselElement = document.querySelector(".carousel");
  const containerElement = document.querySelector(".carousel__container");
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
        utils.addClassname(".sub-footer", "is-sticky");
        utils.addClassname(".breadcrumb", "is-sticky");
        utils.addClassname(".footer", "is-sticky");
      },
      onEnterBack: () => {
        utils.addClassname(".discover", "is-sticky");
        utils.addClassname(".sub-footer", "is-sticky");
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

  const enableCarouselDragForXS = () => {
    tween = utils.disposeInstance(tween);
    combinedST = utils.disposeInstance(combinedST);

    gsap.set(carouselElement, { clearProps: "all" });
    gsap.set(listElement, { clearProps: "all" });

    const maxDragDistance = Math.abs(computeCarouselEndOffsetX());

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
    Draggable.get(containerElement)?.kill();

    const toX = computeCarouselEndOffsetX();

    tween = gsap.fromTo(
      listElement,
      { x: 0 },
      { x: toX, ease: "linear", duration: 0.05, paused: true },
    );

    combinedST = ScrollTrigger.create({
      trigger: carouselElement,
      start: "top bottom",
      end: () =>
        `+=${window.innerHeight + Math.abs(computeCarouselEndOffsetX())}`,
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
    }, 400),
  );

  utils.onBreakpointChange({
    onXs: enableCarouselDragForXS,
    onSm: enableCarouselScrollAnimationForSMAndUp,
    onMd: enableCarouselScrollAnimationForSMAndUp,
    onLg: enableCarouselScrollAnimationForSMAndUp,
  });
};

const initScrollIndicatorAutoHide = () => {
  const helper = document.querySelector(".scroll-indicator");
  if (!helper) return;

  gsap.set(helper, { opacity: 1 });

  ScrollTrigger.create({
    trigger: ".parallax",
    start: "top bottom",
    onEnter: () => {
      gsap.to(helper, { opacity: 0, duration: 0.5, ease: "power2.out" });
    },
    onLeaveBack: () => {
      gsap.to(helper, { opacity: 1, duration: 0.5, ease: "power2.out" });
    },
  });
};

document.addEventListener("DOMContentLoaded", (event) => {
  initHeroTitleReveal();
  initFadeInTextProgressHighlight();
  initParallaxImageScroll();
  initHorizontalSectionsReveal();
  initExtensionMaskReveal();
  initSlideUpTextReveal();
  initCarouselScrollAndControls();
  initScrollIndicatorAutoHide();
});
