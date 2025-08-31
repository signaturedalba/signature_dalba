import { utils } from "./utils.js";

const bindCollapsiblePanels = (triggerSelector, panelSelector, beforeInit) => {
  const triggers = Array.from(document.querySelectorAll(triggerSelector));
  const panels = Array.from(document.querySelectorAll(panelSelector));

  const elementToHandler = new Map();
  const openState = new Map();

  return () => {
    beforeInit && beforeInit();

    triggers.forEach((trigger) => {
      const prev = elementToHandler.get(trigger);
      if (prev) trigger.removeEventListener("click", prev);
    });
    panels.forEach((panel) => gsap.set(panel, { height: "0" }));

    triggers.forEach((trigger, index) => {
      const panel = panels[index];
      openState.set(trigger, false);

      const handler = () => {
        const nextOpen = !openState.get(trigger);
        openState.set(trigger, nextOpen);

        const closeIcon = trigger.querySelector(".collapse-panel-close");
        if (closeIcon) closeIcon.classList.toggle("is-active", nextOpen);

        gsap.to(panel, {
          height: nextOpen ? "auto" : "0",
          duration: 0.45,
          ease: "power2.inOut",
        });
      };

      trigger.addEventListener("click", handler);
      elementToHandler.set(trigger, handler);
    });
  };
};

const initResponsiveHeaderBehavior = () => {
  let headerEnterTween = null;
  let headerContainerEnterTween = null;
  let headerScrollTrigger = null;
  let headerHideTween = null;
  let headerHideTrigger = null;

  const applyHeaderBehaviorForXSToSM = () => {
    headerEnterTween = utils.disposeInstance(headerEnterTween);
    headerContainerEnterTween = utils.disposeInstance(
      headerContainerEnterTween,
    );
    headerScrollTrigger = utils.disposeInstance(headerScrollTrigger);
    headerHideTween = utils.disposeInstance(headerHideTween);
    headerHideTrigger = utils.disposeInstance(headerHideTrigger);

    gsap.set(".header", { clearProps: "all" });
    gsap.set(".header__container", { clearProps: "all" });

    const navigationElement = document.querySelector(".navigation");
    if (navigationElement) navigationElement.classList.remove("is-scrolled");
  };

  const applyHeaderBehaviorForMDUp = () => {
    const headerElement = document.querySelector(".header");
    const navigationElement = document.querySelector(".navigation");

    headerEnterTween = gsap.from(".header", {
      y: "-100%",
      duration: 0.6,
      ease: "power2.out",
    });

    headerContainerEnterTween = gsap.from(".header__container", {
      y: "-100%",
      duration: 0.45,
      ease: "power2.inOut",
    });

    headerScrollTrigger = ScrollTrigger.create({
      start: "50px top",
      end: 99999,
      onUpdate: (self) => {
        const scrollingUp = self.direction === -1;
        if (scrollingUp) {
          headerEnterTween && headerEnterTween.play();
          headerContainerEnterTween && headerContainerEnterTween.play();
          if (navigationElement)
            navigationElement.classList.remove("is-scrolled");
        } else {
          headerEnterTween && headerEnterTween.reverse();
          headerContainerEnterTween && headerContainerEnterTween.reverse();
          if (navigationElement) navigationElement.classList.add("is-scrolled");
        }
      },
    });

    const computePinSpacerTotalHeight = () => {
      const pinSpacers = document.querySelectorAll(".pin-spacer");
      return Array.from(pinSpacers).reduce(
        (sum, spacer) => sum + spacer.offsetHeight,
        0,
      );
    };

    headerHideTween = gsap.to(".header", {
      marginTop: -headerElement.offsetHeight,
      ease: "linear",
      paused: true,
    });

    const createHideTrigger = () => {
      const totalPinSpacerHeight = computePinSpacerTotalHeight();
      return ScrollTrigger.create({
        trigger: ".sub-footer",
        start: () => `top+${totalPinSpacerHeight}px bottom`,
        onEnter: () => headerHideTween && headerHideTween.duration(1).play(),
        onLeaveBack: () =>
          headerHideTween && headerHideTween.duration(0).reverse(),
      });
    };

    headerHideTrigger = createHideTrigger();
  };

  utils.onBreakpointChange({
    onXs: applyHeaderBehaviorForXSToSM,
    onSm: applyHeaderBehaviorForXSToSM,
    onMd: applyHeaderBehaviorForMDUp,
    onLg: applyHeaderBehaviorForMDUp,
  });
};

const initNavigationInteractions = () => {
  const containerElement = document.querySelector(".navigation__container");
  if (!containerElement || typeof Draggable === "undefined") return;

  containerElement.addEventListener("dragstart", (e) => e.preventDefault());
  containerElement
    .querySelectorAll("a")
    .forEach((a) => a.setAttribute("draggable", "false"));

  const enableNavCollapseForXSToSM = () => {
    const collapsePanel = bindCollapsiblePanels(
      ".navigation__trigger-button",
      ".navigation__list",
      () => {
        Draggable.get(containerElement)?.kill();
      },
    );
    collapsePanel();
  };

  const enableNavDragForMDUp = () => {
    Draggable.get(containerElement)?.kill();
    gsap.set(".navigation__list", { height: "100%" });

    Draggable.create(containerElement, {
      type: "scroll",
      axis: "x",
      allowContextMenu: true,
      dragClickables: true,
      cursor: "grab",
      activeCursor: "grabbing",
      onPress: () => {
        document.documentElement.style.userSelect = "none";
        document.body.style.userSelect = "none";
        containerElement.classList.add("is-dragging");
      },
      onRelease: () => {
        document.documentElement.style.userSelect = "";
        document.body.style.userSelect = "";
        containerElement.classList.remove("is-dragging");
      },
    });
  };

  window.matchMedia("(min-width: 1354px)").addEventListener("change", () => {
    Draggable.get(containerElement)?.kill();
    gsap.set(".navigation__list", { height: "100%" });
  });

  utils.onBreakpointChange({
    onXs: enableNavCollapseForXSToSM,
    onSm: enableNavCollapseForXSToSM,
    onMd: enableNavDragForMDUp,
    onLg: enableNavDragForMDUp,
  });
};

const initSubFooterAnimations = () => {
  let timeline = null;
  let scrollTrigger = null;

  const createAnimation = () => {
    scrollTrigger = utils.disposeInstance(scrollTrigger);
    timeline = utils.disposeInstance(timeline);

    gsap.set(".sub-footer__container", { opacity: 0 });

    timeline = gsap.timeline({ paused: true });
    timeline.to(".sub-footer__container", { opacity: 1, ease: "none" });

    const listElement = document.querySelector(".sub-footer__list");
    scrollTrigger = ScrollTrigger.create({
      trigger: ".sub-footer__list",
      start: "top bottom",
      end: () => `+=${listElement ? listElement.offsetHeight : 0}`,
      scrub: true,
      invalidateOnRefresh: true,
      animation: timeline,
    });
  };

  createAnimation();

  window.addEventListener(
    "resize",
    utils.debounce(() => {
      createAnimation();
    }, 400),
  );

  const enableSubFooterCollapseForXS = () => {
    document.querySelectorAll(".sub-footer__title").forEach((el) => {
      el.removeAttribute("disabled");
    });
    const collapsePanel = bindCollapsiblePanels(
      ".sub-footer__title",
      ".sub-footer__content",
    );
    collapsePanel();
  };

  const expandSubFooterForTabletAndUp = () => {
    document.querySelectorAll(".sub-footer__content").forEach((el) => {
      gsap.set(el, { height: "auto" });
    });
    document.querySelectorAll(".sub-footer__title").forEach((el) => {
      utils.setAttribute(el, "disabled", "disabled");
    });
  };

  utils.onBreakpointChange({
    onXs: enableSubFooterCollapseForXS,
    onSm: expandSubFooterForTabletAndUp,
    onMd: expandSubFooterForTabletAndUp,
    onLg: expandSubFooterForTabletAndUp,
  });
};

const initFooterFadeAnimations = () => {
  let scrollTrigger = null;

  const createAnimation = () => {
    scrollTrigger = utils.disposeInstance(scrollTrigger);

    const headingElement = document.querySelector(".footer__heading");
    const bodyElement = document.querySelector(".footer__body");
    gsap.set(headingElement, { opacity: 0 });
    gsap.set(bodyElement, { opacity: 0 });

    scrollTrigger = ScrollTrigger.create({
      trigger: ".breadcrumb",
      start: "bottom bottom",
      end: "top top",
      invalidateOnRefresh: true,
      scrub: true,
      onUpdate: (self) => {
        if (self.progress <= 0.5) {
          gsap.to(bodyElement, { opacity: self.progress * 2, duration: 0 });
          gsap.set(headingElement, { opacity: 0 });
        } else {
          gsap.set(bodyElement, { opacity: 1 });
          gsap.to(headingElement, {
            opacity: (self.progress - 0.5) * 2,
            duration: 0,
          });
        }
      },
    });
  };

  createAnimation();

  window.addEventListener(
    "resize",
    utils.debounce(() => {
      createAnimation();
    }, 400),
  );
};

document.addEventListener("DOMContentLoaded", () => {
  initResponsiveHeaderBehavior();
  initNavigationInteractions();
  initSubFooterAnimations();
  initFooterFadeAnimations();
});
