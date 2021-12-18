(()=>{"use strict";var e={802:e=>{e.exports=require("next/dist/compiled/web-streams-polyfill")},837:e=>{e.exports=require("util")},707:function(e,t,r){
/*! Based on fetch-blob. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> & David Frank */
var n=this&&this.__classPrivateFieldGet||function(e,t,r,n){if(r==="a"&&!n)throw new TypeError("Private accessor was defined without a getter");if(typeof t==="function"?e!==t||!n:!t.has(e))throw new TypeError("Cannot read private member from an object whose class did not declare it");return r==="m"?n:r==="a"?n.call(e):n?n.value:t.get(e)};var i=this&&this.__classPrivateFieldSet||function(e,t,r,n,i){if(n==="m")throw new TypeError("Private method is not writable");if(n==="a"&&!i)throw new TypeError("Private accessor was defined without a setter");if(typeof t==="function"?e!==t||!i:!t.has(e))throw new TypeError("Cannot write private member to an object whose class did not declare it");return n==="a"?i.call(e,r):i?i.value=r:t.set(e,r),r};var o,s,a;Object.defineProperty(t,"__esModule",{value:true});t.Blob=void 0;const l=r(802);const c=r(550);const u=r(131);class Blob{constructor(e=[],t={}){o.set(this,[]);s.set(this,"");a.set(this,0);t!==null&&t!==void 0?t:t={};if(typeof e!=="object"||e===null){throw new TypeError("Failed to construct 'Blob': "+"The provided value cannot be converted to a sequence.")}if(!(0,c.isFunction)(e[Symbol.iterator])){throw new TypeError("Failed to construct 'Blob': "+"The object must have a callable @@iterator property.")}if(typeof t!=="object"&&!(0,c.isFunction)(t)){throw new TypeError("Failed to construct 'Blob': parameter 2 cannot convert to dictionary.")}const r=new TextEncoder;for(const t of e){let e;if(ArrayBuffer.isView(t)){e=new Uint8Array(t.buffer.slice(t.byteOffset,t.byteOffset+t.byteLength))}else if(t instanceof ArrayBuffer){e=new Uint8Array(t.slice(0))}else if(t instanceof Blob){e=t}else{e=r.encode(String(t))}i(this,a,n(this,a,"f")+(ArrayBuffer.isView(e)?e.byteLength:e.size),"f");n(this,o,"f").push(e)}const l=t.type===undefined?"":String(t.type);i(this,s,/^[\x20-\x7E]*$/.test(l)?l:"","f")}static[(o=new WeakMap,s=new WeakMap,a=new WeakMap,Symbol.hasInstance)](e){return Boolean(e&&typeof e==="object"&&(0,c.isFunction)(e.constructor)&&((0,c.isFunction)(e.stream)||(0,c.isFunction)(e.arrayBuffer))&&/^(Blob|File)$/.test(e[Symbol.toStringTag]))}get type(){return n(this,s,"f")}get size(){return n(this,a,"f")}slice(e,t,r){return new Blob((0,u.sliceBlob)(n(this,o,"f"),this.size,e,t),{type:r})}async text(){const e=new TextDecoder;let t="";for await(const r of(0,u.consumeBlobParts)(n(this,o,"f"))){t+=e.decode(r,{stream:true})}t+=e.decode();return t}async arrayBuffer(){const e=new Uint8Array(this.size);let t=0;for await(const r of(0,u.consumeBlobParts)(n(this,o,"f"))){e.set(r,t);t+=r.length}return e.buffer}stream(){const e=(0,u.consumeBlobParts)(n(this,o,"f"),true);return new l.ReadableStream({async pull(t){const{value:r,done:n}=await e.next();if(n){return queueMicrotask((()=>t.close()))}t.enqueue(r)},async cancel(){await e.return()}})}get[Symbol.toStringTag](){return"Blob"}}t.Blob=Blob;Object.defineProperties(Blob.prototype,{type:{enumerable:true},size:{enumerable:true},slice:{enumerable:true},stream:{enumerable:true},text:{enumerable:true},arrayBuffer:{enumerable:true}})},852:function(e,t,r){var n=this&&this.__classPrivateFieldSet||function(e,t,r,n,i){if(n==="m")throw new TypeError("Private method is not writable");if(n==="a"&&!i)throw new TypeError("Private accessor was defined without a setter");if(typeof t==="function"?e!==t||!i:!t.has(e))throw new TypeError("Cannot write private member to an object whose class did not declare it");return n==="a"?i.call(e,r):i?i.value=r:t.set(e,r),r};var i=this&&this.__classPrivateFieldGet||function(e,t,r,n){if(r==="a"&&!n)throw new TypeError("Private accessor was defined without a getter");if(typeof t==="function"?e!==t||!n:!t.has(e))throw new TypeError("Cannot read private member from an object whose class did not declare it");return r==="m"?n:r==="a"?n.call(e):n?n.value:t.get(e)};var o,s;Object.defineProperty(t,"__esModule",{value:true});t.File=void 0;const a=r(707);class File extends a.Blob{constructor(e,t,r={}){super(e,r);o.set(this,void 0);s.set(this,0);if(arguments.length<2){throw new TypeError("Failed to construct 'File': 2 arguments required, "+`but only ${arguments.length} present.`)}n(this,o,String(t),"f");const i=r.lastModified===undefined?Date.now():Number(r.lastModified);if(!Number.isNaN(i)){n(this,s,i,"f")}}get name(){return i(this,o,"f")}get lastModified(){return i(this,s,"f")}get[(o=new WeakMap,s=new WeakMap,Symbol.toStringTag)](){return"File"}}t.File=File},343:function(e,t,r){var n=this&&this.__classPrivateFieldGet||function(e,t,r,n){if(r==="a"&&!n)throw new TypeError("Private accessor was defined without a getter");if(typeof t==="function"?e!==t||!n:!t.has(e))throw new TypeError("Cannot read private member from an object whose class did not declare it");return r==="m"?n:r==="a"?n.call(e):n?n.value:t.get(e)};var i=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};var o,s,a;Object.defineProperty(t,"__esModule",{value:true});t.FormData=void 0;const l=r(837);const c=r(852);const u=r(305);const f=r(550);const d=r(340);const h=i(r(223));class FormData{constructor(e){o.add(this);s.set(this,new Map);if(e){(0,d.deprecateConstructorEntries)();e.forEach((({name:e,value:t,fileName:r})=>this.append(e,t,r)))}}static[(s=new WeakMap,o=new WeakSet,Symbol.hasInstance)](e){return Boolean(e&&(0,f.isFunction)(e.constructor)&&e[Symbol.toStringTag]==="FormData"&&(0,f.isFunction)(e.append)&&(0,f.isFunction)(e.set)&&(0,f.isFunction)(e.get)&&(0,f.isFunction)(e.getAll)&&(0,f.isFunction)(e.has)&&(0,f.isFunction)(e.delete)&&(0,f.isFunction)(e.entries)&&(0,f.isFunction)(e.values)&&(0,f.isFunction)(e.keys)&&(0,f.isFunction)(e[Symbol.iterator])&&(0,f.isFunction)(e.forEach))}append(e,t,r){return n(this,o,"m",a).call(this,{name:e,value:t,fileName:r,append:true,argsLength:arguments.length})}set(e,t,r){return n(this,o,"m",a).call(this,{name:e,value:t,fileName:r,append:false,argsLength:arguments.length})}get(e){const t=n(this,s,"f").get(String(e));if(!t){return null}return t[0]}getAll(e){const t=n(this,s,"f").get(String(e));if(!t){return[]}return t.slice()}has(e){return n(this,s,"f").has(String(e))}delete(e){return void n(this,s,"f").delete(String(e))}*keys(){for(const e of n(this,s,"f").keys()){yield e}}*entries(){for(const e of this.keys()){const t=this.getAll(e);for(const r of t){yield[e,r]}}}*values(){for(const[,e]of this){yield e}}[(a=function _FormData_setEntry({name:e,value:t,append:r,fileName:i,argsLength:o}){const a=r?"append":"set";e=String(e);if(o<2){throw new TypeError(`Failed to execute '${a}' on 'FormData': `+`2 arguments required, but only ${o} present.`)}let l;if((0,u.isFile)(t)){i=(0,h.default)(i===undefined?t.name:i);l=new c.File([t],i,{type:t.type,lastModified:t.lastModified})}else if(i){throw new TypeError(`Failed to execute '${a}' on 'FormData': `+"parameter 2 is not of type 'Blob'.")}else{l=String(t)}const f=n(this,s,"f").get(e);if(!f){return void n(this,s,"f").set(e,[l])}if(!r){return void n(this,s,"f").set(e,[l])}f.push(l)},Symbol.iterator)](){return this.entries()}forEach(e,t){for(const[r,n]of this){e.call(t,n,r,this)}}get[Symbol.toStringTag](){return"FormData"}[l.inspect.custom](){return this[Symbol.toStringTag]}}t.FormData=FormData},131:(e,t,r)=>{
/*! Based on fetch-blob. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> & David Frank */
Object.defineProperty(t,"__esModule",{value:true});t.sliceBlob=t.consumeBlobParts=void 0;const n=r(550);const i=65536;async function*clonePart(e){const t=e.byteOffset+e.byteLength;let r=e.byteOffset;while(r!==t){const n=Math.min(t-r,i);const o=e.buffer.slice(r,r+n);r+=o.byteLength;yield new Uint8Array(o)}}async function*consumeNodeBlob(e){let t=0;while(t!==e.size){const r=e.slice(t,Math.min(e.size,t+i));const n=await r.arrayBuffer();t+=n.byteLength;yield new Uint8Array(n)}}async function*consumeBlobParts(e,t=false){for(const r of e){if(ArrayBuffer.isView(r)){if(t){yield*clonePart(r)}else{yield r}}else if((0,n.isFunction)(r.stream)){yield*r.stream()}else{yield*consumeNodeBlob(r)}}}t.consumeBlobParts=consumeBlobParts;function*sliceBlob(e,t,r=0,n){n!==null&&n!==void 0?n:n=t;let i=r<0?Math.max(t+r,0):Math.min(r,t);let o=n<0?Math.max(t+n,0):Math.min(n,t);const s=Math.max(o-i,0);let a=0;for(const t of e){if(a>=s){break}const e=ArrayBuffer.isView(t)?t.byteLength:t.size;if(i&&e<=i){i-=e;o-=e}else{let r;if(ArrayBuffer.isView(t)){r=t.subarray(i,Math.min(e,o));a+=r.byteLength}else{r=t.slice(i,Math.min(e,o));a+=r.size}o-=e;i=0;yield r}}}t.sliceBlob=sliceBlob},340:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:true});t.deprecateConstructorEntries=void 0;const n=r(837);t.deprecateConstructorEntries=(0,n.deprecate)((()=>{}),'Constructor "entries" argument is not spec-compliant '+"and will be removed in next major release.")},30:function(e,t,r){var n=this&&this.__createBinding||(Object.create?function(e,t,r,n){if(n===undefined)n=r;Object.defineProperty(e,n,{enumerable:true,get:function(){return t[r]}})}:function(e,t,r,n){if(n===undefined)n=r;e[n]=t[r]});var i=this&&this.__exportStar||function(e,t){for(var r in e)if(r!=="default"&&!Object.prototype.hasOwnProperty.call(t,r))n(t,e,r)};Object.defineProperty(t,"__esModule",{value:true});i(r(343),t);i(r(707),t);i(r(852),t)},305:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:true});t.isFile=void 0;const n=r(852);const isFile=e=>e instanceof n.File;t.isFile=isFile},550:(e,t)=>{Object.defineProperty(t,"__esModule",{value:true});t.isFunction=void 0;const isFunction=e=>typeof e==="function";t.isFunction=isFunction},223:(e,t)=>{Object.defineProperty(t,"__esModule",{value:true});const normalizeFilename=(e="blob")=>String(e);t["default"]=normalizeFilename}};var t={};function __nccwpck_require__(r){var n=t[r];if(n!==undefined){return n.exports}var i=t[r]={exports:{}};var o=true;try{e[r].call(i.exports,i,i.exports,__nccwpck_require__);o=false}finally{if(o)delete t[r]}return i.exports}if(typeof __nccwpck_require__!=="undefined")__nccwpck_require__.ab=__dirname+"/";var r=__nccwpck_require__(30);module.exports=r})();