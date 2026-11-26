(function(){
  'use strict';

  const TAG = 'smart-slider';
  const ATTRS = [
    'disabled','hide-thumb-button','class-name','style','is-vertical','value','default-value',
    'min','max','step','force-step','max-track-width','max-track-height','max-track-radius',
    'max-track-color','min-track-width','min-track-height','min-track-radius','min-track-color',
    'thumb-width','thumb-height','thumb-radius','thumb-color','thumb-border-style',
    'thumb-box-shadow-style','thumb-style','thumb-wrap-style','is-show-ticks','tick-width',
    'tick-height','tick-radius','max-track-tick-color','min-track-tick-color','step-style','active-step-style','track-style',
    'bar-style','enable-touch','parcel','parcel-margin','use-parcel-padding',
    'thumb-style-render-formatter','thumb-style-render-value-scale',
    'thumb-style-render-value-start','thumb-style-render-value-reverse',
    'infer-thumb-bg-color-from-track-bg-color'
  ];
  const BOOL_ATTRS = new Set([
    'disabled','hide-thumb-button','is-vertical','is-show-ticks','enable-touch','parcel',
    'use-parcel-padding','thumb-style-render-value-reverse','infer-thumb-bg-color-from-track-bg-color'
  ]);
  const TRUE_DEFAULTS = new Set(['enable-touch','use-parcel-padding']);

  function camel(name){return name.replace(/-([a-z])/g,(_,c)=>c.toUpperCase());}
  function esc(v){return String(v == null ? '' : v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function parseJSON(v, fallback){if(v==null||v==='')return fallback;try{return JSON.parse(v)}catch{return fallback}}
  function num(v, fallback){if(v==null||v==='')return fallback;const n=Number(v);return Number.isFinite(n)?n:fallback;}
  function cssSize(v, fallback){if(v==null||v==='')return fallback;const s=String(v);return /^-?\d+(\.\d+)?$/.test(s)?s+'px':s;}
  function clamp(value, min, max){return Math.min(max, Math.max(min, value));}
  function stepDecimals(step){const s=String(step);return s.includes('.') ? s.length - s.indexOf('.') - 1 : 0;}
  function toStyle(value){
    if(!value)return '';
    if(typeof value === 'string')return value;
    if(typeof value !== 'object')return '';
    return Object.keys(value).map(key => key.replace(/[A-Z]/g,m=>'-'+m.toLowerCase()) + ':' + value[key]).join(';');
  }
  function styleValue(styleText, prop){
    const text=toStyle(parseJSON(styleText, styleText));
    if(!text)return '';
    const found=text.split(';').map(s=>s.trim()).filter(Boolean).map(s=>s.split(':')).find(pair => pair[0] && pair[0].trim() === prop);
    return found ? found.slice(1).join(':').trim() : '';
  }

  class SmartSlider extends HTMLElement{
    static get observedAttributes(){
      return ATTRS.concat([
        'vertical','active-color','inactive-color','bar-height','disable','show-steps'
      ], ATTRS.map(a=>a.replace(/-/g,''))).filter((v,i,a)=>a.indexOf(v)===i);
    }

    constructor(){
      super();
      this.attachShadow({mode:'open'});
      this._value = 0;
      this._dragging = false;
      this._dragStarted = false;
      this._startValue = 0;
      this._startPointer = 0;
      this._trackRect = null;
      this._lastPointerDownAt = 0;
      this._onMove = this._onMove.bind(this);
      this._onUp = this._onUp.bind(this);
    }

    connectedCallback(){
      this._value = this._normalize(this._readValue());
      this.render();
    }

    disconnectedCallback(){
      window.removeEventListener('pointermove', this._onMove);
      window.removeEventListener('pointerup', this._onUp);
      window.removeEventListener('pointercancel', this._onUp);
    }

    attributeChangedCallback(name){
      if(name === 'value' || name === 'default-value' || name === 'defaultvalue' || name === 'min' || name === 'max' || name === 'step'){
        this._value = this._normalize(this._readValue());
      }
      if(this.isConnected) this.render();
    }

    get value(){return this._value;}
    set value(value){this.setAttribute('value', String(value));}

    _attr(name, fallback=''){
      let value=this.getAttribute(name);
      if(value==null)value=this.getAttribute(name.replace(/-/g,''));
      if(value==null){
        const aliases = {
          'is-vertical':'vertical',
          'disabled':'disable',
          'is-show-ticks':'show-steps',
          'min-track-color':'active-color',
          'max-track-color':'inactive-color',
          'max-track-height':'bar-height',
          'min-track-height':'bar-height'
        };
        if(aliases[name]) value=this.getAttribute(aliases[name]);
      }
      return value==null?fallback:value;
    }

    _bool(name, fallback=false){
      const value=this._attr(name, null);
      if(value==null)return fallback;
      return value !== 'false';
    }

    _num(name, fallback){return num(this._attr(name, null), fallback);}
    _min(){return this._num('min', 0);}
    _max(){const min=this._min();const max=this._num('max',100);return max > min ? max : min + 100;}
    _step(){const step=this._num('step',1);return step === 0 ? 1 : step;}
    _vertical(){return this._bool('is-vertical') || this._attr('direction','') === 'vertical';}
    _disabled(){return this._bool('disabled') || this._bool('disable');}

    _readValue(){
      const raw=this._attr('value', null);
      if(raw!=null)return num(raw, this._min());
      return this._num('default-value', 0);
    }

    _normalize(value){
      const min=this._min(), max=this._max(), step=this._step();
      const safe=clamp(num(value, min), min, max);
      const snapped=step > 0 ? Math.round((safe - min) / step) * step + min : safe;
      return +Number(clamp(snapped, min, max)).toFixed(stepDecimals(step));
    }

    _percent(value=this._value){
      const min=this._min(), max=this._max();
      const ratio=(value - min) / (max - min);
      return clamp(ratio, 0, 1);
    }

    _displayRatio(){
      return this._percent();
    }

    _emit(name, detail){
      this.dispatchEvent(new CustomEvent(name,{detail,bubbles:true,composed:true}));
    }

    _setValue(value, options){
      const next=this._normalize(value);
      this._value=next;
      if(this.getAttribute('value') !== String(next)) this.setAttribute('value', String(next));
      this.render();
      if(options && options.change) this._emit('change', next);
      if(options && options.after) {
        this._emit('after-change', next);
        this._emit('end', { value: next, end: next, min: this._min(), max: this._max() });
      }
    }

    _valueFromPointer(event, rect){
      const vertical=this._vertical();
      const total=vertical ? rect.height : rect.width;
      if(!total)return this._value;
      let ratio=vertical ? (event.clientY - rect.top) / total : (event.clientX - rect.left) / total;
      ratio=clamp(ratio, 0, 1);
      if(vertical) ratio=1 - ratio;
      return this._min() + ratio * (this._max() - this._min());
    }

    render(){
      const vertical=this._vertical();
      const disabled=this._disabled();
      const parcel=this._bool('parcel');
      const hideThumb=this._bool('hide-thumb-button') || parcel;
      const showTicks=this._bool('is-show-ticks') || this._bool('show-steps');
      const min=this._min(), max=this._max(), step=this._step();
      const ratio=this._displayRatio();
      const pct=ratio * 100;
      const trackStyle=toStyle(parseJSON(this._attr('track-style', null), this._attr('track-style','')));
      const barStyle=toStyle(parseJSON(this._attr('bar-style', null), this._attr('bar-style','')));
      const thumbStyle=toStyle(parseJSON(this._attr('thumb-style', null), this._attr('thumb-style','')));
      const thumbWrapStyle=toStyle(parseJSON(this._attr('thumb-wrap-style', null), this._attr('thumb-wrap-style','')));
      const maxTrackWidth=cssSize(this._attr('max-track-width','100%'),'100%');
      const maxTrackHeight=cssSize(this._attr('max-track-height','4px'),'4px');
      const maxTrackRadius=cssSize(this._attr('max-track-radius','4px'),'4px');
      const maxTrackColor=this._attr('max-track-color','var(--app-B4-N7, rgba(0,0,0,.1))');
      const minTrackWidth=cssSize(this._attr('min-track-width','28px'),'28px');
      const minTrackHeight=cssSize(this._attr('min-track-height','4px'),'4px');
      const minTrackRadius=cssSize(this._attr('min-track-radius','inherit'),'inherit');
      const minTrackColor=this._attr('min-track-color','#158CFB');
      const thumbWidth=cssSize(this._attr('thumb-width','28px'),'28px');
      const thumbHeight=cssSize(this._attr('thumb-height','28px'),'28px');
      const thumbRadius=cssSize(this._attr('thumb-radius','28px'),'28px');
      const thumbColor=this._attr('thumb-color','#ffffff');
      const thumbBorderStyle=this._attr('thumb-border-style','0px solid #ffffff');
      const thumbBoxShadowStyle=this._attr('thumb-box-shadow-style','0px 0.5px 4px rgba(0,0,0,.12), 0px 6px 13px rgba(0,0,0,.12)');
      const stepStyleText=this._attr('step-style','');
      const activeStepStyleText=this._attr('active-step-style','');
      const tickWidth=cssSize(this._attr('tick-width', styleValue(stepStyleText, 'width') || '4px'),'4px');
      const tickHeight=cssSize(this._attr('tick-height', styleValue(stepStyleText, 'height') || '12px'),'12px');
      const tickRadius=cssSize(this._attr('tick-radius', styleValue(stepStyleText, 'border-radius') || '4px'),'4px');
      const inactiveTickColor=styleValue(stepStyleText, 'background') || styleValue(stepStyleText, 'background-color') || this._attr('max-track-tick-color','#158CFB');
      const activeTickColor=styleValue(activeStepStyleText, 'background') || styleValue(activeStepStyleText, 'background-color') || this._attr('min-track-tick-color','#ffffff');
      const tickCount=Math.max(0, Math.floor((max - min) / step));
      const ticks=Array.from({length: tickCount + 1}, (_,i)=>`<i style="width:${tickWidth};height:${tickHeight};border-radius:${tickRadius}"></i>`).join('');
      const barExtra = parcel ? minTrackWidth : '0px';
      const barMin = parcel ? minTrackWidth : '0px';
      const barMain=vertical ? `height:calc(${pct}% + ${barExtra});bottom:0;width:${minTrackWidth};min-height:${barMin};` : `width:calc(${pct}% + ${barExtra});left:0;height:${minTrackHeight};min-width:${barMin};`;
      const thumbPos=vertical ? `bottom:${pct}%;transform:translate(50%, 50%);right:50%;` : `left:${pct}%;transform:translate(-50%, -50%);top:50%;`;
      const activeTicksClip=vertical ? `clip-path:inset(${100 - pct}% 0 0 0);` : `clip-path:inset(0 ${100 - pct}% 0 0);`;
      this.shadowRoot.innerHTML = `
        <style>
          :host{display:${vertical?'inline-block':'block'};box-sizing:border-box;touch-action:none;font-family:inherit;color:inherit}
          *{box-sizing:border-box}
          .wrap{border-radius:5px;${vertical?'display:inline-block;padding:0 10px;':''}}
          .track{position:relative;display:flex;align-items:center;border-radius:${maxTrackRadius};background:${esc(maxTrackColor)};width:${maxTrackWidth};height:${maxTrackHeight};min-${vertical?'height':'width'}:${vertical?'120px':'120px'};${disabled?'pointer-events:none;opacity:.45;':''}${trackStyle}}
          .track:before{content:'';position:absolute;${vertical?'top:0;bottom:0;left:-8px;right:-8px;':'left:0;right:0;top:-8px;bottom:-8px;'}}
          .bar{position:absolute;z-index:1;display:block;border-radius:${minTrackRadius};background:${esc(minTrackColor)};overflow:hidden;${barMain}${barStyle}}
          .thumb{position:absolute;z-index:4;display:${hideThumb?'none':'block'};${thumbPos}${thumbWrapStyle}}
          .thumb-render{width:${thumbWidth};height:${thumbHeight};border-radius:${thumbRadius};background:${esc(thumbColor)};border:${esc(thumbBorderStyle)};box-shadow:${esc(thumbBoxShadowStyle)};cursor:pointer;${thumbStyle}}
          .parcel-thumb{position:absolute;display:${parcel?'block':'none'};width:${cssSize(this._attr('parcel-thumb-width','18px'),'18px')};height:${cssSize(this._attr('parcel-thumb-height','18px'),'18px')};border-radius:${thumbRadius};background:${esc(thumbColor)};${vertical?'left:50%;bottom:'+this._num('parcel-margin',0)+'px;transform:translateX(-50%);':'right:'+this._num('parcel-margin',0)+'px;top:50%;transform:translateY(-50%);'}${thumbStyle}}
          .ticks,.active-ticks{position:absolute;inset:0;display:${showTicks?'flex':'none'};justify-content:space-between;align-items:center;pointer-events:none;${vertical?'flex-direction:column;padding:14px 0;':'padding:0 14px;'}}
          .ticks{z-index:2}
          .ticks i{display:block;background:${esc(inactiveTickColor)}}
          .active-ticks{z-index:3;overflow:hidden;${activeTicksClip}}
          .active-ticks i{display:block;background:${esc(activeTickColor)}}
        </style>
        <div class="wrap" part="root">
          <div class="track" part="track" role="slider" aria-valuemin="${esc(min)}" aria-valuemax="${esc(max)}" aria-valuenow="${esc(this._value)}">
            <div class="ticks">${ticks}</div>
            <div class="active-ticks">${ticks}</div>
            <div class="bar" part="bar">
              <slot name="bar"></slot>
              <div class="parcel-thumb"></div>
            </div>
            <slot name="track"></slot>
            <div class="thumb" part="thumb-wrap">
              <div class="thumb-render" part="thumb"><slot name="thumb"><slot name="button"></slot></slot></div>
            </div>
          </div>
        </div>`;
      this._bind();
    }

    _bind(){
      const track=this.shadowRoot.querySelector('.track');
      const thumb=this.shadowRoot.querySelector('.thumb');
      const start = event => this._onPointerDown(event);
      if(track && this._bool('enable-touch', true)) track.addEventListener('pointerdown', start);
      if(track && this._bool('enable-touch', true)) track.addEventListener('click', event => {
        if(Date.now() - this._lastPointerDownAt < 350) return;
        if(this._dragging) return;
        this._emit('before-change', this._value);
        this._emit('start', { value: this._value, end: this._value, min: this._min(), max: this._max() });
        this._setValue(this._valueFromPointer(event, track.getBoundingClientRect()), { change:true, after:true });
      });
      if(thumb) thumb.addEventListener('pointerdown', event => { event.stopPropagation(); this._onPointerDown(event, true); });
      if(thumb) thumb.addEventListener('click', event => event.stopPropagation());
    }

    _onPointerDown(event, fromThumb){
      if(this._disabled())return;
      const track=this.shadowRoot.querySelector('.track');
      this._lastPointerDownAt = Date.now();
      this._trackRect=track.getBoundingClientRect();
      this._dragging=true;
      this._dragStarted=false;
      this._startValue=this._value;
      this._startPointer=this._vertical() ? event.clientY : event.clientX;
      try {
        if(track.setPointerCapture && event.pointerId != null) track.setPointerCapture(event.pointerId);
      } catch (e) {}
      this._emit('before-change', this._value);
      this._emit('start', { value: this._value, end: this._value, min: this._min(), max: this._max() });
      if(!fromThumb){
        this._setValue(this._valueFromPointer(event, this._trackRect), { change:true });
      }
      window.addEventListener('pointermove', this._onMove);
      window.addEventListener('pointerup', this._onUp, { once:true });
      window.addEventListener('pointercancel', this._onUp, { once:true });
    }

    _onMove(event){
      if(!this._dragging || !this._trackRect)return;
      this._dragStarted=true;
      this._setValue(this._valueFromPointer(event, this._trackRect), { change:true });
    }

    _onUp(){
      window.removeEventListener('pointermove', this._onMove);
      window.removeEventListener('pointercancel', this._onUp);
      if(this._dragging) this._setValue(this._value, { after:true });
      this._dragging=false;
      this._dragStarted=false;
    }
  }

  for(const attr of ATTRS){
    const prop=camel(attr);
    if(!(prop in SmartSlider.prototype)){
      Object.defineProperty(SmartSlider.prototype, prop, {
        get(){
          if(BOOL_ATTRS.has(attr))return this._bool(attr, TRUE_DEFAULTS.has(attr));
          const value=this._attr(attr, null);
          if(value==null)return '';
          if(/^\s*[\[{]/.test(value))return parseJSON(value, value);
          return value;
        },
        set(value){
          if(value==null || value===false){this.removeAttribute(attr);return;}
          if(typeof value === 'object')this.setAttribute(attr, JSON.stringify(value));
          else if(value === true && BOOL_ATTRS.has(attr))this.setAttribute(attr, '');
          else this.setAttribute(attr, String(value));
        }
      });
    }
  }

  if(!customElements.get(TAG)) customElements.define(TAG, SmartSlider);
})();
