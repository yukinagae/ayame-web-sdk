!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define("Ayame",[],t):"object"==typeof exports?exports.Ayame=t():e.Ayame=t()}(window,function(){return function(e){var t={};function i(s){if(t[s])return t[s].exports;var n=t[s]={i:s,l:!1,exports:{}};return e[s].call(n.exports,n,n.exports,i),n.l=!0,n.exports}return i.m=e,i.c=t,i.d=function(e,t,s){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:s})},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var s=Object.create(null);if(i.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)i.d(s,n,function(t){return e[t]}.bind(null,n));return s},i.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="",i(i.s=0)}([function(e,t,i){"use strict";i.r(t);var s=class{constructor(e,t,i){this.roomId=t,this.signalingUrl=e,this.options=i,i.clientId?this.clientId=i.clientId:this.clientId=function(e){for(var t=[];e--;)t.push("0123456789".charAt(Math.floor(Math.random()*"0123456789".length)));return t.join("")}(17),this._isNegotiating=!1,this.stream=null,this._pc=null,this.authnMetadata=null,this._callbacks={connect:()=>{},disconnect:()=>{},addstream:()=>{},removestream:()=>{}}}on(e,t){e in this._callbacks&&(this._callbacks[e]=t)}async connect(e,t=null){return this.stream=e,this.authnMetadata=t,this._signaling(),e}disconnect(){this.remoteStreamId=null,this.stream&&this.stream.getTracks().forEach(e=>{e.stop()}),this.stream=null,this._ws.onclose=()=>{},this._ws.close(),this._pc&&"closed"!==this._pc.signalingState&&this._pc.close(),this._pc=null,this._isNegotiating=!1}_signaling(){this._ws=new WebSocket(this.signalingUrl),this._ws.onopen=()=>{const e={type:"register",roomId:this.roomId,clientId:this.clientId,authnMetadata:void 0};null!==this.authnMetadata&&(e.authnMetadata=this.authnMetadata),this._sendWs(e),this._ws.onmessage=async e=>{try{if("string"!=typeof e.data)return;const t=JSON.parse(e.data);if("ping"===t.type)this._sendWs({type:"pong"});else if("close"===t.type)this._callbacks.close(e);else if("accept"===t.type)this._pc||(this._pc=this._createPeerConnection(!0)),this._callbacks.connect({authzMetadata:t.authzMetadata}),this._ws.onclose=e=>{this.disconnect(),this._callbacks.disconnect({reason:"WS-CLOSED",event:e})};else if("reject"===t.type)this.disconnect(),this._callbacks.disconnect({reason:"REJECTED"});else if("offer"===t.type)this._setOffer(t);else if("answer"===t.type)await this._setAnswer(t);else if("candidate"===t.type&&t.ice){console.debug("Received ICE candidate ...");const e=new window.RTCIceCandidate(t.ice);this._addIceCandidate(e)}}catch(e){this.disconnect(),this._callbacks.disconnect({reason:"SIGNALING-ERROR",error:e})}}},this._ws.onclose=async e=>{this.disconnect(),this._callbacks.disconnect(e)}}_createPeerConnection(e){const t={iceServers:this.options.iceServers},i=new window.RTCPeerConnection(t);if(void 0===i.ontrack)i.onaddstream=e=>{const t=e.stream;(this.remoteStreamId&&t.id!==this.remoteStreamId||null===this.remoteStreamId)&&(this.remoteStreamId=t.id,this._callbacks.addstream(e))},i.onremovestream=e=>{this.remoteStreamId&&e.stream.id===this.remoteStreamId&&(this.remoteStreamId=null,this._callbacks.removestream(e))};else{let e=[];i.ontrack=t=>{console.log("-- peer.ontrack()",t),e.push(t.track);let i=new window.MediaStream(e);this.remoteStreamId=i.id,t.stream=i,this._callbacks.addstream(t)}}i.onicecandidate=e=>{e.candidate&&this._sendIceCandidate(e.candidate)},i.oniceconnectionstatechange=()=>{i.iceConnectionState},i.onnegotiationneeded=async()=>{if(!this._isNegotiating)try{if(this._isNegotiating=!0,e){const e=await i.createOffer({offerToReceiveAudio:this.options.audio.enabled,offerToReceiveVideo:this.options.video.enabled});await i.setLocalDescription(e),this._sendSdp(i.localDescription),this._isNegotiating=!1}}catch(e){this.disconnect(),this._callbacks.disconnect({reason:"NEGOTIATION-ERROR",error:e})}};const s=this.stream&&this.stream.getVideoTracks()[0],n=this.stream&&this.stream.getAudioTracks()[0];return n&&i.addTrack(n,this.stream),i.addTransceiver("audio",{direction:"recvonly"}),s&&i.addTrack(s,this.stream),i.addTransceiver("video",{direction:"recvonly"}),"sendonly"===this.options.video.direction&&i.getTransceivers().forEach(e=>{s&&e.sender.replaceTrack(s),e.direction=this.options.video.direction}),"sendonly"===this.options.audio.direction&&i.getTransceivers().forEach(e=>{n&&e.sender.replaceTrack(n),e.direction=this.options.audio.direction}),i}async _createAnswer(){if(this._pc)try{let e=await this._pc.createAnswer();await this._pc.setLocalDescription(e),this._sendSdp(this._pc.localDescription)}catch(e){this.disconnect(),this._callbacks.disconnect({reason:"CREATE-ANSWER-ERROR",error:e})}}async _setAnswer(e){await this._pc.setRemoteDescription(e)}async _setOffer(e){this._pc=this._createPeerConnection(!1);try{await this._pc.setRemoteDescription(e),await this._createAnswer()}catch(e){this.disconnect(),this._callbacks.disconnect({reason:"SET-OFFER-ERROR",error:e})}}_addIceCandidate(e){this._pc&&this._pc.addIceCandidate(e)}_sendIceCandidate(e){const t={type:"candidate",ice:e};this._sendWs(t)}_sendSdp(e){this._sendWs(e)}_sendWs(e){this._ws&&this._ws.send(JSON.stringify(e))}};i.d(t,"connection",function(){return a}),i.d(t,"version",function(){return c});const n={audio:{direction:"sendrecv",enabled:!0},video:{direction:"sendrecv",enabled:!0},iceServers:[{urls:"stun:stun.l.google.com:19302"}]};function a(e,t,i=n){return new s(e,t,i)}function c(){return"0.0.1-rc2"}}])});