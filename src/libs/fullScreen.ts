function getWindowSize() {
  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
  };
}

const isGoodForFullScreen = () => {
  const { width, height } = getWindowSize();
  return width < 500 || height < 600;
};

const isEnabledFullScreenAsFeature = () => {
  // Check if the browser supports Fullscreen API
  return (
    document.fullscreenEnabled ||
    // @ts-expect-error
    document.webkitFullscreenEnabled || // Safari
    // @ts-expect-error
    document.mozFullScreenEnabled
  );
};

export function goFullScreen() {
  try {
    if (!isGoodForFullScreen() || !isEnabledFullScreenAsFeature()) {
      return;
    }
    const element = document.documentElement; // or any other element
    if (element.requestFullscreen) {
      element.requestFullscreen();
      // @ts-expect-error
    } else if (element.webkitRequestFullscreen) {
      // Safari
      // @ts-expect-error
      element.webkitRequestFullscreen();
    }
  } catch (error) {
    console.error("Error entering fullscreen mode:", error);
  }
}

export function exitFullScreen() {
  try {
    // Check if the document is already in fullscreen
    // @ts-expect-error
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      return; // Already in normal mode
    }

    if (!isGoodForFullScreen() || !isEnabledFullScreenAsFeature()) {
      return;
    }

    if (document.exitFullscreen) {
      document.exitFullscreen();
      // @ts-expect-error
    } else if (document.webkitExitFullscreen) {
      // Safari
      // @ts-expect-error
      document.webkitExitFullscreen();
    }
  } catch (error) {
    console.error("Error exiting fullscreen mode:", error);
  }
}
