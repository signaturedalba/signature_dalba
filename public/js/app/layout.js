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

const initHeaderAnimations = () => {
  const header = document.querySelector(".header");
  const headerTrigger = document.querySelector(".header__trigger");

  headerTrigger.addEventListener("click", () => {
    document.body.classList.toggle("open-header");
  });
};

const initSubFooterAnimations = () => {
  let timeline = null;
  let scrollTrigger = null;

  const createAnimation = () => {
    scrollTrigger = utils.disposeInstance(scrollTrigger);
    timeline = utils.disposeInstance(timeline);

    const listElement = document.querySelector(".contact__list");
    scrollTrigger = ScrollTrigger.create({
      trigger: ".contact__list",
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
    document.querySelectorAll(".contact__list-title").forEach((el) => {
      el.removeAttribute("disabled");
    });
    const collapsePanel = bindCollapsiblePanels(
      ".contact__list-title",
      ".contact__content",
    );
    collapsePanel();
  };

  const expandSubFooterForTabletAndUp = () => {
    document.querySelectorAll(".contact__content").forEach((el) => {
      gsap.set(el, { height: "auto" });
    });
    document.querySelectorAll(".contact__list-title").forEach((el) => {
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

  const footerElement = document.querySelector(".footer");
  const footerHeadingElement = document.querySelector(".footer__heading");
  const footerBodyElement = document.querySelector(".footer__body");

  gsap.set(footerHeadingElement, { opacity: 0 });
  gsap.set(footerBodyElement, { opacity: 0 });

  const enableFooterFadeForXSAndSM = () => {
    scrollTrigger = utils.disposeInstance(scrollTrigger);

    // note: onXs, onSM 에서 실행되는 스크롤 트리거
    scrollTrigger = ScrollTrigger.create({
      trigger: ".breadcrumb",
      start: "bottom bottom",
      end: "top 30%",
      invalidateOnRefresh: true,
      scrub: true,
      onUpdate: (self) => {
        if (self.progress <= 0.5) {
          gsap.to(footerBodyElement, {
            opacity: self.progress * 2,
            duration: 0,
          });
          gsap.set(footerHeadingElement, { opacity: 0 });
        } else {
          gsap.set(footerBodyElement, { opacity: 1 });
          gsap.to(footerHeadingElement, {
            opacity: (self.progress - 0.5) * 2,
            duration: 0,
          });
        }
      },
    });
  };

  const enableFooterFadeForMDAndLG = () => {
    scrollTrigger = utils.disposeInstance(scrollTrigger);

    // note: onMd, onLg 에서 실행되는 스크롤 트리거
    scrollTrigger = ScrollTrigger.create({
      trigger: ".breadcrumb",
      start: "bottom bottom",
      end: () => `top ${footerElement.offsetTop}px`,
      invalidateOnRefresh: true,
      scrub: true,
      onUpdate: (self) => {
        gsap.to(footerBodyElement, { opacity: self.progress, duration: 0 });
        gsap.to(footerHeadingElement, {
          opacity: self.progress,
          duration: 0,
        });
      },
    });
  };

  utils.onBreakpointChange({
    onXs: enableFooterFadeForXSAndSM,
    onSm: enableFooterFadeForXSAndSM,
    onMd: enableFooterFadeForMDAndLG,
    onLg: enableFooterFadeForMDAndLG,
  });
};

document.addEventListener("DOMContentLoaded", () => {
  initHeaderAnimations();
  initSubFooterAnimations();
  initFooterFadeAnimations();
});
