export const showDebugInfoBadgeOnTopWindow = (message: string) => {
  const elementId = 'debug-info-badge';
  let badge = document.getElementById(elementId);
  if (!badge) {
    badge = document.createElement('div');
    badge.id = elementId;
    badge.style.position = 'fixed';
    badge.style.top = '30px';
    badge.style.right = '10px';
    badge.style.padding = '10px';
    badge.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    badge.style.color = 'white';
    badge.style.zIndex = '9999';
    badge.style.maxWidth = '300px';
    badge.style.borderRadius = '5px';
    // break words if too long
    badge.style.wordBreak = 'break-word';
    document.body.appendChild(badge);
  }

  badge.innerText = message;
  if (!message) {
    badge.style.display = 'none';
  } else {
    badge.style.display = 'block';
  }
};
