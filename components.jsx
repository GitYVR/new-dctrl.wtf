// dctrl. PUNK — components
const { useState, useEffect, useRef } = React;

// ─────────────── Logo (lowercase) ───────────────
function Logo({ size = "lg", className = "" }) {
  return (
    <span className={`logo ${size} ${className}`}>
      <span className="box-d">d</span>
      <span className="rest">ctrl.</span>
    </span>
  );
}

// ─────────────── Status bar ───────────────
function StatusBar() {
  const [now, setNow] = useState(new Date());
  const [gas, setGas] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Live gas price (gwei). ethgas.watch is CORS-open and free.
  useEffect(() => {
    let cancelled = false;
    const safeJson = (url) =>
      fetch(url)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
    async function load() {
      const g = await safeJson("https://www.ethgas.watch/api/gas");
      if (cancelled) return;
      if (g && g.normal && g.normal.gwei)
        setGas(Math.round(g.normal.gwei) + " gwei");
    }
    load();
    const iv = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, []);

  const uptime = (() => {
    const start = new Date("2013-11-01T00:00:00Z").getTime();
    const days = Math.floor((Date.now() - start) / 86400000);
    return `${days}d`;
  })();
  const time = now.toUTCString().split(" ")[4];

  // Context usage — derive from the seconds-of-day so it ticks but stays plausible.
  const ctx = (() => {
    const sec = Math.floor(now.getTime() / 1000);
    // Slow drift around 60–80% with second-level jitter.
    const base = 62 + ((sec % 1800) / 1800) * 18;
    const jitter = ((sec % 7) - 3) * 0.4;
    return Math.max(0, Math.min(99, base + jitter)).toFixed(1) + "%";
  })();
  return (
    <div className="statusbar">
      <div className="statusbar-inner">
        <span className="status-dot" />
        <span className="status-item">
          <span className="k">SYS</span>
          <b>ONLINE</b>
        </span>
        <span className="status-item">
          <span className="k">UPTIME</span>
          <b>{uptime}</b>
        </span>
        <span className="status-item hide-mobile">
          <span className="k">MEMBERS</span>
          <b>137</b>
        </span>
        <span className="status-item hide-mobile">
          <span className="k">GAS</span>
          <b>{gas || "—"}</b>
        </span>
        <span className="status-item hide-mobile">
          <span className="k">CTX</span>
          <b>{ctx}</b>
        </span>
        <span className="statusbar-spacer" />
        <span className="status-item hide-mobile">
          <span className="k">LOC</span>
          <b>49.2827°N 123.1207°W</b>
        </span>
        <span className="status-item">
          <span className="k">UTC</span>
          <b>{time}</b>
        </span>
      </div>
    </div>
  );
}

// ─────────────── Marquee ticker ───────────────
function Marquee({ items, invert = false, speed }) {
  const content = [...items, ...items].map((t, i) => (
    <span key={i}>
      {t} <span className="dot">●</span>
    </span>
  ));
  return (
    <div className={`marquee ${invert ? "invert" : ""}`}>
      <div
        className="marquee-track"
        style={speed ? { animationDuration: `${speed}s` } : undefined}
      >
        {content}
      </div>
    </div>
  );
}

// ─────────────── Nav ───────────────
function Nav({ onApply }) {
  return (
    <nav className="nav">
      <a href="#top" style={{ textDecoration: "none" }}>
        <Logo size="lg" />
      </a>
      <ul className="nav-links">
        <li>
          <a href="#manifesto">Manifesto</a>
        </li>
        <li>
          <a href="#history">History</a>
        </li>
        <li>
          <a href="#space">Space</a>
        </li>
        <li>
          <a href="#tour">Tour</a>
        </li>
        <li>
          <a href="#calendar">Calendar</a>
        </li>
        <li>
          <a href="#talks">Talks</a>
        </li>
        <li>
          <a href="#visit">Visit</a>
        </li>
      </ul>
      <button className="nav-cta" onClick={() => onApply("membership")}>
        Request Access ▸
      </button>
    </nav>
  );
}

// ─────────────── Typewriter (cycles words inside the hero box) ───────────────
function Typewriter({
  words,
  typeMs = 90,
  eraseMs = 45,
  holdMs = 1400,
  gapMs = 220,
}) {
  const [text, setText] = useState(words[0] || "");
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("hold"); // "type" | "hold" | "erase" | "gap"

  useEffect(() => {
    let timer;
    if (phase === "hold") {
      timer = setTimeout(() => setPhase("erase"), holdMs);
    } else if (phase === "erase") {
      if (text.length === 0) {
        timer = setTimeout(() => setPhase("gap"), gapMs);
      } else {
        timer = setTimeout(() => setText(text.slice(0, -1)), eraseMs);
      }
    } else if (phase === "gap") {
      const next = (idx + 1) % words.length;
      setIdx(next);
      setPhase("type");
    } else if (phase === "type") {
      const target = words[idx];
      if (text.length === target.length) {
        timer = setTimeout(() => setPhase("hold"), 0);
      } else {
        timer = setTimeout(
          () => setText(target.slice(0, text.length + 1)),
          typeMs,
        );
      }
    }
    return () => clearTimeout(timer);
  }, [phase, text, idx, words, typeMs, eraseMs, holdMs, gapMs]);

  return (
    <span className="typewriter">
      <span className="typewriter-text">{text}</span>
      <span className="typewriter-caret" aria-hidden="true">
        ▍
      </span>
    </span>
  );
}

// ─────────────── Hero ───────────────
const CTA_OPTIONS = [
  { key: "desk", label: "Dedicated desk" },
  { key: "membership", label: "Membership" },
  { key: "event", label: "Host an event" },
  { key: "reach", label: "Send signal" },
];

function Hero({ onApply, intent, setIntent }) {
  return (
    <section className="hero" id="top">
      <div className="hero-grid">
        <div className="hero-l">
          <div className="hero-eyebrow">
            <span className="dot" />
            <span>Hackerspace</span>
            <span>·</span>
            <span>Gastown / Vancouver</span>
            <span>·</span>
            <span className="accent">OPERATING SINCE 2013</span>
          </div>

          <h1 className="display">
            <span>A </span>
            <span className="box">
              <Typewriter
                words={[
                  "hackerspace",
                  "clubhouse",
                  "makerspace",
                  "coworking space",
                  "eventspace",
                ]}
              />
            </span>
            <br />
            <span>in </span>
            <span className="strike">the cloud</span>
            <br />
            <span>downtown Vancouver.</span>
          </h1>

          <p className="hero-lede">
            A <strong>member-run, non-profit</strong> studio on West Hastings —
            for engineers, designers, builders and the crypto-curious crowd that
            keeps the fire burning.{" "}
            <strong>Funded by dues & grants, not capital.</strong>
          </p>

          <div className="cta-block">
            <div className="cta-prompt">select_intent --type</div>
            <div className="segmented">
              {CTA_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  className={`seg-btn ${intent === opt.key ? "active" : ""}`}
                  onClick={() => setIntent(opt.key)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="apply-row">
              <button className="apply-btn" onClick={() => onApply(intent)}>
                {intent === "reach"
                  ? "Send signal"
                  : intent === "event"
                    ? "Pitch the event"
                    : "Submit request"}
                <span className="arrow">▸</span>
              </button>
              <span className="apply-helper">
                {intent === "desk" && "24/7 access · From $480/mo"}
                {intent === "membership" && "Hot desks + lounge · From $220/mo"}
                {intent === "event" && "Talks · demos · hackathons · ≤80 ppl"}
                {intent === "reach" && "Press · partnerships · just curious"}
              </span>
            </div>
          </div>
        </div>

        <figure className="hero-photo" style={{ margin: 0 }}>
          <img
            src="assets/new-storefront.png"
            alt="dctrl. — new home, 328 W Hastings storefront"
          />
          <span className="photo-tag">DSC_03678</span>
          <span className="photo-stamp">ACQUIRED</span>
          <span className="photo-coords">
            328 W HASTINGS · 49.2827°N 123.1207°W
          </span>
        </figure>
      </div>
    </section>
  );
}

// ─────────────── Manifesto ───────────────
const MANIFESTO_LINES = [
  "We build in the open. We host in the open.",
  "The door is open to anyone who shows up.",
  "Cypherpunks write code. Cypherpunks pay rent.",
  "The space outlives the cycle.",
];

function Manifesto() {
  return (
    <section className="section first" id="manifesto">
      <div className="manifesto">
        <div className="section-tag" style={{ color: "var(--accent)" }}>
          // COMMUNIQUÉ · 2013→
        </div>
        <h2>
          What this <span className="accent">is.</span>
        </h2>
        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: 13,
            lineHeight: 1.55,
            maxWidth: "60ch",
            opacity: 0.8,
          }}
        >
          Vancouver's longest-running home for Bitcoin, crypto and decentralized
          tech. A space, a community, and a fire that's always burning.
        </p>
        <div className="manifesto-grid">
          {MANIFESTO_LINES.map((line, i) => (
            <div className="man-line" key={i}>
              <span className="num">0{i + 1}</span>
              <span>{line}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────── Donate / support ───────────────
const DONATE_LINKS = [
  {
    label: "Giveth",
    meta: "Quadratic funding · public goods",
    url: "https://giveth.io/project/dctrl-clubhouse-events-space",
  },
  {
    label: "dctrl.eth",
    meta: "ENS · any EVM chain",
    url: "https://etherscan.io/address/0xD5184c0d23f7551DB7c8c4a3a3c5F1685059A09c",
  },
  {
    label: "BTC on Lightning",
    meta: "dctrl@coinos.io · instant · low-fee",
    url: "https://coinos.io/dctrl",
  },
  {
    label: "The Bepsi",
    meta: "Lightning · 12 EVM chains · in person",
    url: "https://bepsi.dctrl.wtf",
  },
];

function Donate() {
  return (
    <section className="section" id="donate">
      <div className="section-head">
        <div>
          <div className="section-tag">// SUPPORT_THE_SPACE</div>
          <h2 className="section-title">
            Donate <span className="accent">/ keep the door open.</span>
          </h2>
        </div>
        <p className="section-sub">
          Volunteer-run since 2013. Funded by public donations, member dues, and
          a vending machine that accepts crypto. Every dollar pays rent.
        </p>
      </div>
      <div className="donate-grid">
        {DONATE_LINKS.map((d) => (
          <a
            key={d.label}
            className="donate-card"
            href={d.url}
            target="_blank"
            rel="noreferrer"
          >
            <div className="donate-label">{d.label}</div>
            <div className="donate-meta">{d.meta}</div>
            <div className="donate-arrow">▸</div>
          </a>
        ))}
      </div>
    </section>
  );
}

window.Logo = Logo;
window.StatusBar = StatusBar;
window.Marquee = Marquee;
window.Nav = Nav;
window.Hero = Hero;
window.Manifesto = Manifesto;
window.Donate = Donate;
window.CTA_OPTIONS = CTA_OPTIONS;

// ─────────────── History ───────────────
const NOTABLE = [
  { name: "Vitalik Buterin", role: "Co-founder, Ethereum", x: "https://x.com/VitalikButerin" },
  { name: "Andreas Antonopoulos", role: "Bitcoin educator", x: "https://x.com/aantonop" },
  { name: "Erik Voorhees", role: "ShapeShift / Venice.AI", x: "https://x.com/ErikVoorhees" },
  { name: "Jacob Steeves", role: "Co-founder, Bittensor", x: "https://x.com/const_reborn" },
  { name: "0xMaki", role: "SushiSwap", x: "https://x.com/0xMaki" },
  { name: "Witek Radomski", role: "Founder, Enjin", x: "https://x.com/witekradomski" },
  { name: "Peter Rizun", role: "Bitcoin Unlimited", x: "https://x.com/PeterRizun" },
  { name: "Ken Sim", role: "Mayor of Vancouver", x: "https://x.com/KenSimCity" },
];

function History() {
  return (
    <section className="section" id="history">
      <div className="section-head">
        <div>
          <div className="section-tag">// SINCE 2013 · v12.5.0</div>
          <h2 className="section-title">
            The <span className="accent">story.</span>
          </h2>
        </div>
        <p className="section-sub">
          Twelve years deep. New chapter on West Hastings — same fire, same
          loud opinions, more room to grow.
        </p>
      </div>

      <div className="story-grid">
        <figure className="story-photo">
          <img
            src="assets/photos/founders.jpg"
            alt="Co-founders at dctrl."
            loading="lazy"
          />
          <figcaption>Cam &amp; Freddie · 436 W Pender · 2014</figcaption>
        </figure>

        <div className="story-body">
          <p className="story-lede">
            Founded 2013 as <em>Decentral Vancouver</em> — Vancouver's
            longest-running home for Bitcoin, crypto and decentralized tech.
            Started as a back room on Pender. Became an <em>Institution</em>.
          </p>
          <p>
            Over twelve years it became an educational hub, a cultural meeting
            place, and an ideation centre for Bitcoin, Ethereum, web3 and
            everything adjacent. Weekly meetups. Talks. Hackathons. Music
            nights. Quiet Tuesdays where someone fixes their compiler at 2am
            while someone else paints the lounge.
          </p>
          <p>
            For many of the people who walked through the door — students,
            founders, ex-bankers, artists — DCTRL. was the first place they met
            other people who also believed in this stuff and realized they
            weren't building alone.
          </p>

          <blockquote className="story-quote">
            "The first place I met people who also believed in it,
            <br />
            and realized I wasn't building alone."
          </blockquote>

          <p>
            The space became a laboratory for crypto-native physical
            infrastructure: the <strong>Bepsi machine</strong> — a
            donation-powered vending machine running since 2015 that today
            accepts Lightning and a dozen EVM chains. Programmable door access
            via Discord emoji reactions. A small museum of early mining hardware
            in the back. Glass sidewalk tiles with LEDs underneath.
          </p>

          <div className="notable">
            <div className="notable-head">
              <span>// PARTIAL_LOG · who came through</span>
              <span>0x8 entries</span>
            </div>
            <ul>
              {NOTABLE.map((p, i) => (
                <li key={i}>
                  <span className="notable-name">{p.name}</span>
                  <span className="notable-role">{p.role}{p.x ? <>{" "}— <a href={p.x} className="notable-handle" target="_blank" rel="noopener noreferrer">@{p.x.split("/").pop()}</a></> : null}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="story-callout">
            <div className="callout-tag">// 328_W_HASTINGS · NEW_CHAPTER</div>
            <p>
              For most of its life DCTRL. lived at <strong>436 W Pender</strong>{" "}
              — concrete-walled basement that hosted thousands of talks, hacks and
              late-night arguments. When the building was slated for demolition,
               we packed up and moved a couple blocks away. Same community, same
              fire, more room to grow.
            </p>
            <a className="callout-link" href="#">
              Read the proposal ▸
            </a>
          </div>

          <pre className="hex-block">{`PGP fingerprint · dctrl-society
A4F2 8B91 C5D7 E3F0  ·  6B72 9A0E 1F84 D5C2
4E37 A810 B6D9 7C15  ·  3A2F 8E1B 0492 F73C`}</pre>
        </div>
      </div>
    </section>
  );
}

// ─────────────── Space gallery ───────────────
const SPACE_SHOTS = [
  {
    src: "assets/photos/btc-hackathon-2024.jpg",
    caption: "Bitcoin hackathon · 2024",
    span: "tall",
    detail:
      "Annual hackathon — 36 hours, 60 builders, judges from Bitcoin Vancouver and Ethereum Foundation. Winners shipped a Lightning vending-machine prototype that became the Bepsi v2.",
    where: "Main floor · 436 W Pender",
    when: "Nov 2024",
  },
  {
    src: "assets/photos/btc-flag.jpg",
    caption: "436 W Pender · the original",
    span: "",
    detail:
      "The flag has hung in every DCTRL. location since day one. The original 2013 storefront on Pender — basement vibes, fluorescent lights, the smell of coffee and toner.",
    where: "436 W Pender (original)",
    when: "2013–2025",
  },
  {
    src: "assets/photos/inside-3.png",
    caption: "Hallway · tea wall + workstations",
    span: "wide",
    detail:
      "The hallway between the two studios. Members keep ~20 varieties of loose-leaf tea </parameter>
</function>
</tool_call>
<tool_call>
<function=edit>
<parameter=filePath>
/Users/owenmurovec/projects/gityvr/new-dctrl.wtf/components-bundle.jsx The wall of monitors is a self-hosted dashboard rotation — block height, member presence, weather, on-call.",
    where: "Hallway · Studio A → B",
    when: "ongoing",
  },
  {
    src: "assets/photos/inside-1.png",
    caption: "Museum of blockchain relics",
    span: "",
    detail:
      "A small museum: a working Bitmain S1, an early ASICMiner block-erupter array, a Ledger prototype, the original whiteboard from the night ETH 2.0 was sketched out (signed by everyone in the room).",
    where: "Back room",
    when: "curated since 2016",
  },
  {
    src: "assets/photos/inside-5.png",
    caption: "Members meeting room",
    span: "wide",
    detail:
      "Glass-walled meeting room. Schedulable on Discord with the /book command. Best whiteboard in the building. Hosts our weekly all-hands and the occasional remote conference call back to Berlin / Singapore.",
    where: "Studio B",
    when: "ongoing",
  },
  {
    src: "assets/photos/inside-2.png",
    caption: "Cam & Freddie + Vitalik",
    span: "",
    detail:
      "Vitalik dropped in for a Tuesday talk in 2017. No livestream — at his request. The talk is in nobody's archive. The conversation continued at the bar across the street until 2am.",
    where: "Main floor · 436 W Pender",
    when: "2017",
  },
  {
    src: "assets/photos/inside-4.png",
    caption: "Mayor Ken Sim · using the Bepsi",
    span: "tall",
    detail:
      "Mayor Ken Sim using the Bepsi machine — the donation-powered vending machine that's been running since 2015. Today it accepts Lightning, twelve EVM chains, and exact change in CAD.",
    where: "Kitchen",
    when: "Mar 2024",
  },
  {
    src: "assets/photos/inside-7.png",
    caption: "Pool table & relics room",
    span: "wide",
    detail:
      "The pool table came with the building. We patched the felt twice. Behind it: shelves of donated hardware, books and binders from the early Vancouver crypto scene. Nothing here is for sale.",
    where: "Lounge",
    when: "ongoing",
  },
  {
    src: "assets/photos/inside-6.png",
    caption: "Live-stream rig, piano & DJ booth",
    span: "wide",
    detail:
      "Three-camera live-stream rig, upright piano, and a small DJ booth. Used for talks, demo nights, and the occasional Friday party that runs until the upstairs neighbours politely complain.",
    where: "Main floor",
    when: "ongoing",
  },
];

function SpaceGallery({ onPhoto }) {
  return (
    <section className="section" id="space">
      <div className="section-head">
        <div>
          <div className="section-tag">
            // 4,800 SQ_FT · 8 BOOTHS · 2 STUDIOS
          </div>
          <h2 className="section-title">
            Inside <span className="accent">DCTRL.</span>
          </h2>
        </div>
        <p className="section-sub">
          Dark basement, loud opinions, and a museum of mining hardware.
        </p>
      </div>
      <div className="gallery">
        {SPACE_SHOTS.map((s, i) => (
          <figure
            key={i}
            className={`shot ${s.span}`}
            data-idx={String(i + 1).padStart(2, "0")}
            onClick={() => onPhoto && onPhoto(s)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && onPhoto) {
                e.preventDefault();
                onPhoto(s);
              }
            }}
          >
            <img src={s.src} alt={s.caption} loading="lazy" />
            <figcaption>{s.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

window.History = History;
window.SpaceGallery = SpaceGallery;
window.NOTABLE = NOTABLE;

// ─────────────── Virtual tour (360° embed) ───────────────
function VirtualTour() {
  return (
    <section className="section" id="tour">
      <div className="section-head">
        <div>
          <div className="section-tag">// 360° · WALK_THROUGH</div>
          <h2 className="section-title">
            Virtual <span className="accent">tour.</span>
          </h2>
        </div>
        <a
          className="tier-cta"
          href="https://old.dctrl.wtf/360dctrl/index.html"
          target="_blank"
          rel="noreferrer"
        >
          Open fullscreen ▸
        </a>
      </div>
      <div className="tour-embed">
        <iframe
          src="https://old.dctrl.wtf/360dctrl/index.html"
          title="DCTRL 360° virtual tour"
          width="100%"
          height="640"
          frameBorder="0"
          allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer"
          allowFullScreen
        />
        <div className="tour-fallback mono">
          // drag to look around · scroll to zoom · click hotspots to move
          between rooms
        </div>
      </div>
    </section>
  );
}

// ─────────────── Calendar (lu.ma embed) ───────────────
function Calendar() {
  return (
    <section className="section" id="calendar">
      <div className="section-head">
        <div>
          <div className="section-tag">// WHAT_S_ON · ALWAYS_FREE</div>
          <h2 className="section-title">
            Calendar <span className="accent">/ what's on.</span>
          </h2>
        </div>
        <a
          className="tier-cta"
          href="https://luma.com/yvr"
          target="_blank"
          rel="noreferrer"
        >
          Full calendar ▸
        </a>
      </div>
      <div className="calendar-embed">
        <iframe
          src="https://lu.ma/embed/calendar/cal-amfzgB29zJECwuw/events"
          title="DCTRL calendar"
          width="100%"
          height="560"
          frameBorder="0"
          style={{
            border: "1px solid var(--rule)",
            background: "var(--panel)",
            borderRadius: 0,
          }}
          allowFullScreen
          aria-hidden="false"
          tabIndex="0"
        />
        <div className="calendar-fallback mono">
          // can't see the calendar?{" "}
          <a href="https://luma.com/yvr" target="_blank" rel="noreferrer">
            open on lu.ma ▸
          </a>
        </div>
      </div>
    </section>
  );
}

// ─────────────── Talks ───────────────
const TALKS = [
  { id: "B9YO3fJXvw4", caption: "from the archive · 2024" },
  { id: "1S4cRiduV-U", caption: "from the archive · 2024" },
  { id: "hkJS5oIodbk", caption: "from the archive · 2023" },
  { id: "qLUK_nSZzuo", caption: "from the archive · 2023" },
  { id: "IlHUAjChj8E", caption: "from the archive · 2022" },
  { id: "84nqMwLyYZk", caption: "from the archive · 2022" },
];

function Talks() {
  return (
    <section className="section" id="talks">
      <div className="section-head">
        <div>
          <div className="section-tag">// PAST_TALKS · UNCUT</div>
          <h2 className="section-title">
            From the <span className="accent">archive.</span>
          </h2>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            alignItems: "flex-end",
          }}
        >
          <p className="section-sub" style={{ textAlign: "right", margin: 0 }}>
            We live-record most talks and post them the same day. Highlights
            here — the rest live on the channel.
          </p>
          <a
            className="tier-cta"
            href="https://www.youtube.com/@DCTRL"
            target="_blank"
            rel="noreferrer"
          >
            youtube.com/@dctrl ▸
          </a>
        </div>
      </div>
      <div className="talks">
        {TALKS.map((t, i) => (
          <a
            key={i}
            className="talk"
            href={`https://www.youtube.com/watch?v=${t.id}`}
            target="_blank"
            rel="noreferrer"
          >
            <div className="talk-thumb">
              <img
                src={`https://i.ytimg.com/vi/${t.id}/hqdefault.jpg`}
                alt=""
                loading="lazy"
              />
              <div className="play">
                <span>▶</span>
              </div>
            </div>
            <div className="talk-meta">{t.caption}</div>
          </a>
        ))}
      </div>
    </section>
  );
}

// ─────────────── Footer ───────────────
function Footer() {
  return (
    <footer className="footer" id="visit">
      <div className="container">
        <div className="footer-mark">
          <Logo size="huge" />
        </div>
        <div className="footer-grid">
          <div>
            <p className="footer-tagline">
              328 W Hastings St
              <br />
              Vancouver, BC · V6B 1L1
              <br />
              Open 24/7 for members.
              <br />
              <br />
              hello@dctrl.club
            </p>
            <pre className="footer-fp">
              PGP A4F2 8B91 C5D7 E3F0 6B72 9A0E 1F84 D5C2
            </pre>
          </div>
          <div>
            <div className="footer-h">// CHANNELS</div>
            <ul className="footer-list">
              <li>
                <a href="https://youtube.com/@DCTRL">youtube.com/@DCTRL</a>
              </li>
              <li>
                <a href="https://x.com/dctrlvan">@dctrlvan</a>
              </li>
              <li>
                <a href="https://twitch.tv/dctrlvan">twitch.tv/dctrlvan</a>
              </li>
              <li>
                <a href="https://discord.gg/7rjEfhtsxe">discord.gg/dctrl</a>
              </li>
              <li>
                <a href="https://dctrl.wtf">dctrl.wtf</a>
              </li>
            </ul>
          </div>
          <div>
            <div className="footer-h">// COMMUNITY</div>
            <ul className="footer-list">
              <li>Built to decentralize community.</li>
              <li>Member-run, non-profit.</li>
              <li>Open since 2013.</li>
            </ul>
          </div>
        </div>
        <div className="footer-bar">
          <span>© 2013–2026 DCTRL. society · vancouver, bc</span>
          <span>built in the open · self-hosted · no trackers</span>
          <span>v.PUNK / 2026.05.01</span>
        </div>
      </div>
    </footer>
  );
}

// ─────────────── Apply Modal ───────────────
// Paste the Google Apps Script web-app URL here (ends in /exec) to log
// submissions to a Google Sheet. Leave empty to keep the form inert.
const SHEET_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbz6oeiokgJvMy33d_48ir7xQFQW0QRX7GgeBYlg19_K0PJx5eohuHE_UaQMq8tB846yDw/exec";

function ApplyModal({ open, intent, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (open) setSubmitted(false);
  }, [open, intent]);
  if (!open) return null;
  const onSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.append("intent", intent);
    fd.append("submitted_at", new Date().toISOString());
    setSubmitted(true);
    if (SHEET_ENDPOINT) {
      fetch(SHEET_ENDPOINT, {
        method: "POST",
        body: new URLSearchParams(fd),
      }).catch((err) => console.error("dctrl form submit failed:", err));
    }
  };
  const titles = {
    desk: "Request a dedicated desk",
    membership: "Apply for membership",
    event: "Pitch your event",
    reach: "Send a signal",
  };
  const meta = {
    desk: "PRIORITY 0x01 · 24/7 access · ETA 3 business days",
    membership: "PRIORITY 0x02 · hot desks + lounge · ETA 5 business days",
    event: "PRIORITY 0x03 · talks / hacks / demos · ETA 2 business days",
    reach: "PRIORITY 0x04 · open channel",
  };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-tag">// {meta[intent]}</div>
            <h3 className="modal-title">{titles[intent]}</h3>
          </div>
          <button className="modal-x" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        {!submitted ? (
          <form className="modal-form" onSubmit={onSubmit}>
            <label>
              <span className="lbl">handle / name</span>
              <input
                name="handle"
                type="text"
                required
                placeholder="satoshi.eth"
              />
            </label>
            <label>
              <span className="lbl">contact channel</span>
              <input
                name="contact"
                type="text"
                required
                placeholder="signal · email · matrix"
              />
            </label>
            {intent === "event" && (
              <label>
                <span className="lbl">event_type · headcount</span>
                <input
                  name="event_type"
                  type="text"
                  placeholder="hack night · ~40"
                />
              </label>
            )}
            {intent === "desk" && (
              <label>
                <span className="lbl">project / what are you building</span>
                <input
                  name="project"
                  type="text"
                  placeholder="rollup, agent, zine, anything"
                />
              </label>
            )}
            {intent === "membership" && (
              <label>
                <span className="lbl">vouch · who do you know</span>
                <input
                  name="vouch"
                  type="text"
                  placeholder="member name · or 'walked in'"
                />
              </label>
            )}
            <label>
              <span className="lbl">message</span>
              <textarea
                name="message"
                rows={4}
                placeholder="tell us what you're up to."
              ></textarea>
            </label>
            <div className="modal-foot">
              <span className="modal-helper">
                // signed_message · we read every one
              </span>
              <button type="submit" className="apply-btn">
                Transmit ▸
              </button>
            </div>
          </form>
        ) : (
          <div className="modal-success">
            <div className="ok-stamp">RECEIVED</div>
            <p>Signal received. Expected response window: 24–72h.</p>
            <p className="mono small">
              // log appended to /var/log/dctrl/access_requests.log
            </p>
            <button className="apply-btn" onClick={onClose}>
              Close ▸
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

window.VirtualTour = VirtualTour;
window.Calendar = Calendar;
window.Talks = Talks;
window.Footer = Footer;
window.ApplyModal = ApplyModal;

// ─────────────── Detail Modal (photos + events) ───────────────
function DetailModal({ open, item, kind, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open || !item) return null;
  const isPhoto = kind === "photo";
  const tagText = isPhoto
    ? `// ARCHIVE_FRAME · ${item.where || "DCTRL."}`
    : `// EVENT · ${item.type || ""}`.toUpperCase();
  const titleText = isPhoto ? item.caption : item.title;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-detail" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-tag">{tagText}</div>
            <h3 className="modal-title">{titleText}</h3>
          </div>
          <button className="modal-x" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        {isPhoto && (
          <figure className="detail-photo">
            <img src={item.src} alt={item.caption} />
          </figure>
        )}
        <div className="detail-body">
          {!isPhoto && (
            <div className="detail-meta-row">
              <span className="detail-meta-k">when</span>
              <span className="detail-meta-v">{item.when}</span>
            </div>
          )}
          {!isPhoto && (
            <div className="detail-meta-row">
              <span className="detail-meta-k">where</span>
              <span className="detail-meta-v">{item.room}</span>
            </div>
          )}
          {!isPhoto && (
            <div className="detail-meta-row">
              <span className="detail-meta-k">host</span>
              <span className="detail-meta-v">{item.host}</span>
            </div>
          )}
          {isPhoto && item.when && (
            <div className="detail-meta-row">
              <span className="detail-meta-k">when</span>
              <span className="detail-meta-v">{item.when}</span>
            </div>
          )}
          <p className="detail-text">{item.detail}</p>
          <div className="modal-foot">
            <span className="modal-helper">
              // {isPhoto ? "frame_id" : "event_id"} ·{" "}
              {(titleText || "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .slice(0, 24)}
            </span>
            {!isPhoto && (
              <button className="apply-btn" onClick={onClose}>
                RSVP ▸
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

window.DetailModal = DetailModal;
