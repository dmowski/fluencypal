export function goFullScreen() {
  try {
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
