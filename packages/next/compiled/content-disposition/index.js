(()=>{var e={292:(e,r,t)=>{"use strict";
/*!
 * content-disposition
 * Copyright(c) 2014-2017 Douglas Christopher Wilson
 * MIT Licensed
 */e.exports=contentDisposition;e.exports.parse=parse;var n=t(17).basename;var a=t(455).Buffer;var o=/[\x00-\x20"'()*,/:;<=>?@[\\\]{}\x7f]/g;var i=/%[0-9A-Fa-f]{2}/;var f=/%([0-9A-Fa-f]{2})/g;var u=/[^\x20-\x7e\xa0-\xff]/g;var s=/\\([\u0000-\u007f])/g;var p=/([\\"])/g;var l=/;[\x09\x20]*([!#$%&'*+.0-9A-Z^_`a-z|~-]+)[\x09\x20]*=[\x09\x20]*("(?:[\x20!\x23-\x5b\x5d-\x7e\x80-\xff]|\\[\x20-\x7e])*"|[!#$%&'*+.0-9A-Z^_`a-z|~-]+)[\x09\x20]*/g;var c=/^[\x20-\x7e\x80-\xff]+$/;var v=/^[!#$%&'*+.0-9A-Z^_`a-z|~-]+$/;var d=/^([A-Za-z0-9!#$%&+\-^_`{}~]+)'(?:[A-Za-z]{2,3}(?:-[A-Za-z]{3}){0,3}|[A-Za-z]{4,8}|)'((?:%[0-9A-Fa-f]{2}|[A-Za-z0-9!#$&+.^_`|~-])+)$/;var x=/^([!#$%&'*+.0-9A-Z^_`a-z|~-]+)[\x09\x20]*(?:$|;)/;function contentDisposition(e,r){var t=r||{};var n=t.type||"attachment";var a=createparams(e,t.fallback);return format(new ContentDisposition(n,a))}function createparams(e,r){if(e===undefined){return}var t={};if(typeof e!=="string"){throw new TypeError("filename must be a string")}if(r===undefined){r=true}if(typeof r!=="string"&&typeof r!=="boolean"){throw new TypeError("fallback must be a string or boolean")}if(typeof r==="string"&&u.test(r)){throw new TypeError("fallback must be ISO-8859-1 string")}var a=n(e);var o=c.test(a);var f=typeof r!=="string"?r&&getlatin1(a):n(r);var s=typeof f==="string"&&f!==a;if(s||!o||i.test(a)){t["filename*"]=a}if(o||s){t.filename=s?f:a}return t}function format(e){var r=e.parameters;var t=e.type;if(!t||typeof t!=="string"||!v.test(t)){throw new TypeError("invalid type")}var n=String(t).toLowerCase();if(r&&typeof r==="object"){var a;var o=Object.keys(r).sort();for(var i=0;i<o.length;i++){a=o[i];var f=a.substr(-1)==="*"?ustring(r[a]):qstring(r[a]);n+="; "+a+"="+f}}return n}function decodefield(e){var r=d.exec(e);if(!r){throw new TypeError("invalid extended field value")}var t=r[1].toLowerCase();var n=r[2];var o;var i=n.replace(f,pdecode);switch(t){case"iso-8859-1":o=getlatin1(i);break;case"utf-8":o=a.from(i,"binary").toString("utf8");break;default:throw new TypeError("unsupported charset in extended field")}return o}function getlatin1(e){return String(e).replace(u,"?")}function parse(e){if(!e||typeof e!=="string"){throw new TypeError("argument string is required")}var r=x.exec(e);if(!r){throw new TypeError("invalid type format")}var t=r[0].length;var n=r[1].toLowerCase();var a;var o=[];var i={};var f;t=l.lastIndex=r[0].substr(-1)===";"?t-1:t;while(r=l.exec(e)){if(r.index!==t){throw new TypeError("invalid parameter format")}t+=r[0].length;a=r[1].toLowerCase();f=r[2];if(o.indexOf(a)!==-1){throw new TypeError("invalid duplicate parameter")}o.push(a);if(a.indexOf("*")+1===a.length){a=a.slice(0,-1);f=decodefield(f);i[a]=f;continue}if(typeof i[a]==="string"){continue}if(f[0]==='"'){f=f.substr(1,f.length-2).replace(s,"$1")}i[a]=f}if(t!==-1&&t!==e.length){throw new TypeError("invalid parameter format")}return new ContentDisposition(n,i)}function pdecode(e,r){return String.fromCharCode(parseInt(r,16))}function pencode(e){return"%"+String(e).charCodeAt(0).toString(16).toUpperCase()}function qstring(e){var r=String(e);return'"'+r.replace(p,"\\$1")+'"'}function ustring(e){var r=String(e);var t=encodeURIComponent(r).replace(o,pencode);return"UTF-8''"+t}function ContentDisposition(e,r){this.type=e;this.parameters=r}},455:(e,r,t)=>{var n=t(300);var a=n.Buffer;function copyProps(e,r){for(var t in e){r[t]=e[t]}}if(a.from&&a.alloc&&a.allocUnsafe&&a.allocUnsafeSlow){e.exports=n}else{copyProps(n,r);r.Buffer=SafeBuffer}function SafeBuffer(e,r,t){return a(e,r,t)}copyProps(a,SafeBuffer);SafeBuffer.from=function(e,r,t){if(typeof e==="number"){throw new TypeError("Argument must not be a number")}return a(e,r,t)};SafeBuffer.alloc=function(e,r,t){if(typeof e!=="number"){throw new TypeError("Argument must be a number")}var n=a(e);if(r!==undefined){if(typeof t==="string"){n.fill(r,t)}else{n.fill(r)}}else{n.fill(0)}return n};SafeBuffer.allocUnsafe=function(e){if(typeof e!=="number"){throw new TypeError("Argument must be a number")}return a(e)};SafeBuffer.allocUnsafeSlow=function(e){if(typeof e!=="number"){throw new TypeError("Argument must be a number")}return n.SlowBuffer(e)}},300:e=>{"use strict";e.exports=require("buffer")},17:e=>{"use strict";e.exports=require("path")}};var r={};function __nccwpck_require__(t){var n=r[t];if(n!==undefined){return n.exports}var a=r[t]={exports:{}};var o=true;try{e[t](a,a.exports,__nccwpck_require__);o=false}finally{if(o)delete r[t]}return a.exports}if(typeof __nccwpck_require__!=="undefined")__nccwpck_require__.ab=__dirname+"/";var t=__nccwpck_require__(292);module.exports=t})();