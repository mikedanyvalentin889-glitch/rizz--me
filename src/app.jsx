import { useState } from "react";

const OPENROUTER_API = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM = `Tu es RizzGPT, coach de séduction IA. Tu génères TOUJOURS 3 messages pour parler à une fille.
Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks :
{"smooth":"message élégant","bold":"message direct","funny":"message drôle","tip":"conseil court"}`;

const SCENARIOS = [
  "On vient de matcher sur Tinder",
  "Elle a liké ma photo Instagram",
  "Je veux relancer après 3 jours",
  "Elle répond avec des mots courts",
  "Je veux obtenir son numéro",
  "Premier message après match",
];

export default function App() {
  const [key, setKey] = useState(() => localStorage.getItem("or_key") || "");
  const [showKey, setShowKey] = useState(!localStorage.getItem("or_key"));
  const [situation, setSituation] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const saveKey = () => {
    localStorage.setItem("or_key", key);
    setShowKey(false);
  };

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 1500);
  };

  const generate = async () => {
    if (!key) { setShowKey(true); return; }
    if (!situation && !context) { setError("Décris la situation !"); return; }
    setError(""); setLoading(true); setResult(null);

    try {
      const res = await fetch(OPENROUTER_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`,
          "HTTP-Referer": window.location.href,
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-8b-instruct:free",
          messages: [
            { role: "system", content: SYSTEM },
            { role: "user", content: `Situation: ${situation || "général"}. ${context}` }
          ]
        })
      });

      const data = await res.json();

      if (data.error) {
        setError("Clé invalide ou limite atteinte. Vérifie sur openrouter.ai");
        setLoading(false); return;
      }

      const raw = data.choices?.[0]?.message?.content || "";
      let parsed;
      try {
        parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      } catch {
        parsed = {
          smooth: "Hé, t'as quelque chose qui me rend vraiment curieux… c'est quoi ton secret ?",
          bold: "Soyons honnêtes — t'as capté mon attention. On se parle ?",
          funny: "Mon GPS dit que t'es ma destination finale 😂 Il a souvent raison.",
          tip: "Sois naturel, l'authenticité bat toujours le script parfait."
        };
      }
      setResult(parsed);
    } catch {
      setError("Erreur réseau. Vérifie ta connexion.");
    }
    setLoading(false);
  };

  const styles = {
    smooth: { emoji: "🌊", label: "Smooth", color: "#818cf8" },
    bold: { emoji: "🔥", label: "Bold", color: "#f87171" },
    funny: { emoji: "😂", label: "Funny", color: "#fbbf24" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a14", color: "#f1f5f9", fontFamily: "system-ui, sans-serif", padding: "20px 16px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 44 }}>💬</div>
          <h1 style={{ fontSize: 32, margin: "8px 0 4px", background: "linear-gradient(135deg,#818cf8,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            RizzGPT
          </h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>Messages qui cartonnent 🎯</p>
        </div>

        {/* Clé API */}
        {showKey ? (
          <div style={{ background: "#111827", border: "1px solid #6366f1", borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <p style={{ color: "#a5b4fc", fontSize: 14, marginBottom: 10 }}>
              🔑 Entre ta clé <a href="https://openrouter.ai/keys" target="_blank" style={{ color: "#818cf8" }}>OpenRouter</a> (gratuite)
            </p>
            <input
              type="password"
              placeholder="sk-or-..."
              value={key}
              onChange={e => setKey(e.target.value)}
              style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "10px 12px", color: "#f1f5f9", fontSize: 14, boxSizing: "border-box", marginBottom: 10 }}
            />
            <button onClick={saveKey} style={{ width: "100%", background: "#6366f1", border: "none", borderRadius: 8, padding: "11px 0", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
              Sauvegarder ✓
            </button>
          </div>
        ) : (
          <button onClick={() => setShowKey(true)} style={{ background: "transparent", border: "1px solid #1e293b", borderRadius: 20, padding: "5px 14px", color: "#475569", fontSize: 12, cursor: "pointer", marginBottom: 20 }}>
            🔑 Changer la clé
          </button>
        )}

        {/* Scénarios */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {SCENARIOS.map(s => (
            <button key={s} onClick={() => setSituation(s)} style={{
              background: situation === s ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${situation === s ? "#6366f1" : "#1e293b"}`,
              color: situation === s ? "#a5b4fc" : "#64748b",
              borderRadius: 20, padding: "6px 13px", fontSize: 12, cursor: "pointer"
            }}>{s}</button>
          ))}
        </div>

        {/* Inputs */}
        <div style={{ background: "#111827", borderRadius: 14, padding: 18, marginBottom: 16 }}>
          <input
            placeholder="📍 Situation..."
            value={situation}
            onChange={e => setSituation(e.target.value)}
            style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "10px 12px", color: "#f1f5f9", fontSize: 14, boxSizing: "border-box", marginBottom: 12 }}
          />
          <textarea
            placeholder="💡 Contexte (son prénom, ses intérêts...)"
            value={context}
            onChange={e => setContext(e.target.value)}
            rows={3}
            style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "10px 12px", color: "#f1f5f9", fontSize: 14, boxSizing: "border-box", resize: "vertical" }}
          />
          {error && <p style={{ color: "#f87171", fontSize: 13, marginTop: 8 }}>{error}</p>}
          <button onClick={generate} disabled={loading} style={{
            width: "100%", marginTop: 14, background: loading ? "#1e293b" : "linear-gradient(135deg,#6366f1,#a855f7)",
            border: "none", borderRadius: 10, padding: "13px 0", color: loading ? "#475569" : "#fff",
            fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer"
          }}>
            {loading ? "Génération..." : "🚀 Générer mes messages"}
          </button>
        </div>

        {/* Résultats */}
        {result && (
          <div>
            {["smooth", "bold", "funny"].map(type => (
              <div key={type} style={{ background: "#111827", border: `1px solid ${styles[type].color}33`, borderRadius: 14, padding: 16, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ color: styles[type].color, fontWeight: 700, fontSize: 13 }}>
                    {styles[type].emoji} {styles[type].label}
                  </span>
                  <button onClick={() => copy(result[type], type)} style={{
                    background: copied === type ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${copied === type ? "#4ade80" : "#334155"}`,
                    color: copied === type ? "#4ade80" : "#64748b",
                    borderRadius: 6, padding: "4px 12px", fontSize: 12, cursor: "pointer"
                  }}>
                    {copied === type ? "✓ Copié" : "Copier"}
                  </button>
                </div>
                <p style={{ color: "#e2e8f0", fontSize: 15, lineHeight: 1.6, margin: 0 }}>{result[type]}</p>
              </div>
            ))}
            {result.tip && (
              <div style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 12, padding: "12px 16px" }}>
                <span style={{ color: "#fbbf24", fontSize: 13 }}>💡 Conseil : </span>
                <span style={{ color: "#94a3b8", fontSize: 13 }}>{result.tip}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
