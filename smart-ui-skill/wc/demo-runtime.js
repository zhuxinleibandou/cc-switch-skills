(function setupDemoEvents(global) {
  const events = [
  "after-enter",
  "after-leave",
  "animation-end",
  "animation-start",
  "before-change",
  "before-enter",
  "before-leave",
  "before-toggle",
  "cancel",
  "change",
  "clear",
  "click",
  "click-item",
  "click-left",
  "click-left-icon",
  "click-left-text",
  "click-nav",
  "click-right",
  "click-right-text",
  "click-title",
  "close",
  "confirm",
  "disabled",
  "drag",
  "drag-end",
  "drag-position",
  "drag-start",
  "enter",
  "finish",
  "getuserinfo",
  "input",
  "leave",
  "open",
  "scroll",
  "search",
  "select",
  "show-change",
  "tab-close"
];

  function getComponentInstance(selector) {
    const host = document.querySelector(selector);
    if (!(host instanceof HTMLElement)) return null;

    const runtime = global.MpComponent.resolveRuntimeFromHost(host);
    return runtime && runtime.instance ? runtime.instance : null;
  }

  const toastQueue = [];
  const toastDefaults = {
    show: true,
    type: 'text',
    duration: 2000,
    position: 'middle',
    loadingType: 'circular',
    selector: '#smart-toast',
  };

  function parseToastOptions(options) {
    return options !== null && typeof options === 'object' ? options : { message: options };
  }

  function ToastInstance(options) {
    const resolvedOptions = { ...toastDefaults, ...parseToastOptions(options) };
    const toast = getComponentInstance(resolvedOptions.selector);
    if (!toast) {
      console.warn(`Toast component not found: ${resolvedOptions.selector}`);
      return undefined;
    }

    delete resolvedOptions.selector;
    toast.clear = () => toast.setData({ show: false });
    toast.setData(resolvedOptions);
    toastQueue.push(toast);
    clearTimeout(toast.timer);

    if (resolvedOptions.duration > 0) {
      toast.timer = setTimeout(toast.clear, resolvedOptions.duration);
    }
    return toast;
  }

  ['loading', 'success', 'fail', 'warn'].forEach(type => {
    ToastInstance[type] = options => ToastInstance({ type, ...parseToastOptions(options) });
  });
  ToastInstance.clear = () => {
    toastQueue.splice(0).forEach(toast => toast.clear());
  };
  global.ToastInstance = ToastInstance;

  function invokeHandler(name, event) {
    const originalTarget = event.target;
    if (!(originalTarget instanceof Element)) return;

    let target = originalTarget;
    let handlerName = null;
    while (target) {
      handlerName = target.getAttribute(`bind:${name}`);
      if (handlerName) break;
      target = target.parentElement;
    }

    if (handlerName && target) {
      const handler = global[handlerName];
      if (typeof handler === 'function') {
        handler(event.detail, event, name);
        return;
      }

      if (typeof global.__handle === 'function') {
        const handled = global.__handle(handlerName, event, target);
        if (handled) return;
      }
    }

    if (typeof global.__set !== 'function') return;
    if (name === 'click-nav') {
      const binding = originalTarget.getAttribute('data-bind-main-active-index');
      if (binding) global.__set(binding, event.detail.index);
      return;
    }
    if (name === 'click-item') {
      const binding = originalTarget.getAttribute('data-bind-active-id');
      if (!binding) return;
      const current = originalTarget.activeId;
      const id = event.detail.id;
      const next = Array.isArray(current)
        ? current.includes(id)
          ? current.filter(value => value !== id)
          : [...current, id]
        : id;
      global.__set(binding, next);
      return;
    }
    if (name === 'change' || name === 'input') {
      const binding =
        originalTarget.getAttribute('data-bind-value') || originalTarget.getAttribute('data-bind-checked');
      if (binding) {
        const value = event.detail?.value !== undefined ? event.detail.value : event.detail;
        global.__set(binding, value);
      }
    }
  }

  events.forEach(name => {
    global.MpComponent.webEvents.on(name, event => invokeHandler(name, event));
  });
})(window);
