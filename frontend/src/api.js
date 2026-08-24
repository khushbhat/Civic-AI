const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, '');

const requestJson = async (url, options, failureMessage) => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) {
      throw new Error(failureMessage);
    }
    return await res.json();
  } catch {
    throw new Error(failureMessage);
  } finally {
    window.clearTimeout(timeout);
  }
};

export const submitProfile = async (profile) => {
  return await requestJson(`${API_BASE}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  }, "We’re having trouble connecting to the benefits service right now.");
};

export const getSchemeDetails = async (schemeId) => {
  return await requestJson(`${API_BASE}/scheme/${schemeId}`, undefined, "We couldn’t load the scheme details right now.");
};

export const chatWithScheme = async (schemeId, question) => {
  return await requestJson(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scheme_id: schemeId, question })
  }, "We’re having trouble reaching the assistant right now.");
};
