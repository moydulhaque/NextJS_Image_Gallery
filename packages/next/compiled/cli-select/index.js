(()=>{"use strict";var e={358:(e,t)=>{Object.defineProperty(t,"__esModule",{value:true});t.withPromise=t.withCallback=void 0;const withCallback=(e,t,r)=>{e.open();e.onSelect(((e,s)=>r(t(e,s))))};t.withCallback=withCallback;const withPromise=(e,t)=>new Promise(((r,s)=>{e.open();e.onSelect(((e,i)=>{if(e===null){s()}else{r(t(e,i))}}))}));t.withPromise=withPromise},417:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:true});t["default"]=void 0;var s=_interopRequireDefault(r(250));var i=_interopRequireDefault(r(439));var n=r(358);var u=r(868);function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function _objectSpread(e){for(var t=1;t<arguments.length;t++){var r=arguments[t]!=null?arguments[t]:{};var s=Object.keys(r);if(typeof Object.getOwnPropertySymbols==="function"){s=s.concat(Object.getOwnPropertySymbols(r).filter((function(e){return Object.getOwnPropertyDescriptor(r,e).enumerable})))}s.forEach((function(t){_defineProperty(e,t,r[t])}))}return e}function _defineProperty(e,t,r){if(t in e){Object.defineProperty(e,t,{value:r,enumerable:true,configurable:true,writable:true})}else{e[t]=r}return e}const a={outputStream:process.stdout,inputStream:process.stdin,values:[],defaultValue:0,selected:"(x)",unselected:"( )",indentation:0,cleanup:true,valueRenderer:e=>e};const creator=(e,t)=>{e=_objectSpread({},a,e);const r=new i.default(e,e.outputStream);const o=new s.default(e.inputStream);o.setDefaultValue(e.defaultValue);o.attachRenderer(r);let l;if(Array.isArray(e.values)){l=(0,u.withArrayValues)(e)}else{l=(0,u.withObjectValues)(e)}e.values=l.input;o.setValues(e.values);if(typeof t==="function"){return(0,n.withCallback)(o,l.output,t)}else{return(0,n.withPromise)(o,l.output)}};t=e.exports=creator;Object.defineProperty(t,"__esModule",{value:true});var o=creator;t["default"]=o},250:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:true});t["default"]=void 0;var s=_interopRequireDefault(r(521));function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}class Input{constructor(e=process.stdin){this.stream=e;this.values=[];this.selectedValue=0;this.onSelectListener=()=>{};this.onKeyPress=this.onKeyPress.bind(this)}setValues(e){this.values=e;if(this.renderer){this.renderer.setValues(e)}}setDefaultValue(e){this.selectedValue=e}attachRenderer(e){this.renderer=e;this.renderer.setValues(this.values)}onSelect(e){this.onSelectListener=e}open(){s.default.emitKeypressEvents(this.stream);this.stream.on("keypress",this.onKeyPress);if(this.renderer){this.renderer.render(this.selectedValue)}this.stream.setRawMode(true);this.stream.resume()}close(e=false){this.stream.setRawMode(false);this.stream.pause();if(this.renderer){this.renderer.cleanup()}if(e){this.onSelectListener(null)}else{this.onSelectListener(this.selectedValue,this.values[this.selectedValue])}this.stream.removeListener("keypress",this.onKeyPress)}render(){if(!this.renderer){return}this.renderer.render(this.selectedValue)}onKeyPress(e,t){if(t){if(t.name==="up"&&this.selectedValue>0){this.selectedValue--;this.render()}else if(t.name==="down"&&this.selectedValue+1<this.values.length){this.selectedValue++;this.render()}else if(t.name==="return"){this.close()}else if(t.name==="escape"||t.name==="c"&&t.ctrl){this.close(true)}}}}t["default"]=Input},439:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:true});t["default"]=void 0;var s=_interopRequireDefault(r(521));var i=r(974);function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}class Renderer{constructor(e,t=process.stdout){this.options=e;this.stream=t;this.values=[];this.initialRender=true}setValues(e){this.values=e}render(e=0){if(this.initialRender){this.initialRender=false;this.stream.write(i.cursorHide)}else{this.stream.write((0,i.eraseLines)(this.values.length))}this.values.forEach(((t,r)=>{const s=e===r?this.options.selected:this.options.unselected;const i=" ".repeat(this.options.indentation);const n=this.options.valueRenderer(t,e===r);const u=r!==this.values.length-1?"\n":"";this.stream.write(i+s+" "+n+u)}))}cleanup(){this.stream.write((0,i.eraseLines)(this.values.length));this.stream.write(i.cursorShow)}}t["default"]=Renderer},868:(e,t)=>{Object.defineProperty(t,"__esModule",{value:true});t.withObjectValues=t.withArrayValues=void 0;const withArrayValues=e=>({input:e.values,output:(e,t)=>({id:e,value:t})});t.withArrayValues=withArrayValues;const withObjectValues=e=>{const t=e.values;return{input:Object.values(t),output:(e,r)=>({id:Object.keys(t)[e],value:r})}};t.withObjectValues=withObjectValues},974:e=>{const t=e.exports;const r="[";const s="]";const i="";const n=";";const u=process.env.TERM_PROGRAM==="Apple_Terminal";t.cursorTo=(e,t)=>{if(typeof e!=="number"){throw new TypeError("The `x` argument is required")}if(typeof t!=="number"){return r+(e+1)+"G"}return r+(t+1)+";"+(e+1)+"H"};t.cursorMove=(e,t)=>{if(typeof e!=="number"){throw new TypeError("The `x` argument is required")}let s="";if(e<0){s+=r+-e+"D"}else if(e>0){s+=r+e+"C"}if(t<0){s+=r+-t+"A"}else if(t>0){s+=r+t+"B"}return s};t.cursorUp=e=>r+(typeof e==="number"?e:1)+"A";t.cursorDown=e=>r+(typeof e==="number"?e:1)+"B";t.cursorForward=e=>r+(typeof e==="number"?e:1)+"C";t.cursorBackward=e=>r+(typeof e==="number"?e:1)+"D";t.cursorLeft=r+"G";t.cursorSavePosition=r+(u?"7":"s");t.cursorRestorePosition=r+(u?"8":"u");t.cursorGetPosition=r+"6n";t.cursorNextLine=r+"E";t.cursorPrevLine=r+"F";t.cursorHide=r+"?25l";t.cursorShow=r+"?25h";t.eraseLines=e=>{let r="";for(let s=0;s<e;s++){r+=t.eraseLine+(s<e-1?t.cursorUp():"")}if(e){r+=t.cursorLeft}return r};t.eraseEndLine=r+"K";t.eraseStartLine=r+"1K";t.eraseLine=r+"2K";t.eraseDown=r+"J";t.eraseUp=r+"1J";t.eraseScreen=r+"2J";t.scrollUp=r+"S";t.scrollDown=r+"T";t.clearScreen="c";t.clearTerminal=process.platform==="win32"?`${t.eraseScreen}${r}0f`:`${t.eraseScreen}${r}3J${r}H`;t.beep=i;t.link=(e,t)=>[s,"8",n,n,t,i,e,s,"8",n,n,i].join("");t.image=(e,t)=>{t=t||{};let r=s+"1337;File=inline=1";if(t.width){r+=`;width=${t.width}`}if(t.height){r+=`;height=${t.height}`}if(t.preserveAspectRatio===false){r+=";preserveAspectRatio=0"}return r+":"+e.toString("base64")+i};t.iTerm={};t.iTerm.setCwd=e=>s+"50;CurrentDir="+(e||process.cwd())+i},521:e=>{e.exports=require("readline")}};var t={};function __nccwpck_require__(r){var s=t[r];if(s!==undefined){return s.exports}var i=t[r]={exports:{}};var n=true;try{e[r](i,i.exports,__nccwpck_require__);n=false}finally{if(n)delete t[r]}return i.exports}if(typeof __nccwpck_require__!=="undefined")__nccwpck_require__.ab=__dirname+"/";var r=__nccwpck_require__(417);module.exports=r})();