const hasDataLayer = () => Array.isArray(window.dataLayer);

export function trackEvent(name, payload = {}) {
  const event = {
    event: name,
    timestamp: new Date().toISOString(),
    ...payload
  };

  if (!hasDataLayer()) {
    window.dataLayer = [];
  }

  window.dataLayer.push(event);
  window.dispatchEvent(new CustomEvent("conversion-event", { detail: event }));
}
