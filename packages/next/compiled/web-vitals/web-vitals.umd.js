(function(){var e={296:function(e,t){!function(e,l){true?l(t):0}(this,(function(e){"use strict";var t,l,g,h,a=function(e,t){return{name:e,value:void 0===t?-1:t,delta:0,entries:[],id:"v2-".concat(Date.now(),"-").concat(Math.floor(8999999999999*Math.random())+1e12)}},o=function(e,t){try{if(PerformanceObserver.supportedEntryTypes.includes(e)){if("first-input"===e&&!("PerformanceEventTiming"in self))return;var l=new PerformanceObserver((function(e){return e.getEntries().map(t)}));return l.observe({type:e,buffered:!0}),l}}catch(e){}},u=function(e,t){var l=function n(l){"pagehide"!==l.type&&"hidden"!==document.visibilityState||(e(l),t&&(removeEventListener("visibilitychange",n,!0),removeEventListener("pagehide",n,!0)))};addEventListener("visibilitychange",l,!0),addEventListener("pagehide",l,!0)},c=function(e){addEventListener("pageshow",(function(t){t.persisted&&e(t)}),!0)},f=function(e,t,l){var g;return function(h){t.value>=0&&(h||l)&&(t.delta=t.value-(g||0),(t.delta||void 0===g)&&(g=t.value,e(t)))}},y=-1,d=function(){return"hidden"===document.visibilityState?0:1/0},m=function(){u((function(e){var t=e.timeStamp;y=t}),!0)},v=function(){return y<0&&(y=d(),m(),c((function(){setTimeout((function(){y=d(),m()}),0)}))),{get firstHiddenTime(){return y}}},p=function(e,t){var l,g=v(),h=a("FCP"),u=function(e){"first-contentful-paint"===e.name&&(w&&w.disconnect(),e.startTime<g.firstHiddenTime&&(h.value=e.startTime,h.entries.push(e),l(!0)))},y=performance.getEntriesByName&&performance.getEntriesByName("first-contentful-paint")[0],w=y?null:o("paint",u);(y||w)&&(l=f(e,h,t),y&&u(y),c((function(g){h=a("FCP"),l=f(e,h,t),requestAnimationFrame((function(){requestAnimationFrame((function(){h.value=performance.now()-g.timeStamp,l(!0)}))}))})))},w=!1,b=-1,_={passive:!0,capture:!0},F=new Date,T=function(e,h){t||(t=h,l=e,g=new Date,L(removeEventListener),E())},E=function(){if(l>=0&&l<g-F){var e={entryType:"first-input",name:t.type,target:t.target,cancelable:t.cancelable,startTime:t.timeStamp,processingStart:t.timeStamp+l};h.forEach((function(t){t(e)})),h=[]}},S=function(e){if(e.cancelable){var t=(e.timeStamp>1e12?new Date:performance.now())-e.timeStamp;"pointerdown"==e.type?function(e,t){var n=function(){T(e,t),r()},i=function(){r()},r=function(){removeEventListener("pointerup",n,_),removeEventListener("pointercancel",i,_)};addEventListener("pointerup",n,_),addEventListener("pointercancel",i,_)}(t,e):T(t,e)}},L=function(e){["mousedown","keydown","touchstart","pointerdown"].forEach((function(t){return e(t,S,_)}))},P=new Set;e.getCLS=function(e,t){w||(p((function(e){b=e.value})),w=!0);var l,i=function(t){b>-1&&e(t)},g=a("CLS",0),h=0,y=[],m=function(e){if(!e.hadRecentInput){var t=y[0],w=y[y.length-1];h&&e.startTime-w.startTime<1e3&&e.startTime-t.startTime<5e3?(h+=e.value,y.push(e)):(h=e.value,y=[e]),h>g.value&&(g.value=h,g.entries=y,l())}},_=o("layout-shift",m);_&&(l=f(i,g,t),u((function(){_.takeRecords().map(m),l(!0)})),c((function(){h=0,b=-1,g=a("CLS",0),l=f(i,g,t)})))},e.getFCP=p,e.getFID=function(e,g){var y,w=v(),b=a("FID"),p=function(e){e.startTime<w.firstHiddenTime&&(b.value=e.processingStart-e.startTime,b.entries.push(e),y(!0))},_=o("first-input",p);y=f(e,b,g),_&&u((function(){_.takeRecords().map(p),_.disconnect()}),!0),_&&c((function(){var w;b=a("FID"),y=f(e,b,g),h=[],l=-1,t=null,L(addEventListener),w=p,h.push(w),E()}))},e.getLCP=function(e,t){var l,g=v(),h=a("LCP"),s=function(e){var t=e.startTime;t<g.firstHiddenTime&&(h.value=t,h.entries.push(e)),l()},y=o("largest-contentful-paint",s);if(y){l=f(e,h,t);var m=function(){P.has(h.id)||(y.takeRecords().map(s),y.disconnect(),P.add(h.id),l(!0))};["keydown","click"].forEach((function(e){addEventListener(e,m,{once:!0,capture:!0})})),u(m,!0),c((function(g){h=a("LCP"),l=f(e,h,t),requestAnimationFrame((function(){requestAnimationFrame((function(){h.value=performance.now()-g.timeStamp,P.add(h.id),l(!0)}))}))}))}},e.getTTFB=function(e){var t,l=a("TTFB");t=function(){try{var t=performance.getEntriesByType("navigation")[0]||function(){var e=performance.timing,t={entryType:"navigation",startTime:0};for(var l in e)"navigationStart"!==l&&"toJSON"!==l&&(t[l]=Math.max(e[l]-e.navigationStart,0));return t}();if(l.value=l.delta=t.responseStart,l.value<0)return;l.entries=[t],e(l)}catch(e){}},"complete"===document.readyState?setTimeout(t,0):addEventListener("pageshow",t)},Object.defineProperty(e,"__esModule",{value:!0})}))}};if(typeof __nccwpck_require__!=="undefined")__nccwpck_require__.ab=__dirname+"/";var t={};e[296](0,t);module.exports=t})();