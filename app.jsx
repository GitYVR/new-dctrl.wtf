// dctrl. PUNK — app entrypoint
const { useState } = React;

const ACCENT_HEX = { orange: "#FF450C", acid: "#6CFF3D", cyan: "#25E5FF", pink: "#FF2E88" };

function PunkCursor({ active, accent }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0, x = -100, y = -100;
    const onMove = (e) => {
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const apply = () => { raf = 0; el.style.transform = `translate3d(${x - 14}px, ${y - 14}px, 0)`; };
    const onOver = (e) => {
      const t = e.target;
      const hov = t && (t.closest && t.closest('a, button, [role="button"], .shot, .event-row, .talk, .nav-cta'));
      el.classList.toggle('hover', !!hov);
    };
    const onLeave = () => el.classList.add('hidden');
    const onEnter = () => el.classList.remove('hidden');
    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
    };
  }, [active]);
  if (!active) return null;
  // SVG fill = accent. mix-blend-mode: difference flips it to black when it
  // sits on its own accent color (since accent XOR accent = 0,0,0).
  return (
    <div id="__punk_cursor" ref={ref} aria-hidden="true">
      <svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
        <g stroke={accent} strokeWidth="1.6" fill="none">
          <circle cx="14" cy="14" r="10"/>
          <line x1="14" y1="0" x2="14" y2="8"/>
          <line x1="14" y1="20" x2="14" y2="28"/>
          <line x1="0" y1="14" x2="8" y2="14"/>
          <line x1="20" y1="14" x2="28" y2="14"/>
        </g>
        <circle cx="14" cy="14" r="1.6" fill={accent}/>
      </svg>
    </div>
  );
}

function App() {
  const [intent, setIntent] = useState("membership");
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null); // { kind: 'photo'|'event', item }
  const open = (kind) => setModal(kind || intent);

  // Tweaks defaults
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "theme": "black",
    "accent": "orange",
    "scanlines": false,
    "halftone": true,
    "punkCursor": true,
    "marquee": true
  }/*EDITMODE-END*/;

  const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  // Apply tweaks to <html> + <body>
  React.useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.setAttribute("data-theme", t.theme === "black" ? "" : t.theme);
    html.setAttribute("data-accent", t.accent === "orange" ? "" : t.accent);
    body.classList.toggle("scanlines", !!t.scanlines);
    body.classList.toggle("halftone", !!t.halftone);
    body.classList.toggle("has-punk-cursor", !!t.punkCursor);
  }, [t.theme, t.accent, t.scanlines, t.halftone, t.punkCursor]);

  const tickerItems = [
    "DOOR_OPEN", "MEMBER_RUN", "NON_PROFIT_SOCIETY",
    "Cypherpunks write code", "Cypherpunks pay rent",
    "REWARD: A space that outlives the cycle",
    "Live talks Thu 7pm", "We host. We don't pitch.",
    "All talks recorded · YouTube next morning",
  ];

  return (
    <div className="page">
      <PunkCursor active={!!t.punkCursor} accent={ACCENT_HEX[t.accent] || ACCENT_HEX.orange} />
      {window.StatusBar ? <window.StatusBar/> : null}
      {t.marquee && window.Marquee ? <window.Marquee items={tickerItems}/> : null}
      <div className="container">
        {window.Nav ? <window.Nav onApply={open}/> : null}
        {window.Hero ? <window.Hero onApply={open} intent={intent} setIntent={setIntent}/> : null}
        {window.Manifesto ? <window.Manifesto/> : null}
        {window.History ? <window.History/> : null}
        {window.SpaceGallery ? <window.SpaceGallery onPhoto={(s) => setDetail({ kind: "photo", item: s })}/> : null}
        {window.VirtualTour ? <window.VirtualTour/> : null}
        {window.Calendar ? <window.Calendar/> : null}
        {window.Donate ? <window.Donate/> : null}
        {window.Talks ? <window.Talks/> : null}
      </div>
      {window.Footer ? <window.Footer/> : null}

      {window.ApplyModal ? (
        <window.ApplyModal open={!!modal} intent={modal || intent} onClose={() => setModal(null)}/>
      ) : null}

      {window.DetailModal ? (
        <window.DetailModal
          open={!!detail}
          item={detail && detail.item}
          kind={detail && detail.kind}
          onClose={() => setDetail(null)}
        />
      ) : null}

      {window.TweaksPanel ? (
        <window.TweaksPanel>
          <window.TweakSection label="Theme" />
          <window.TweakRadio label="Surface" value={t.theme}
            options={["black","white","cream"]}
            onChange={(v) => setTweak("theme", v)} />
          <window.TweakRadio label="Accent" value={t.accent}
            options={["orange","acid","cyan","pink"]}
            onChange={(v) => setTweak("accent", v)} />
          <window.TweakSection label="Effects" />
          <window.TweakToggle label="Halftone photos" value={t.halftone}
            onChange={(v) => setTweak("halftone", v)} />
          <window.TweakToggle label="CRT scanlines" value={t.scanlines}
            onChange={(v) => setTweak("scanlines", v)} />
          <window.TweakToggle label="Crosshair cursor" value={t.punkCursor}
            onChange={(v) => setTweak("punkCursor", v)} />
          <window.TweakToggle label="Status marquee" value={t.marquee}
            onChange={(v) => setTweak("marquee", v)} />
        </window.TweaksPanel>
      ) : null}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
