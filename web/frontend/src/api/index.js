const API_BASE = import.meta.env.VITE_API_BASE ?? "";
const STATIC_DATA = import.meta.env.VITE_STATIC_DATA === "true";

async function fetchJson(path, label) {
    const url = STATIC_DATA
        ? `/data${path.replace("/api", "")}.json`
        : `${API_BASE}${path}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${label} data fetch failed!`);
    return res.json();
}

export const fetchQ1 = () => fetchJson("/api/q1", "Q1");
export const fetchQ2 = () => fetchJson("/api/q2", "Q2");
export const fetchQ3 = () => fetchJson("/api/q3", "Q3");
export const fetchQ4 = () => fetchJson("/api/q4", "Q4");
export const fetchQ5 = () => fetchJson("/api/q5", "Q5");
export const fetchQ6 = () => fetchJson("/api/q6", "Q6");

// Fetch the year Croatia entered the Schengen Area
export const fetchSchengenEntryYear = () =>
    fetchJson("/api/schengen-entry-year", "Schengen entry year");


export const fetchQ5Growth = () =>
  fetchJson("/api/q5-growth", "Q5 growth");

//-------------------------------------------------- //