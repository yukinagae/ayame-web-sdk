/* @flow */
import type { VideoCodecOption } from './connection/options';

/** @private */
export function randomString(strLength: number) {
  var result = [];
  var charSet = '0123456789';
  while (strLength--) {
    result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
  }
  return result.join('');
}

/** @private */
export function traceLog(title: string, value: Object | string) {
  let prefix = '';
  if (window.performance) {
    prefix = '[Ayame ' + (window.performance.now() / 1000).toFixed(3) + ']';
  }
  if (browser() === 'edge') {
    console.log(prefix + ' ' + title + '\n', value);
  } else {
    console.info(prefix + ' ' + title + '\n', value);
  }
}

/** @private */
export function getVideoCodecsFromString(codec: VideoCodecOption, codecs: Array<Object>) {
  let mimeType = '';
  if (codec === 'VP8') {
    mimeType = 'video/VP8';
  } else if (codec === 'VP9') {
    mimeType = 'video/VP9';
  } else if (codec === 'H264') {
    mimeType = 'video/H264';
  } else {
    mimeType = `video/${codec}`;
  }
  const filteredCodecs: Array<Object> = codecs.filter(c => c.mimeType == mimeType);
  if (filteredCodecs.length < 1) {
    throw new Error('invalid video codec type');
  }
  return filteredCodecs;
}

/** @private */
export function removeCodec(orgSdp: any, codec: VideoCodecOption) {
  const internalFunc = (orgSdp: any) => {
    const codecre = new RegExp('(a=rtpmap:(\\d*) ' + codec + '/90000\\r\\n)');
    const rtpmaps = orgSdp.match(codecre);
    if (rtpmaps == null || rtpmaps.length <= 2) {
      return orgSdp;
    }
    const rtpmap = rtpmaps[2];
    let modsdp = orgSdp.replace(codecre, '');

    const rtcpre = new RegExp('(a=rtcp-fb:' + rtpmap + '.*\r\n)', 'g');
    modsdp = modsdp.replace(rtcpre, '');

    const fmtpre = new RegExp('(a=fmtp:' + rtpmap + '.*\r\n)', 'g');
    modsdp = modsdp.replace(fmtpre, '');

    const aptpre = new RegExp('(a=fmtp:(\\d*) apt=' + rtpmap + '\\r\\n)');
    const aptmaps = modsdp.match(aptpre);
    let fmtpmap = '';
    if (aptmaps != null && aptmaps.length >= 3) {
      fmtpmap = aptmaps[2];
      modsdp = modsdp.replace(aptpre, '');

      const rtppre = new RegExp('(a=rtpmap:' + fmtpmap + '.*\r\n)', 'g');
      modsdp = modsdp.replace(rtppre, '');
    }

    let videore = /(m=video.*\r\n)/;
    const videolines = modsdp.match(videore);
    if (videolines != null) {
      //If many m=video are found in SDP, this program doesn't work.
      let videoline = videolines[0].substring(0, videolines[0].length - 2);
      const videoelems = videoline.split(' ');
      let modvideoline = videoelems[0];
      videoelems.forEach((videoelem, index) => {
        if (index === 0) return;
        if (videoelem == rtpmap || videoelem == fmtpmap) {
          return;
        }
        modvideoline += ' ' + videoelem;
      });
      modvideoline += '\r\n';
      modsdp = modsdp.replace(videore, modvideoline);
    }
    return internalFunc(modsdp);
  };
  return internalFunc(orgSdp);
}

/* @ignore */
export function browser() {
  const ua = window.navigator.userAgent.toLocaleLowerCase();
  if (ua.indexOf('edge') !== -1) {
    return 'edge';
  } else if (ua.indexOf('chrome') !== -1 && ua.indexOf('edge') === -1) {
    return 'chrome';
  } else if (ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1) {
    return 'safari';
  } else if (ua.indexOf('opera') !== -1) {
    return 'opera';
  } else if (ua.indexOf('firefox') !== -1) {
    return 'firefox';
  }
  return;
}
