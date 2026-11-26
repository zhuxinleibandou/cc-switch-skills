"use strict";
var MpComponent = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    MpComponent: () => MpComponent,
    PatchFlags: () => PatchFlags,
    createMountContext: () => createMountContext,
    createVnodeRenderer: () => createVnodeRenderer,
    getComponentInnerElement: () => getComponentInnerElement,
    getShadowInnerElement: () => getShadowInnerElement,
    hostConfig: () => hostConfig,
    isPlatformReady: () => isPlatformReady,
    mountVnode: () => mountVnode,
    renderTyml: () => renderTyml,
    renderVnode: () => renderVnode,
    setupPlatform: () => setupPlatform,
    setupTymlEnv: () => setupTymlEnv
  });

  // src/core/Behavior.ts
  function Behavior(options) {
    return options;
  }

  // src/core/component-catalog.ts
  var currentContext = null;
  var optionsByTag = /* @__PURE__ */ new Map();
  var metaByTag = /* @__PURE__ */ new Map();
  function setComponentCurrent(context) {
    currentContext = context;
  }
  function getComponentCurrent() {
    if (!currentContext) {
      throw new Error("Component() called outside component registration context");
    }
    return currentContext;
  }
  function clearComponentCurrent() {
    currentContext = null;
  }
  function setComponentOptions(tag, options) {
    optionsByTag.set(tag, options);
  }
  function getComponentOptions(tag) {
    const options = optionsByTag.get(tag);
    if (!options) {
      throw new Error(`Missing component options for tag: ${tag}`);
    }
    return options;
  }
  function isComponentRegistered(tagName) {
    return metaByTag.has(tagName);
  }
  function registerComponentMeta(meta) {
    metaByTag.set(meta.tagName, meta);
  }
  function getComponentMeta(tagName) {
    return metaByTag.get(tagName);
  }

  // src/core/Component.ts
  function Component(options) {
    const { tag } = getComponentCurrent();
    setComponentOptions(tag, options);
    return options;
  }

  // src/core/component-runtime.ts
  var instanceRuntimeMap = /* @__PURE__ */ new WeakMap();
  var hostRuntimeMap = /* @__PURE__ */ new WeakMap();
  function registerInstanceRuntime(instance, runtime) {
    instanceRuntimeMap.set(instance, runtime);
    hostRuntimeMap.set(runtime.host, runtime);
  }
  function resolveRuntimeFromInstance(instance) {
    return instanceRuntimeMap.get(instance);
  }
  function unregisterInstanceRuntime(instance) {
    const runtime = instanceRuntimeMap.get(instance);
    if (runtime) {
      hostRuntimeMap.delete(runtime.host);
    }
    instanceRuntimeMap.delete(instance);
  }
  function resolveRuntimeFromHost(host) {
    return hostRuntimeMap.get(host);
  }
  function resolveBelongRuntime(vnode) {
    const belong = vnode.belongComponent;
    if (belong == null || typeof belong !== "object") {
      return void 0;
    }
    return belong;
  }

  // src/renderer/mount-context.ts
  function createMountContext() {
    return {
      tidBelongVnodeMap: /* @__PURE__ */ new Map(),
      vnodeBelongElement: /* @__PURE__ */ new WeakMap(),
      elementBelongVnode: /* @__PURE__ */ new WeakMap(),
      elementUnderFragment: /* @__PURE__ */ new WeakMap(),
      nodeMap: /* @__PURE__ */ new Map()
    };
  }
  function cleanupMountContext(context) {
    context.tidBelongVnodeMap.clear();
    context.nodeMap.clear();
  }

  // ../../node_modules/.bun/@tuya-miniapp+tyml-shared@1.0.30/node_modules/@tuya-miniapp/tyml-shared/dist/index.mjs
  var camelToDashCache = {};
  function camelToDash(str = "") {
    if (camelToDashCache[str]) {
      return camelToDashCache[str];
    }
    if (/^[A-Z]/.test(str)) {
      camelToDashCache[str] = str;
      return str;
    }
    const dash = str.replace(/([A-Z])/g, (_, g) => {
      return `-${g.toLowerCase()}`;
    });
    camelToDashCache[str] = dash;
    return dash;
  }
  var deepClone = (obj) => {
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    if (obj instanceof RegExp) {
      return new RegExp(obj.source, obj.flags);
    }
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }
    let copy;
    if (Array.isArray(obj)) {
      copy = new Array(obj.length);
      for (let i = 0, l = obj.length; i < l; i++) {
        copy[i] = deepClone(obj[i]);
      }
    } else {
      copy = {};
      for (const key in obj) {
        copy[key] = deepClone(obj[key]);
      }
    }
    return copy;
  };
  var hashCache = {};
  function genTidHash(str) {
    if (DEV) {
      return str;
    }
    if (hashCache[str]) {
      return hashCache[str];
    }
    let hash = 5381;
    for (let i = str.length; i--; ) {
      hash = hash * 33 ^ str.charCodeAt(i);
    }
    hashCache[str] = (hash >>> 0).toString(16);
    return hashCache[str];
  }
  var PatchFlags = /* @__PURE__ */ ((PatchFlags2) => {
    PatchFlags2[PatchFlags2["TEXT"] = 1] = "TEXT";
    PatchFlags2[PatchFlags2["ATTRS"] = 2] = "ATTRS";
    PatchFlags2[PatchFlags2["EVENTS"] = 4] = "EVENTS";
    PatchFlags2[PatchFlags2["IF_DIRECTIVE"] = 8] = "IF_DIRECTIVE";
    PatchFlags2[PatchFlags2["FOR_DIRECTIVE"] = 16] = "FOR_DIRECTIVE";
    PatchFlags2[PatchFlags2["FRAGMENT_BLOCK"] = 32] = "FRAGMENT_BLOCK";
    PatchFlags2[PatchFlags2["PATCH_BLOCK"] = 64] = "PATCH_BLOCK";
    PatchFlags2[PatchFlags2["TEMPLATE"] = 128] = "TEMPLATE";
    PatchFlags2[PatchFlags2["INCLUDE"] = 256] = "INCLUDE";
    PatchFlags2[PatchFlags2["SLOT"] = 512] = "SLOT";
    PatchFlags2[PatchFlags2["COMPONENT"] = 1024] = "COMPONENT";
    PatchFlags2[PatchFlags2["SLOT_NAME"] = 2048] = "SLOT_NAME";
    PatchFlags2[PatchFlags2["CACHED"] = 0] = "CACHED";
    return PatchFlags2;
  })(PatchFlags || {});
  var VnodeTypes = {
    tag: "tag",
    text: "text",
    comment: "comment",
    fragment: "fragment",
    slot: "slot",
    container: "container"
  };

  // ../../node_modules/.bun/@tuya-miniapp+tyml-runtime@1.0.62/node_modules/@tuya-miniapp/tyml-runtime/dist/index.mjs
  var RENDER_STATE = { isUpdate: false };
  function __CLEAR_SET_VALUE__(v) {
    if (v === null || v === void 0) return v;
    const vType = typeof v;
    if (vType !== "object") return v;
    if ("__value__" in v && "__set__" in v) {
      RENDER_STATE.isUpdate = v.__set__;
      return __CLEAR_SET_VALUE__(v.__value__);
    }
    if ("$builtin$" in v) return v;
    if (Array.isArray(v)) {
      const arr = [];
      for (let i = 0; i < v.length; i++) {
        arr[i] = __CLEAR_SET_VALUE__(v[i]);
      }
      return arr;
    }
    const obj = {};
    for (const key in v) {
      obj[key] = __CLEAR_SET_VALUE__(v[key]);
    }
    return obj;
  }
  function __COPY_SJS_MODULE__(target) {
    if (target === null || target === void 0) return target;
    const constructor = target.constructor;
    if (constructor === String || constructor === Boolean || constructor === Number) return target;
    if (constructor === Object) {
      const copy = {};
      for (const key in target) {
        let k = key;
        if (key === "v_constructor") {
          k = k.substring(2);
        }
        copy[k] = __COPY_SJS_MODULE__(target[key]);
      }
      return copy;
    }
    if (constructor === Array) {
      const copy = [];
      for (let i = 0; i < target.length; i++) {
        copy.push(__COPY_SJS_MODULE__(target[i]));
      }
      return copy;
    }
    if (constructor === Date) {
      const copy = /* @__PURE__ */ new Date();
      copy.setTime(target.getTime());
      return copy;
    }
    if (constructor === RegExp) {
      let f = "";
      if (target.global) f += "g";
      if (target.ignoreCase) f += "i";
      if (target.multiline) f += "m";
      return new RegExp(target.source, f);
    }
    if (constructor === Function) {
      return target;
    }
    return null;
  }
  var assign = (...args) => {
    return Object.assign.apply(null, args);
  };
  var assignSjs = (target, modules) => {
    for (const modulesKey in modules) {
      target[modulesKey] = __COPY_SJS_MODULE__(modules[modulesKey]);
    }
  };
  function decodeUnicode(str) {
    return str.replace(/\\u(\w{4})/gi, (_match, grp) => {
      const code = Number.parseInt(grp, 16);
      return String.fromCharCode(code);
    });
  }
  function setupOptions($options, SAFE_SCRIPT, ctx) {
    const options = $options || {};
    const $PS = options.$PS;
    if ($PS) assign(SAFE_SCRIPT, $PS);
    options.$SJS = SAFE_SCRIPT;
    if (SAFE_SCRIPT && Object.keys(SAFE_SCRIPT).length > 0) {
      options.ctx = assign({}, ctx, SAFE_SCRIPT);
    } else {
      options.ctx = ctx;
    }
    return options;
  }
  function __DEFAULT_EXPRESSION__(value, propName) {
    if (typeof value === "string") {
      value = decodeUnicode(value);
    }
    if (["class", "style", ""].indexOf(propName) !== -1) {
      return value === void 0 ? "" : value;
    }
    return value;
  }
  function __FOR_DATA__(data) {
    if (RENDER_STATE.isUpdate && RENDER_STATE.isUpdate !== "l") {
      if (Array.isArray(data)) {
        return data.map((item) => {
          return { __value__: item, __set__: "f" };
        });
      }
      return { __value__: data, __set__: true };
    }
    return data;
  }
  function __TEMPLATE_DATA__(data) {
    if (RENDER_STATE.isUpdate) {
      if (Array.isArray(data)) {
        return data.map((item) => ({ __set__: "temp-data", __value__: item }));
      }
      if (data !== null && typeof data === "object") {
        const res = {};
        for (const key in data) {
          res[key] = { __set__: "temp-data", __value__: data[key] };
        }
        return res;
      }
      return { __set__: "temp-data", __value__: data };
    }
    return data;
  }
  function __REALLY_VALUE__(value) {
    if (value === null || value === void 0) return value;
    const vType = typeof value;
    if (vType !== "object") return value;
    if ("__value__" in value && "__set__" in value) {
      return __REALLY_VALUE__(value.__value__);
    }
    if (Array.isArray(value)) {
      return value.map((item) => __REALLY_VALUE__(item));
    }
    const result = {};
    for (const key in value) {
      result[key] = __REALLY_VALUE__(value[key]);
    }
    return result;
  }
  var emptyValue = /* @__PURE__ */ Symbol("expression");
  var mustReturn = emptyValue;
  var mockObject = /* @__PURE__ */ Object.create({
    __is_mock_object__: true,
    toString: () => mustReturn
  });
  function EXPRESSION(v) {
    return v;
  }
  function EXPRESSION_SRT(v) {
    if (v === void 0) {
      return "";
    }
    return v;
  }
  function EXPRESSION_TEXT(v) {
    let value = v === void 0 ? "" : v;
    if (typeof v === "function") {
      value = v.toString();
    }
    if (typeof value === "string") {
      return decodeUnicode(value);
    }
    return value;
  }
  function hasOwn(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }
  function isPrototypeMethod(target, key) {
    if (typeof target !== "object") {
      return false;
    }
    if (!(key in target)) {
      return false;
    }
    return !hasOwn(target, key);
  }
  function METHOD(target, methodName) {
    if (target === void 0 || target === null || target === mockObject) {
      return () => {
      };
    }
    if (isPrototypeMethod(target, methodName)) {
      const type = Object.prototype.toString.call(target).slice(8, -1);
      console.warn(
        `[Template] expression "${type}.${methodName}()" is ECMAScript proto method, Can't be used in templates, please use SafeScript (sjs), will be removed after 2023-03-28!!`
      );
    }
    let fn = target[methodName];
    if ("object" === typeof fn && "__set__" in fn && "__value__" in fn) {
      RENDER_STATE.isUpdate = fn.__set__;
      fn = fn.__value__;
    }
    if ("function" !== typeof fn) {
      return () => {
      };
    }
    const func = fn.bind(target);
    return function() {
      const args = Array.prototype.slice.call(arguments);
      if (args.length) {
        const argv = [];
        for (let i = 0; i < args.length; i++) {
          const arg = args[i];
          argv.push(__CLEAR_SET_VALUE__(arg));
        }
        return func.apply(target, argv);
      }
      return func.apply(target, args);
    };
  }
  function EXP(v) {
    if (mustReturn !== emptyValue) {
      return mockObject;
    }
    if (v === void 0 || v === null) {
      mustReturn = v;
      return mockObject;
    }
    if ("object" === typeof v && "__set__" in v && "__value__" in v) {
      RENDER_STATE.isUpdate = v.__set__;
      return v.__value__;
    }
    return v;
  }
  function EXP_E(v) {
    const mockResult = mustReturn;
    if (mustReturn !== emptyValue) {
      mustReturn = emptyValue;
    }
    if (v === mockObject) {
      return mockResult;
    }
    if (v === void 0 || v === null) {
      return v;
    }
    if ("object" === typeof v && "__set__" in v && "__value__" in v) {
      RENDER_STATE.isUpdate = v.__set__;
      return v.__value__;
    }
    return v;
  }
  function vnodeLink(parentVnode) {
    const children = parentVnode.children;
    if (children) {
      let prevChild;
      const len = children.length;
      const isComponent = parentVnode.patchFlag & PatchFlags.COMPONENT;
      for (let i = 0; i < len; i++) {
        const currentChild = children[i];
        if (isComponent) {
          setVnodeIsUnderComponent(currentChild, parentVnode);
        }
        currentChild.parentVnode = parentVnode;
        currentChild.index = i;
        if (prevChild) {
          currentChild.prevVnode = prevChild;
          prevChild.nextVnode = currentChild;
        }
        prevChild = currentChild;
      }
    }
    return parentVnode;
  }
  function setVnodeIsUnderComponent(vnode, componentVnode) {
    if (vnode.type === VnodeTypes.fragment) {
      const children = vnode.children;
      if (children) {
        const len = children.length;
        for (let i = 0; i < len; i++) {
          const currentChild = children[i];
          setVnodeIsUnderComponent(currentChild, componentVnode);
        }
      }
    }
    vnode.isUnderComponent = true;
    vnode.parentComponentVnode = componentVnode;
  }
  function normalizeChildren(value, tag, attrs = {}) {
    if (value !== void 0) {
      let normalizedText = String(value);
      if (tag === "text") {
        normalizedText = processTextChildren(normalizedText, attrs);
      }
      return normalizedText;
    }
  }
  function createTemplate(options, _context, tid, children, _patchFlag, treePatchFlag) {
    const { prefix, belongComponent, groupId } = options;
    const vnodeTid = genTidHash(`${prefix}_${tid}`);
    const vnode = {
      tid: vnodeTid,
      type: VnodeTypes.fragment,
      name: "template",
      patchFlag: PatchFlags.FRAGMENT_BLOCK,
      treePatchFlag,
      children
    };
    if (belongComponent) vnode.belongComponent = belongComponent;
    if (groupId) vnode.groupId = groupId;
    vnodeLink(vnode);
    return vnode;
  }
  function createPatchNode(options, _context, uid, comment) {
    const { prefix, belongComponent, groupId } = options;
    const vnodeTid = genTidHash(`${prefix}_${uid}`);
    const vnode = {
      tid: vnodeTid,
      type: "comment",
      text: `${comment} ${vnodeTid}`,
      patchFlag: PatchFlags.PATCH_BLOCK
    };
    if (belongComponent) vnode.belongComponent = belongComponent;
    if (groupId) vnode.groupId = groupId;
    return vnode;
  }
  function EXP_E_ATTRS(v) {
    return __CLEAR_SET_VALUE__(EXP_E(v));
  }
  function additionAttrs(options) {
    const { attrs, vnode, context, pickAttrs, updateFields = [] } = options;
    if (attrs === null || typeof attrs !== "object") return;
    const normalizedAttrs = {};
    const attrKeys = pickAttrs || Object.keys(attrs);
    const length = attrKeys.length;
    for (let index = 0; index < length; index++) {
      const attrKey = attrKeys[index];
      let attrValue = attrs[attrKey];
      if (typeof attrValue === "function") {
        RENDER_STATE.isUpdate = false;
        const attrExec = attrValue(context, EXP_E_ATTRS);
        attrValue = __DEFAULT_EXPRESSION__(attrExec, attrKey);
        if (RENDER_STATE.isUpdate) {
          updateFields.push(attrKey);
        }
      }
      if (attrKey === "slot") {
        vnode.slotTarget = attrValue;
      } else {
        normalizedAttrs[attrKey] = attrValue;
      }
    }
    vnode.attrs = normalizedAttrs;
    vnode.updateFields = updateFields;
  }
  function normalizeForList(fn, context) {
    RENDER_STATE.isUpdate = false;
    const list = fn(context);
    if (list == null) return [];
    const listType = typeof list;
    if (listType === "string") {
      return __FOR_DATA__(list.split(""));
    }
    if (listType === "number") {
      return __FOR_DATA__(Array.from({ length: list }));
    }
    if (listType === "object") {
      if (Array.isArray(list)) {
        return __FOR_DATA__(list);
      }
      return __FOR_DATA__(Object.values(list));
    }
    return [];
  }
  function createKeyFunction(keyExpression) {
    if (!keyExpression || typeof keyExpression !== "string") {
      if (!Object.__isView__) {
        console.warn(
          `For loop key is not set, using default index as key. This may cause performance issues in updates.`
        );
      }
      return (_itemValue, itemIndex) => `idx_${itemIndex}`;
    }
    if (keyExpression === "*this") {
      return (itemValue, itemIndex) => {
        const valueType = typeof itemValue;
        return valueType === "string" || valueType === "number" ? itemValue : `self_${itemIndex}`;
      };
    }
    return (itemValue, itemIndex) => {
      if (itemValue && "object" === typeof itemValue && !Array.isArray(itemValue)) {
        const keyValue = __REALLY_VALUE__(itemValue[keyExpression]);
        const keyValueType = typeof keyValue;
        return keyValueType === "string" || keyValueType === "number" ? keyValue : `def_${itemIndex}`;
      }
      return `def_${itemIndex}`;
    };
  }
  function createFor(options, context, tid, forContext, renderChildItem, patchFlag, treePatchFlag) {
    const { list, item, index, key } = forContext;
    const { prefix, belongComponent, groupId } = options;
    const vnodeTid = genTidHash(`${prefix}_${tid}`);
    const normalizedList = normalizeForList(list, context);
    const listLength = normalizedList.length;
    if (listLength === 0) {
      const vnode2 = {
        tid: vnodeTid,
        type: "fragment",
        patchFlag: patchFlag | PatchFlags.FOR_DIRECTIVE,
        treePatchFlag,
        children: []
      };
      if (belongComponent) vnode2.belongComponent = belongComponent;
      if (groupId) vnode2.groupId = groupId;
      vnodeLink(vnode2);
      return vnode2;
    }
    const keyFn = createKeyFunction(key);
    const vnode = {
      tid: vnodeTid,
      type: "fragment",
      patchFlag: patchFlag | PatchFlags.FOR_DIRECTIVE,
      treePatchFlag
    };
    if (belongComponent) vnode.belongComponent = belongComponent;
    if (groupId) vnode.groupId = groupId;
    const scopeContext = Object.assign({}, context);
    const scopeOptions = Object.assign({}, options);
    const children = new Array(listLength);
    const needRemove = [];
    for (let itemIndex = 0; itemIndex < listLength; itemIndex++) {
      const itemValue = normalizedList[itemIndex];
      const clearedValue = __CLEAR_SET_VALUE__(itemValue);
      const nodeKey = keyFn(clearedValue, itemIndex);
      scopeContext[item] = itemValue;
      scopeContext[index] = itemIndex;
      scopeOptions.prefix = genTidHash(`${vnodeTid}_${nodeKey}`);
      const childNode = renderChildItem(scopeOptions, scopeContext);
      if (childNode) {
        childNode.key = nodeKey;
        children[itemIndex] = childNode;
      } else {
        console.warn(`For loop render function returned null or undefined for item at index ${itemIndex}.`);
        needRemove.push(itemIndex);
      }
    }
    if (needRemove.length > 0) {
      for (let i = needRemove.length - 1; i >= 0; i--) {
        children.splice(needRemove[i], 1);
      }
    }
    vnode.children = children;
    vnodeLink(vnode);
    return vnode;
  }
  function normalizeEvents(events) {
    const eventsLength = events.length;
    const normalizedEvents = {};
    for (let eventIndex = 0; eventIndex < eventsLength; eventIndex++) {
      const currentEvent = events[eventIndex];
      const eventType = currentEvent[0];
      const eventName = currentEvent[1];
      const eventHandler = currentEvent[2];
      if (!normalizedEvents[eventName]) normalizedEvents[eventName] = {};
      normalizedEvents[eventName][eventType] = eventHandler;
    }
    return normalizedEvents;
  }
  function createNode(options, context, uid, tag, attrs, dynamicAttrs, events, dynamicEvents, change, children, patchFlag, treePatchFlag, updateFields) {
    const { prefix, belongComponent, groupId, usingComponents: using } = options;
    const vnodeTid = genTidHash(`${prefix}_${uid}`);
    const vnode = {
      tid: vnodeTid,
      type: tag === "block" ? "fragment" : "tag",
      name: tag,
      patchFlag,
      treePatchFlag
    };
    if (belongComponent) vnode.belongComponent = belongComponent;
    if (groupId) vnode.groupId = groupId;
    if (using && using[tag]) {
      vnode.is = using[tag];
      vnode.patchFlag |= PatchFlags.COMPONENT;
    }
    if (attrs || change || events) {
      if (attrs) additionAttrs({ attrs, vnode, context, updateFields });
      if (change) vnode.change = change;
      if (events) {
        vnode.events = normalizeEvents(events);
      }
    }
    if (dynamicEvents) vnode.dynamicEvents = dynamicEvents;
    if (dynamicAttrs) vnode.dynamicAttrs = dynamicAttrs;
    if (Array.isArray(children)) vnode.children = children;
    vnodeLink(vnode);
    return vnode;
  }
  function createTextNode(options, context, uid, attrs, text, patchFlag, treePatchFlag) {
    const { prefix, belongComponent, groupId } = options;
    const vnodeTid = genTidHash(`${prefix}_${uid}`);
    const vnode = {
      tid: vnodeTid,
      type: "text",
      patchFlag,
      treePatchFlag
    };
    if (attrs) additionAttrs({ attrs, vnode, context });
    if (belongComponent) vnode.belongComponent = belongComponent;
    if (groupId) vnode.groupId = groupId;
    vnode.text = normalizeChildren(text, "text", vnode.attrs);
    return vnode;
  }
  function useTemplate(hostConfig2, options, context, templateUsage, uid, attrs) {
    const { prefix, usingComponents, belongComponent, groupId } = options;
    const vnodeTid = genTidHash(`${prefix}_${uid}`);
    const templateName = typeof attrs.is === "function" ? attrs.is(context, EXP_E_ATTRS) : attrs.is;
    const renderFunction = templateUsage[templateName];
    if (typeof renderFunction !== "function") {
      console.warn(`[Template] "${templateName}" named of template not found.`);
      return createPatchNode(options, context, `${vnodeTid}_404`, `Template "${templateName}" not found`);
    }
    let templateContext = {};
    const dataAttribute = attrs.data;
    if (typeof dataAttribute === "function") {
      RENDER_STATE.isUpdate = false;
      templateContext = __TEMPLATE_DATA__(dataAttribute(context));
    }
    const vnode = renderFunction(hostConfig2, templateContext, {
      prefix: vnodeTid,
      usingComponents,
      belongComponent,
      groupId
    });
    vnode.patchFlag = PatchFlags.TEMPLATE;
    if (belongComponent) vnode.belongComponent = belongComponent;
    if (groupId) vnode.groupId = groupId;
    return vnode;
  }
  function createSlot(options, context, uid, attrs, patchFlag, treePatchFlag) {
    const { prefix, belongComponent, groupId } = options;
    const vnodeTid = genTidHash(`${prefix}_${uid}`);
    const vnode = {
      type: "slot",
      tid: vnodeTid,
      patchFlag,
      treePatchFlag,
      slotPriority: uid
    };
    if (belongComponent) vnode.belongComponent = belongComponent;
    if (groupId) vnode.groupId = groupId;
    if (attrs) additionAttrs({ attrs, vnode, context, pickAttrs: ["name", "slot"] });
    return vnode;
  }
  function useInclude(hostConfig2, options, context, uid, render, block) {
    const { prefix, $SJS, usingComponents, belongComponent, groupId } = options;
    const vnodeTid = genTidHash(`${prefix}_${uid}`);
    const vnode = render(hostConfig2, context, {
      $PS: $SJS,
      // include 透传 $SJS, 作为父模块的 SJS, 在 setupOptions 函数中覆盖
      usingComponents,
      belongComponent,
      prefix: vnodeTid,
      groupId
    });
    if (block) {
      vnode.patchFlag = PatchFlags.INCLUDE;
      vnode.name = "include";
    }
    vnode.tid = vnodeTid;
    return vnode;
  }
  function processTextChildren(textContent, attrs) {
    const { space, decode } = attrs;
    if (!space && !decode) {
      if (/^ +| +$/gm.test(textContent)) {
        return textContent.replace(/^ +| +$/gm, "");
      }
      return textContent;
    }
    if (space) {
      if (space === "nbsp") {
      } else if (space === "ensp") {
        textContent = textContent.replace(/ /g, "\u2002");
      } else if (space === "emsp") {
        textContent = textContent.replace(/ /g, "\u2003");
      }
    } else {
      textContent = textContent.replace(/^ +| +$/gm, "");
    }
    if (decode) {
      textContent = textContent.replace(/&(nbsp|ensp|emsp|lt|gt|quot|apos|amp);/g, (match, entity) => {
        const entities = {
          nbsp: " ",
          ensp: "\u2002",
          emsp: "\u2003",
          lt: "<",
          gt: ">",
          quot: '"',
          apos: "'",
          amp: "&"
        };
        return entities[entity] || match;
      });
    }
    return textContent;
  }
  var isSameVNode = (a, b) => {
    return a.tid === b.tid && a.type === b.type;
  };
  var defaultSlotName = "defaultSlot_881725";
  var getVnodeSlotTarget = (node) => {
    return node.slotTarget || defaultSlotName;
  };
  var getVnodeSlotIs = (node) => {
    if (node.type === VnodeTypes.slot) {
      return node.attrs?.name || defaultSlotName;
    }
    throw new Error(`VNode is not a slot type: ${node.type}`);
  };
  function isComponentVNode(node) {
    return Boolean(node.is) && node.type === VnodeTypes.tag;
  }
  function isTagVNode(node) {
    return node.type === VnodeTypes.tag;
  }
  function isSlotVNode(node) {
    return node.type === VnodeTypes.slot;
  }
  function isCommentVNode(node) {
    return node.type === VnodeTypes.comment;
  }
  function isTextVNode(node) {
    return node.type === VnodeTypes.text;
  }
  function isFragmentVNode(node) {
    return node.type === VnodeTypes.fragment;
  }
  var hostConfig = {
    assign,
    assignSjs,
    _UNDEF: void 0,
    setupOptions,
    createNode,
    createTemplate,
    createTextNode,
    createPatchNode,
    createFor,
    createSlot,
    useTemplate,
    useInclude,
    EXP,
    EXP_E,
    METHOD,
    EXPRESSION,
    EXPRESSION_SRT,
    EXPRESSION_TEXT
  };

  // src/tyml/index.ts
  function setupTymlEnv() {
    const globalScope = globalThis;
    if (globalScope.__GLOBAL_SCRIPT__ === void 0) {
      globalScope.__GLOBAL_SCRIPT__ = {};
    }
    if (globalScope.DEV === void 0) {
      globalScope.DEV = false;
    }
  }
  function renderTyml(render, ctx, options = {}) {
    setupTymlEnv();
    return render(hostConfig, ctx, options);
  }

  // src/utils/index.ts
  function toCamelCase(name) {
    return name.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
  }
  function toKebabCase(name) {
    return name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
  }
  function getPropertyDefaultValue(property) {
    if (property.value !== void 0) {
      return property.value;
    }
    switch (property.type) {
      case String:
        return "";
      case Number:
        return 0;
      case Boolean:
        return false;
      case Object:
        return {};
      case Array:
        return [];
      case Function:
        return null;
      default:
        return void 0;
    }
  }
  function parseAttributeValue(type, value, property) {
    if (type === Boolean) {
      return value !== "false" && value !== "0";
    }
    if (type === Number) {
      const parsed = Number(value);
      if (Number.isNaN(parsed)) {
        return getPropertyDefaultValue(property ?? { type: Number });
      }
      return parsed;
    }
    if (type === Object) {
      try {
        const parsed = JSON.parse(value);
        if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
          return getPropertyDefaultValue(property ?? { type: Object });
        }
        return parsed;
      } catch {
        return getPropertyDefaultValue(property ?? { type: Object });
      }
    }
    if (type === Array) {
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
          return getPropertyDefaultValue(property ?? { type: Array });
        }
        return parsed;
      } catch {
        return getPropertyDefaultValue(property ?? { type: Array });
      }
    }
    if (type === Function) {
      return getPropertyDefaultValue(property ?? { type: Function });
    }
    if (type === void 0 || type === null) {
      if (value === "true") {
        return true;
      }
      if (value === "false") {
        return false;
      }
      if (/^-?\d+(\.\d+)?$/.test(value)) {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }
      const trimmed = value.trim();
      if (trimmed.startsWith("{") && trimmed.endsWith("}") || trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          return JSON.parse(trimmed);
        } catch {
        }
      }
    }
    return value;
  }
  function resolvePropertyValueFromAttribute(property, attrValue) {
    if (attrValue === null) {
      return getPropertyDefaultValue(property);
    }
    return parseAttributeValue(property.type, attrValue, property);
  }
  function getInitialData(options) {
    const data = {
      ...options.data ?? {}
    };
    for (const [key, property] of Object.entries(options.properties ?? {})) {
      if (data[key] === void 0) {
        data[key] = property.value;
      }
    }
    return data;
  }

  // src/core/merge-behaviors.ts
  function flattenBehaviors(behavior) {
    const list = [];
    for (const nested of behavior.behaviors ?? []) {
      list.push(...flattenBehaviors(nested));
    }
    list.push(behavior);
    return list;
  }
  function flattenFromComponent(component) {
    const list = [];
    for (const behavior of component.behaviors ?? []) {
      list.push(...flattenBehaviors(behavior));
    }
    return list;
  }
  function mergeRecords(layers) {
    const merged = {};
    let hasKeys = false;
    for (const layer of layers) {
      if (!layer) {
        continue;
      }
      Object.assign(merged, layer);
      hasKeys = true;
    }
    return hasKeys ? merged : void 0;
  }
  function composeLifetimes(behaviorLayers, component) {
    const composed = {};
    let hasAny = false;
    for (const hook of ["created", "attached", "ready"]) {
      const fns = [...behaviorLayers.map((behavior) => behavior.lifetimes?.[hook]), component.lifetimes?.[hook]].filter(
        (fn) => typeof fn === "function"
      );
      if (fns.length === 0) {
        continue;
      }
      hasAny = true;
      composed[hook] = function lifetimeHook() {
        for (const fn of fns) {
          fn.call(this);
        }
      };
    }
    const detachedFns = [
      component.lifetimes?.detached,
      ...[...behaviorLayers].reverse().map((behavior) => behavior.lifetimes?.detached)
    ].filter((fn) => typeof fn === "function");
    if (detachedFns.length > 0) {
      hasAny = true;
      composed.detached = function detachedHook() {
        for (const fn of detachedFns) {
          fn.call(this);
        }
      };
    }
    return hasAny ? composed : void 0;
  }
  function applyBehaviors(component) {
    const behaviorLayers = flattenFromComponent(component);
    if (behaviorLayers.length === 0) {
      return component;
    }
    return {
      ...component,
      observers: mergeRecords([...behaviorLayers.map((behavior) => behavior.observers), component.observers]),
      lifetimes: composeLifetimes(behaviorLayers, component),
      behaviors: void 0
    };
  }

  // src/renderer/style-resolver.ts
  var StyleResolver = class {
    /**
     * @param options.styleIsolation style isolation mode
     * @param options.prefix compiled wxss selector prefix
     */
    constructor(options) {
      const { styleIsolation, prefix } = options;
      if (styleIsolation === "apply-shared") {
        this.resolveClass = (cls) => `${cls} ${prefix}${cls}`;
        return;
      }
      if (styleIsolation === "isolated") {
        this.resolveClass = (cls) => `${prefix}${cls}`;
        return;
      }
      this.resolveClass = (cls) => cls;
    }
  };

  // src/renderer/component-style-context.ts
  function attachComponentStyleContext(runtime, options) {
    runtime.styleResolver = new StyleResolver({
      prefix: options.prefix,
      styleIsolation: options.styleIsolation ?? "isolated"
    });
  }
  function resolveClassAttr(classValue, runtime) {
    if (!runtime?.styleResolver || classValue.trim() === "") {
      return classValue;
    }
    return classValue.split(/\s+/).filter((className) => className.trim() !== "").map((className) => runtime.styleResolver.resolveClass(className)).join(" ");
  }

  // src/renderer/dom-position.ts
  function insertNodeAfter(newNode, refNode, parent) {
    const next = refNode.nextSibling;
    if (next) {
      parent.insertBefore(newNode, next);
      return;
    }
    parent.appendChild(newNode);
  }

  // src/renderer/view-links.ts
  var vnodeMountContext = /* @__PURE__ */ new WeakMap();
  var globalTidBelongVnodeMap = /* @__PURE__ */ new Map();
  var elementUnderSlotWeakMap = /* @__PURE__ */ new WeakMap();
  function registerGlobalVnode(vnode) {
    if (vnode.tid) {
      globalTidBelongVnodeMap.set(vnode.tid, vnode);
    }
  }
  function unregisterGlobalVnode(vnode) {
    if (vnode.tid) {
      globalTidBelongVnodeMap.delete(vnode.tid);
    }
  }
  function resolveGlobalVnodeByTid(tid) {
    return globalTidBelongVnodeMap.get(tid);
  }
  function linkVnode(context, element, vnode) {
    vnodeMountContext.set(vnode, context);
    registerGlobalVnode(vnode);
    if (vnode.tid) {
      context.tidBelongVnodeMap.set(vnode.tid, vnode);
    }
    context.vnodeBelongElement.set(vnode, element);
    context.elementBelongVnode.set(element, vnode);
    const domNode = element.$elem;
    if (domNode && vnode.tid) {
      context.nodeMap.set(vnode.tid, domNode);
    }
  }
  function unlinkVnode(context, element, vnode) {
    vnodeMountContext.delete(vnode);
    unregisterGlobalVnode(vnode);
    if (vnode.tid) {
      context.tidBelongVnodeMap.delete(vnode.tid);
      context.nodeMap.delete(vnode.tid);
    }
    context.vnodeBelongElement.delete(vnode);
    context.elementBelongVnode.delete(element);
    context.elementUnderFragment.delete(element);
  }
  function relinkVnode(context, element, oldVnode, newVnode) {
    vnodeMountContext.delete(oldVnode);
    unregisterGlobalVnode(oldVnode);
    vnodeMountContext.set(newVnode, context);
    registerGlobalVnode(newVnode);
    if (newVnode.tid) {
      context.tidBelongVnodeMap.set(newVnode.tid, newVnode);
      const domNode = element.$elem;
      if (domNode) {
        context.nodeMap.set(newVnode.tid, domNode);
      }
    }
    context.vnodeBelongElement.delete(oldVnode);
    context.vnodeBelongElement.set(newVnode, element);
    context.elementBelongVnode.set(element, newVnode);
  }
  function resolveVnodeByTid(context, tid) {
    return context.tidBelongVnodeMap.get(tid);
  }
  function resolveElementByVnode(vnode) {
    const context = vnodeMountContext.get(vnode);
    if (!context) {
      return void 0;
    }
    const registered = vnode.tid ? context.tidBelongVnodeMap.get(vnode.tid) : void 0;
    const lookupVnode = registered ?? vnode;
    return context.vnodeBelongElement.get(lookupVnode);
  }
  function resolveNode(vnode) {
    const element = resolveElementByVnode(vnode);
    if (element?.$elem) {
      return element.$elem;
    }
    const context = vnodeMountContext.get(vnode);
    if (context && vnode.tid) {
      return context.nodeMap.get(vnode.tid);
    }
    return void 0;
  }
  function setElementUnderFragment(context, child, fragment) {
    if (fragment) {
      context.elementUnderFragment.set(child, fragment);
      return;
    }
    context.elementUnderFragment.delete(child);
  }
  function resolveFragmentForChild(context, child) {
    return context.elementUnderFragment.get(child);
  }
  function resolveSlotChain(slotElement) {
    let current = slotElement;
    while (elementUnderSlotWeakMap.has(current)) {
      const parentSlot = elementUnderSlotWeakMap.get(current);
      const parentChildren = parentSlot.slotChildren;
      const slotIdx = parentChildren.indexOf(current);
      if (slotIdx > 0) {
        for (let i = slotIdx - 1; i >= 0; i--) {
          const prev = parentChildren[i];
          if (prev.isAttached && (prev.domNode != null || prev.isVirtualSlot())) {
            return { type: "anchor", element: prev };
          }
        }
      }
      const parentSlotEl = resolveElementByVnode(parentSlot.vnode);
      if (!parentSlotEl) {
        break;
      }
      current = parentSlotEl;
    }
    return { type: "top", element: current };
  }

  // src/renderer/DOM/BaseHTMLElement.ts
  var BaseHTMLElement = class {
    constructor(element) {
      this._elem = element;
    }
    setAttribute(name, value) {
      this._elem?.setAttribute(name, value);
    }
    getAttribute(name) {
      return this._elem?.getAttribute(name) ?? null;
    }
    removeAttribute(name) {
      this._elem?.removeAttribute(name);
    }
    addEventListener(name, listener, options) {
      this._elem?.addEventListener(name, listener, options);
    }
    removeEventListener(name, listener, options) {
      this._elem?.removeEventListener(name, listener, options);
    }
    get className() {
      return this._elem?.className ?? "";
    }
    set className(value) {
      if (this._elem) {
        this._elem.className = value;
      }
    }
  };

  // src/renderer/DOM/ViewElement.ts
  function removeFromChildNodes(childNodes, child) {
    const index = childNodes.indexOf(child);
    if (index >= 0) {
      childNodes.splice(index, 1);
    }
  }
  var ViewElement = class extends BaseHTMLElement {
    /**
     * @brief Create view element and link to vnode
     * @param[in] element underlying DOM node
     * @param[in] vnode bound vnode
     * @param[in] context mount context
     */
    constructor(element, _vnode, _context) {
      super(element);
      this._vnode = _vnode;
      this._context = _context;
      this.childNodes = [];
      this.isAttached = false;
      this.isRemoved = false;
      this.tid = _vnode.tid;
    }
    get vnode() {
      return this._vnode;
    }
    get $elem() {
      return this._elem;
    }
    get domNode() {
      return this._elem;
    }
    get nativeElement() {
      return this._elem;
    }
    /**
     * @brief Whether this is a slot proxy without a durable host node
     * @return false for normal elements; SlotElement overrides
     */
    isVirtualSlot() {
      return false;
    }
    /**
     * @brief Node used when inserting this element into a parent
     * @return durable DOM node, or a one-shot fragment for virtual slots
     * @note Prefer this over `$elem` for insert paths so SlotElement can emit
     *       a projection fragment without corrupting resolveNode/linkVnode.
     */
    getInsertNode() {
      return this.$elem;
    }
    after(nextSibling) {
      const node = nextSibling.getInsertNode();
      if (!this._elem || !node) {
        return;
      }
      const parent = this._elem.parentNode;
      if (!parent) {
        return;
      }
      insertNodeAfter(node, this._elem, parent);
      nextSibling.asAttached();
    }
    before(prevSibling) {
      const node = prevSibling.getInsertNode();
      if (!this._elem || !node || !this._elem.parentNode) {
        return;
      }
      this._elem.parentNode.insertBefore(node, this._elem);
      prevSibling.asAttached();
    }
    append(child) {
      const node = child.getInsertNode();
      if (!this._elem || !node) {
        return;
      }
      this._elem.appendChild(node);
      this.childNodes.push(child);
      child.asAttached();
    }
    prepend(child) {
      const node = child.getInsertNode();
      if (!this._elem || !node) {
        return;
      }
      if (this._elem.firstChild) {
        this._elem.insertBefore(node, this._elem.firstChild);
      } else {
        this._elem.appendChild(node);
      }
      this.childNodes.unshift(child);
      child.asAttached();
    }
    /**
     * @brief Update vnode reference after patch
     * @param[in] newVnode next vnode
     * @param[in] oldVnode previous vnode
     * @return none
     */
    updateVnode(newVnode, oldVnode) {
      relinkVnode(this._context, this, oldVnode, newVnode);
      this._vnode = newVnode;
    }
    /**
     * @brief Mark element as attached to document
     * @return none
     */
    asAttached() {
      this.isAttached = true;
      this.isRemoved = false;
    }
    /**
     * @brief Mark element as detached from document
     * @return none
     */
    asUnAttached() {
      this.isAttached = false;
      this.isRemoved = false;
    }
    /**
     * @brief Detach from document without destroying — keep ViewElement for re-project
     * @return this
     */
    pick() {
      if (this.isAttached && this._elem?.parentNode) {
        this._elem.parentNode.removeChild(this._elem);
        this.asUnAttached();
      }
      return this;
    }
    /**
     * @brief Remove element from DOM and unlink vnode mappings
     * @param[in] parentRemove whether parent already removed this node
     * @return none
     */
    remove(parentRemove = false) {
      if (this.isRemoved) {
        return;
      }
      if (!parentRemove && this._elem?.parentNode) {
        this._elem.parentNode.removeChild(this._elem);
      }
      const underSlot = elementUnderSlotWeakMap.get(this);
      if (underSlot) {
        underSlot.trackRemove(this);
      }
      const children = this._vnode.children;
      if (children?.length) {
        for (const childVnode of children) {
          const childElement = resolveElementByVnode(childVnode);
          childElement?.remove(true);
        }
      }
      this.asRemoved();
      unlinkVnode(this._context, this, this._vnode);
    }
    /**
     * @brief Mark element as fully removed
     * @return none
     */
    asRemoved() {
      this.isRemoved = true;
      this.isAttached = false;
    }
    static removeChild(childNodes, child) {
      removeFromChildNodes(childNodes, child);
    }
  };

  // src/renderer/DOM/LightDomElement.ts
  var lightDomSeq = 0;
  function createLightDomVnode(slotName) {
    lightDomSeq += 1;
    return {
      tid: `__mp_light_${lightDomSeq}`,
      type: VnodeTypes.tag,
      name: "light-dom",
      patchFlag: 0,
      treePatchFlag: 0,
      slotTarget: slotName,
      attrs: {}
    };
  }
  var LightDomElement = class extends ViewElement {
    /**
     * @brief Wrap a host light-DOM node
     * @param[in] node native DOM node
     * @param[in] slotName slot target name
     * @param[in] context mount context of the host component
     */
    constructor(node, slotName, context) {
      super(node, createLightDomVnode(slotName), context);
    }
  };

  // src/renderer/vnode-slot.ts
  function getDefaultSlotName() {
    return getVnodeSlotTarget({});
  }
  function getFragmentHasSlotName(vnode, slotName) {
    const children = vnode.children;
    if (!Array.isArray(children)) {
      return void 0;
    }
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      if (child.type === VnodeTypes.fragment) {
        const inFragment = getFragmentHasSlotName(child, slotName);
        if (inFragment) {
          return inFragment;
        }
      } else if (getVnodeSlotTarget(child) === slotName) {
        return child;
      }
    }
    return void 0;
  }
  function getPrevVnodeHasSlotName(vnode, inputSlotName) {
    const slotName = inputSlotName ?? getVnodeSlotTarget(vnode);
    let prevVnode = vnode.prevVnode;
    while (prevVnode) {
      if (isFragmentVNode(prevVnode)) {
        const inFragment = getFragmentHasSlotName(prevVnode, slotName);
        if (inFragment) {
          return inFragment;
        }
      } else if (getVnodeSlotTarget(prevVnode) === slotName) {
        return prevVnode;
      }
      prevVnode = prevVnode.prevVnode;
    }
    let parentVnode = vnode.parentVnode;
    while (parentVnode && parentVnode.type === VnodeTypes.fragment) {
      const inFragment = getPrevVnodeHasSlotName(parentVnode, slotName);
      if (inFragment) {
        return inFragment;
      }
      parentVnode = parentVnode.parentVnode;
    }
    return void 0;
  }

  // src/renderer/slot-manager.ts
  var SlotManager = class {
    constructor() {
      this.slotsChildren = /* @__PURE__ */ Object.create(null);
      this.slots = /* @__PURE__ */ new Map();
      this.slotsByName = /* @__PURE__ */ new Map();
    }
    /**
     * @brief Register a newly created slot element
     * @param[in] slot slot element
     * @return none
     */
    addSlot(slot) {
      const tid = slot.vnode.tid;
      if (!tid) {
        return;
      }
      this.slots.set(tid, slot);
      const slotName = slot.slotName;
      let group = this.slotsByName.get(slotName);
      if (!group) {
        group = [];
        this.slotsByName.set(slotName, group);
      }
      group.push(slot);
      this.makeSlotAvailable(slotName);
    }
    /**
     * @brief Unregister a slot element
     * @param[in] slot slot element
     * @return none
     */
    removeSlot(slot) {
      const slotName = slot.slotName;
      const wasAvailable = slot.isAvailable;
      const tid = slot.vnode.tid;
      if (tid) {
        this.slots.delete(tid);
      }
      const group = this.slotsByName.get(slotName);
      if (group) {
        const idx = group.indexOf(slot);
        if (idx > -1) {
          group.splice(idx, 1);
        }
        if (group.length === 0) {
          this.slotsByName.delete(slotName);
        }
      }
      if (wasAvailable) {
        this.makeSlotAvailable(slotName);
      }
    }
    /**
     * @brief Resolve available slot element for a slot name
     * @param[in] slotName slot name
     * @return available slot element
     */
    getAvailableSlot(slotName) {
      const group = this.slotsByName.get(slotName) ?? [];
      for (const slot of group) {
        if (slot.isAvailable) {
          return slot;
        }
      }
      return null;
    }
    /**
     * @brief Get (or lazily create) cached content elements for a slot name
     * @param[in] name slot name
     * @return content ViewElement list — retained across slot destroy/recreate
     */
    getSlotChildren(name) {
      if (!this.slotsChildren[name]) {
        this.slotsChildren[name] = [];
      }
      return this.slotsChildren[name];
    }
    /**
     * @brief Collect page light-DOM children into slotsChildren (HTML host usage)
     * @param[in] host component host element
     * @param[in] wrap factory that wraps a native node as ViewElement
     * @return none
     * @note Only used when parent did not already route ViewElements via ComponentElement.
     */
    collectHostSlotContent(host, wrap) {
      const defaultSlot = getDefaultSlotName();
      while (host.firstChild) {
        const node = host.firstChild;
        host.removeChild(node);
        const named = node instanceof Element && node.hasAttribute("slot") ? node.getAttribute("slot") ?? "" : "";
        const slotName = named || defaultSlot;
        this.getSlotChildren(slotName).push(wrap(node, slotName));
      }
    }
    /**
     * @brief Whether any slot still has cached content elements
     * @return true when slotsChildren already has entries
     */
    hasCachedContent() {
      for (const name of Object.keys(this.slotsChildren)) {
        if (this.slotsChildren[name].length > 0) {
          return true;
        }
      }
      return false;
    }
    /**
     * @brief Clear all slots and content (component teardown)
     * @return none
     */
    removeAll() {
      this.slotsByName.clear();
      for (const slot of this.slots.values()) {
        slot.remove();
      }
      this.slots.clear();
      this.slotsChildren = /* @__PURE__ */ Object.create(null);
    }
    /**
     * @brief Activate highest-priority slot for a name (tyml makeSlotAvailable)
     * @param[in] slotName slot name
     * @return newly available slot when changed
     */
    makeSlotAvailable(slotName) {
      const group = this.slotsByName.get(slotName) ?? [];
      if (group.length === 0) {
        return null;
      }
      let currentAvailable = null;
      let minPriority = Number.POSITIVE_INFINITY;
      let minIndex = Number.POSITIVE_INFINITY;
      let nextAvailable = null;
      for (const slot of group) {
        if (slot.isAvailable) {
          currentAvailable = slot;
        }
        const p = slot.priority;
        const idx = slot.index;
        if (p < minPriority || p === minPriority && idx < minIndex) {
          minPriority = p;
          minIndex = idx;
          nextAvailable = slot;
        }
      }
      if (currentAvailable !== nextAvailable) {
        if (currentAvailable) {
          currentAvailable.setAvailable(false);
        }
        if (nextAvailable) {
          nextAvailable.setAvailable(true);
        }
      }
      return nextAvailable;
    }
  };
  function routeSlotChild(slotManager, child, mode, anchor) {
    const slotName = getVnodeSlotTarget(child.vnode);
    const available = slotManager.getAvailableSlot(slotName);
    if (available) {
      if (mode === "after" && anchor) {
        available.insertElementAfter(child, anchor);
        available.trackInsertAfter(child, anchor);
      } else if (mode === "prepend") {
        available.prependElement(child);
        available.trackPrepend(child);
      } else {
        available.appendElement(child);
        available.trackAppend(child);
      }
      return available;
    }
    const children = slotManager.getSlotChildren(slotName);
    const existing = children.indexOf(child);
    if (existing >= 0) {
      children.splice(existing, 1);
    }
    if (mode === "after" && anchor) {
      const anchorIdx = children.indexOf(anchor);
      if (anchorIdx > -1) {
        children.splice(anchorIdx + 1, 0, child);
      } else {
        children.push(child);
      }
    } else if (mode === "prepend") {
      children.unshift(child);
    } else {
      children.push(child);
    }
    return null;
  }

  // src/renderer/DOM/ComponentElement.ts
  var hostBelongComponentElement = /* @__PURE__ */ new WeakMap();
  function resolveComponentElementByHost(host) {
    return hostBelongComponentElement.get(host);
  }
  var componentPathAliases = {
  "packages/action-sheet/index": "smart-action-sheet",
  "packages/battery/index": "smart-battery",
  "packages/bottom-sheet/index": "smart-bottom-sheet",
  "packages/button/index": "smart-button",
  "packages/calendar/index": "smart-calendar",
  "packages/calendar-header/index": "smart-calendar-header",
  "packages/calendar-month/index": "smart-calendar-month",
  "packages/calendar-month-list/index": "smart-calendar-month-list",
  "packages/calendar-utils/index": "smart-calendar-utils",
  "packages/calendar-year-list/index": "smart-calendar-year-list",
  "packages/cascader/index": "smart-cascader",
  "packages/cell/index": "smart-cell",
  "packages/cell-group/index": "smart-cell-group",
  "packages/checkbox/index": "smart-checkbox",
  "packages/checkbox-group/index": "smart-checkbox-group",
  "packages/circle/index": "smart-circle",
  "packages/col/index": "smart-col",
  "packages/collapse/index": "smart-collapse",
  "packages/collapse-item/index": "smart-collapse-item",
  "packages/common/index": "smart-common",
  "packages/config-provider/index": "smart-config-provider",
  "packages/count-down/index": "smart-count-down",
  "packages/custom-keyboard/index": "smart-custom-keyboard",
  "packages/datetime-picker/index": "smart-datetime-picker",
  "packages/definitions/index": "smart-definitions",
  "packages/dialog/index": "smart-dialog",
  "packages/divider/index": "smart-divider",
  "packages/dropdown-item/index": "smart-dropdown-item",
  "packages/dropdown-menu/index": "smart-dropdown-menu",
  "packages/empty/index": "smart-empty",
  "packages/field/index": "smart-field",
  "packages/goods-action/index": "smart-goods-action",
  "packages/goods-action-button/index": "smart-goods-action-button",
  "packages/goods-action-icon/index": "smart-goods-action-icon",
  "packages/grid/index": "smart-grid",
  "packages/grid-item/index": "smart-grid-item",
  "packages/icon/index": "smart-icon",
  "packages/image/index": "smart-image",
  "packages/index-anchor/index": "smart-index-anchor",
  "packages/index-bar/index": "smart-index-bar",
  "packages/info/index": "smart-info",
  "packages/loading/index": "smart-loading",
  "packages/mixins/index": "smart-mixins",
  "packages/nav-bar/index": "smart-nav-bar",
  "packages/normal-slider/index": "smart-slider",
  "packages/notice-bar/index": "smart-notice-bar",
  "packages/notify/index": "smart-notify",
  "packages/overlay/index": "smart-overlay",
  "packages/picker/index": "smart-picker",
  "packages/picker-column/index": "smart-picker-column",
  "packages/popover/index": "smart-popover",
  "packages/popup/index": "smart-popup",
  "packages/progress/index": "smart-progress",
  "packages/radio/index": "smart-radio",
  "packages/radio-group/index": "smart-radio-group",
  "packages/rate/index": "smart-rate",
  "packages/row/index": "smart-row",
  "packages/search/index": "smart-search",
  "packages/sidebar/index": "smart-sidebar",
  "packages/sidebar-item/index": "smart-sidebar-item",
  "packages/skeleton/index": "smart-skeleton",
  "packages/slider/index": "smart-range-slider",
  "packages/stepper/index": "smart-stepper",
  "packages/sticky/index": "smart-sticky",
  "packages/swipe-cell/index": "smart-swipe-cell",
  "packages/switch/index": "smart-switch",
  "packages/tab/index": "smart-tab",
  "packages/tabbar/index": "smart-tabbar",
  "packages/tabbar-item/index": "smart-tabbar-item",
  "packages/tabs/index": "smart-tabs",
  "packages/tag/index": "smart-tag",
  "packages/toast/index": "smart-toast",
  "packages/transition/index": "smart-transition",
  "packages/tree-select/index": "smart-tree-select",
  "packages/wxs/index": "smart-wxs"
};
  var ComponentElement = class extends ViewElement {
    /**
     * @brief Create custom component host element
     * @param[in] vnode component vnode
     * @param[in] context parent mount context
     * @param[in] existingHost reuse an already-created host (e.g. from upgrade)
     */
    constructor(vnode, context, existingHost) {
      vnode.name = componentPathAliases[vnode.is] ?? vnode.name;
      if (!isComponentRegistered(vnode.name)) {
        throw new Error(`Component ${vnode.name} not registered`);
      }
      const placeholder = existingHost ?? document.createElement(vnode.name);
      super(placeholder, vnode, context);
      this.slotManager = new SlotManager();
      hostBelongComponentElement.set(placeholder, this);
    }
    /**
     * @brief Append a content element into an available slot or slotsChildren cache
     * @param[in] child content view element
     * @return available slot when projected immediately
     */
    appendElement(child) {
      return routeSlotChild(this.slotManager, child, "append");
    }
    /**
     * @brief Prepend a content element into an available slot or slotsChildren cache
     * @param[in] child content view element
     * @return available slot when projected immediately
     */
    prependElement(child) {
      return routeSlotChild(this.slotManager, child, "prepend");
    }
    /**
     * @brief Insert a content element after a same-slot anchor
     * @param[in] child content view element
     * @param[in] anchor same-slot anchor element
     * @return available slot when projected immediately
     */
    insertElementAfter(child, anchor) {
      return routeSlotChild(this.slotManager, child, "after", anchor);
    }
    /**
     * @brief Resolve slot name used for routing this child
     * @param[in] child content view element
     * @return slot target name
     */
    getChildSlotName(child) {
      return getVnodeSlotTarget(child.vnode);
    }
  };

  // src/renderer/element-class-effect.ts
  var elementClassEffectMap = /* @__PURE__ */ new WeakMap();
  function setElementClassEffect(element, field, dispose) {
    let effectSet = elementClassEffectMap.get(element);
    if (!effectSet) {
      effectSet = {};
      elementClassEffectMap.set(element, effectSet);
    }
    effectSet[field]?.();
    effectSet[field] = dispose;
  }
  function disposeElementClassEffect(element, field) {
    const effectSet = elementClassEffectMap.get(element);
    const dispose = effectSet?.[field];
    if (!dispose) {
      return;
    }
    dispose();
    delete effectSet[field];
  }

  // src/renderer/external-classes-manager.ts
  var ExternalClassesManager = class {
    /**
     * @param options.classNames declared externalClasses list
     * @param options.resolveLocalClass resolver for non-external class tokens
     */
    constructor(options) {
      this.values = /* @__PURE__ */ new Map();
      this.listeners = /* @__PURE__ */ new Set();
      for (const className of options.classNames) {
        this.values.set(className, "");
      }
      this.resolveLocalClass = options.resolveLocalClass;
    }
    /**
     * @brief Check whether a class name is declared as external
     * @param[in] name dash-case class field name
     * @return true when name is in externalClasses
     */
    has(name) {
      return this.values.has(name);
    }
    /**
     * @brief Update external class value and notify subscribers
     * @param[in] key external class field name
     * @param[in] value resolved class string from host
     * @return none
     */
    setSignal(key, value) {
      if (!this.values.has(key)) {
        return;
      }
      const nextValue = value.trim();
      if (this.values.get(key) === nextValue) {
        return;
      }
      this.values.set(key, nextValue);
      this.notify();
    }
    /**
     * @brief Resolve and subscribe a class attribute field
     * @param[in] classOptions raw class value and target element metadata
     * @param[in] callback invoked with resolved class string
     * @return none
     */
    processClass(classOptions, callback) {
      const { field, value, element } = classOptions;
      disposeElementClassEffect(element, field);
      if (!value || value.trim() === "") {
        callback({ value: "" });
        return;
      }
      const classList = value.split(/\s+/).filter((className) => className.trim() !== "");
      const run = () => {
        callback({
          value: classList.map((className) => this.resolve(className)).join(" ")
        });
      };
      run();
      setElementClassEffect(element, field, () => {
        this.listeners.delete(run);
      });
      this.listeners.add(run);
    }
    /**
     * @brief Resolve one class token through external value or local style prefix
     * @param[in] className class token from template
     * @return resolved class token
     */
    resolve(className) {
      if (!this.values.has(className)) {
        return this.resolveLocalClass(className);
      }
      return this.values.get(className) ?? "";
    }
    /**
     * @brief Notify all class field subscribers
     * @return none
     */
    notify() {
      for (const listener of this.listeners) {
        listener();
      }
    }
  };

  // src/renderer/mount-container.ts
  var COMPONENT_STYLE_ATTR = "data-mp-component-style";
  function appendToMountContainer(container, node) {
    container.appendChild(node);
  }
  function insertAtMountContainerStart(container, node) {
    if (container.firstChild) {
      container.insertBefore(node, container.firstChild);
      return;
    }
    container.appendChild(node);
  }
  function ensureComponentStyle(tagName, cssText) {
    const selector = `style[${COMPONENT_STYLE_ATTR}="${tagName}"]`;
    const existing = document.head.querySelector(selector);
    if (existing) {
      return null;
    }
    const style = document.createElement("style");
    style.setAttribute(COMPONENT_STYLE_ATTR, tagName);
    style.textContent = cssText;
    document.head.appendChild(style);
    return style;
  }
  function getComponentInnerElement(host) {
    const inner = host.firstElementChild;
    if (inner instanceof HTMLElement) {
      return inner;
    }
    throw new Error("inner view not found in component host");
  }
  var getShadowInnerElement = getComponentInnerElement;

  // src/renderer/attr-applicator.ts
  var STYLE_CLASS_FIELDS = /* @__PURE__ */ new Set(["class", "hover-class"]);
  function normalizeAttrValue(value) {
    if (value === null || value === void 0) {
      return "";
    }
    return String(value);
  }
  function applyResolvedClassField(element, key, resolved) {
    if (key === "class") {
      element.setAttribute("class", resolved);
      return;
    }
    if (resolved) {
      element.setAttribute(key, resolved);
    } else {
      element.removeAttribute(key);
    }
  }
  function resolveAnimationValue(type, args, state, element) {
    const value = args?.[0];
    if (type === "height") {
      if (value === "auto") return `${element.scrollHeight}px`;
      return typeof value === "number" ? `${value}px` : String(value);
    }
    if (type === "top") {
      return typeof value === "number" ? `${value}px` : String(value);
    }
    if (["translateX", "translateY"].includes(type)) {
      const unitValue = typeof value === "number" ? `${value}px` : String(value);
      state.transforms[type] = `${type}(${unitValue})`;
      return null;
    }
    if (["scale", "rotate"].includes(type)) {
      const unitValue = type === "rotate" && typeof value === "number" ? `${value}deg` : value;
      state.transforms[type] = `${type}(${unitValue})`;
      return null;
    }
    return value;
  }
  function animationFrameFromState(state, offset, easing) {
    const frame = { offset };
    for (const [key, value] of Object.entries(state.values)) {
      if (value != null && value !== "") frame[key] = value;
    }
    const transform = Object.values(state.transforms).join(" ");
    if (transform) frame.transform = transform;
    if (easing) frame.easing = easing;
    return frame;
  }
  function applyMiniappAnimation(element, value) {
    const native = element.nativeElement;
    if (!(native instanceof HTMLElement)) return true;
    native.__mpAnimation?.cancel();
    native.__mpAnimation = null;
    if (!value || !Array.isArray(value.actions) || value.actions.length === 0) return true;

    const previous = native.__mpPreviousStyleSnapshot ?? {};
    const state = {
      values: {
        height: previous.height,
        top: previous.top,
        opacity: previous.opacity
      },
      transforms: {}
    };
    const steps = [];
    let elapsed = 0;
    for (const action of value.actions) {
      const option = action.option ?? {};
      const duration = Math.max(0, Number(option.duration) || 0);
      for (const animate of action.animates ?? []) {
        const resolved = resolveAnimationValue(animate.type, animate.args, state, native);
        if (resolved !== null) state.values[animate.type] = resolved;
      }
      elapsed += duration;
      steps.push({
        elapsed,
        easing: option.timingFunction || "ease",
        values: { ...state.values },
        transforms: { ...state.transforms }
      });
    }
    if (elapsed <= 0) return true;

    const initialState = {
      values: {
        height: previous.height,
        top: previous.top,
        opacity: previous.opacity
      },
      transforms: {}
    };
    const frames = [animationFrameFromState(initialState, 0, steps[0]?.easing)];
    for (const step of steps) {
      frames.push(animationFrameFromState(step, step.elapsed / elapsed, step.easing));
    }
    native.__mpAnimation = native.animate(frames, {
      duration: elapsed,
      fill: "none"
    });
    native.__mpAnimation.addEventListener("finish", () => {
      native.__mpAnimation = null;
    }, { once: true });
    return true;
  }
  function applyAttr(element, key, value, vnode) {
    const dashFieldKey = camelToDash(key);
    const belongRuntime = resolveBelongRuntime(vnode);
    const isComponentVnode = Boolean(vnode.is);
    const currentRuntime = isComponentVnode ? resolveRuntimeFromHost(element.nativeElement) : void 0;
    const childMeta = isComponentVnode ? getComponentMeta(vnode.name) : void 0;
    const isExternalClassField = childMeta?.externalClasses.includes(dashFieldKey) ?? false;
    const isSignalClassField = STYLE_CLASS_FIELDS.has(dashFieldKey);
    const isComponentExternalClassSignal = isComponentVnode && isExternalClassField;
    if (isExternalClassField || isSignalClassField) {
      const nextValueTxt = String(value ?? "").trim();
      const manager = belongRuntime?.externalClasses;
      if (!manager) {
        applyResolvedClassField(element, dashFieldKey, resolveClassAttr(nextValueTxt, belongRuntime));
        return;
      }
      manager.processClass(
        { value: nextValueTxt, field: dashFieldKey, element: element.nativeElement },
        ({ value: resolved }) => {
          if (isComponentExternalClassSignal && currentRuntime?.externalClasses) {
            currentRuntime.externalClasses.setSignal(dashFieldKey, resolved);
          }
          applyResolvedClassField(element, dashFieldKey, resolved);
        }
      );
      return;
    }
    if (isComponentExternalClassSignal && currentRuntime?.externalClasses) {
      currentRuntime.externalClasses.setSignal(dashFieldKey, String(value ?? "").trim());
    }
    const shouldSetComponentProperty =
      value == null ||
      typeof value === "boolean" ||
      typeof value === "function" ||
      (value !== null && typeof value === "object");
    if (isComponentVnode && shouldSetComponentProperty) {
      const host = element.nativeElement;
      const propertyKey = toCamelCase(dashFieldKey);
      if (host) {
        host[propertyKey] = value;
        return;
      }
    }
    if (dashFieldKey === "animation" && applyMiniappAnimation(element, value)) {
      return;
    }
    const normalized = normalizeAttrValue(value);
    if (dashFieldKey === "style") {
      const native = element.nativeElement;
      if (native instanceof HTMLElement) {
        const computed = getComputedStyle(native);
        native.__mpPreviousStyleSnapshot = {
          height: `${native.getBoundingClientRect().height}px`,
          top: computed.top,
          opacity: computed.opacity
        };
      }
      element.setAttribute("style", normalized.replace(/\n/g, "").replace(/\s+/g, " ").trim());
      return;
    }
    element.setAttribute(dashFieldKey, normalized);
  }
  function applyAttrs(vnode) {
    if (vnode.type !== VnodeTypes.tag) {
      return;
    }
    const element = resolveElementByVnode(vnode);
    if (!element) {
      return;
    }
    const attrs = vnode.attrs ?? {};
    for (const [key, value] of Object.entries(attrs)) {
      applyAttr(element, key, value, vnode);
    }
  }
  function updateAttrs(options) {
    const { oldVnode, newVnode, updateFields } = options;
    const element = resolveElementByVnode(newVnode);
    if (!element) {
      return;
    }
    const newAttrs = newVnode.attrs ?? {};
    const oldAttrs = oldVnode.attrs ?? {};
    const fields = updateFields.length > 0 ? updateFields : Object.keys(newAttrs);
    for (const field of fields) {
      const nextValue = newAttrs[field];
      const prevValue = oldAttrs[field];
      if (nextValue === prevValue) {
        continue;
      }
      applyAttr(element, field, nextValue, newVnode);
    }
  }

  // src/renderer/DOM/ContainerElement.ts
  var ContainerElement = class extends ViewElement {
    /**
     * @brief Create container element proxy
     * @param[in] container mount container
     * @param[in] vnode container vnode
     * @param[in] context mount context
     */
    constructor(container, vnode, context) {
      super(null, vnode, context);
      this.container = container;
    }
    get $elem() {
      return null;
    }
    append(child) {
      const childNode = child.getInsertNode();
      if (childNode) {
        appendToMountContainer(this.container, childNode);
      }
      this.childNodes.push(child);
      child.asAttached();
    }
    prepend(child) {
      const childNode = child.getInsertNode();
      if (childNode) {
        insertAtMountContainerStart(this.container, childNode);
      }
      this.childNodes.unshift(child);
      child.asAttached();
    }
    before() {
      throw new Error("ContainerElement.before is not supported");
    }
    after() {
      throw new Error("ContainerElement.after is not supported");
    }
    updateVnode(newVnode, oldVnode) {
      relinkVnode(this._context, this, oldVnode, newVnode);
      this._vnode = newVnode;
    }
  };

  // src/renderer/DOM/FragmentElement.ts
  var FragmentElement = class extends ViewElement {
    constructor(vnode, context) {
      super(null, vnode, context);
    }
    get $elem() {
      return null;
    }
    /**
     * @brief Bind fallback parent for root-level fragment insertion
     * @param[in] fallbackParent container element when fragment has no vnode parent
     * @return none
     */
    bindFallbackParent(fallbackParent) {
      this._fallbackParent = fallbackParent;
    }
    append(child) {
      const last = this.childNodes[this.childNodes.length - 1];
      if (last) {
        last.after(child);
        return;
      }
      this.insertByVnodePosition(child);
    }
    prepend(child) {
      this.insertByVnodePosition(child);
    }
    before(child) {
      const first = this.childNodes[0];
      if (first) {
        first.before(child);
        return;
      }
      this.insertByVnodePosition(child);
    }
    after(nextSibling) {
      const last = this.childNodes[this.childNodes.length - 1];
      if (last) {
        last.after(nextSibling);
        return;
      }
      this.insertByVnodePosition(nextSibling);
    }
    /**
     * @brief Track child appended to fragment child list
     * @param[in] child child element
     * @param[in] childVnode child vnode
     * @return none
     */
    trackAppend(child, childVnode) {
      if (!this.directChild(childVnode, "trackAppend")) {
        return;
      }
      ViewElement.removeChild(this.childNodes, child);
      this.childNodes.push(child);
      setElementUnderFragment(this._context, child, this);
    }
    /**
     * @brief Track child prepended to fragment child list
     * @param[in] child child element
     * @param[in] childVnode child vnode
     * @return none
     */
    trackPrepend(child, childVnode) {
      if (!this.directChild(childVnode, "trackPrepend")) {
        return;
      }
      ViewElement.removeChild(this.childNodes, child);
      this.childNodes.unshift(child);
      setElementUnderFragment(this._context, child, this);
    }
    /**
     * @brief Track child inserted before anchor in fragment child list
     * @param[in] child child element
     * @param[in] childVnode child vnode
     * @param[in] anchorNode anchor element
     * @return none
     */
    trackInsertBefore(child, childVnode, anchorNode) {
      if (!this.directChild(childVnode, "trackInsertBefore")) {
        return;
      }
      ViewElement.removeChild(this.childNodes, child);
      const anchorIndex = this.childNodes.indexOf(anchorNode);
      if (anchorIndex >= 0) {
        this.childNodes.splice(anchorIndex, 0, child);
        setElementUnderFragment(this._context, child, this);
      }
    }
    /**
     * @brief Track child inserted after anchor in fragment child list
     * @param[in] child child element
     * @param[in] childVnode child vnode
     * @param[in] anchorNode anchor element
     * @return none
     */
    trackInsertAfter(child, childVnode, anchorNode) {
      if (!this.directChild(childVnode, "trackInsertAfter")) {
        return;
      }
      ViewElement.removeChild(this.childNodes, child);
      const anchorIndex = this.childNodes.indexOf(anchorNode);
      if (anchorIndex >= 0) {
        this.childNodes.splice(anchorIndex + 1, 0, child);
        setElementUnderFragment(this._context, child, this);
      }
    }
    /**
     * @brief Track child removed from fragment child list
     * @param[in] child child element
     * @return none
     */
    trackRemove(child) {
      const index = this.childNodes.indexOf(child);
      if (index >= 0) {
        this.childNodes.splice(index, 1);
        setElementUnderFragment(this._context, child, void 0);
      }
    }
    /**
     * @brief Clear fragment child tracking
     * @return none
     */
    clear() {
      for (const child of this.childNodes) {
        setElementUnderFragment(this._context, child, void 0);
      }
      this.childNodes.length = 0;
    }
    updateVnode(newVnode, oldVnode) {
      relinkVnode(this._context, this, oldVnode, newVnode);
      this._vnode = newVnode;
    }
    /**
     * @brief Insert child at fragment position derived from vnode tree
     * @param[in] child child element
     * @return none
     */
    insertByVnodePosition(child) {
      const { prevVnode, parentVnode, containerVnode } = this._vnode;
      if (prevVnode) {
        const prevElement = resolveElementByVnode(prevVnode);
        prevElement?.after(child);
        return;
      }
      const parentRef = parentVnode || containerVnode;
      if (parentRef) {
        const parentElement = resolveElementByVnode(parentRef);
        parentElement?.prepend(child);
        return;
      }
      this._fallbackParent?.prepend(child);
    }
    directChild(childVnode, op) {
      if (childVnode.parentVnode?.tid === this._vnode.tid) {
        return true;
      }
      console.warn(`[FragmentElement.${op}] child is not a direct child of ${this._vnode.tid}`);
      return false;
    }
    /**
     * @brief Remove fragment tracking without DOM node
     * @param[in] parentRemove unused for fragment
     * @return none
     */
    remove(_parentRemove = false) {
      if (this.isRemoved) {
        return;
      }
      this.clear();
      this.asRemoved();
      unlinkVnode(this._context, this, this._vnode);
    }
  };
  function resolveParentFragment(vnode) {
    const parentVnode = vnode.parentVnode;
    if (!parentVnode || !isFragmentVNode(parentVnode)) {
      return void 0;
    }
    const parentElement = resolveElementByVnode(parentVnode);
    if (parentElement instanceof FragmentElement) {
      return parentElement;
    }
    return void 0;
  }

  // src/renderer/DOM/SlotElement.ts
  function removeFromArray(list, child) {
    const idx = list.indexOf(child);
    if (idx > -1) {
      list.splice(idx, 1);
    }
  }
  var SlotElement = class _SlotElement extends ViewElement {
    /**
     * @brief Create slot element proxy
     * @param[in] vnode slot vnode
     * @param[in] context mount context
     * @param[in] slotManager slot manager
     * @param[in] container mount container
     */
    constructor(vnode, context, slotManager, container) {
      super(null, vnode, context);
      this.slotManager = slotManager;
      this.container = container;
      this._isAvailable = false;
      this.slotName = getVnodeSlotIs(vnode);
      this.slotManager.addSlot(this);
    }
    /**
     * @brief Durability-safe host probe — never a projection fragment
     * @return always null (slot has no durable host node)
     */
    get $elem() {
      return null;
    }
    isVirtualSlot() {
      return true;
    }
    /**
     * @brief One-shot DocumentFragment of projected children for parent insertion
     * @return fragment (may be empty)
     * @note Moves child DOM into the fragment. Call only from insert paths via getInsertNode().
     */
    getInsertNode() {
      const fragment = document.createDocumentFragment();
      if (!this.isRemoved && this._isAvailable) {
        for (const child of this.slotChildren) {
          const node = child.getInsertNode();
          if (node) {
            fragment.appendChild(node);
          }
        }
      }
      return fragment;
    }
    /**
     * @brief Whether this slot is the active projection target
     * @return availability flag
     */
    get isAvailable() {
      return this._isAvailable;
    }
    /**
     * @brief Slot priority (lower wins)
     * @return priority number
     */
    get priority() {
      return this._vnode.slotPriority ?? 0;
    }
    /**
     * @brief Template index among same-name slots
     * @return index
     */
    get index() {
      return this._vnode.index ?? 0;
    }
    /**
     * @brief Content elements for this slot name (shared slotsChildren list)
     * @return content ViewElement list
     */
    get slotChildren() {
      return this.slotManager.getSlotChildren(this.slotName);
    }
    /**
     * @brief Set whether slot is available for external content
     * @param[in] value availability flag
     * @return none
     */
    setAvailable(value) {
      if (this._isAvailable === value) {
        return;
      }
      if (value) {
        this.activate();
      } else {
        this.deactivate();
      }
    }
    /**
     * @brief Mark slot as attached after parent projected content (or empty)
     * @return none
     * @note Cascade asAttached when children were already placed via getInsertNode();
     *       otherwise append places them via vnode positioning.
     */
    asAttached() {
      if (this.isRemoved) {
        return;
      }
      this.isAttached = true;
      if (!this._isAvailable) {
        return;
      }
      for (const child of this.slotChildren) {
        if (child.isAttached || child.domNode?.parentNode != null) {
          child.asAttached();
        } else {
          this.append(child);
        }
      }
    }
    /**
     * @brief Append projected content after last projected sibling
     * @param[in] child content element
     * @return none
     */
    append(child) {
      if (!this.isAttached) {
        return;
      }
      const last = this.lastAttachedChild();
      if (last) {
        last.after(child);
        return;
      }
      this.insertByVnodePosition(child);
    }
    /**
     * @brief Prepend projected content at slot position
     * @param[in] child content element
     * @return none
     */
    prepend(child) {
      if (!this.isAttached) {
        return;
      }
      const first = this.firstAttachedChild();
      if (first) {
        first.before(child);
        return;
      }
      this.insertByVnodePosition(child);
    }
    /**
     * @brief Insert before first projected child, or at slot vnode position
     * @param[in] prevSibling element to insert before first / at position
     * @return none
     */
    before(prevSibling) {
      const first = this.firstAttachedChild();
      if (first) {
        first.before(prevSibling);
        return;
      }
      this.insertByVnodePosition(prevSibling);
    }
    /**
     * @brief Insert after last projected child, or at slot vnode position
     * @param[in] nextSibling element to insert after last / at position
     * @return none
     */
    after(nextSibling) {
      const last = this.lastAttachedChild();
      if (last) {
        last.after(nextSibling);
        return;
      }
      this.insertByVnodePosition(nextSibling);
    }
    /**
     * @brief DOM: append + track (available slot path)
     * @param[in] child content element
     * @return none
     */
    appendElement(child) {
      this.append(child);
    }
    /**
     * @brief DOM: prepend + track (available slot path)
     * @param[in] child content element
     * @return none
     */
    prependElement(child) {
      this.prepend(child);
    }
    /**
     * @brief DOM: insert after anchor
     * @param[in] child content element
     * @param[in] anchor same-slot content anchor
     * @return none
     */
    insertElementAfter(child, anchor) {
      anchor.after(child);
    }
    /**
     * @brief Sync slotsChildren: append and register elementUnderSlotWeakMap
     * @param[in] child content element
     * @return none
     */
    trackAppend(child) {
      removeFromArray(this.slotChildren, child);
      this.slotChildren.push(child);
      elementUnderSlotWeakMap.set(child, this);
    }
    /**
     * @brief Sync slotsChildren: prepend and register elementUnderSlotWeakMap
     * @param[in] child content element
     * @return none
     */
    trackPrepend(child) {
      removeFromArray(this.slotChildren, child);
      this.slotChildren.unshift(child);
      elementUnderSlotWeakMap.set(child, this);
    }
    /**
     * @brief Sync slotsChildren: insert after anchor
     * @param[in] child content element
     * @param[in] anchor same-slot content anchor
     * @return none
     */
    trackInsertAfter(child, anchor) {
      removeFromArray(this.slotChildren, child);
      const anchorIndex = this.slotChildren.indexOf(anchor);
      if (anchorIndex > -1) {
        this.slotChildren.splice(anchorIndex + 1, 0, child);
        elementUnderSlotWeakMap.set(child, this);
      }
    }
    /**
     * @brief Sync slotsChildren: remove and clear elementUnderSlotWeakMap
     * @param[in] child content element
     * @return none
     */
    trackRemove(child) {
      removeFromArray(this.slotChildren, child);
      elementUnderSlotWeakMap.delete(child);
    }
    /**
     * @brief Force unavailable without deactivate DOM flow (priority handoff)
     * @return none
     */
    forceUnavailable() {
      this._isAvailable = false;
    }
    /**
     * @brief Pick content out of DOM but keep slotsChildren; unregister slot
     * @param[in] parentRemove whether parent already removed this node
     * @return none
     */
    remove(_parentRemove = false) {
      if (this.isRemoved) {
        return;
      }
      if (this._isAvailable) {
        for (const child of this.slotChildren) {
          child.pick();
        }
        this.clearTracking();
      }
      this.slotManager.removeSlot(this);
      this._isAvailable = false;
      this.asRemoved();
      unlinkVnode(this._context, this, this._vnode);
    }
    /**
     * @brief Detach from document without destroying (slot deactivate / move)
     * @return this
     */
    pick() {
      if (this._isAvailable) {
        for (const child of this.slotChildren) {
          child.pick();
        }
      }
      if (this.isAttached) {
        this.asUnAttached();
      }
      return this;
    }
    /**
     * @brief Activate slot and mount cached content when already attached
     * @return none
     */
    activate() {
      this._isAvailable = true;
      const children = this.slotChildren;
      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i];
        if (child.isRemoved) {
          children.splice(i, 1);
          continue;
        }
        if (!(child instanceof _SlotElement) && !child.domNode) {
          children.splice(i, 1);
        }
      }
      if (this.isAttached) {
        for (const child of children) {
          this.append(child);
        }
      }
      this.restoreTracking();
    }
    /**
     * @brief Deactivate slot: pick content from DOM, keep slotsChildren
     * @return none
     */
    deactivate() {
      for (const child of this.slotChildren) {
        child.pick();
      }
      this._isAvailable = false;
    }
    restoreTracking() {
      for (const child of this.slotChildren) {
        elementUnderSlotWeakMap.set(child, this);
      }
    }
    clearTracking() {
      for (const child of this.slotChildren) {
        elementUnderSlotWeakMap.delete(child);
      }
    }
    insertByVnodePosition(child) {
      const result = resolveSlotChain(this);
      if (result.type === "anchor") {
        result.element.after(child);
        return;
      }
      const { prevVnode, parentVnode, containerVnode } = result.element.vnode;
      if (prevVnode) {
        const prevElement = resolveElementByVnode(prevVnode);
        if (prevElement) {
          prevElement.after(child);
          return;
        }
      }
      const parentRef = parentVnode || containerVnode;
      if (parentRef) {
        const parentElement = resolveElementByVnode(parentRef);
        if (parentElement) {
          parentElement.prepend(child);
          return;
        }
      }
      const childNode = child.getInsertNode();
      if (!childNode) {
        return;
      }
      appendToMountContainer(this.container, childNode);
      child.asAttached();
    }
    lastAttachedChild() {
      const children = this.slotChildren;
      for (let i = children.length - 1; i >= 0; i--) {
        if (this.isProjectionAnchor(children[i])) {
          return children[i];
        }
      }
      return void 0;
    }
    firstAttachedChild() {
      for (const child of this.slotChildren) {
        if (this.isProjectionAnchor(child)) {
          return child;
        }
      }
      return void 0;
    }
    /**
     * @brief Whether a slot child can serve as a DOM sibling anchor
     * @param[in] child slot content element
     * @return true when attached and positionable without reading SlotElement.$elem
     */
    isProjectionAnchor(child) {
      if (!child.isAttached) {
        return false;
      }
      if (child instanceof _SlotElement) {
        return true;
      }
      return child.domNode != null;
    }
  };

  // src/renderer/DOM/TextElement.ts
  var TextElement = class extends ViewElement {
    constructor(vnode, context) {
      super(document.createTextNode(vnode.text ?? ""), vnode, context);
    }
    get textContent() {
      return this.$elem?.textContent ?? "";
    }
    set textContent(value) {
      const node = this.$elem;
      if (node) {
        node.textContent = value;
      }
    }
  };

  // src/renderer/dom-helpers.ts
  function setMetaInfos(vnode) {
    const element = resolveElementByVnode(vnode);
    if (!element) {
      return;
    }
    const { events, change, tid } = vnode;
    element.setAttribute("meta:tid", tid);
    const native = element.nativeElement;
    if (native) {
      native.tid = tid;
    }
    if (events) {
      for (const eventType of Object.keys(events)) {
        const eventHandlers = events[eventType];
        for (const handlerType of Object.keys(eventHandlers)) {
          let handlerValue = eventHandlers[handlerType];
          if (handlerValue) {
            if (typeof handlerValue === "function") {
              handlerValue = `[SJS Function ${handlerValue.name}]`;
            }
            element.setAttribute(`meta:${handlerType}:${eventType}`, String(handlerValue));
          } else {
            element.removeAttribute(`meta:${handlerType}:${eventType}`);
          }
        }
      }
    }
    if (change) {
      for (const changeKey in change) {
        const changeHandler = change[changeKey];
        const handlerValue = typeof changeHandler === "function" ? `[SJS Function ${changeHandler.name}]` : JSON.stringify(changeHandler);
        element.setAttribute(`meta:change:${camelToDash(changeKey)}`, handlerValue);
      }
    }
  }
  function setMetas(vnode) {
    const vnodeType = vnode.type;
    if (vnodeType !== VnodeTypes.tag && vnodeType !== VnodeTypes.container) {
      return;
    }
    const element = resolveElementByVnode(vnode);
    if (!element) {
      return;
    }
    if (vnode.is) {
      element.setAttribute("is", vnode.is);
    }
    element.setAttribute("meta:tag", vnode.name);
    setMetaInfos(vnode);
  }
  function setText(options) {
    const { oldVnode, newVnode } = options;
    if (oldVnode.text === newVnode.text) {
      return;
    }
    const element = resolveElementByVnode(newVnode);
    if (element instanceof TextElement) {
      element.textContent = newVnode.text ?? "";
      return;
    }
    const node = resolveNode(newVnode);
    if (node instanceof Text) {
      node.textContent = newVnode.text ?? "";
    }
  }

  // src/renderer/DOM/CommentElement.ts
  var CommentElement = class extends ViewElement {
    constructor(vnode, context) {
      super(document.createComment(vnode.text ?? ""), vnode, context);
    }
  };

  // src/renderer/DOM/TagElement.ts
  var TagElement = class extends ViewElement {
    constructor(vnode, context) {
      super(document.createElement(`v-${vnode.name}`), vnode, context);
    }
  };

  // src/renderer/element-creator.ts
  function createElement(vnode, context) {
    const vnodeType = vnode.type;
    let element;
    if (vnodeType === VnodeTypes.comment) {
      element = new CommentElement(vnode, context);
    } else if (vnodeType === VnodeTypes.text) {
      element = new TextElement(vnode, context);
    } else if (vnodeType === VnodeTypes.tag) {
      if (isComponentVNode(vnode)) {
        element = new ComponentElement(vnode, context);
      } else {
        element = new TagElement(vnode, context);
      }
    } else {
      throw new Error(`Unsupported vnode type for createElement: ${vnodeType}`);
    }
    linkVnode(context, element, vnode);
    return element;
  }
  function createFragmentElement(vnode, context) {
    const element = new FragmentElement(vnode, context);
    linkVnode(context, element, vnode);
    return element;
  }
  function createSlotElement(vnode, context, slotManager, container) {
    const element = new SlotElement(vnode, context, slotManager, container);
    linkVnode(context, element, vnode);
    const anchor = document.createComment(`slot:${element.slotName}`);
    context.nodeMap.set(vnode.tid, anchor);
    return { element, anchor };
  }
  function createSingleComponentElement(vnode, context) {
    const element = new ComponentElement(vnode, context);
    linkVnode(context, element, vnode);
    setMetas(vnode);
    applyAttrs(vnode);
    return element;
  }
  function createSingleTagElement(vnode, context) {
    const element = new TagElement(vnode, context);
    linkVnode(context, element, vnode);
    setMetas(vnode);
    applyAttrs(vnode);
    return element;
  }

  // src/renderer/lis.ts
  function longestIncreasingSubsequence(sequence) {
    const sequenceLength = sequence.length;
    const seq = sequence;
    if (sequenceLength === 0) {
      return {
        lis: [],
        stableByMapIndex: [],
        rightFixedIndexByMapIndex: []
      };
    }
    const predecessorIndex = new Int32Array(sequenceLength);
    predecessorIndex.fill(-1);
    const lengthToIndex = new Int32Array(sequenceLength);
    lengthToIndex.fill(-1);
    const stableByMapIndex = Array(sequenceLength).fill(false);
    const rightFixedIndexByMapIndex = Array(sequenceLength).fill(-1);
    let lisLength = 0;
    for (let index = 0; index < sequenceLength; index++) {
      const currentValue = seq[index];
      if (currentValue === -1) {
        continue;
      }
      let leftBound = 0;
      let rightBound = lisLength;
      while (leftBound < rightBound) {
        const middle = leftBound + rightBound >>> 1;
        const middleIndex = lengthToIndex[middle];
        if (seq[middleIndex] < currentValue) {
          leftBound = middle + 1;
        } else {
          rightBound = middle;
        }
      }
      const insertPosition = leftBound;
      lengthToIndex[insertPosition] = index;
      if (insertPosition) {
        predecessorIndex[index] = lengthToIndex[insertPosition - 1];
      }
      if (insertPosition === lisLength) {
        lisLength++;
      }
    }
    if (lisLength === 0) {
      return {
        lis: [],
        stableByMapIndex,
        rightFixedIndexByMapIndex
      };
    }
    const lis = Array(lisLength);
    let currentIndex = lengthToIndex[lisLength - 1];
    for (let resultIndex = lisLength - 1; resultIndex >= 0; resultIndex--) {
      lis[resultIndex] = seq[currentIndex];
      stableByMapIndex[currentIndex] = true;
      currentIndex = predecessorIndex[currentIndex];
    }
    let nextStableIndex = -1;
    for (let mapIndex = sequenceLength - 1; mapIndex >= 0; mapIndex--) {
      const isStable = stableByMapIndex[mapIndex];
      rightFixedIndexByMapIndex[mapIndex] = isStable ? -2 : nextStableIndex;
      if (isStable) {
        nextStableIndex = mapIndex;
      }
    }
    return {
      lis,
      stableByMapIndex,
      rightFixedIndexByMapIndex
    };
  }

  // src/renderer/patch-children.ts
  function diffKeyedChildren(ops, oldChildren, newChildren, startIndex, oldEndIndex, newEndIndex) {
    const needProcessCount = newEndIndex - startIndex + 1;
    if (needProcessCount <= 0) {
      return;
    }
    const newIndexToOldIndexMap = Array(needProcessCount).fill(-1);
    const oldStartIndex = startIndex;
    const newStartIndex = startIndex;
    let needToMove = false;
    let maxMoveIndex = 0;
    const keyToNewIndexMap = /* @__PURE__ */ new Map();
    for (let newIndex = newStartIndex; newIndex <= newEndIndex; newIndex++) {
      const currentVnode = newChildren[newIndex];
      if (keyToNewIndexMap.has(currentVnode.tid)) {
        console.warn(`Duplicate for-key found: ${currentVnode.tid}, this may cause unexpected behavior.`);
      }
      keyToNewIndexMap.set(currentVnode.tid, newIndex);
    }
    let toPatched = 0;
    for (let oldIndex = oldStartIndex; oldIndex <= oldEndIndex; oldIndex++) {
      const oldVnode = oldChildren[oldIndex];
      if (toPatched >= needProcessCount) {
        ops.unmount(oldVnode);
        continue;
      }
      if (!keyToNewIndexMap.has(oldVnode.tid)) {
        ops.unmount(oldVnode);
        continue;
      }
      const newVnodeIndex = keyToNewIndexMap.get(oldVnode.tid);
      if (newVnodeIndex === void 0) {
        ops.unmount(oldVnode);
        continue;
      }
      const newVnode = newChildren[newVnodeIndex];
      if (isSameVNode(oldVnode, newVnode)) {
        ops.update(oldVnode, newVnode);
      } else {
        ops.replace(oldVnode, newVnode);
      }
      toPatched++;
      newIndexToOldIndexMap[newVnodeIndex - newStartIndex] = oldIndex;
      if (newVnodeIndex < maxMoveIndex) {
        needToMove = true;
      } else {
        maxMoveIndex = newVnodeIndex;
      }
    }
    if (needToMove) {
      const { stableByMapIndex, rightFixedIndexByMapIndex } = longestIncreasingSubsequence(newIndexToOldIndexMap);
      for (let mapIndex = 0; mapIndex < needProcessCount; mapIndex++) {
        const newIndex = mapIndex + newStartIndex;
        const newVnode = newChildren[newIndex];
        if (newIndexToOldIndexMap[mapIndex] === -1) {
          ops.mount(newVnode, false);
          continue;
        }
        if (!stableByMapIndex[mapIndex]) {
          ops.move(newVnode, mapIndex, rightFixedIndexByMapIndex[mapIndex], newChildren, newStartIndex);
        }
      }
    } else {
      for (let mapIndex = 0; mapIndex < newIndexToOldIndexMap.length; mapIndex++) {
        if (newIndexToOldIndexMap[mapIndex] === -1) {
          ops.mount(newChildren[mapIndex + newStartIndex], false);
        }
      }
    }
  }
  function patchKeyedChildren(ops, leftVnode, rightVnode) {
    let startIndex = 0;
    const oldChildren = leftVnode.children || [];
    const newChildren = rightVnode.children || [];
    let oldEndIndex = oldChildren.length - 1;
    let newEndIndex = newChildren.length - 1;
    if (oldEndIndex < 0 && newEndIndex < 0) {
      return;
    }
    if (oldChildren.length === 0) {
      for (let i = 0; i <= newEndIndex; i++) {
        ops.mount(newChildren[i], false);
      }
      return;
    }
    if (newChildren.length === 0) {
      for (let i = 0; i <= oldEndIndex; i++) {
        ops.unmount(oldChildren[i]);
      }
      return;
    }
    while (startIndex <= oldEndIndex && startIndex <= newEndIndex) {
      const oldVnode = oldChildren[startIndex];
      const newVnode = newChildren[startIndex];
      if (isSameVNode(oldVnode, newVnode)) {
        ops.update(oldVnode, newVnode);
        startIndex++;
      } else {
        break;
      }
    }
    while (startIndex <= oldEndIndex && startIndex <= newEndIndex) {
      const oldVnode = oldChildren[oldEndIndex];
      const newVnode = newChildren[newEndIndex];
      if (isSameVNode(oldVnode, newVnode)) {
        ops.update(oldVnode, newVnode);
        oldEndIndex--;
        newEndIndex--;
      } else {
        break;
      }
    }
    if (startIndex > oldEndIndex && startIndex <= newEndIndex) {
      while (startIndex <= newEndIndex) {
        ops.mount(newChildren[startIndex], false);
        startIndex++;
      }
      return;
    }
    if (startIndex > newEndIndex && startIndex <= oldEndIndex) {
      while (startIndex <= oldEndIndex) {
        ops.unmount(oldChildren[startIndex]);
        startIndex++;
      }
      return;
    }
    if (startIndex > oldEndIndex && startIndex > newEndIndex) {
      return;
    }
    diffKeyedChildren(ops, oldChildren, newChildren, startIndex, oldEndIndex, newEndIndex);
  }
  function patchIndexedChildren(ops, oldVnode, newVnode) {
    const oldChildren = oldVnode.children || [];
    const newChildren = newVnode.children || [];
    const patchLen = Math.min(oldChildren.length, newChildren.length);
    for (let i = 0; i < patchLen; i++) {
      ops.patch(oldChildren[i], newChildren[i]);
    }
    for (let i = patchLen; i < newChildren.length; i++) {
      ops.mount(newChildren[i], false);
    }
    for (let i = patchLen; i < oldChildren.length; i++) {
      ops.unmount(oldChildren[i]);
    }
  }

  // src/renderer/vnode-renderer.ts
  function hasAttrsChanges(oldVnode, newVnode) {
    const oldAttrs = oldVnode.attrs ?? {};
    const newAttrs = newVnode.attrs ?? {};
    const fields = /* @__PURE__ */ new Set([...Object.keys(oldAttrs), ...Object.keys(newAttrs)]);
    for (const field of fields) {
      if (oldAttrs[field] !== newAttrs[field]) {
        return true;
      }
    }
    return false;
  }
  function shouldPatchAttrs(oldVnode, newVnode) {
    if (!isTagVNode(newVnode)) {
      return false;
    }
    const updateFields = newVnode.updateFields ?? [];
    return Boolean(newVnode.patchFlag & PatchFlags.ATTRS) || updateFields.length > 0 || hasAttrsChanges(oldVnode, newVnode);
  }
  function createVnodeRenderer(options) {
    const { container, mountContext } = options;
    const slotManager = mountContext.slotManager;
    if (!slotManager) {
      throw new Error("mountContext.slotManager is required for vnode rendering");
    }
    const activeSlotManager = slotManager;
    let patchTree = null;
    const rootVnode = {
      tid: "__mp_root__",
      type: VnodeTypes.container,
      name: "container",
      patchFlag: 0,
      treePatchFlag: 0
    };
    const rootElement = new ContainerElement(container, rootVnode, mountContext);
    function resolveParentElement(vnode) {
      const parentRef = vnode.parentVnode || vnode.containerVnode;
      if (!parentRef) {
        return rootElement;
      }
      const parentElement = resolveElementByVnode(parentRef);
      if (!parentElement) {
        throw new Error(`Parent element not found for tid ${parentRef.tid}`);
      }
      return parentElement;
    }
    function appendVnodeToParent(vnode, isFirstMount) {
      if (isFragmentVNode(vnode)) {
        return;
      }
      const childElement = resolveElementByVnode(vnode);
      if (!childElement) {
        return;
      }
      const componentVnode = vnode.parentComponentVnode;
      if (componentVnode) {
        const componentElement = resolveElementByVnode(componentVnode);
        if (!componentElement) {
          return;
        }
        if (isFragmentVNode(vnode)) {
          return;
        }
        if (isFirstMount && !componentElement.isAttached) {
          const slot = componentElement.appendElement(childElement);
          slot?.trackAppend(childElement);
          if (childElement instanceof SlotElement) {
            childElement.asAttached();
          }
          return;
        }
        const prevSameSlotVnode = getPrevVnodeHasSlotName(vnode);
        if (prevSameSlotVnode) {
          const previousElement = resolveElementByVnode(prevSameSlotVnode);
          if (previousElement) {
            const slot = componentElement.insertElementAfter(childElement, previousElement);
            slot?.trackInsertAfter(childElement, previousElement);
          } else {
            const slot = componentElement.prependElement(childElement);
            slot?.trackPrepend(childElement);
          }
        } else {
          const slot = componentElement.prependElement(childElement);
          slot?.trackPrepend(childElement);
        }
        if (childElement instanceof SlotElement) {
          childElement.asAttached();
        }
        return;
      }
      const parentFragment = resolveParentFragment(vnode);
      const parentElement = resolveParentElement(vnode);
      if (vnode.prevVnode && !isFirstMount) {
        const prevElement = resolveElementByVnode(vnode.prevVnode);
        if (prevElement) {
          prevElement.after(childElement);
          if (parentFragment) {
            parentFragment.trackInsertAfter(childElement, vnode, prevElement);
          }
        }
        if (childElement instanceof SlotElement) {
          childElement.asAttached();
        }
        return;
      }
      if (isFirstMount) {
        parentElement.append(childElement);
        if (parentFragment) {
          parentFragment.trackAppend(childElement, vnode);
        }
        if (childElement instanceof SlotElement) {
          childElement.asAttached();
        }
        return;
      }
      parentElement.prepend(childElement);
      if (parentFragment) {
        parentFragment.trackPrepend(childElement, vnode);
      }
      if (childElement instanceof SlotElement) {
        childElement.asAttached();
      }
    }
    function createVnodeElement(vnode) {
      if (isCommentVNode(vnode) || isTextVNode(vnode)) {
        const element = createElement(vnode, mountContext);
        return element.$elem;
      }
      if (isComponentVNode(vnode)) {
        const element = createSingleComponentElement(vnode, mountContext);
        return element.$elem;
      }
      if (isSlotVNode(vnode)) {
        createSlotElement(vnode, mountContext, activeSlotManager, container);
        return mountContext.nodeMap.get(vnode.tid) ?? null;
      }
      if (isTagVNode(vnode)) {
        const element = createSingleTagElement(vnode, mountContext);
        return element.$elem;
      }
      throw new Error(`Unsupported vnode type for mount: ${vnode.type}`);
    }
    function mountVnodeTree(vnode, isFirstMount = false) {
      if (isFragmentVNode(vnode)) {
        const fragmentElement = createFragmentElement(vnode, mountContext);
        fragmentElement.bindFallbackParent(rootElement);
      } else {
        createVnodeElement(vnode);
      }
      if (Array.isArray(vnode.children)) {
        for (const child of vnode.children) {
          mountVnodeTree(child, true);
        }
      }
      appendVnodeToParent(vnode, isFirstMount);
    }
    function extendVnode(newVnode, oldVnode) {
      if (!oldVnode.tid) {
        return;
      }
      const oldRegisteredVnode = resolveVnodeByTid(mountContext, oldVnode.tid);
      if (oldRegisteredVnode !== oldVnode) {
        return;
      }
      const element = resolveElementByVnode(oldVnode);
      if (!element) {
        return;
      }
      element.updateVnode(newVnode, oldVnode);
    }
    function removeVnodeDom(vnode) {
      if (isFragmentVNode(vnode)) {
        const element2 = resolveElementByVnode(vnode);
        if (vnode.children) {
          for (const child of vnode.children) {
            removeVnodeDom(child);
          }
        }
        element2?.remove(true);
        return;
      }
      const element = resolveElementByVnode(vnode);
      const parentFragment = element ? resolveFragmentForChild(mountContext, element) : void 0;
      if (parentFragment && element) {
        parentFragment.trackRemove(element);
      }
      element?.remove();
    }
    function unmountVnode(vnode) {
      removeVnodeDom(vnode);
    }
    function replace(oldVnode, newVnode) {
      mountVnodeTree(newVnode, false);
      unmountVnode(oldVnode);
    }
    function moveVnode(vnode, mapIndex, rightFixedIndex, newChildren, newStartIndex) {
      const moveElement = resolveElementByVnode(vnode);
      if (!moveElement) {
        return;
      }
      const parentFragment = resolveParentFragment(vnode);
      if (vnode.prevVnode) {
        const prevElement = resolveElementByVnode(vnode.prevVnode);
        if (prevElement) {
          prevElement.after(moveElement);
          parentFragment?.trackInsertAfter(moveElement, vnode, prevElement);
        }
        return;
      }
      if (rightFixedIndex >= 0) {
        const newIndex = mapIndex + newStartIndex;
        const rightGlobal = newStartIndex + rightFixedIndex;
        if (newIndex !== rightGlobal) {
          const rightFixedVnode = newChildren[rightGlobal];
          const rightFixedElement = resolveElementByVnode(rightFixedVnode);
          if (rightFixedElement) {
            rightFixedElement.before(moveElement);
            parentFragment?.trackInsertBefore(moveElement, vnode, rightFixedElement);
          }
        }
      }
    }
    function update(oldVnode, newVnode) {
      extendVnode(newVnode, oldVnode);
      const { patchFlag, treePatchFlag } = newVnode;
      const patchAttrs = shouldPatchAttrs(oldVnode, newVnode);
      if (patchFlag > 0) {
        if ((patchFlag & PatchFlags.EVENTS || newVnode.change) && (isTagVNode(newVnode) || isComponentVNode(newVnode))) {
          setMetas(newVnode);
        }
        if (patchAttrs) {
          updateAttrs({
            oldVnode,
            newVnode,
            updateFields: newVnode.updateFields || []
          });
        }
        if (patchFlag & PatchFlags.TEXT) {
          setText({ oldVnode, newVnode });
        }
      } else if (patchAttrs) {
        updateAttrs({
          oldVnode,
          newVnode,
          updateFields: newVnode.updateFields || []
        });
      }
      if (treePatchFlag > 0 || patchFlag & PatchFlags.FOR_DIRECTIVE) {
        if (patchFlag & PatchFlags.FOR_DIRECTIVE) {
          patchKeyedChildren(childOps, oldVnode, newVnode);
        } else {
          patchIndexedChildren(indexedOps, oldVnode, newVnode);
        }
      }
    }
    function patchVnode(oldVnode, newVnode) {
      if (isSameVNode(oldVnode, newVnode)) {
        update(oldVnode, newVnode);
      } else {
        replace(oldVnode, newVnode);
      }
    }
    const childOps = {
      mount: mountVnodeTree,
      unmount: unmountVnode,
      update,
      replace,
      move: moveVnode
    };
    const indexedOps = {
      mount: mountVnodeTree,
      unmount: unmountVnode,
      patch: patchVnode
    };
    function renderRoot(vnode) {
      if (!patchTree) {
        mountVnodeTree(vnode, true);
        patchTree = vnode;
        return;
      }
      patchVnode(patchTree, vnode);
      patchTree = vnode;
    }
    return {
      mount(vnode) {
        mountVnodeTree(vnode, true);
        patchTree = vnode;
      },
      patch(vnode) {
        renderRoot(vnode);
      },
      render(vnode) {
        renderRoot(vnode);
      },
      getPatchTree() {
        return patchTree;
      },
      unmount() {
        if (patchTree) {
          removeVnodeDom(patchTree);
          patchTree = null;
        }
      }
    };
  }

  // src/renderer/renderer.ts
  function mountVnode(vnode, container, _instance, context) {
    if (!vnode) {
      return;
    }
    const renderer = createVnodeRenderer({
      container,
      mountContext: context
    });
    renderer.mount(vnode);
  }
  function renderVnode(vnode, container, _instance, context, renderer) {
    const activeRenderer = renderer ?? createVnodeRenderer({
      container,
      mountContext: context
    });
    if (!vnode) {
      activeRenderer.unmount();
      return activeRenderer;
    }
    activeRenderer.render(vnode);
    return activeRenderer;
  }

  // src/core/group-set-data.ts
  var depth = 0;
  var flushCallbacks = /* @__PURE__ */ new Set();
  function isGroupSetDataActive() {
    return depth > 0;
  }
  function runGroupSetData(callback) {
    depth++;
    try {
      callback();
    } finally {
      depth--;
      if (depth === 0) {
        const callbacks = [...flushCallbacks];
        flushCallbacks.clear();
        for (const flush of callbacks) {
          flush();
        }
      }
    }
  }
  function scheduleGroupSetDataFlush(flush) {
    if (depth === 0) {
      flush();
      return;
    }
    flushCallbacks.add(flush);
  }

  // src/core/observers.ts
  function resolvePropertyObserver(instance, observer) {
    if (typeof observer === "function") {
      return observer.bind(instance);
    }
    if (typeof observer === "string") {
      const method = instance[observer];
      if (typeof method === "function") {
        return method.bind(instance);
      }
    }
    return null;
  }
  function notifyDataObservers(options, instance, changedKeys) {
    if (!options.observers || changedKeys.length === 0) {
      return;
    }
    for (const [fields, observer] of Object.entries(options.observers)) {
      const keys = fields.split(",").map((field) => field.trim()).filter(Boolean);
      if (!keys.some((key) => changedKeys.includes(key))) {
        continue;
      }
      const values = keys.map((key) => instance.data[key]);
      observer.apply(instance, values);
    }
  }
  function notifyPropertyObservers(properties, instance, prevData, changedKeys) {
    if (!properties) {
      return;
    }
    const data = instance.data;
    const keys = changedKeys ?? Object.keys(properties);
    for (const key of keys) {
      const property = properties[key];
      if (!property?.observer) {
        continue;
      }
      if (data[key] !== prevData[key]) {
        const observer = resolvePropertyObserver(
          instance,
          property.observer
        );
        observer?.(data[key], prevData[key]);
      }
    }
  }

  // src/core/component-update-scheduler.ts
  function createComponentUpdateScheduler(options, getInstance, getTemplateData, render) {
    const renderQueue = [];
    const pendingPropertyChanges = /* @__PURE__ */ new Map();
    const pendingSetDataPatches = [];
    let isProcessing = false;
    let callInObservers = false;
    let attributeFlushScheduled = false;
    let deferredFlushScheduled = false;
    let groupedPatchBatch = null;
    function flushGroupedPatchBatch() {
      if (!groupedPatchBatch) {
        return;
      }
      const batch = groupedPatchBatch;
      groupedPatchBatch = null;
      const templateData = getTemplateData();
      if (!templateData) {
        return;
      }
      const task = {
        renderData: templateData.getRenderData(),
        changedKeys: [...new Set(batch.changedKeys)],
        prevData: batch.prevData
      };
      enqueue(task);
    }
    function setDataDuringGroup(patch) {
      const templateData = getTemplateData();
      if (!templateData) {
        return;
      }
      if (!groupedPatchBatch) {
        groupedPatchBatch = {
          changedKeys: [],
          prevData: templateData.getPrevData()
        };
      }
      const task = applyPatch(patch);
      if (task) {
        groupedPatchBatch.changedKeys.push(...task.changedKeys);
      }
      scheduleGroupSetDataFlush(flushGroupedPatchBatch);
    }
    function applyPatch(patch, quiet) {
      const templateData = getTemplateData();
      if (!templateData) {
        return null;
      }
      const changedKeys = Object.keys(patch).filter((key) => patch[key] !== void 0);
      if (changedKeys.length === 0) {
        return null;
      }
      const renderData = templateData.setData(patch, quiet);
      const prevData = templateData.getPrevData();
      return { renderData, changedKeys, prevData };
    }
    function drainPendingSetDataPatches() {
      const merged = {};
      for (const patch of pendingSetDataPatches) {
        Object.assign(merged, patch);
      }
      pendingSetDataPatches.length = 0;
      return merged;
    }
    function emitObservers(task) {
      const instance = getInstance();
      if (!instance) {
        return;
      }
      callInObservers = true;
      try {
        notifyDataObservers(options, instance, task.changedKeys);
        const propertyKeys = task.changedKeys.filter((key) => options.properties?.[key]);
        if (propertyKeys.length > 0) {
          notifyPropertyObservers(options.properties, instance, task.prevData, propertyKeys);
        }
      } finally {
        callInObservers = false;
      }
    }
    function runUpdateCycle(task) {
      let currentTask = task;
      while (true) {
        emitObservers(currentTask);
        if (pendingSetDataPatches.length > 0) {
          const mergedPatch = drainPendingSetDataPatches();
          const nextTask = applyPatch(mergedPatch);
          if (nextTask) {
            currentTask = nextTask;
            continue;
          }
        }
        render(currentTask.renderData);
        break;
      }
    }
    function processQueue() {
      if (isProcessing) {
        return;
      }
      const instance = getInstance();
      if (!instance) {
        renderQueue.length = 0;
        pendingSetDataPatches.length = 0;
        return;
      }
      isProcessing = true;
      try {
        while (renderQueue.length > 0) {
          const task = renderQueue.shift();
          if (!task) {
            continue;
          }
          runUpdateCycle(task);
        }
      } finally {
        isProcessing = false;
        if (renderQueue.length > 0 || pendingSetDataPatches.length > 0) {
          scheduleDeferredFlush();
        }
      }
    }
    function scheduleDeferredFlush() {
      if (deferredFlushScheduled) {
        return;
      }
      deferredFlushScheduled = true;
      queueMicrotask(() => {
        deferredFlushScheduled = false;
        processQueue();
      });
    }
    function enqueue(task) {
      renderQueue.push(task);
      if (callInObservers || isProcessing) {
        scheduleDeferredFlush();
        return;
      }
      processQueue();
    }
    function flushAttributeChanges() {
      attributeFlushScheduled = false;
      if (pendingPropertyChanges.size === 0) {
        return;
      }
      const patch = {};
      for (const [key, { nextValue }] of pendingPropertyChanges) {
        patch[key] = nextValue;
      }
      pendingPropertyChanges.clear();
      const task = applyPatch(patch);
      if (task) {
        enqueue(task);
      }
    }
    return {
      patchData(patch, quiet) {
        return applyPatch(patch, quiet);
      },
      setData(patch) {
        if (callInObservers) {
          pendingSetDataPatches.push(patch);
          return;
        }
        if (isGroupSetDataActive()) {
          setDataDuringGroup(patch);
          return;
        }
        const task = applyPatch(patch);
        if (!task) {
          const templateData = getTemplateData();
          if (templateData) {
            render(templateData.getRenderData());
          }
          return;
        }
        enqueue(task);
      },
      enqueue,
      flush() {
        processQueue();
      },
      queuePropertyChange(key, prevValue, nextValue) {
        const existing = pendingPropertyChanges.get(key);
        pendingPropertyChanges.set(key, {
          prevValue: existing?.prevValue ?? prevValue,
          nextValue
        });
      },
      scheduleAttributeFlush() {
        if (attributeFlushScheduled) {
          return;
        }
        attributeFlushScheduled = true;
        queueMicrotask(flushAttributeChanges);
      },
      getEffectiveValue(key, currentValue) {
        const pending = pendingPropertyChanges.get(key);
        if (pending) {
          return pending.nextValue;
        }
        return currentValue;
      }
    };
  }

  // src/dom-events/dataset.ts
  var DATA_ATTR_PREFIX = "data-";
  function getDatasetFromVnode(vnode) {
    const dataset = {};
    const attrs = vnode.attrs ?? {};
    for (const attrKey of Object.keys(attrs)) {
      if (!attrKey.startsWith(DATA_ATTR_PREFIX)) {
        continue;
      }
      const dataKey = toCamelCase(attrKey.slice(DATA_ATTR_PREFIX.length).toLowerCase());
      dataset[dataKey] = attrs[attrKey];
    }
    return dataset;
  }

  // src/api/exec-selector-query.ts
  function prefixSelector(classPrefix, selector) {
    if (!classPrefix) {
      return selector;
    }
    return selector.replace(/\.([\w-]+)/g, (_match, classSegment) => {
      return `.${classPrefix}${classSegment}`;
    });
  }
  function getElementTid(element) {
    const host = element;
    return host.tid ?? element.getAttribute("meta:tid") ?? void 0;
  }
  function isElementInScope(element, scopeRuntime) {
    const tid = getElementTid(element);
    if (!tid) {
      return false;
    }
    const vnode = resolveGlobalVnodeByTid(tid);
    if (!vnode) {
      return false;
    }
    if (isComponentVNode(vnode)) {
      return true;
    }
    return vnode.belongComponent === scopeRuntime;
  }
  function getInfoInFields(element, fields) {
    const result = {};
    if (fields.id) {
      result.id = element.id || "";
    }
    if (fields.rect || fields.size) {
      const domBounding = element.getBoundingClientRect();
      if (fields.rect) {
        result.left = domBounding.left;
        result.right = domBounding.right;
        result.top = domBounding.top;
        result.bottom = domBounding.bottom;
      }
      if (fields.size) {
        result.width = domBounding.width;
        result.height = domBounding.height;
      }
    }
    if (fields.scrollOffset) {
      const tid2 = getElementTid(element);
      const vnode = tid2 ? resolveGlobalVnodeByTid(tid2) : void 0;
      if (vnode && isTagVNode(vnode) && vnode.name === "scroll-view") {
        result.scrollLeft = element.scrollLeft;
        result.scrollTop = element.scrollTop;
        result.scrollWidth = element.scrollWidth;
        result.scrollHeight = element.scrollHeight;
      } else {
        result.scrollLeft = 0;
        result.scrollTop = 0;
        result.scrollWidth = 0;
        result.scrollHeight = 0;
      }
    }
    if (fields.computedStyle) {
      const style = window.getComputedStyle(element);
      for (const attrKey of fields.computedStyle) {
        result[attrKey] = style.getPropertyValue(attrKey);
      }
    }
    if (fields.node) {
      result.node = "";
    }
    const tid = getElementTid(element);
    if (tid) {
      result.tid = tid;
    }
    return result;
  }
  function getViewportInfo(fields) {
    const result = {};
    if (fields.id) {
      result.id = "";
    }
    if (fields.dataset) {
      result.dataset = {};
    }
    if (fields.rect) {
      result.left = 0;
      result.right = 0;
      result.top = 0;
      result.bottom = 0;
    }
    const documentElement = document.documentElement;
    const documentBody = document.body;
    if (fields.size) {
      result.width = documentElement.clientWidth;
      result.height = documentElement.clientHeight;
    }
    if (fields.scrollOffset) {
      result.scrollLeft = documentElement.scrollLeft || documentBody.scrollLeft || 0;
      result.scrollTop = documentElement.scrollTop || documentBody.scrollTop || 0;
      result.scrollWidth = documentElement.scrollWidth || documentBody.scrollWidth || 0;
      result.scrollHeight = documentElement.scrollHeight || documentBody.scrollHeight || 0;
    }
    return result;
  }
  function formatSelectorQueryData(data, fields) {
    const tid = data.tid;
    if (!tid) {
      return;
    }
    const vnode = resolveGlobalVnodeByTid(tid);
    delete data.tid;
    if (!vnode) {
      if (fields.dataset) {
        data.dataset = {};
      }
      return;
    }
    if (fields.dataset) {
      data.dataset = getDatasetFromVnode(vnode);
    }
    if (fields.properties) {
      for (const propKey of fields.properties) {
        if (isComponentVNode(vnode)) {
          const belongComponent = resolveBelongRuntime(vnode);
          const instanceData = belongComponent?.instance.data;
          if (instanceData && Object.hasOwn(instanceData, propKey)) {
            data[propKey] = instanceData[propKey];
          }
          continue;
        }
        const attrKey = toKebabCase(propKey);
        const attrs = vnode.attrs ?? {};
        if (Object.hasOwn(attrs, attrKey)) {
          data[propKey] = attrs[attrKey];
        }
      }
    }
  }
  function waitForSelectors(options, callback, retry = 20) {
    const { container, queue } = options;
    const isReady = queue.every((item) => {
      if (item.selector === "body") {
        return true;
      }
      return container.querySelectorAll(item.selector).length > 0;
    });
    if (isReady || retry === 0) {
      callback();
      return;
    }
    window.requestAnimationFrame(() => {
      waitForSelectors(options, callback, retry - 1);
    });
  }
  function execSelectorQuery(options, callback) {
    const { container, scopeRuntime, queue } = options;
    waitForSelectors(options, () => {
      const execResult = [];
      for (const item of queue) {
        const { selector, single, fields } = item;
        let result;
        if (selector === "body") {
          result = getViewportInfo(fields);
          execResult.push(result);
          continue;
        }
        const elements = Array.from(container.querySelectorAll(selector)).filter(
          (node) => node instanceof HTMLElement
        );
        if (single) {
          const matched = scopeRuntime ? elements.find((element) => isElementInScope(element, scopeRuntime)) : elements.find((element) => getElementTid(element));
          result = matched ? getInfoInFields(matched, fields) : void 0;
        } else {
          const matchedList = elements.filter((element) => {
            if (scopeRuntime) {
              return isElementInScope(element, scopeRuntime);
            }
            return Boolean(getElementTid(element));
          });
          result = matchedList.map((element) => getInfoInFields(element, fields));
          if (result.length === 0) {
            result = void 0;
          }
        }
        execResult.push(result);
      }
      callback(execResult);
    });
  }

  // src/api/createSelectorQuery.ts
  var BOUNDING_CLIENT_RECT_FIELDS = {
    id: true,
    dataset: true,
    rect: true,
    size: true
  };
  var SCROLL_OFFSET_FIELDS = {
    id: true,
    dataset: true,
    scrollOffset: true
  };
  function createSelectorQuery(runtime) {
    return new SelectorQuery(runtime);
  }
  var NodesRef = class {
    constructor(selectorQuery, selector, single) {
      this.selectorQuery = selectorQuery;
      this.selector = selector;
      this.single = single;
    }
    /**
     * @brief Request custom fields for matched nodes
     * @param[in] fields field options
     * @param[in] callback per-item callback
     * @return selector query for chaining
     */
    fields(fields, callback) {
      this.selectorQuery._push(this.selector, this.single, fields, callback);
      return this.selectorQuery;
    }
    /**
     * @brief Request bounding client rect for matched nodes
     * @param[in] callback per-item callback
     * @return selector query for chaining
     */
    boundingClientRect(callback) {
      this.selectorQuery._push(this.selector, this.single, BOUNDING_CLIENT_RECT_FIELDS, callback);
      return this.selectorQuery;
    }
    /**
     * @brief Request scroll offset for matched nodes
     * @param[in] callback per-item callback
     * @return selector query for chaining
     */
    scrollOffset(callback) {
      this.selectorQuery._push(this.selector, this.single, SCROLL_OFFSET_FIELDS, callback);
      return this.selectorQuery;
    }
  };
  var SelectorQuery = class {
    constructor(runtime) {
      this.queue = [];
      this.queueCallback = [];
      this.container = document.body;
      if (runtime) {
        this.scopeRuntime = runtime;
        this.container = runtime.host;
        this.selectorPrefixValue = runtime.classPrefix;
      }
    }
    /**
     * @brief Limit query scope to a component instance
     * @param[in] context component instance or object with runtime binding
     * @return selector query for chaining
     */
    in(context) {
      const runtime = resolveRuntimeFromInstance(context);
      if (runtime) {
        this.scopeRuntime = runtime;
        this.container = runtime.host;
        this.selectorPrefixValue = runtime.classPrefix;
      }
      return this;
    }
    /**
     * @brief Select first matching node
     * @param[in] selector css selector
     * @return nodes ref for chaining
     */
    select(selector) {
      return new NodesRef(this, prefixSelector(this.selectorPrefixValue, selector), true);
    }
    /**
     * @brief Select all matching nodes
     * @param[in] selector css selector
     * @return nodes ref for chaining
     */
    selectAll(selector) {
      return new NodesRef(this, prefixSelector(this.selectorPrefixValue, selector), false);
    }
    /**
     * @brief Select viewport as query target
     * @return nodes ref for chaining
     */
    selectViewport() {
      return new NodesRef(this, "body", true);
    }
    /**
     * @brief Execute queued selector queries
     * @param[in] execCallback final callback with all results
     * @return none
     */
    exec(execCallback) {
      const queue = this.queue;
      const callbacks = this.queueCallback;
      queueMicrotask(() => {
        execSelectorQuery(
          {
            container: this.container,
            scopeRuntime: this.scopeRuntime,
            queue
          },
          (result) => {
            if (Array.isArray(result)) {
              result.forEach((data, index) => {
                const item = queue[index];
                if (data && item.selector !== "body") {
                  const fields = item.fields;
                  if (item.single && data && typeof data === "object") {
                    formatSelectorQueryData(data, fields);
                  } else if (Array.isArray(data)) {
                    for (const entry of data) {
                      if (entry && typeof entry === "object") {
                        formatSelectorQueryData(entry, fields);
                      }
                    }
                  }
                }
                const callback = callbacks[index];
                if (typeof callback === "function") {
                  callback.call(this, data);
                }
              });
            }
            if (typeof execCallback === "function") {
              execCallback.call(this, result);
            }
          }
        );
      });
    }
    /**
     * @brief Push one query item into execution queue
     * @param[in] selector css selector
     * @param[in] single whether only first match is returned
     * @param[in] fields requested fields
     * @param[in] callback per-item callback
     * @return none
     */
    _push(selector, single, fields, callback) {
      this.queue.push({ selector, single, fields });
      this.queueCallback.push(callback ?? null);
    }
  };

  // src/dom-events/dom-event-type.ts
  var ListenDomEvent = {
    focus: "focus",
    blur: "blur",
    change: "change",
    touchstart: "touchstart",
    touchmove: "touchmove",
    touchend: "touchend",
    touchcancel: "touchcancel",
    transitionend: "transitionend",
    animationstart: "animationstart",
    animationiteration: "animationiteration",
    animationend: "animationend"
  };
  var SyntheticDomEvent = {
    tap: "tap",
    longtap: "longtap",
    longpress: "longpress"
  };
  var DomEventType = {
    ...ListenDomEvent,
    ...SyntheticDomEvent
  };

  // src/dom-events/create-base-event.ts
  function getElementInfo(element) {
    const host = element;
    return {
      tid: host.tid ?? element.getAttribute("meta:tid") ?? void 0,
      id: element.id,
      offsetLeft: element.offsetLeft,
      offsetTop: element.offsetTop
    };
  }
  function createBaseEvent(options) {
    const { type, event, element, target, overrideDetail } = options;
    const mpEvent = {
      type,
      timeStamp: event?.timeStamp ?? Date.now(),
      detail: {},
      currentTarget: element ? getElementInfo(element) : target,
      target
    };
    if (!event) {
      if (overrideDetail) {
        mpEvent.detail = { ...overrideDetail };
      }
      return mpEvent;
    }
    if ("detail" in event && typeof event.detail === "object" && event.detail) {
      mpEvent.detail = { ...event.detail };
    }
    if (event instanceof TouchEvent) {
      mpEvent.touches = normalizeTouchList(event.touches);
      mpEvent.changedTouches = normalizeTouchList(event.changedTouches);
    }
    if (type === DomEventType.tap || type === DomEventType.longtap || type === DomEventType.longpress) {
      const defaultDetail = {};
      const firstTouch = mpEvent.changedTouches?.[0];
      if (firstTouch) {
        defaultDetail.x = firstTouch.clientX;
        defaultDetail.y = firstTouch.clientY;
      }
      mpEvent.detail = { ...defaultDetail, ...mpEvent.detail };
    }
    if (overrideDetail) {
      mpEvent.detail = { ...mpEvent.detail, ...overrideDetail };
    }
    return mpEvent;
  }
  function normalizeTouchList(touchList) {
    const points = [];
    for (let index = 0; index < touchList.length; index++) {
      const touch = typeof touchList.item === "function" ? touchList.item(index) : touchList[index];
      if (!touch) {
        continue;
      }
      points.push({
        identifier: touch.identifier,
        force: touch.force,
        pageX: touch.pageX,
        pageY: touch.pageY,
        clientX: touch.clientX,
        clientY: touch.clientY
      });
    }
    return points;
  }

  // src/dom-events/builtin-events.ts
  function resolveElemTid(elem) {
    return elem.tid ?? elem.getAttribute("meta:tid") ?? void 0;
  }
  function createSjsElement(element, runtime) {
    if (!(element instanceof HTMLElement)) return null;
    return {
      getDataset() {
        const tid = element.tid ?? element.getAttribute("meta:tid");
        const vnode = tid ? resolveGlobalVnodeByTid(tid) : null;
        return vnode ? getDatasetFromVnode(vnode) : { ...element.dataset };
      },
      setStyle(styles) {
        for (const [key, value] of Object.entries(styles ?? {})) {
          element.style.setProperty(toKebabCase(key), String(value));
        }
      },
      getBoundingClientRect() {
        return element.getBoundingClientRect();
      },
      selectComponent(selector) {
        const resolved = prefixSelector(runtime.classPrefix, selector);
        return createSjsElement(element.querySelector(resolved), runtime);
      }
    };
  }
  function createSjsOwner(instance) {
    const runtime = resolveRuntimeFromInstance(instance);
    return {
      callMethod(name, ...args) {
        return typeof instance[name] === "function" ? instance[name](...args) : undefined;
      },
      triggerEvent(name, detail) {
        instance.triggerEvent(name, detail);
      },
      selectComponent(selector) {
        if (!runtime) return null;
        const resolved = prefixSelector(runtime.classPrefix, selector);
        return createSjsElement(runtime.host.querySelector(resolved), runtime);
      }
    };
  }
  function invokeHandler(instance, methodName, event) {
    if (typeof methodName === "function") {
      methodName.call(instance, event, createSjsOwner(instance));
      return;
    }
    const handler = instance[methodName];
    if (typeof handler === "function") {
      handler.call(instance, event);
    }
  }
  function invokeVnodeBoundEvent(elem, type, detail, event) {
    const tid = resolveElemTid(elem);
    if (!tid) {
      return false;
    }
    const vnode = resolveGlobalVnodeByTid(tid);
    if (!vnode?.events) {
      return false;
    }
    const handlers = vnode.events[type];
    if (!handlers) {
      return false;
    }
    const methodName = handlers.catch || handlers.bind;
    if (!methodName) {
      return false;
    }
    const instance = resolveBelongRuntime(vnode)?.instance;
    if (!instance) {
      return false;
    }
    const target = getElementInfo(elem);
    const mpEvent = createBaseEvent({
      type,
      event,
      element: elem,
      target,
      overrideDetail: detail
    });
    mpEvent.currentTarget.dataset = getDatasetFromVnode(vnode);
    mpEvent.target.dataset = getDatasetFromVnode(vnode);
    delete mpEvent.currentTarget.tid;
    delete mpEvent.target.tid;
    invokeHandler(instance, methodName, mpEvent);
    return true;
  }
  var BuiltinEvents = class {
    /**
     * @brief Fire a non-bubbling mini-program event declared on the elem's vnode
     * @param[in] elem host element carrying tid (e.g. v-image)
     * @param[in] type event name (load / error / change / …)
     * @param[in] detail optional event.detail payload
     * @param[in] event optional native Event for timestamps / touches
     * @return none
     */
    trigger(elem, type, detail, event) {
      invokeVnodeBoundEvent(elem, type, detail, event);
    }
  };
  var installed = false;
  function installBuiltinEvents() {
    if (installed) {
      return;
    }
    installed = true;
    const api = new BuiltinEvents();
    window.builtinEvents = api;
  }

  // ../../node_modules/.bun/assign-set@1.1.9/node_modules/assign-set/index.js
  var FUNC_ERROR_TEXT = "Expected a function";
  var HASH_UNDEFINED = "__lodash_hash_undefined__";
  var INFINITY = 1 / 0;
  var MAX_SAFE_INTEGER = 9007199254740991;
  var funcTag = "[object Function]";
  var genTag = "[object GeneratorFunction]";
  var symbolTag = "[object Symbol]";
  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
  var reIsPlainProp = /^\w*$/;
  var reLeadingDot = /^\./;
  var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  var reEscapeChar = /\\(\\)?/g;
  var reIsHostCtor = /^\[object .+?Constructor\]$/;
  var reIsUint = /^(?:0|[1-9]\d*)$/;
  var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
  var freeSelf = typeof self == "object" && self && self.Object === Object && self;
  var root = freeGlobal || freeSelf || Function("return this")();
  function getValue(object, key) {
    return object == null ? void 0 : object[key];
  }
  function isHostObject(value) {
    var result = false;
    if (value != null && typeof value.toString != "function") {
      try {
        result = !!(value + "");
      } catch (e) {
      }
    }
    return result;
  }
  var arrayProto = Array.prototype;
  var funcProto = Function.prototype;
  var objectProto = Object.prototype;
  var coreJsData = root["__core-js_shared__"];
  var maskSrcKey = (function() {
    var uid = /[^.]+$/.exec(
      coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || ""
    );
    return uid ? "Symbol(src)_1." + uid : "";
  })();
  var funcToString = funcProto.toString;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var objectToString = objectProto.toString;
  var reIsNative = RegExp(
    "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(
      /hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,
      "$1.*?"
    ) + "$"
  );
  var Symbol2 = root.Symbol;
  var splice = arrayProto.splice;
  var Map2 = getNative(root, "Map");
  var nativeCreate = getNative(Object, "create");
  var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
  var symbolToString = symbolProto ? symbolProto.toString : void 0;
  function Hash(entries) {
    var index = -1, length = entries ? entries.length : 0;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  function hashClear() {
    this.__data__ = nativeCreate ? nativeCreate(null) : {};
  }
  function hashDelete(key) {
    return this.has(key) && delete this.__data__[key];
  }
  function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate) {
      var result = data[key];
      return result === HASH_UNDEFINED ? void 0 : result;
    }
    return hasOwnProperty.call(data, key) ? data[key] : void 0;
  }
  function hashHas(key) {
    var data = this.__data__;
    return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
  }
  function hashSet(key, value) {
    var data = this.__data__;
    data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
    return this;
  }
  Hash.prototype.clear = hashClear;
  Hash.prototype["delete"] = hashDelete;
  Hash.prototype.get = hashGet;
  Hash.prototype.has = hashHas;
  Hash.prototype.set = hashSet;
  function ListCache(entries) {
    var index = -1, length = entries ? entries.length : 0;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  function listCacheClear() {
    this.__data__ = [];
  }
  function listCacheDelete(key) {
    var data = this.__data__, index = assocIndexOf(data, key);
    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    return true;
  }
  function listCacheGet(key) {
    var data = this.__data__, index = assocIndexOf(data, key);
    return index < 0 ? void 0 : data[index][1];
  }
  function listCacheHas(key) {
    return assocIndexOf(this.__data__, key) > -1;
  }
  function listCacheSet(key, value) {
    var data = this.__data__, index = assocIndexOf(data, key);
    if (index < 0) {
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }
  ListCache.prototype.clear = listCacheClear;
  ListCache.prototype["delete"] = listCacheDelete;
  ListCache.prototype.get = listCacheGet;
  ListCache.prototype.has = listCacheHas;
  ListCache.prototype.set = listCacheSet;
  function MapCache(entries) {
    var index = -1, length = entries ? entries.length : 0;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  function mapCacheClear() {
    this.__data__ = {
      hash: new Hash(),
      map: new (Map2 || ListCache)(),
      string: new Hash()
    };
  }
  function mapCacheDelete(key) {
    return getMapData(this, key)["delete"](key);
  }
  function mapCacheGet(key) {
    return getMapData(this, key).get(key);
  }
  function mapCacheHas(key) {
    return getMapData(this, key).has(key);
  }
  function mapCacheSet(key, value) {
    getMapData(this, key).set(key, value);
    return this;
  }
  MapCache.prototype.clear = mapCacheClear;
  MapCache.prototype["delete"] = mapCacheDelete;
  MapCache.prototype.get = mapCacheGet;
  MapCache.prototype.has = mapCacheHas;
  MapCache.prototype.set = mapCacheSet;
  function assignValue(object, key, value) {
    var objValue = object[key];
    if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === void 0 && !(key in object)) {
      object[key] = value;
    }
  }
  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }
  function baseIsNative(value) {
    if (!isObject(value) || isMasked(value)) {
      return false;
    }
    var pattern = isFunction(value) || isHostObject(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }
  function baseSet(object, fieldPath, value, customizer) {
    if (!isObject(object)) {
      return object;
    }
    var path = fieldPath;
    if (/\[('|")(\d+)(\1)\]/.test(fieldPath)) {
      path = path.replace(/\[('|")(\d+)(\1)\]/g, "[$2]");
      console.warn(
        `\`${fieldPath}\` array string index will be deprecated. Use \`${path}\` instead.`
      );
    }
    path = isKey(path, object) ? [path] : castPath(path);
    var index = -1, length = path.length, lastIndex = length - 1, nested = object;
    while (nested != null && ++index < length) {
      var key = toKey(path[index]), newValue = value;
      var nextPath = path[index + 1];
      if (key[0] == "[" && key.substring(key.length - 1) == "]") {
        key = key.substring(1, key.length - 1);
      }
      if (index != lastIndex) {
        var objValue = nested[key];
        newValue = customizer ? customizer(objValue, key, nested) : void 0;
        if (newValue === void 0) {
          newValue = isObject(objValue) && isPath(nextPath, objValue) ? objValue : isIndex(nextPath) ? [] : {};
        }
      }
      assignValue(nested, key, newValue);
      nested = nested[key];
    }
    return object;
  }
  function baseToString(value) {
    if (typeof value == "string") {
      return value;
    }
    if (isSymbol(value)) {
      return symbolToString ? symbolToString.call(value) : "";
    }
    var result = value + "";
    return result == "0" && 1 / value == -INFINITY ? "-0" : result;
  }
  function castPath(value) {
    return isArray(value) ? value : stringToPath(value);
  }
  function getMapData(map, key) {
    var data = map.__data__;
    return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
  }
  function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : void 0;
  }
  function isIndex(value, length) {
    var number = value.slice(1, -1);
    length = length == null ? MAX_SAFE_INTEGER : length;
    var is = number && !!length && reIsUint.test(number) && number > -1 && number % 1 == 0 && number < length;
    return is;
  }
  function isKey(value, object) {
    if (isArray(value)) {
      return false;
    }
    var type = typeof value;
    if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
      return true;
    }
    return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
  }
  function isPath(path, object) {
    var isArr = isArray(object);
    var isField = /\[\d+\]/.test(path);
    var isIndexField = /^\d+$/.test(path);
    if (isArr && isField) {
      return true;
    } else if (isArr && isIndexField) {
      return true;
    } else if (!isArr && !isField) {
      return true;
    }
    return false;
  }
  function isKeyable(value) {
    var type = typeof value;
    return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
  }
  function isMasked(func) {
    return !!maskSrcKey && maskSrcKey in func;
  }
  var stringToPath = memoize(function(string) {
    string = toString(string);
    var result = [];
    if (reLeadingDot.test(string)) {
      result.push("");
    }
    string.replace(rePropName, function(match, number, quote, string2) {
      result.push(
        quote ? string2.replace(reEscapeChar, "$1") : number && number[0] !== "-" ? match : number || match
      );
    });
    return result;
  });
  function toKey(value) {
    if (typeof value == "string" || isSymbol(value)) {
      return value;
    }
    var result = value + "";
    return result == "0" && 1 / value == -INFINITY ? "-0" : result;
  }
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {
      }
      try {
        return func + "";
      } catch (e) {
      }
    }
    return "";
  }
  function memoize(func, resolver) {
    if (typeof func != "function" || resolver && typeof resolver != "function") {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    var memoized = function() {
      var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
      if (cache.has(key)) {
        return cache.get(key);
      }
      var result = func.apply(this, args);
      memoized.cache = cache.set(key, result);
      return result;
    };
    memoized.cache = new (memoize.Cache || MapCache)();
    return memoized;
  }
  memoize.Cache = MapCache;
  function eq(value, other) {
    return value === other || value !== value && other !== other;
  }
  var isArray = Array.isArray;
  function isFunction(value) {
    var tag = isObject(value) ? objectToString.call(value) : "";
    return tag == funcTag || tag == genTag;
  }
  function isObject(value) {
    var type = typeof value;
    return !!value && (type == "object" || type == "function");
  }
  function isObjectLike(value) {
    return !!value && typeof value == "object";
  }
  function isSymbol(value) {
    return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
  }
  function toString(value) {
    return value == null ? "" : baseToString(value);
  }
  function set(object, path, value) {
    return object == null ? object : baseSet(object, path, value);
  }
  var assign_set_default = set;

  // ../../node_modules/.bun/update-set@1.0.4/node_modules/update-set/index.js
  var FUNC_ERROR_TEXT2 = "Expected a function";
  var HASH_UNDEFINED2 = "__lodash_hash_undefined__";
  var INFINITY2 = 1 / 0;
  var MAX_SAFE_INTEGER2 = 9007199254740991;
  var funcTag2 = "[object Function]";
  var genTag2 = "[object GeneratorFunction]";
  var symbolTag2 = "[object Symbol]";
  var reIsDeepProp2 = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
  var reIsPlainProp2 = /^\w*$/;
  var reArrayIndexField = /\[\d+\]/;
  var reQuotedIndex = /\[('|")(\d+)(\1)\]/;
  var reQuotedIndexGlobal = /\[('|")(\d+)(\1)\]/g;
  var reLeadingDot2 = /^\./;
  var rePropName2 = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
  var reRegExpChar2 = /[\\^$.*+?()[\]{}|]/g;
  var reEscapeChar2 = /\\(\\)?/g;
  var reIsHostCtor2 = /^\[object .+?Constructor\]$/;
  var reIsUint2 = /^(?:0|[1-9]\d*)$/;
  var freeGlobal2 = typeof global == "object" && global && global.Object === Object && global;
  var freeSelf2 = typeof self == "object" && self && self.Object === Object && self;
  var root2 = freeGlobal2 || freeSelf2 || Function("return this")();
  function getValue2(object, key) {
    return object == null ? void 0 : object[key];
  }
  function isHostObject2(value) {
    var result = false;
    if (value != null && typeof value.toString != "function") {
      try {
        result = !!(value + "");
      } catch (e) {
      }
    }
    return result;
  }
  var arrayProto2 = Array.prototype;
  var funcProto2 = Function.prototype;
  var objectProto2 = Object.prototype;
  var coreJsData2 = root2["__core-js_shared__"];
  var maskSrcKey2 = (function() {
    var uid = /[^.]+$/.exec(
      coreJsData2 && coreJsData2.keys && coreJsData2.keys.IE_PROTO || ""
    );
    return uid ? "Symbol(src)_1." + uid : "";
  })();
  var funcToString2 = funcProto2.toString;
  var hasOwnProperty2 = objectProto2.hasOwnProperty;
  var objectToString2 = objectProto2.toString;
  var reIsNative2 = RegExp(
    "^" + funcToString2.call(hasOwnProperty2).replace(reRegExpChar2, "\\$&").replace(
      /hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,
      "$1.*?"
    ) + "$"
  );
  var Symbol3 = root2.Symbol;
  var splice2 = arrayProto2.splice;
  var Map3 = getNative2(root2, "Map");
  var nativeCreate2 = getNative2(Object, "create");
  var symbolProto2 = Symbol3 ? Symbol3.prototype : void 0;
  var symbolToString2 = symbolProto2 ? symbolProto2.toString : void 0;
  function Hash2(entries) {
    var index = -1, length = entries ? entries.length : 0;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  function hashClear2() {
    this.__data__ = nativeCreate2 ? nativeCreate2(null) : {};
  }
  function hashDelete2(key) {
    return this.has(key) && delete this.__data__[key];
  }
  function hashGet2(key) {
    var data = this.__data__;
    if (nativeCreate2) {
      var result = data[key];
      return result === HASH_UNDEFINED2 ? void 0 : result;
    }
    return hasOwnProperty2.call(data, key) ? data[key] : void 0;
  }
  function hashHas2(key) {
    var data = this.__data__;
    return nativeCreate2 ? data[key] !== void 0 : hasOwnProperty2.call(data, key);
  }
  function hashSet2(key, value) {
    var data = this.__data__;
    data[key] = nativeCreate2 && value === void 0 ? HASH_UNDEFINED2 : value;
    return this;
  }
  Hash2.prototype.clear = hashClear2;
  Hash2.prototype["delete"] = hashDelete2;
  Hash2.prototype.get = hashGet2;
  Hash2.prototype.has = hashHas2;
  Hash2.prototype.set = hashSet2;
  function ListCache2(entries) {
    var index = -1, length = entries ? entries.length : 0;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  function listCacheClear2() {
    this.__data__ = [];
  }
  function listCacheDelete2(key) {
    var data = this.__data__, index = assocIndexOf2(data, key);
    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice2.call(data, index, 1);
    }
    return true;
  }
  function listCacheGet2(key) {
    var data = this.__data__, index = assocIndexOf2(data, key);
    return index < 0 ? void 0 : data[index][1];
  }
  function listCacheHas2(key) {
    return assocIndexOf2(this.__data__, key) > -1;
  }
  function listCacheSet2(key, value) {
    var data = this.__data__, index = assocIndexOf2(data, key);
    if (index < 0) {
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }
  ListCache2.prototype.clear = listCacheClear2;
  ListCache2.prototype["delete"] = listCacheDelete2;
  ListCache2.prototype.get = listCacheGet2;
  ListCache2.prototype.has = listCacheHas2;
  ListCache2.prototype.set = listCacheSet2;
  function MapCache2(entries) {
    var index = -1, length = entries ? entries.length : 0;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  function mapCacheClear2() {
    this.__data__ = {
      hash: new Hash2(),
      map: new (Map3 || ListCache2)(),
      string: new Hash2()
    };
  }
  function mapCacheDelete2(key) {
    return getMapData2(this, key)["delete"](key);
  }
  function mapCacheGet2(key) {
    return getMapData2(this, key).get(key);
  }
  function mapCacheHas2(key) {
    return getMapData2(this, key).has(key);
  }
  function mapCacheSet2(key, value) {
    getMapData2(this, key).set(key, value);
    return this;
  }
  MapCache2.prototype.clear = mapCacheClear2;
  MapCache2.prototype["delete"] = mapCacheDelete2;
  MapCache2.prototype.get = mapCacheGet2;
  MapCache2.prototype.has = mapCacheHas2;
  MapCache2.prototype.set = mapCacheSet2;
  function shouldCreateArray(path) {
    if (typeof path == "number") {
      return isIndex2(path);
    }
    return typeof path == "string" && path[0] == "[" && path[path.length - 1] == "]";
  }
  function resolvePath(value, object) {
    if (isArray2(value)) {
      return value;
    }
    var type = typeof value;
    if (type == "number" || type == "boolean" || value == null) {
      return [value];
    }
    if (type == "string") {
      var hasBracket = value.indexOf("[") != -1;
      if (!hasBracket && value.indexOf(".") == -1 || object != null && value in Object(object)) {
        return [value];
      }
      return castPath2(value);
    }
    return isKey2(value, object) ? [value] : castPath2(value);
  }
  function assocIndexOf2(array, key) {
    var length = array.length;
    while (length--) {
      if (eq2(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }
  function baseIsNative2(value) {
    if (!isObject2(value) || isMasked2(value)) {
      return false;
    }
    var pattern = isFunction2(value) || isHostObject2(value) ? reIsNative2 : reIsHostCtor2;
    return pattern.test(toSource2(value));
  }
  function baseSet2(object, fieldPath, value, customizer) {
    if (!isObject2(object)) {
      return object;
    }
    var path = fieldPath;
    if (typeof fieldPath == "string" && reQuotedIndex.test(fieldPath)) {
      path = path.replace(reQuotedIndexGlobal, "[$2]");
      console.warn(
        `\`${fieldPath}\` array string index will be deprecated. Use \`${path}\` instead.`
      );
    }
    path = resolvePath(path, object);
    var index = -1, length = path.length, lastIndex = length - 1, nested = object;
    while (nested != null && ++index < length) {
      if (nested != null && typeof nested == "object" && nested.__set__ === true && hasOwnProperty2.call(nested, "__value__")) {
        nested = nested.__value__;
      }
      var pathKey = path[index];
      var key = typeof pathKey == "string" ? pathKey : pathKey + "";
      var newValue = value;
      var nextPath = path[index + 1];
      var isEnd = index === lastIndex;
      if (key == "0" && 1 / pathKey == -INFINITY2) {
        key = "-0";
      }
      if (typeof key == "string" && key[0] == "[" && key[key.length - 1] == "]") {
        key = key.slice(1, -1);
      }
      if (!isEnd) {
        var objValue = nested[key];
        var objValueValue = objValue != null && typeof objValue == "object" && objValue.__set__ === true && hasOwnProperty2.call(objValue, "__value__") ? objValue.__value__ : objValue;
        newValue = customizer ? customizer(objValueValue, key, nested) : void 0;
        if (newValue === void 0) {
          newValue = isObject2(objValueValue) && isPath2(nextPath, objValueValue) ? objValue : shouldCreateArray(nextPath) ? [] : {};
        }
        if (!(hasOwnProperty2.call(nested, key) && nested[key] === newValue) || newValue === void 0 && !(key in nested)) {
          nested[key] = newValue;
        }
      } else if (nested != null && typeof nested == "object") {
        nested[key] = { __set__: true, __value__: value };
      }
      nested = nested[key];
    }
    return object;
  }
  function baseToString2(value) {
    if (typeof value == "string") {
      return value;
    }
    if (isSymbol2(value)) {
      return symbolToString2 ? symbolToString2.call(value) : "";
    }
    var result = value + "";
    return result == "0" && 1 / value == -INFINITY2 ? "-0" : result;
  }
  var lastSimplePathKey;
  var lastSimplePathResult;
  function castPath2(value) {
    if (isArray2(value)) {
      return value;
    }
    if (typeof value == "string" && value.indexOf("[") == -1) {
      if (value === lastSimplePathKey) {
        return lastSimplePathResult;
      }
      lastSimplePathKey = value;
      lastSimplePathResult = value.indexOf(".") == -1 ? [value] : value.split(".");
      return lastSimplePathResult;
    }
    return stringToPath2(value);
  }
  function getMapData2(map, key) {
    var data = map.__data__;
    return isKeyable2(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
  }
  function getNative2(object, key) {
    var value = getValue2(object, key);
    return baseIsNative2(value) ? value : void 0;
  }
  function isIndex2(value, length) {
    length = length == null ? MAX_SAFE_INTEGER2 : length;
    if (!length || value == null) {
      return false;
    }
    if (typeof value == "number") {
      return value > -1 && value % 1 == 0 && value < length;
    }
    var string = value + "";
    var number = string;
    if (string[0] == "[" && string[string.length - 1] == "]") {
      number = string.slice(1, -1);
    }
    return !!number && reIsUint2.test(number) && number < length;
  }
  function isKey2(value, object) {
    if (isArray2(value)) {
      return false;
    }
    var type = typeof value;
    if (type == "number" || type == "boolean" || value == null) {
      return true;
    }
    return reIsPlainProp2.test(value) || !reIsDeepProp2.test(value) || object != null && value in Object(object);
  }
  function isPath2(path, object) {
    if (isArray2(object)) {
      return isIndex2(path);
    }
    return !reArrayIndexField.test(path + "");
  }
  function isKeyable2(value) {
    var type = typeof value;
    return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
  }
  function isMasked2(func) {
    return !!maskSrcKey2 && maskSrcKey2 in func;
  }
  var stringToPath2 = memoize2(function(string) {
    string = toString2(string);
    var result = [];
    if (reLeadingDot2.test(string)) {
      result.push("");
    }
    string.replace(rePropName2, function(match, number, quote, string2) {
      result.push(
        quote ? string2.replace(reEscapeChar2, "$1") : number && number[0] !== "-" ? match : number || match
      );
    });
    return result;
  });
  function toSource2(func) {
    if (func != null) {
      try {
        return funcToString2.call(func);
      } catch (e) {
      }
      try {
        return func + "";
      } catch (e) {
      }
    }
    return "";
  }
  function memoize2(func, resolver) {
    if (typeof func != "function" || resolver && typeof resolver != "function") {
      throw new TypeError(FUNC_ERROR_TEXT2);
    }
    var memoized = function() {
      var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
      if (cache.has(key)) {
        return cache.get(key);
      }
      var result = func.apply(this, args);
      memoized.cache = cache.set(key, result);
      return result;
    };
    memoized.cache = new (memoize2.Cache || MapCache2)();
    return memoized;
  }
  memoize2.Cache = MapCache2;
  function eq2(value, other) {
    return value === other || value !== value && other !== other;
  }
  var isArray2 = Array.isArray;
  function isFunction2(value) {
    var tag = isObject2(value) ? objectToString2.call(value) : "";
    return tag == funcTag2 || tag == genTag2;
  }
  function isObject2(value) {
    var type = typeof value;
    return !!value && (type == "object" || type == "function");
  }
  function isObjectLike2(value) {
    return !!value && typeof value == "object";
  }
  function isSymbol2(value) {
    return typeof value == "symbol" || isObjectLike2(value) && objectToString2.call(value) == symbolTag2;
  }
  function toString2(value) {
    return value == null ? "" : baseToString2(value);
  }
  function set2(object, path, value) {
    return object == null ? object : baseSet2(object, path, value);
  }
  var update_set_default = set2;

  // src/template-data/helpers.ts
  function withoutPureData(data, pureDataPattern) {
    const result = {};
    for (const key in data) {
      if (!pureDataPattern.test(key)) {
        result[key] = data[key];
      }
    }
    return result;
  }

  // src/template-data/TemplateData.es5.ts
  var createTemplateDataES5 = (data, opts) => {
    const options = opts || {};
    const { pureDataPattern, prevData: inputPrevData } = options;
    const internalData = deepClone(data);
    let prevData = inputPrevData;
    function withoutPurePattern(obj) {
      if (!pureDataPattern) {
        return obj;
      }
      return withoutPureData(obj, pureDataPattern);
    }
    function setData(patchData, quiet) {
      prevData = deepClone(internalData);
      const renderData = deepClone(internalData);
      for (const key in patchData) {
        const targetValue = patchData[key];
        if (targetValue !== void 0) {
          assign_set_default(internalData, key, deepClone(targetValue));
          update_set_default(renderData, key, deepClone(targetValue));
        } else if (!quiet) {
          console.warn(`setData field "${key}" to undefined is invalid.`);
        }
      }
      return withoutPurePattern(renderData);
    }
    return {
      withoutPurePattern,
      setData,
      getData: () => internalData,
      getRenderData: () => withoutPurePattern(internalData),
      getPrevData: () => prevData || cloneObject(internalData)
    };
  };
  function cloneObject(obj) {
    const clone = {};
    for (const key in obj) {
      const value = obj[key];
      if (value && typeof value === "object") {
        if (Array.isArray(value)) {
          clone[key] = value.slice();
        } else {
          clone[key] = Object.assign({}, value);
        }
      } else {
        clone[key] = value;
      }
    }
    return clone;
  }

  // src/web-events/index.ts
  var webEvents = {
    _listeners: /* @__PURE__ */ new Map(),
    /**
     * @brief Register a listener for a component event name
     * @param[in] name event name from triggerEvent (e.g. click, close)
     * @param[in] listener callback receiving { target, detail }
     * @return none
     */
    on(name, listener) {
      let set3 = this._listeners.get(name);
      if (!set3) {
        set3 = /* @__PURE__ */ new Set();
        this._listeners.set(name, set3);
      }
      set3.add(listener);
    },
    /**
     * @brief Remove a previously registered listener
     * @param[in] name event name
     * @param[in] listener listener to remove
     * @return none
     */
    off(name, listener) {
      this._listeners.get(name)?.delete(listener);
    },
    /**
     * @brief Notify listeners when a component calls triggerEvent
     * @param[in] name event name
     * @param[in] event payload with host element as target
     * @return none
     */
    trigger(name, event) {
      const set3 = this._listeners.get(name);
      if (!set3 || set3.size === 0) {
        return;
      }
      for (const listener of [...set3]) {
        listener(event);
      }
    }
  };

  // src/utils/resolve-relation-path.ts
  function toPosixPath(path) {
    return path.replace(/\\/g, "/");
  }
  function posixDirname(path) {
    const posixPath = toPosixPath(path);
    const index = posixPath.lastIndexOf("/");
    if (index === -1) {
      return ".";
    }
    if (index === 0) {
      return "/";
    }
    return posixPath.slice(0, index);
  }
  function posixNormalize(path) {
    const posixPath = toPosixPath(path);
    const isAbsolute = posixPath.startsWith("/");
    const stack = [];
    for (const segment of posixPath.split("/")) {
      if (!segment || segment === ".") {
        continue;
      }
      if (segment === "..") {
        if (stack.length > 0) {
          stack.pop();
          continue;
        }
        if (!isAbsolute) {
          stack.push("..");
        }
        continue;
      }
      stack.push(segment);
    }
    const joined = stack.join("/");
    if (isAbsolute) {
      return `/${joined}`;
    }
    return joined || ".";
  }
  function resolveRelationPath(relationIs, relationKey) {
    const baseDir = posixDirname(relationIs);
    const joined = baseDir === "." ? relationKey : `${baseDir}/${relationKey}`;
    return posixNormalize(joined);
  }

  // src/core/relations.ts
  function asComponentHost(node) {
    if (!(node instanceof HTMLElement)) {
      return null;
    }
    if (!node.hasAttribute("relation-is")) {
      return null;
    }
    return node;
  }
  function isDirectChildComponentHost(referenceHost, candidateHost) {
    let current = candidateHost.parentElement;
    while (current) {
      if (current === referenceHost) {
        return true;
      }
      if (asComponentHost(current)) {
        return false;
      }
      current = current.parentElement;
    }
    return false;
  }
  function isHostAttached(host) {
    return resolveRuntimeFromHost(host)?.isAttached === true;
  }
  function findParentRelation(relations, childRelationIs, type) {
    for (const [relationPath, relation] of Object.entries(relations)) {
      if (relationPath === childRelationIs && relation.type === type) {
        return [relationPath, relation];
      }
    }
    return null;
  }
  function trackRelationLink(child, parent) {
    child.linkedAncestors.add(parent);
    parent.linkedDescendants.add(child);
  }
  function untrackRelationLink(child, parent) {
    child.linkedAncestors.delete(parent);
    parent.linkedDescendants.delete(child);
  }
  function applyRelation(params) {
    const { type, child, parent, childRelation, parentRelation } = params;
    const parentHandler = parentRelation[type];
    const childHandler = childRelation[type];
    if (type === "linked") {
      trackRelationLink(child, parent);
    } else if (type === "unlinked") {
      untrackRelationLink(child, parent);
    }
    if (typeof parentHandler === "function") {
      parentHandler.call(parent.instance, child.instance);
    }
    if (typeof childHandler === "function") {
      childHandler.call(child.instance, parent.instance);
    }
  }
  function unlinkTrackedRelations(context) {
    for (const parent of [...context.linkedAncestors]) {
      const parentRelations = parent.options.relations;
      const childRelations = context.options.relations;
      if (!parentRelations || !childRelations) {
        continue;
      }
      const childAncestor = Object.entries(childRelations).find(([, relation]) => relation.type === "ancestor");
      const parentDescendant = childAncestor ? findParentRelation(parentRelations, context.relationIs, "descendant") : null;
      const childParent = Object.entries(childRelations).find(([, relation]) => relation.type === "parent");
      const parentChild = childParent ? findParentRelation(parentRelations, context.relationIs, "child") : null;
      const matched = parentDescendant ?? parentChild;
      const childMatched = childAncestor ?? Object.entries(childRelations).find(([, relation]) => relation.type === "parent");
      if (matched && childMatched) {
        applyRelation({
          type: "unlinked",
          child: context,
          parent,
          childRelation: childMatched[1],
          parentRelation: matched[1]
        });
      }
    }
  }
  function matchRelations(context, type) {
    if (type === "unlinked") {
      unlinkTrackedRelations(context);
      return;
    }
    const { options, relationIs } = context;
    const relations = options.relations;
    if (!relations) {
      return;
    }
    const relationList = Object.entries(relations);
    const ancestorRelations = relationList.filter(([, relation]) => relation.type === "ancestor");
    const parentRelations = relationList.filter(([, relation]) => relation.type === "parent");
    if (parentRelations.length > 0) {
      let parentNode = context.host.parentElement;
      while (parentNode) {
        const parentHost = asComponentHost(parentNode);
        if (parentHost && isHostAttached(parentHost)) {
          const parentContext = resolveRuntimeFromHost(parentHost);
          if (parentContext) {
            for (const [relationPath, relationItem] of parentRelations) {
              const parentRelationIs = parentContext.relationIs;
              if (parentRelationIs !== relationPath) {
                continue;
              }
              const parentRelationsConfig = parentContext.options.relations;
              const matchedParentRelation = parentRelationsConfig ? findParentRelation(parentRelationsConfig, relationIs, "child") : null;
              if (matchedParentRelation) {
                applyRelation({
                  type,
                  child: context,
                  parent: parentContext,
                  childRelation: relationItem,
                  parentRelation: matchedParentRelation[1]
                });
              }
            }
          }
        }
        parentNode = parentNode.parentElement;
      }
    }
    if (ancestorRelations.length > 0) {
      for (const [relationPath, relationItem] of ancestorRelations) {
        let parentNode = context.host.parentElement;
        while (parentNode) {
          const ancestorHost = asComponentHost(parentNode);
          if (ancestorHost && isHostAttached(ancestorHost)) {
            const ancestorContext = resolveRuntimeFromHost(ancestorHost);
            if (ancestorContext?.relationIs === relationPath) {
              const ancestorRelationsConfig = ancestorContext.options.relations;
              const matchedAncestorRelation = ancestorRelationsConfig ? findParentRelation(ancestorRelationsConfig, relationIs, "descendant") : null;
              if (matchedAncestorRelation) {
                applyRelation({
                  type,
                  child: context,
                  parent: ancestorContext,
                  childRelation: relationItem,
                  parentRelation: matchedAncestorRelation[1]
                });
                break;
              }
            }
          }
          parentNode = parentNode.parentElement;
        }
      }
    }
  }
  function getRelationNodes(context, relationKey) {
    const relations = context.options.relations;
    if (!relations) {
      return [];
    }
    const absolutePath = resolveRelationPath(context.relationIs, relationKey);
    const relation = relations[absolutePath];
    if (!relation) {
      return [];
    }
    const nodes = [];
    if (relation.type === "child" || relation.type === "descendant") {
      const elements = context.host.querySelectorAll("[relation-is]");
      for (const element of elements) {
        if (!(element instanceof HTMLElement) || element === context.host) {
          continue;
        }
        const runtime = resolveRuntimeFromHost(element);
        if (!runtime?.isAttached || runtime.relationIs !== absolutePath) {
          continue;
        }
        if (relation.type === "child" && !isDirectChildComponentHost(context.host, element)) {
          continue;
        }
        nodes.push(runtime.instance);
      }
    } else if (relation.type === "parent" || relation.type === "ancestor") {
      let parentNode = context.host.parentElement;
      while (parentNode) {
        const parentHost = asComponentHost(parentNode);
        if (parentHost) {
          const runtime = resolveRuntimeFromHost(parentHost);
          if (runtime?.isAttached && runtime.relationIs === absolutePath) {
            nodes.push(runtime.instance);
            if (relation.type === "parent") {
              break;
            }
          }
        }
        parentNode = parentNode.parentElement;
      }
    }
    return nodes;
  }

  // src/core/instance.ts
  function toEventDetail(detail) {
    if (detail === void 0) {
      return void 0;
    }
    if (detail !== null && typeof detail === "object" && !Array.isArray(detail)) {
      return detail;
    }
    return { value: detail };
  }
  function createComponentInstance(options, host, scheduler, relationIs = "") {
    const templateData = createTemplateDataES5(getInitialData(options));
    const runtime = {
      instance: null,
      templateData,
      host,
      options,
      relationIs,
      isAttached: false,
      linkedAncestors: /* @__PURE__ */ new Set(),
      linkedDescendants: /* @__PURE__ */ new Set(),
      syncAttribute(name, value) {
        const key = name.includes("-") ? name.replace(/-([a-z])/g, (_, char) => char.toUpperCase()) : name;
        const property = options.properties?.[key];
        if (!property) {
          return;
        }
        const nextValue = resolvePropertyValueFromAttribute(property, value);
        if (runtime.instance.data[key] === nextValue) {
          return;
        }
        scheduler.setData({ [key]: nextValue });
      }
    };
    const instance = Object.create(null, {
      dataset: {
        get() {
          return { ...host.dataset };
        }
      },
      properties: {
        get() {
          return templateData.getData();
        }
      },
      selectComponent: {
        value(selector) {
          return this.selectAllComponents(selector)[0] ?? null;
        },
        writable: true
      },
      selectAllComponents: {
        value(selector) {
          const resolvedSelector = prefixSelector(runtime.classPrefix, selector);
          return Array.from(host.querySelectorAll(resolvedSelector))
            .map(element => resolveRuntimeFromHost(element)?.instance)
            .filter(Boolean);
        },
        writable: true
      },
      data: {
        get() {
          return templateData.getData();
        },
        set(value) {
          console.error(`Component data is readonly! can't set to`, value);
        }
      },
      setData: {
        value(partial) {
          scheduler.setData(partial);
        },
        writable: true
      },
      groupSetData: {
        value(callback) {
          runGroupSetData(callback);
        },
        writable: true
      },
      triggerEvent: {
        value(name, detail) {
          invokeVnodeBoundEvent(host, name, toEventDetail(detail));
          host.dispatchEvent(
            new CustomEvent(name, {
              detail,
              bubbles: true,
              composed: true
            })
          );
          webEvents.trigger(name, { target: host, detail });
        }
      },
      createSelectorQuery: {
        value() {
          return createSelectorQuery(runtime);
        },
        writable: true
      },
      relationIs: {
        get() {
          return relationIs;
        }
      },
      getRelationNodes: {
        value(relationKey) {
          return getRelationNodes(runtime, relationKey);
        },
        writable: true
      }
    });
    for (const [name, method] of Object.entries(options.methods ?? {})) {
      instance[name] = method.bind(instance);
    }
    runtime.instance = instance;
    const publicInstance = instance;
    registerInstanceRuntime(publicInstance, runtime);
    return {
      options,
      runtime,
      instance: publicInstance,
      templateData,
      relationIs
    };
  }

  // src/core/mount-component-host.ts
  function syncExternalClassAttributes(host, manager, externalClassNames) {
    for (const name of externalClassNames) {
      manager.setSignal(name, host.getAttribute(name)?.trim() ?? "");
    }
  }
  function buildAttributePatch(host, options, templateData) {
    const patchData = {};
    const data = templateData.getData();
    for (const key of Object.keys(options.properties ?? {})) {
      const attrName = toKebabCase(key);
      const property = options.properties?.[key];
      if (!property) {
        continue;
      }
      const nextValue = resolvePropertyValueFromAttribute(property, host.getAttribute(attrName));
      if (data[key] !== nextValue) {
        patchData[key] = nextValue;
      }
    }
    for (const [key, value] of host._pendingPropertyValues ?? []) {
      patchData[key] = value;
    }
    host._pendingPropertyValues?.clear();
    return patchData;
  }
  function buildInitialRenderTask(scheduler, templateData, attributePatch) {
    const patchedTask = Object.keys(attributePatch).length > 0 ? scheduler.patchData(attributePatch) : null;
    if (patchedTask) {
      return patchedTask;
    }
    return {
      renderData: templateData.getRenderData(),
      changedKeys: [],
      prevData: templateData.getPrevData()
    };
  }
  function mountComponentHost(input) {
    const {
      host,
      hostUniqueId,
      tagName,
      definition,
      componentOptions,
      usingComponents,
      stylePrefixWithIsolated,
      styleIsolation,
      externalClassNames
    } = input;
    const mountRoot = host;
    const parentComponentElement = resolveComponentElementByHost(host);
    const slotManager = parentComponentElement?.slotManager ?? new SlotManager();
    ensureComponentStyle(
      tagName,
      definition.css({
        host: definition.is ?? "",
        prefix: stylePrefixWithIsolated,
        rpx: (v) => {
          return v / 2;
        }
      })
    );
    const mountContext = createMountContext();
    mountContext.slotManager = slotManager;
    if (!parentComponentElement) {
      slotManager.collectHostSlotContent(
        host,
        (node, slotName) => new LightDomElement(node, slotName, mountContext)
      );
    }
    const mounted = {
      mountRoot,
      slotManager,
      mountContext,
      vnodeRenderer: void 0
    };
    const render = (renderData) => {
      const ctx = renderData ?? mounted.templateData.getRenderData();
      const vnode = definition.wxml(hostConfig, ctx, {
        // tyml-runtime uses options.prefix (not tid) for genTidHash(`${prefix}_${uid}`)
        belongComponent: mounted.runtime,
        prefix: hostUniqueId,
        usingComponents
      });
      mounted.vnodeRenderer = renderVnode(
        vnode,
        mounted.mountRoot,
        mounted.instance,
        mounted.mountContext,
        mounted.vnodeRenderer
      );
    };
    mounted.render = render;
    mounted.updateScheduler = createComponentUpdateScheduler(
      componentOptions,
      () => mounted.instance,
      () => mounted.templateData,
      render
    );
    const context = createComponentInstance(componentOptions, host, mounted.updateScheduler, definition.relationIs ?? "");
    mounted.runtime = context.runtime;
    mounted.instance = context.instance;
    mounted.templateData = context.templateData;
    mounted.runtime.mountContext = mountContext;
    mounted.runtime.classPrefix = stylePrefixWithIsolated;
    attachComponentStyleContext(mounted.runtime, {
      prefix: stylePrefixWithIsolated,
      styleIsolation
    });
    if (externalClassNames.length > 0) {
      const styleResolver = mounted.runtime.styleResolver;
      mounted.externalClasses = new ExternalClassesManager({
        classNames: externalClassNames,
        resolveLocalClass: (className) => styleResolver.resolveClass(className)
      });
      mounted.runtime.externalClasses = mounted.externalClasses;
      syncExternalClassAttributes(host, mounted.externalClasses, externalClassNames);
    }
    const attributePatch = buildAttributePatch(host, componentOptions, mounted.templateData);
    let initialPatchTask = null;
    if (Object.keys(attributePatch).length > 0) {
      initialPatchTask = mounted.updateScheduler.patchData(attributePatch);
    }
    componentOptions.lifetimes?.created?.call(mounted.instance);
    mounted.runtime.isAttached = true;
    componentOptions.lifetimes?.attached?.call(mounted.instance);
    matchRelations(mounted.runtime, "linked");
    const initialTask = { renderData: mounted.templateData.getRenderData(), changedKeys: initialPatchTask ? initialPatchTask.changedKeys : [], prevData: initialPatchTask ? initialPatchTask.prevData : mounted.templateData.getPrevData() };
    mounted.updateScheduler.enqueue(initialTask);
    mounted.updateScheduler.flush();
    componentOptions.lifetimes?.ready?.call(mounted.instance);
    return mounted;
  }

  // src/core/mount-gate.ts
  function scheduleMountGate(callback) {
    let cancelled = false;
    let rafId = 0;
    let timerId = 0;
    const scheduleTimeout = (fn) => setTimeout(fn, 0);
    const run = () => {
      if (cancelled) {
        return;
      }
      callback();
    };
    if (typeof requestAnimationFrame === "function") {
      rafId = requestAnimationFrame(() => {
        if (cancelled) {
          return;
        }
        timerId = scheduleTimeout(run);
      });
    } else {
      timerId = scheduleTimeout(() => {
        timerId = scheduleTimeout(run);
      });
    }
    return {
      cancel() {
        cancelled = true;
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        clearTimeout(timerId);
      }
    };
  }

  // src/core/builtin-behaviors.ts
  var FORM_FIELD_BEHAVIOR = {
    properties: {
      name: String
    }
  };
  var FORM_FIELD_GROUP_BEHAVIOR = {};
  var FORM_FIELD_BUTTON_BEHAVIOR = {};
  var BUILTIN_BEHAVIORS = {
    "wx://form-field": FORM_FIELD_BEHAVIOR,
    "wx://form-field-group": FORM_FIELD_GROUP_BEHAVIOR,
    "wx://form-field-button": FORM_FIELD_BUTTON_BEHAVIOR
  };
  function resolveBehaviorReference(behavior) {
    if (typeof behavior !== "string") {
      return behavior;
    }
    const builtin = BUILTIN_BEHAVIORS[behavior];
    if (builtin) {
      return builtin;
    }
    console.warn(`[mp-runtime] Unknown built-in behavior: ${behavior}`);
    return {};
  }

  // src/core/normalizeComponentOptions.ts
  var PROPERTY_TYPE_CONSTRUCTORS = /* @__PURE__ */ new Set([String, Number, Boolean, Object, Array, Function]);
  function isPropertyTypeConstructor(value) {
    return PROPERTY_TYPE_CONSTRUCTORS.has(value);
  }
  function getDefaultValueForType(type) {
    switch (type) {
      case String:
        return "";
      case Number:
        return 0;
      case Boolean:
        return false;
      case Object:
        return {};
      case Array:
        return [];
      case Function:
        return null;
      default:
        return null;
    }
  }
  function normalizePropertyOption(value) {
    if (value == null) {
      return { type: null, value: null };
    }
    if (isPropertyTypeConstructor(value)) {
      return {
        type: value,
        value: getDefaultValueForType(value)
      };
    }
    const option = { ...value };
    if (option.type !== void 0 && option.value === void 0) {
      option.value = getDefaultValueForType(option.type);
    }
    return option;
  }
  function normalizeProperties(properties) {
    if (!properties) {
      return void 0;
    }
    const normalized = {};
    for (const [key, value] of Object.entries(properties)) {
      normalized[key] = normalizePropertyOption(value);
    }
    return normalized;
  }
  function mergeProperties(target, source) {
    if (!source) {
      return target;
    }
    for (const key of Object.keys(source)) {
      if (key in target) {
        target[key] = { ...target[key], ...source[key] };
      } else {
        target[key] = { ...source[key] };
      }
    }
    return target;
  }
  function getPropertiesValues(properties) {
    const result = {};
    for (const [key, property] of Object.entries(properties)) {
      result[key] = property.value !== void 0 ? property.value : property.type !== void 0 ? getDefaultValueForType(property.type) : void 0;
    }
    return result;
  }
  function flattenBehaviorLayers(behavior) {
    const list = [];
    for (const nested of behavior.behaviors ?? []) {
      list.push(...flattenBehaviorLayers(nested));
    }
    list.push(behavior);
    return list;
  }
  function makeBehaviors(config) {
    let behaviorProperties = {};
    let behaviorData = {};
    let behaviorMethods = {};
    for (const behavior of config.behaviors ?? []) {
      const layers = flattenBehaviorLayers(behavior);
      for (let index = layers.length - 1; index >= 0; index--) {
        const layer = layers[index];
        behaviorProperties = mergeProperties(behaviorProperties, layer.properties);
        behaviorData = { ...behaviorData, ...layer.data };
        behaviorMethods = { ...behaviorMethods, ...layer.methods };
      }
    }
    config.properties = mergeProperties(config.properties ?? {}, behaviorProperties);
    config.data = { ...behaviorData, ...config.data ?? {} };
    config.methods = { ...behaviorMethods, ...config.methods ?? {} };
  }
  function normalizeBehavior(behavior) {
    const resolved = resolveBehaviorReference(behavior);
    const normalized = {
      data: resolved.data,
      methods: resolved.methods,
      lifetimes: resolved.lifetimes,
      observers: resolved.observers,
      properties: normalizeProperties(resolved.properties)
    };
    if (resolved.behaviors?.length) {
      normalized.behaviors = resolved.behaviors.map(normalizeBehavior);
    }
    const legacyLifetimeHooks = ["created", "attached", "ready", "detached"];
    for (const lifecycle of legacyLifetimeHooks) {
      const handler = resolved[lifecycle];
      if (handler) {
        normalized.lifetimes = { ...normalized.lifetimes, [lifecycle]: handler };
      }
    }
    return normalized;
  }
  function normalizeConfig(config) {
    if (config.behaviors?.length) {
      makeBehaviors(config);
    }
    if (config.properties && Object.keys(config.properties).length > 0) {
      const propertyValues = getPropertiesValues(config.properties);
      config.data = { ...config.data ?? {}, ...propertyValues };
    }
    return config;
  }
  function normalizeComponentOptions(options, relationIs = "") {
    const config = {
      data: options.data,
      methods: options.methods,
      observers: options.observers,
      lifetimes: options.lifetimes,
      options: options.options,
      externalClasses: options.externalClasses,
      properties: normalizeProperties(options.properties)
    };
    if (options.behaviors?.length) {
      config.behaviors = options.behaviors.map(normalizeBehavior);
    }
    if (options.relations) {
      const normalizedRelations = {};
      for (const [key, value] of Object.entries(options.relations)) {
        normalizedRelations[resolveRelationPath(relationIs, key)] = value;
      }
      config.relations = normalizedRelations;
    }
    const legacyLifetimeHooks = ["created", "attached", "ready", "detached"];
    for (const lifecycle of legacyLifetimeHooks) {
      const handler = options[lifecycle];
      if (handler) {
        config.lifetimes = { ...config.lifetimes, [lifecycle]: handler };
      }
    }
    return normalizeConfig(config);
  }

  // src/core/define.ts
  var nextHostUniqueId = 0;
  function createHostUniqueId(tagName) {
    nextHostUniqueId += 1;
    return `${tagName}-${nextHostUniqueId}`;
  }
  function getObservedAttributes(options, externalClassNames) {
    const propertyAttributes = Object.keys(options.properties ?? {}).map((key) => toKebabCase(key));
    return [...propertyAttributes, ...externalClassNames];
  }
  function definePropertyAccessors(proto, options) {
    for (const key of Object.keys(options.properties ?? {})) {
      const attrName = toKebabCase(key);
      const property = options.properties?.[key];
      if (!property) {
        continue;
      }
      Object.defineProperty(proto, key, {
        configurable: true,
        enumerable: true,
        get() {
          if (this._mounted) {
            return this._mounted.runtime.instance.data[key];
          }
          if (this._pendingPropertyValues?.has(key)) {
            return this._pendingPropertyValues.get(key);
          }
          return resolvePropertyValueFromAttribute(property, this.getAttribute(attrName));
        },
        set(value) {
          if (value !== null && (typeof value === "object" || typeof value === "function")) {
            const mounted = this._mounted;
            if (!mounted) {
              (this._pendingPropertyValues ??= new Map()).set(key, value);
              return;
            }
            const prevValue = mounted.runtime.instance.data[key];
            const effectiveValue = mounted.updateScheduler.getEffectiveValue(key, prevValue);
            if (effectiveValue === value) return;
            mounted.updateScheduler.queuePropertyChange(key, prevValue, value);
            mounted.updateScheduler.scheduleAttributeFlush();
            return;
          }
          if (property.type === Boolean) {
            const mounted = this._mounted;
            if (!mounted) {
              (this._pendingPropertyValues ??= new Map()).set(key, Boolean(value));
            } else {
              const nextValue = Boolean(value);
              const prevValue = mounted.runtime.instance.data[key];
              const effectiveValue = mounted.updateScheduler.getEffectiveValue(key, prevValue);
              if (effectiveValue !== nextValue) {
                mounted.updateScheduler.queuePropertyChange(key, prevValue, nextValue);
                mounted.updateScheduler.scheduleAttributeFlush();
              }
              return;
            }
            if (value) {
              this.setAttribute(attrName, "");
            } else {
              this.removeAttribute(attrName);
            }
            return;
          }
          if (value === null || value === void 0) {
            this.removeAttribute(attrName);
            return;
          }
          this.setAttribute(attrName, String(value));
        }
      });
    }
  }
  function define(tagName, definition) {
    if (customElements.get(tagName)) {
      return;
    }
    if (isComponentRegistered(tagName)) {
      throw new Error(`Component ${tagName} already registered`);
    }
    setupTymlEnv();
    const initOptions = definition.js();
    const componentOptions = applyBehaviors(normalizeComponentOptions(initOptions, definition.relationIs));
    const jsonConfig = definition.json();
    const stylePrefix = definition.is ?? "";
    const styleIsolation = componentOptions.options?.styleIsolation ?? "isolated";
    const stylePrefixWithIsolated = styleIsolation !== "shared" ? `${stylePrefix}__` : "";
    const externalClassNames = componentOptions.externalClasses ?? [];
    registerComponentMeta({
      tagName,
      externalClasses: externalClassNames
    });
    const observedAttributes = getObservedAttributes(componentOptions, externalClassNames);
    const externalClassNameSet = new Set(externalClassNames);
    class MpComponentElement extends HTMLElement {
      constructor() {
        super(...arguments);
        this._syncingAttr = false;
      }
      static get observedAttributes() {
        return observedAttributes;
      }
      get relationIs() {
        return definition.relationIs ?? "";
      }
      /**
       * @brief Apply an observed attribute change to component data and re-render
       * @param[in] name attribute name
       * @param[in] oldValue previous attribute value
       * @param[in] newValue next attribute value (intended value for property sync)
       * @return none
       * @note Unique data-write path for attributes: queuePropertyChange → scheduleAttributeFlush
       */
      _applyAttributeChange(name, oldValue, newValue) {
        const mounted = this._mounted;
        if (!mounted) {
          return;
        }
        if (oldValue === newValue) {
          return;
        }
        if (externalClassNameSet.has(name)) {
          mounted.externalClasses?.setSignal(name, String(newValue ?? "").trim());
          return;
        }
        const key = toCamelCase(name);
        const property = componentOptions.properties?.[key];
        if (!property) {
          return;
        }
        const prevValue = mounted.runtime.instance.data[key];
        const nextValue = resolvePropertyValueFromAttribute(property, newValue);
        const effectiveValue = mounted.updateScheduler.getEffectiveValue(key, prevValue);
        if (effectiveValue === nextValue) {
          return;
        }
        mounted.updateScheduler.queuePropertyChange(key, prevValue, nextValue);
        mounted.updateScheduler.scheduleAttributeFlush();
      }
      /**
       * @brief Set attribute and sync observed properties to component data
       * @param[in] name attribute name
       * @param[in] value attribute value
       * @return none
       */
      setAttribute(name, value) {
        if (this._syncingAttr) {
          Element.prototype.setAttribute.call(this, name, value);
          return;
        }
        const oldValue = this.getAttribute(name);
        this._syncingAttr = true;
        try {
          Element.prototype.setAttribute.call(this, name, value);
          if (observedAttributes.includes(name)) {
            if (externalClassNameSet.has(name)) {
              this._mounted?.externalClasses?.setSignal(name, value.trim());
            } else {
              this._applyAttributeChange(name, oldValue, value);
            }
          }
        } finally {
          this._syncingAttr = false;
        }
      }
      /**
       * @brief Remove attribute and sync observed properties to component data
       * @param[in] name attribute name
       * @return none
       */
      removeAttribute(name) {
        if (this._syncingAttr) {
          Element.prototype.removeAttribute.call(this, name);
          return;
        }
        const oldValue = this.getAttribute(name);
        this._syncingAttr = true;
        try {
          Element.prototype.removeAttribute.call(this, name);
          if (observedAttributes.includes(name)) {
            if (externalClassNameSet.has(name)) {
              this._mounted?.externalClasses?.setSignal(name, "");
            } else {
              this._applyAttributeChange(name, oldValue, null);
            }
          }
        } finally {
          this._syncingAttr = false;
        }
      }
      /**
       * @brief Schedule mount after parser-inserted light DOM children are available
       * @return none
       * @see scheduleMountGate
       */
      connectedCallback() {
        if (this._mountGate || this._mounted) {
          return;
        }
        this.setAttribute("is", definition.is ?? "");
        this.setAttribute("relation-is", definition.relationIs ?? "");
        this.hostUniqueId = createHostUniqueId(tagName);
        this._mountGate = scheduleMountGate(() => {
          this._mountGate = void 0;
          if (!this.isConnected || this._mounted) {
            return;
          }
          this._mounted = mountComponentHost({
            host: this,
            hostUniqueId: this.hostUniqueId,
            tagName,
            definition,
            componentOptions,
            usingComponents: jsonConfig.usingComponents ?? {},
            stylePrefixWithIsolated,
            styleIsolation,
            externalClassNames
          });
        });
      }
      disconnectedCallback() {
        const mounted = this._mounted;
        if (!mounted) {
          return;
        }
        mounted.vnodeRenderer?.unmount();
        cleanupMountContext(mounted.mountContext);
        componentOptions.lifetimes?.detached?.call(mounted.instance);
        matchRelations(mounted.runtime, "unlinked");
        mounted.runtime.isAttached = false;
        unregisterInstanceRuntime(mounted.instance);
      }
      attributeChangedCallback(name, oldValue, newValue) {
        if (this._syncingAttr) {
          return;
        }
        this._applyAttributeChange(name, oldValue, newValue);
      }
    }
    definePropertyAccessors(MpComponentElement.prototype, componentOptions);
    customElements.define(tagName, MpComponentElement);
  }

  // src/css/reset.ts
  var resetCss = `
* {
  box-sizing: border-box;
  outline: 0;
  -webkit-tap-highlight-color: transparent;
}

a,
article,
body,
button,
dd,
div,
dl,
dt,
em,
footer,
form,
h1,
h2,
h3,
h4,
header,
html,
iframe,
img,
input,
li,
nav,
ol,
p,
span,
strong,
textarea,
ul,
var {
  padding: 0;
  margin: 0;
}

html,
body {
  -webkit-text-size-adjust: none;
  text-size-adjust: none;
  -webkit-font-smoothing: antialiased;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  width: 100%;
  font-family: 'San Francisco', 'PingFang SC', 'Source Han Sans CN', Robot, 'Helvetica Neue', STHeiti, 'Microsoft Yahei',
    Tahoma, Simsun, sans-serif;
  font-size: 16px;
}

form,
input {
  background: 0 0;
  border: none;
}

a {
  text-decoration: none;
}

a:focus,
a:hover {
  outline: 0;
}

img {
  border: none;
}
`;
  function initResetCss() {
    const style = document.createElement("style");
    style.id = "reset-css";
    style.textContent = resetCss;
    if (document.head.firstChild) {
      document.head.insertBefore(style, document.head.firstChild);
    } else {
      document.head.appendChild(style);
    }
  }

  // src/dom-events/tap-manager.ts
  var TapManager = class {
    constructor() {
      this.state = "start";
      this.longStay = 350;
    }
    /**
     * @brief Start tap tracking and schedule longpress callback
     * @param[in] longTapCallback callback when longpress threshold is reached
     * @return none
     */
    start(longTapCallback) {
      this.state = "start";
      if (this.longTapTimer) {
        clearTimeout(this.longTapTimer);
      }
      this.longTapTimer = setTimeout(() => {
        longTapCallback();
      }, this.longStay);
    }
    /**
     * @brief End tap tracking and invoke tap callback when gesture was not cancelled
     * @param[in] callback tap callback
     * @return none
     */
    end(callback) {
      if (this.longTapTimer) {
        clearTimeout(this.longTapTimer);
      }
      if (this.state === "start") {
        callback();
      }
      this.state = "end";
    }
    /**
     * @brief Cancel pending tap and longpress callbacks
     * @return none
     */
    cancelTap() {
      if (this.longTapTimer) {
        clearTimeout(this.longTapTimer);
      }
      this.state = "cancel";
    }
  };
  var tapManager = new TapManager();

  // src/dom-events/trigger-event.ts
  var catchTouchUidList = {};
  function hasChildCatchEvent(tid, list = []) {
    for (let index = list.length - 1; index >= 0; index--) {
      const [itemTid, isCatch] = list[index];
      if (itemTid === tid) {
        return false;
      }
      if (isCatch) {
        return true;
      }
    }
    return false;
  }
  function hasCatchTouchStart(_tid, list = []) {
    for (const [, isCatch] of list) {
      if (isCatch) {
        return true;
      }
    }
    return false;
  }
  function getElementTid2(element) {
    const host = element;
    return host.tid ?? element.getAttribute("meta:tid") ?? void 0;
  }
  function resolveEventInstance(vnode) {
    return resolveBelongRuntime(vnode)?.instance;
  }
  function invokeHandler2(instance, methodName, event) {
    if (typeof methodName === "function") {
      methodName.call(instance, event, createSjsOwner(instance));
      return;
    }
    const handler = instance[methodName];
    if (typeof handler === "function") {
      handler.call(instance, event);
    }
  }
  function applyEventDataset(event, currentTargetVnode, targetVnode) {
    event.currentTarget.dataset = getDatasetFromVnode(currentTargetVnode);
    event.target.dataset = targetVnode ? getDatasetFromVnode(targetVnode) : {};
    delete event.currentTarget.tid;
    delete event.target.tid;
  }
  function dispatchEventList(eventList) {
    for (const item of eventList) {
      const currentTargetVnode = resolveGlobalVnodeByTid(item.tid);
      if (!currentTargetVnode) {
        continue;
      }
      const instance = resolveEventInstance(currentTargetVnode);
      if (!instance) {
        continue;
      }
      const targetVnode = item.event.target.tid ? resolveGlobalVnodeByTid(item.event.target.tid) : void 0;
      applyEventDataset(item.event, currentTargetVnode, targetVnode);
      invokeHandler2(instance, item.methodName, item.event);
    }
  }
  function triggerEvent(type, options) {
    const { event, eventPath } = options;
    catchTouchUidList[type] = [];
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return false;
    }
    const targetInfo = getElementInfo(target);
    const pendingEvents = [];
    for (const element of eventPath) {
      const tid = getElementTid2(element);
      if (!tid) {
        continue;
      }
      const vnode = resolveGlobalVnodeByTid(tid);
      if (!vnode?.events) {
        catchTouchUidList[type].unshift([tid, 0]);
        continue;
      }
      const eventHandlers = vnode.events[type];
      if (!eventHandlers) {
        catchTouchUidList[type].unshift([tid, 0]);
        continue;
      }
      const catchHandler = eventHandlers.catch;
      const bindHandler = eventHandlers.bind;
      const methodName = catchHandler || bindHandler;
      if (!methodName) {
        catchTouchUidList[type].unshift([tid, 0]);
        continue;
      }
      pendingEvents.push({
        tid,
        methodName,
        event: createBaseEvent({ type, event, element, target: targetInfo })
      });
      catchTouchUidList[type].unshift([tid, catchHandler ? 1 : 0]);
    }
    let eventList = pendingEvents;
    if (type === DomEventType.tap) {
      eventList = eventList.filter((item) => !hasCatchTouchStart(item.tid, catchTouchUidList[DomEventType.touchstart]));
      eventList = eventList.filter((item) => !hasChildCatchEvent(item.tid, catchTouchUidList[type]));
    }
    if (type === DomEventType.touchend || type === DomEventType.touchstart || type === DomEventType.touchmove || type === DomEventType.touchcancel) {
      eventList = eventList.filter((item) => !hasChildCatchEvent(item.tid, catchTouchUidList[type]));
    }
    if (eventList.length === 0) {
      return false;
    }
    dispatchEventList(eventList);
    return true;
  }
  function getEventPath(event) {
    const composedPath = typeof event.composedPath === "function" ? event.composedPath() : (
      // legacy fallback
      event.path ?? []
    );
    const path = composedPath.filter((node) => node instanceof HTMLElement);
    const bodyIndex = path.findIndex((element) => element.localName === "body");
    if (bodyIndex >= 0) {
      return path.slice(0, bodyIndex + 1);
    }
    return path;
  }

  // src/dom-events/index.ts
  var listening = false;
  function handleEvent(type, event) {
    const eventPath = getEventPath(event);
    if (type === ListenDomEvent.touchstart && event instanceof TouchEvent) {
      tapManager.start(() => {
        triggerEvent(DomEventType.longtap, { event, eventPath });
        const hasLongpress = triggerEvent(DomEventType.longpress, { event, eventPath });
        if (hasLongpress) {
          tapManager.cancelTap();
        }
      });
    }
    if (type === ListenDomEvent.touchmove) {
      tapManager.cancelTap();
    }
    triggerEvent(type, { event, eventPath });
    if (type === ListenDomEvent.touchend && event instanceof TouchEvent) {
      tapManager.end(() => {
        triggerEvent(DomEventType.tap, { event, eventPath });
      });
    }
  }
  function listenDocumentEvent() {
    if (listening) {
      return;
    }
    listening = true;
    for (const key of Object.keys(ListenDomEvent)) {
      const type = ListenDomEvent[key];
      document.addEventListener(
        type,
        (event) => {
          handleEvent(type, event);
        },
        { capture: true, passive: false }
      );
    }
  }

  // src/touch-emulator/index.ts
  var isMultiTouch = false;
  var multiTouchStartPos;
  var eventTarget;
  var sourceTarget;
  var touchElements = {};
  var mouseGestureHandled = false;
  function PTouch(target, identifier, pos, deltaX, deltaY) {
    deltaX = deltaX || 0;
    deltaY = deltaY || 0;
    return new Touch({
      target,
      identifier,
      pageX: pos.pageX + deltaX,
      pageY: pos.pageY + deltaY,
      clientX: pos.clientX + deltaX,
      clientY: pos.clientY + deltaY,
      screenX: pos.screenX + deltaX,
      screenY: pos.screenY + deltaY
    });
  }
  function fakeTouchSupport() {
    var objs = [window, document.documentElement];
    var props = ["ontouchstart", "ontouchmove", "ontouchcancel", "ontouchend"];
    for (var o = 0; o < objs.length; o++) {
      for (var p = 0; p < props.length; p++) {
        if (objs[o] && objs[o][props[p]] === void 0) {
          objs[o][props[p]] = null;
        }
      }
    }
  }
  function hasTouchSupport() {
    return (navigator.maxTouchPoints || 0) > 0;
  }
  function preventMouseEvents(ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }
  function onMouse(touchType) {
    return (ev) => {
      if (ev.type === "mousedown") {
        mouseGestureHandled = true;
      }
      const path = ev.composedPath ? ev.composedPath() : ev.path;
      var triggerElement = path[0];
      if (triggerElement.nodeType === Node.ELEMENT_NODE) {
        sourceTarget = triggerElement;
      }
      const target = ev.target;
      if (TouchEmulator.ignoreTags.indexOf(target.tagName) < 0 && TouchEmulator.ignoreTags.indexOf(sourceTarget.tagName) < 0) {
        preventMouseEvents(ev);
      }
      if (ev.which !== 1) {
        return;
      }
      if (ev.type === "mousedown" || !eventTarget || eventTarget && !eventTarget.dispatchEvent) {
        eventTarget = sourceTarget || target;
      }
      if (isMultiTouch && !ev.shiftKey) {
        triggerTouch("touchend", ev);
        isMultiTouch = false;
      }
      triggerTouch(touchType, ev);
      if (!isMultiTouch && ev.shiftKey) {
        isMultiTouch = true;
        multiTouchStartPos = {
          pageX: ev.pageX,
          pageY: ev.pageY,
          clientX: ev.clientX,
          clientY: ev.clientY,
          screenX: ev.screenX,
          screenY: ev.screenY
        };
        triggerTouch("touchstart", ev);
      }
      if (ev.type === "mouseup") {
        multiTouchStartPos = null;
        isMultiTouch = false;
        eventTarget = null;
        sourceTarget = null;
      }
    };
  }
  function triggerTouch(eventName, mouseEv) {
    var touches = getActiveTouches(mouseEv, eventName);
    var targetTouches = getActiveTouches(mouseEv, eventName);
    var changedTouches = getChangedTouches(mouseEv, eventName);
    var target = eventTarget;
    var touchEvent = new TouchEvent(eventName, {
      bubbles: true,
      composed: true,
      cancelable: true,
      altKey: mouseEv.altKey,
      ctrlKey: mouseEv.ctrlKey,
      metaKey: mouseEv.metaKey,
      shiftKey: mouseEv.shiftKey,
      touches,
      targetTouches,
      changedTouches
    });
    target.dispatchEvent(touchEvent);
  }
  function onClick(ev) {
    if (!ev.isTrusted) return;
    if (mouseGestureHandled) {
      mouseGestureHandled = false;
      return;
    }
    if (ev.which !== 1 && ev.button !== 0) {
      return;
    }
    const path = ev.composedPath ? ev.composedPath() : ev.path;
    var triggerElement = path[0];
    if (triggerElement && triggerElement.nodeType === Node.ELEMENT_NODE) {
      sourceTarget = triggerElement;
    }
    const target = ev.target;
    if (TouchEmulator.ignoreTags.indexOf(target.tagName) < 0 && TouchEmulator.ignoreTags.indexOf(sourceTarget.tagName) < 0) {
      preventMouseEvents(ev);
    }
    eventTarget = sourceTarget || target;
    triggerTouch("touchstart", ev);
    triggerTouch("touchend", ev);
    eventTarget = null;
    sourceTarget = null;
  }
  function createTouchList(mouseEv) {
    var touchList = [];
    if (isMultiTouch) {
      var f = TouchEmulator.multiTouchOffset;
      var deltaX = multiTouchStartPos.pageX - mouseEv.pageX;
      var deltaY = multiTouchStartPos.pageY - mouseEv.pageY;
      touchList.push(PTouch(eventTarget, 1, multiTouchStartPos, deltaX * -1 - f, deltaY * -1 + f));
      touchList.push(PTouch(eventTarget, 2, multiTouchStartPos, deltaX + f, deltaY - f));
    } else {
      touchList.push(PTouch(eventTarget, 1, mouseEv, 0, 0));
    }
    return touchList;
  }
  function getActiveTouches(mouseEv, eventName) {
    if (mouseEv.type === "mouseup") {
      return [];
    }
    var touchList = createTouchList(mouseEv);
    if (isMultiTouch && mouseEv.type !== "mouseup" && eventName === "touchend") {
      touchList.splice(1, 1);
    }
    return touchList;
  }
  function getChangedTouches(mouseEv, eventName) {
    var touchList = createTouchList(mouseEv);
    if (isMultiTouch && mouseEv.type !== "mouseup" && (eventName === "touchstart" || eventName === "touchend")) {
      touchList.splice(0, 1);
    }
    return touchList;
  }
  function showTouches(ev) {
    var touch, i, el, styles;
    for (i = 0; i < ev.touches.length; i++) {
      touch = ev.touches[i];
      el = touchElements[touch.identifier];
      if (!el) {
        el = touchElements[touch.identifier] = document.createElement("touch-point");
        document.body.appendChild(el);
      }
      styles = TouchEmulator.template(touch);
      for (var prop in styles) {
        el.style[prop] = styles[prop];
      }
    }
    if (ev.type === "touchend" || ev.type === "touchcancel") {
      for (i = 0; i < ev.changedTouches.length; i++) {
        touch = ev.changedTouches[i];
        el = touchElements[touch.identifier];
        if (el) {
          el.parentNode.removeChild(el);
          delete touchElements[touch.identifier];
        }
      }
    }
  }
  function TouchEmulator() {
    if (hasTouchSupport()) {
      return;
    }
    fakeTouchSupport();
    window.addEventListener("mousedown", onMouse("touchstart"), true);
    window.addEventListener("mousemove", onMouse("touchmove"), true);
    window.addEventListener("mouseup", onMouse("touchend"), true);
    window.addEventListener("click", onClick, true);
    window.addEventListener("mouseenter", preventMouseEvents, true);
    window.addEventListener("mouseleave", preventMouseEvents, true);
    window.addEventListener("mouseout", preventMouseEvents, true);
    window.addEventListener("mouseover", preventMouseEvents, true);
    window.addEventListener("touchstart", showTouches, true);
    window.addEventListener("touchmove", showTouches, true);
    window.addEventListener("touchend", showTouches, true);
    window.addEventListener("touchcancel", showTouches, true);
  }
  TouchEmulator.multiTouchOffset = 75;
  TouchEmulator.ignoreTags = ["TEXTAREA", "INPUT", "SELECT"];
  TouchEmulator.template = (touch) => {
    var size = 30;
    var transform = `translate(${touch.clientX - size / 2}px, ${touch.clientY - size / 2}px)`;
    return {
      position: "fixed",
      left: 0,
      top: 0,
      background: "#fff",
      border: "solid 1px #999",
      opacity: 0.6,
      borderRadius: "100%",
      height: `${size}px`,
      width: `${size}px`,
      padding: 0,
      margin: 0,
      display: "block",
      overflow: "hidden",
      pointerEvents: "none",
      webkitUserSelect: "none",
      mozUserSelect: "none",
      userSelect: "none",
      webkitTransform: transform,
      mozTransform: transform,
      transform,
      zIndex: 100
    };
  };

  // src/touch-emulator/touch-state.ts
  var touchState = {
    /**
     * 是否取消 tap 事件
     * 当页面滚动后，需要取消 tap 事件的触发
     */
    cancelTap: false
  };

  // src/touch-emulator/scroll-emulator.ts
  function getScrollTarget(e) {
    let target = window;
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
    let scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
    const nodePaths = e.composedPath ? e.composedPath() : e.path;
    const scrollViewIndex = nodePaths.findIndex((ele) => {
      return ele.is === "scroll-view";
    });
    if (scrollViewIndex > -1) {
      const scrollViewElement = nodePaths[scrollViewIndex];
      target = scrollViewElement;
      scrollTop = scrollViewElement.getScrollTop();
      scrollLeft = scrollViewElement.getScrollLeft();
      return { target, scrollTop, scrollLeft };
    }
    return { window, scrollTop, scrollLeft };
  }
  function ScrollEmulator() {
    let prevY = 0;
    let prevX = 0;
    let initSt = 0;
    let initSl = 0;
    window.document.addEventListener(
      "touchstart",
      (e) => {
        touchState.cancelTap = false;
        prevY = e.touches[0].screenY;
        prevX = e.touches[0].screenX;
        const { scrollTop, scrollLeft } = getScrollTarget(e);
        initSt = scrollTop;
        initSl = scrollLeft;
      },
      { passive: false, capture: true }
    );
    window.document.addEventListener(
      "touchmove",
      (e) => {
        const paths = e.composedPath ? e.composedPath() : e.path;
        const scrollViewIndex = paths.findIndex((ele) => {
          return ["scroll-view"].indexOf(ele.is) > -1;
        });
        const childPaths = paths.slice(0, scrollViewIndex);
        const hasBreakScrollElement = childPaths.some((elm, _index) => {
          return ["movable-view", "slider", "picker", "picker-view"].indexOf(elm.is) >= 0;
        });
        const hasCatch = childPaths.some((ele) => {
          if (!ele.__vnode) {
            return false;
          }
          return !!ele.__vnode.events?.touchmove?.catch;
        });
        const { target, window: window2 } = getScrollTarget(e);
        const Y = e.touches[0].screenY;
        const X = e.touches[0].screenX;
        const moveY = prevY - Y;
        const moveX = prevX - X;
        const newScrollTop = initSt + moveY;
        const newScrollLeft = initSl + moveX;
        if (!hasBreakScrollElement && !hasCatch) {
          if (target) {
            if (newScrollTop >= 0 || newScrollLeft >= 0) {
              target.applyScrollTo({
                top: newScrollTop,
                left: newScrollLeft,
                behavior: "auto"
              });
            }
          } else if (window2) {
            window2.scrollTo({
              top: newScrollTop,
              left: newScrollLeft,
              behavior: "auto"
            });
          }
          touchState.cancelTap = true;
        } else {
          touchState.cancelTap = false;
        }
      },
      { passive: false }
    );
  }

  // src/platform/setup.ts
  var platformReady = false;
  function setupPlatform() {
    if (platformReady) {
      return;
    }
    platformReady = true;
    TouchEmulator();
    ScrollEmulator();
    listenDocumentEvent();
    installBuiltinEvents();
    initResetCss();
  }
  function isPlatformReady() {
    return platformReady;
  }

  // src/sjs/getRegExp.ts
  var getRegExp = (pattern, flags) => new RegExp(pattern, flags);

  // src/sjs/vConstructor.ts
  Object.defineProperty(Object.prototype, "v_constructor", { writable: true, value: "Object" });
  Object.defineProperty(Function.prototype, "v_constructor", { writable: true, value: "Function" });
  Object.defineProperty(Array.prototype, "v_constructor", { writable: true, value: "Array" });
  Object.defineProperty(Number.prototype, "v_constructor", { writable: true, value: "Number" });
  Object.defineProperty(String.prototype, "v_constructor", { writable: true, value: "String" });
  Object.defineProperty(Boolean.prototype, "v_constructor", { writable: true, value: "Boolean" });

  // src/api/index.ts
  var api_exports = {};
  __export(api_exports, {
    SelectorQuery: () => SelectorQuery,
    createSelectorQuery: () => createSelectorQuery,
    getSystemInfo: () => getSystemInfo,
    getSystemInfoSync: () => getSystemInfoSync,
    nextTick: () => nextTick
  });

  // src/api/getSystemInfo.ts
  var getSystemInfo = (options) => {
    options.success(mockSystemInfo);
  };
  var getSystemInfoSync = () => mockSystemInfo;
  var mockSystemInfo = {
    SDKVersion: "2.30.20",
    bluetoothEnabled: true,
    brand: "devtools",
    cameraAuthorized: true,
    deviceOrientation: "portrait",
    is24Hour: false,
    language: "zh",
    locationAuthorized: true,
    locationEnabled: true,
    microphoneAuthorized: true,
    model: "iPhone 6/7/8",
    notificationAuthorized: false,
    pixelRatio: window.devicePixelRatio,
    platform: "devtools",
    safeArea: { bottom: 667, height: 647, left: 0, right: 375, top: 20, width: 375 },
    screenHeight: 667,
    screenWidth: 375,
    statusBarHeight: 20,
    system: "iOS 10.0.1",
    theme: "light",
    timezoneId: "Asia/Shanghai",
    wifiEnabled: true,
    windowHeight: 603,
    windowWidth: 375
  };

  // src/api/nextTick.ts
  var nextTick = (callback) => {
    setTimeout(callback, 0);
  };

  // src/index.ts
  setupPlatform();
  var MpComponent = {
    define,
    Component,
    Behavior,
    setComponentCurrent,
    getComponentOptions,
    clearComponentCurrent,
    setupTymlEnv,
    setupPlatform,
    getComponentInnerElement,
    /** @deprecated Use getComponentInnerElement (Light DOM host) */
    getShadowInnerElement,
    resolveRuntimeFromHost,
    getRegExp,
    __REPLACE_PROPERTY__: (k) => k === "constructor" ? "v_constructor" : k,
    ty: api_exports,
    getCurrentPages: () => [],
    webEvents
  };
  return __toCommonJS(index_exports);
})();
globalThis.getDate ??= function(...args) { return new Date(...args); };
MpComponent.MpComponent.ty.createAnimation ??= function(options = {}) {
  let actions = [];
  let animates = [];
  const animation = {
    step(stepOptions = {}) {
      actions.push({ animates, option: { ...options, ...stepOptions } });
      animates = [];
      return animation;
    },
    export() {
      const result = { actions };
      actions = [];
      return result;
    }
  };
  for (const type of ['height', 'top', 'translateX', 'translateY', 'opacity', 'scale', 'rotate']) {
    animation[type] = (...args) => {
      animates.push({ type, args });
      return animation;
    };
  }
  return animation;
};
globalThis.MpComponent = MpComponent.MpComponent; globalThis.ty = MpComponent.ty; globalThis.wx = MpComponent.ty; globalThis.Behavior = MpComponent.Behavior; globalThis.Component = MpComponent.Component; globalThis.getRegExp = MpComponent.getRegExp; globalThis.__REPLACE_PROPERTY__ = MpComponent.__REPLACE_PROPERTY__;
//# sourceMappingURL=index.js.map