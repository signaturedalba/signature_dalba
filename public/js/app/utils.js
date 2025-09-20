export const utils = {
  storage: {
    get(key) {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch (e) {
        return null;
      }
    },
    set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },
    remove(key) {
      localStorage.removeItem(key);
    },
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  addClassname(selector, className) {
    const element = document.querySelector(`${selector}`);
    if (element) element.classList.add(className);
  },

  removeClassname(selector, className) {
    const element = document.querySelector(`${selector}`);
    if (element) element.classList.remove(className);
  },

  disposeInstance(instance) {
    if (instance && typeof instance.kill === "function") instance.kill();
    return null;
  },

  setAttribute(el, name, value) {
    if (!el) return;
    if (value === null || value === undefined) el.removeAttribute(name);
    else el.setAttribute(name, value);
  },

  setAttributes(el, attrs) {
    if (!el || !attrs) return;
    for (const [key, val] of Object.entries(attrs)) {
      if (val === null || val === undefined) el.removeAttribute(key);
      else el.setAttribute(key, val);
    }
  },

  addEventListenerOnce(el, type, handler) {
    const fn = (e) => {
      el.removeEventListener(type, fn);
      handler(e);
    };
    el.addEventListener(type, fn);
  },

  playVideoSafely(video) {
    try {
      const p = video.play();
      if (p && typeof p.then === "function") {
        p.catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    } catch (_) {}
  },

  getCurrentBreakpoint() {
    const mediaQueries = {
      lg: window.matchMedia("(min-width: 1201px)"),
      md: window.matchMedia("(min-width: 961px)"),
      sm: window.matchMedia("(min-width: 601px)"),
    };

    if (mediaQueries.lg.matches) return "lg";
    if (mediaQueries.md.matches) return "md";
    if (mediaQueries.sm.matches) return "sm";
    return "xs";
  },

  onBreakpointChange({ onXs, onSm, onMd, onLg }) {
    let currentMatchMediaQuery = null;

    const handleResize = () => {
      const matchMediaQuery = this.getCurrentBreakpoint();

      if (matchMediaQuery === currentMatchMediaQuery) return;

      currentMatchMediaQuery = matchMediaQuery;

      switch (matchMediaQuery) {
        case "lg":
          onLg && onLg();
          break;
        case "md":
          onMd && onMd();
          break;
        case "sm":
          onSm && onSm();
          break;
        case "xs":
          onXs && onXs();
          break;
          break;
      }
    };

    handleResize();

    window.addEventListener("resize", this.debounce(handleResize, 400));
  },
};
