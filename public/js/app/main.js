const heroAnimation = () => {
  gsap.set([".hero__sub-title", ".hero__main-title"], {
    y: 30,
    opacity: 0,
  });

  const timeline = gsap.timeline({
    delay: 0.5, // 페이지 로드 후 0.5초 대기
  });

  timeline.to(".hero__sub-title", {
    y: 0,
    opacity: 1,
    duration: 1,
    ease: "ease",
  });

  timeline.to(
    ".hero__main-title",
    {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: "ease",
    },
    "-=0.7",
  );
};

const fadeInTextAnimation = () => {
  const words = gsap.utils.toArray(".fade-in-text__word");
  if (!words.length) return;

  // 초기 빨간색 단어 인덱스 계산 (마크업 기본값 유지)
  const START_INDEX = 2;
  let lastIndex = START_INDEX;

  const setRangeColor = (from, to, color) => {
    for (let i = from; i <= to; i++) {
      if (words[i]) words[i].style.color = color;
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
      const total = words.length;
      if (!total) return;

      const targetIndex = Math.floor(self.progress * (total - 1) + 0.00001);
      if (targetIndex === lastIndex || targetIndex < START_INDEX) return;
      if (targetIndex > lastIndex) {
        setRangeColor(lastIndex + 1, targetIndex, "#a42135");
      } else {
        setRangeColor(targetIndex + 1, lastIndex, "#d8d8d8");
      }
      lastIndex = targetIndex;
    },
  });
};

const parallaxAnimation = () => {
  // parallax 이미지 애니메이션
  gsap.to(".parallax__image", {
    yPercent: -10, // 이미지를 위로 50% 이동
    ease: "none",
    scrollTrigger: {
      trigger: ".parallax",
      start: "top bottom",
      end: "bottom 50%",
      scrub: 1,
    },
  });
};

const horizontalScrollAnimation = () => {
  const horizontalScrollItems = gsap.utils.toArray(".horizontal-scroll__item");
  const horizontalScrollContents = gsap.utils.toArray(
    ".horizontal-scroll__content",
  );

  // 초기 상태 설정 - z-index 설정
  horizontalScrollItems.forEach((item, index) => {
    gsap.set(item, {
      zIndex: (horizontalScrollItems.length - index) * 5,
    });
  });

  // 스크롤 트리거 설정
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".horizontal-scroll",
      start: "top top",
      end: () => `+=${horizontalScrollItems.length * 100}%`,
      scrub: 1,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      fastScrollEnd: true,
      invalidateOnRefresh: true,
    },
  });

  timeline
    .to(
      horizontalScrollItems[0],
      {
        clipPath: "inset(0 100% 0 0)",
        ease: "power2.inOut",
      },
      0,
    )
    .to(
      horizontalScrollContents[0],
      {
        x: "-150%",
        ease: "power2.inOut",
      },
      0,
    )

    .to(
      horizontalScrollItems[1],
      {
        clipPath: "inset(0 100% 0 0)",
        ease: "power2.inOut",
      },
      "50%",
    )
    .to(
      horizontalScrollContents[1],
      {
        x: "-150%",
        ease: "power2.inOut",
      },
      "50%",
    );
};

const extensionAnimation = () => {
  gsap.set(".extension__container", {
    clipPath: "rect(20% 80% 60% 20%)",
  });

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".extension",
      start: "top bottom", // 섹션이 화면 하단에 닿을 때 시작
      end: "center center", // 섹션 중앙이 화면 중앙에 올 때 완료
      scrub: 1, // 스크롤과 동기화
    },
  });

  // 4면 마스킹에서 점진적으로 전체 이미지가 보이도록 애니메이션
  timeline.to(".extension__container", {
    clipPath: "rect(0% 100% 100% 0%)", // 최종 상태: 전체 이미지 표시
    ease: "power2.in",
    duration: 1,
  });
};

const slideUpTextAnimation = () => {
  // 초기 상태 설정
  gsap.set([".slide-up-text__effect", ".slide-up-text__accent"], {
    y: 30,
    opacity: 0,
  });

  // 애니메이션 타임라인 생성 (일시정지 상태로 시작)
  const timeline = gsap.timeline({ paused: true });

  // effectTo 애니메이션
  timeline.to(".slide-up-text__effect", {
    y: 0,
    opacity: 1,
    duration: 1,
    ease: "ease",
  });

  // accentTo 애니메이션 (0.3초 후 실행)
  timeline.to(
    ".slide-up-text__accent",
    {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: "ease",
    },
    "-=0.7",
  );

  // 스크롤 트리거 설정
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

const carouselAnimation = () => {
  const carousel = document.querySelector(".carousel");
  const list = document.querySelector(".carousel__list");
  const lastItem = document.querySelector(".carousel__item:last-child");

  const setPositionSticky = (className) => {
    const element = document.querySelector(`.${className}`);
    if (element) element.style.position = "sticky";
  };

  if (!carousel || !list || !lastItem) return;

  // 마지막 아이템이 화면 정가운데에 위치하도록 필요한 이동 거리 계산
  const getToValue = () => {
    const lastItemOffsetLeft = lastItem.offsetLeft;
    const lastItemWidth = lastItem.offsetWidth;
    return -(lastItemOffsetLeft - window.innerWidth / 2 + lastItemWidth / 2);
  };

  let tween;
  let combinedST;
  let pinST;

  const init = () => {
    // 기존 인스턴스 정리
    if (tween) tween.kill();
    if (combinedST) combinedST.kill();
    if (pinST) pinST.kill();

    // 최신 치수 기준으로 목표값 계산
    const toX = getToValue();

    // 하나의 트윈으로 전체 구간(사전 이동 + Pin 구간)을 제어
    tween = gsap.fromTo(
      list,
      { x: 0 },
      { x: toX, ease: "linear", duration: 0.05, paused: true },
    );

    // 1) 통합 진행도 컨트롤러: top bottom → top top(뷰포트높이) → +=수평이동거리
    combinedST = ScrollTrigger.create({
      trigger: carousel,
      start: "top bottom", // 1. carousel 상단이 뷰포트 하단에 닿는 순간부터 이동 시작
      end: () => `+=${window.innerHeight + Math.abs(getToValue())}`,
      scrub: 1,
      invalidateOnRefresh: true, // 레이아웃 변경 시 재계산
      fastScrollEnd: true,
      onUpdate: (self) => {
        tween.progress(self.progress);
      },
    });

    // 2) Pin 전용 트리거: top top → +=수평이동거리
    pinST = ScrollTrigger.create({
      trigger: carousel,
      start: "top top", // 2. carousel 최상단이 뷰포트 최상단에 위치하면 Pin 고정
      end: () => `+=${Math.abs(getToValue())}`, // 4. 마지막 아이템이 중앙에 오면 종료
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      fastScrollEnd: true,
      onEnter: () => {
        setPositionSticky("discover");
        setPositionSticky("breadcrumb");
        setPositionSticky("footer");
      },
      onEnterBack: () => {
        setPositionSticky("discover");
        setPositionSticky("breadcrumb");
        setPositionSticky("footer");
      },
    });
  };

  init();

  // 리사이즈/폰트로드 등 레이아웃 변경 시 재계산
  window.addEventListener("resize", () => ScrollTrigger.refresh());
};

const scrollHelperAnimation = () => {
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
  heroAnimation();
  fadeInTextAnimation();
  parallaxAnimation();
  horizontalScrollAnimation();
  extensionAnimation();
  slideUpTextAnimation();
  carouselAnimation();
  scrollHelperAnimation();
});
