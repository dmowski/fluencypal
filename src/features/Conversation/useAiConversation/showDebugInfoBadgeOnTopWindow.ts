export const showDebugInfoBadgeOnTopWindow = (message: string) => {
  const elementId = 'debug-info-badge';
  let badge = document.getElementById(elementId);
  if (!badge) {
    badge = document.createElement('div');
    badge.id = elementId;
    badge.style.position = 'fixed';
    badge.style.top = '10px';
    badge.style.right = '10px';
    badge.style.padding = '10px';
    badge.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    badge.style.color = 'white';
    badge.style.zIndex = '9999';
    badge.style.borderRadius = '5px';
    document.body.appendChild(badge);
  }

  badge.innerText = message;
};
