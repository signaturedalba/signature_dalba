const headerAnimation = () => {
  const headerElement = document.querySelector(".header__container");

  const headerFrom = gsap.from(".header", {
    y: -headerElement.offsetHeight,
    duration: 0.6,
    ease: "power2.out",
  });
  const headerContainerFrom = gsap.from(".header__container", {
    y: -headerElement.offsetHeight,
    duration: 0.45,
    ease: "power2.inOut",
  });
  const navigationFrom = gsap.from(".navigation", {
    width: "100%",
    duration: 0.45,
    ease: "power2.inOut",
  });

  ScrollTrigger.create({
    start: "50px top",
    end: 99999,
    onUpdate: (self) => {
      if (self.direction === -1) {
        headerFrom.play();
        headerContainerFrom.play();
        setTimeout(() => {
          navigationFrom.play();
        }, 150);
      } else {
        headerFrom.reverse();
        headerContainerFrom.reverse();
        navigationFrom.reverse();
      }
    },
  });

  const computePinSpacerTotalHeight = () => {
    const pinSpacerElements = document.querySelectorAll(".pin-spacer");
    return Array.from(pinSpacerElements).reduce((total, spacer) => {
      return total + spacer.offsetHeight;
    }, 0);
  };

  const headerHideTween = gsap.to(".header", {
    marginTop: -headerElement.offsetHeight,
    ease: "linear",
    paused: true,
  });

  const createHideST = () => {
    const pinPacerTotalHeight = computePinSpacerTotalHeight();
    return ScrollTrigger.create({
      trigger: ".sub-footer",
      start: () => `top+${pinPacerTotalHeight}px bottom`,
      onEnter: () => headerHideTween.duration(1).play(),
      onLeaveBack: () => headerHideTween.duration(0).reverse(),
    });
  };

  let hideST = createHideST();

  // 레이아웃이 변해 .pin-spacer 높이가 바뀌면 동적으로 재계산
  ScrollTrigger.addEventListener("refreshInit", () => {
    if (hideST) hideST.kill();
    hideST = createHideST();
  });
};

const subFooterAnimation = () => {
  gsap.set(".sub-footer", { opacity: 0 });

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".sub-footer__list",
      start: "top bottom",
      end: () => `+=${document.querySelector(".sub-footer").offsetHeight}`,
      scrub: true,
      // invalidateOnRefresh: true,
      // anticipatePin: 1,
    },
  });

  timeline.to(".sub-footer", { opacity: 1, ease: "none" });
};

const footerAnimation = () => {
  const footerHeadingElement = document.querySelector(".footer__heading");
  const footerBodyElement = document.querySelector(".footer__body");
  gsap.set(footerHeadingElement, { opacity: 0 });
  gsap.set(footerBodyElement, { opacity: 0 });

  ScrollTrigger.create({
    trigger: ".breadcrumb",
    start: "bottom bottom",
    end: "top top",
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

document.addEventListener("DOMContentLoaded", (event) => {
  window.addEventListener("resize", () => ScrollTrigger.refresh());

  headerAnimation();
  subFooterAnimation();
  footerAnimation();
});
