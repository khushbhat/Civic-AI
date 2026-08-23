const API_BASE = "http://localhost:8000";

export const submitProfile = async (profile) => {
  const res = await fetch(`${API_BASE}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  if (!res.ok) throw new Error("Failed to fetch recommendations");
  return await res.json();
};

export const getSchemeDetails = async (schemeId) => {
  const res = await fetch(`${API_BASE}/scheme/${schemeId}`);
  if (!res.ok) throw new Error("Failed to fetch scheme details");
  return await res.json();
};

export const chatWithScheme = async (schemeId, question) => {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scheme_id: schemeId, question })
  });
  if (!res.ok) throw new Error("Failed to get chat response");
  return await res.json();
};
