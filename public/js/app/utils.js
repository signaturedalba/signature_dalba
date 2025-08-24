// 유틸리티 함수들
export const utils = {
  // DOM 요소 선택
  $(selector) {
    return document.querySelector(selector);
  },

  // 모든 DOM 요소 선택
  $$(selector) {
    return document.querySelectorAll(selector);
  },

  // 이벤트 리스너 추가
  on(element, event, handler) {
    element.addEventListener(event, handler);
  },

  // 로컬 스토리지 관리
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

  // 디바운스 함수
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

  // 스로틀 함수
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
};
