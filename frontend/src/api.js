const API_BASE = "http://localhost:8000";

const requestJson = async (url, options, failureMessage) => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(failureMessage);
    }
    return await res.json();
  } catch {
    throw new Error(failureMessage);
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
