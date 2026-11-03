module.exports = async (req, res) => {
  const ids = String(req.query.ids || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!/^[A-Z0-9]{4}$/.test(ids)) {
    res.status(400).json({ error: "Invalid ICAO code" });
    return;
  }
  try {
    const r = await fetch(
      "https://aviationweather.gov/api/data/metar?ids=" + ids + "&format=raw&hours=3",
      { headers: { "User-Agent": "pranala-atlas" } }
    );
    if (!r.ok) throw new Error("Upstream HTTP " + r.status);
    const text = (await r.text()).trim().split("\n")[0].trim();
    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=300");
    res.status(200).json({ icao: ids, metar: text || null });
  } catch (e) {
    res.status(502).json({ error: String(e.message || e) });
  }
};
