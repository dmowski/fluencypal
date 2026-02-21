type BrowserInfo = {
  browserName: string;
  os: string;
};

export function parseBrowserInfo(userAgent?: string): BrowserInfo {
  const ua = (
    userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '')
  ).toLowerCase();

  // ---------- OS ----------
  let os = 'Unknown OS';

  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    // iOS version example: OS 18_7 like Mac OS X
    const m = ua.match(/os (\d+)[._](\d+)(?:[._](\d+))?/);
    os = m ? `iOS ${m[1]}.${m[2]}${m[3] ? '.' + m[3] : ''}` : 'iOS';
  } else if (ua.includes('android')) {
    const m = ua.match(/android (\d+)(?:\.(\d+))?(?:\.(\d+))?/);
    os = m ? `Android ${m[1]}${m[2] ? '.' + m[2] : ''}${m[3] ? '.' + m[3] : ''}` : 'Android';
  } else if (ua.includes('mac os x')) {
    const m = ua.match(/mac os x (\d+)[._](\d+)(?:[._](\d+))?/);
    os = m ? `macOS ${m[1]}.${m[2]}${m[3] ? '.' + m[3] : ''}` : 'macOS';
  } else if (ua.includes('windows nt')) {
    const m = ua.match(/windows nt (\d+)\.(\d+)/);
    // mapping NT versions to Windows names
    if (m) {
      const nt = `${m[1]}.${m[2]}`;
      os =
        nt === '10.0'
          ? 'Windows 10/11'
          : nt === '6.3'
            ? 'Windows 8.1'
            : nt === '6.2'
              ? 'Windows 8'
              : nt === '6.1'
                ? 'Windows 7'
                : nt === '6.0'
                  ? 'Windows Vista'
                  : nt === '5.1'
                    ? 'Windows XP'
                    : `Windows NT ${nt}`;
    } else {
      os = 'Windows';
    }
  } else if (ua.includes('linux')) {
    os = 'Linux';
  }

  // ---------- Browser ----------
  let browserName = 'Unknown Browser';

  // Edge (Chromium) includes "edg/"
  if (ua.includes('edg/')) {
    const m = ua.match(/edg\/([\d.]+)/);
    browserName = m ? `Edge ${m[1]}` : 'Edge';
  }
  // Opera includes "opr/"
  else if (ua.includes('opr/')) {
    const m = ua.match(/opr\/([\d.]+)/);
    browserName = m ? `Opera ${m[1]}` : 'Opera';
  }
  // Firefox includes "firefox/"
  else if (ua.includes('firefox/')) {
    const m = ua.match(/firefox\/([\d.]+)/);
    browserName = m ? `Firefox ${m[1]}` : 'Firefox';
  }
  // Chrome on iOS uses CriOS; regular Chrome uses Chrome/
  else if (ua.includes('crios/')) {
    const m = ua.match(/crios\/([\d.]+)/);
    browserName = m ? `Chrome (iOS) ${m[1]}` : 'Chrome (iOS)';
  }
  // Chrome (ignore if it's SamsungBrowser etc. if you want)
  else if (ua.includes('chrome/')) {
    const m = ua.match(/chrome\/([\d.]+)/);
    browserName = m ? `Chrome ${m[1]}` : 'Chrome';
  }
  // Safari: detect by "safari" + "version/" but not chrome
  else if (ua.includes('safari') && ua.includes('version/')) {
    const m = ua.match(/version\/([\d.]+)/);
    browserName = m ? `Safari ${m[1]}` : 'Safari';
  }

  return { browserName, os };
}
