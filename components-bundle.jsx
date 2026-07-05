// dctrl. PUNK — components
const { useState, useEffect, useRef } = React;

// ─────────────── Logo (uppercase, Figma-style) ───────────────
function Logo({ size = "lg", className = "" }) {
  return (
    <span className={`logo ${size} ${className}`}>
      <span className="box-d">D</span><span className="rest">CTRL</span>
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
    const safeJson = (url) => fetch(url).then(r => r.ok ? r.json() : null).catch(() => null);
    async function load() {
      const g = await safeJson("https://www.ethgas.watch/api/gas");
      if (cancelled) return;
      if (g && g.normal && g.normal.gwei) setGas(Math.round(g.normal.gwei) + " gwei");
    }
    load();
    const iv = setInterval(load, 60000);
    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  const uptime = (() => {
    const start = new Date('2013-11-01T00:00:00Z').getTime();
    const days = Math.floor((Date.now() - start) / 86400000);
    return `${days}d`;
  })();
  const time = now.toUTCString().split(' ')[4];

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
        <span className="status-item"><span className="k">SYS</span><b>ONLINE</b></span>
        <span className="status-item"><span className="k">UPTIME</span><b>{uptime}</b></span>
        <span className="status-item hide-mobile"><span className="k">MEMBERS</span><b>137</b></span>
        <span className="status-item hide-mobile"><span className="k">GAS</span><b>{gas || "—"}</b></span>
        <span className="status-item hide-mobile"><span className="k">CTX</span><b>{ctx}</b></span>
        <span className="statusbar-spacer" />
        <span className="status-item hide-mobile"><span className="k">LOC</span><b>49.2827°N 123.1207°W</b></span>
        <span className="status-item"><span className="k">UTC</span><b>{time}</b></span>
      </div>
    </div>
  );
}

// ─────────────── Marquee ticker ───────────────
function Marquee({ items, invert = false, speed }) {
  const content = [...items, ...items].map((t, i) => (
    <span key={i}>{t} <span className="dot">●</span></span>
  ));
  return (
    <div className={`marquee ${invert ? "invert" : ""}`}>
      <div className="marquee-track" style={speed ? { animationDuration: `${speed}s` } : undefined}>
        {content}
      </div>
    </div>
  );
}

// ─────────────── Nav ───────────────
function Nav({ onApply }) {
  return (
    <nav className="nav">
      <a href="#top" style={{ textDecoration: "none" }}><Logo size="lg" /></a>
      <ul className="nav-links">
        <li><a href="#manifesto">Manifesto</a></li>
        <li><a href="#history">History</a></li>
        <li><a href="#space">Space</a></li>
        <li><a href="#events">Events</a></li>
        <li><a href="#talks">Talks</a></li>
        <li><a href="#visit">Visit</a></li>
      </ul>
      <button className="nav-cta" onClick={() => onApply("membership")}>
        Request Access ▸
      </button>
    </nav>
  );
}

// ─────────────── Hero ───────────────
const CTA_OPTIONS = [
  { key: "desk",       label: "Dedicated desk" },
  { key: "membership", label: "Membership" },
  { key: "event",      label: "Host an event" },
  { key: "reach",      label: "Send signal" },
];

function Hero({ onApply, intent, setIntent }) {
  return (
    <section className="hero" id="top">
      <div className="hero-grid">
        <div className="hero-l">
          <div className="hero-eyebrow">
            <span className="dot" />
            <span>Coworking</span>
            <span>·</span>
            <span>Gastown / Vancouver</span>
            <span>·</span>
            <span className="accent">OPERATING SINCE 2013</span>
          </div>

          <h1 className="display">
            <span className="strike">Closed garden</span><br/>
            <span>The </span><span className="box">space</span><br/>
            <span>for community.</span>
          </h1>

          <p className="hero-lede">
            A <strong>member-run, non-profit</strong> studio on West Hastings —
            for engineers, designers, builders and the crypto-curious crowd
            that keeps the kettle on. <strong>Funded by dues & grants, not capital.</strong>
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
                {intent === "reach" ? "Send signal" : intent === "event" ? "Pitch the event" : "Submit request"}
                <span className="arrow">▸</span>
              </button>
              <span className="apply-helper">
                {intent === "desk"       && "24/7 access · From $480/mo"}
                {intent === "membership" && "Hot desks + lounge · From $220/mo"}
                {intent === "event"      && "Talks · demos · hackathons · ≤80 ppl"}
                {intent === "reach"      && "Press · partnerships · just curious"}
              </span>
            </div>
          </div>
        </div>

        <figure className="hero-photo" style={{ margin: 0 }}>
          <img src={(window.__resources && window.__resources.heroStorefront) || "assets/photos-bundle/new-storefront.jpg"} alt="dctrl. — new home, 328 W Hastings storefront" />
          <span className="photo-tag">DSC_03678</span>
          <span className="photo-stamp">ACQUIRED</span>
          <span className="photo-coords">328 W HASTINGS · 49.2827°N 123.1207°W</span>
        </figure>
      </div>
    </section>
  );
}

// ─────────────── Manifesto ───────────────
const MANIFESTO_LINES = [
  "Privacy is not a feature. It is the precondition.",
  "We build in the open. We host in the open.",
  "The door is open to anyone who shows up.",
  "Run as a non-profit. Funded by dues & grants.",
  "If it can be self-hosted, it will be.",
  "Talks are recorded. Names are optional.",
  "Cypherpunks write code. Cypherpunks pay rent.",
  "The space outlives the cycle.",
];

function Manifesto() {
  return (
    <section className="section first" id="manifesto">
      <div className="manifesto">
        <div className="section-tag" style={{ color: "var(--accent)" }}>// COMMUNIQUÉ 001 · 2013→</div>
        <h2>
          A space for <span className="accent">community.</span>
        </h2>
        <p style={{ fontFamily: "var(--mono)", fontSize: 13, lineHeight: 1.55, maxWidth: "60ch", opacity: 0.8 }}>
          Vancouver's longest-running home for Bitcoin, crypto and decentralized
          tech. Started as a back room on Pender. Became an Institution.
        </p>
        <div className="manifesto-grid">
          {MANIFESTO_LINES.map((line, i) => (
            <div className="man-line" key={i}>
              <span className="num">0{i+1}</span>
              <span>{line}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────── Logos / collaborators ───────────────
const LOGOS = [
  { name: "Giveth",              role: "Grants" },
  { name: "Ethereum Foundation", role: "Ecosystem" },
  { name: "Gitcoin Grants",      role: "Quadratic funding" },
  { name: "Nous Research",       role: "Open AI" },
  { name: "Optimism RetroPGF",   role: "Retro funding" },
  { name: "Protocol Labs",       role: "Infra grants" },
  { name: "Vancouver Tech",      role: "Community" },
  { name: "Mozilla",             role: "Open web" },
  { name: "Bitcoin Vancouver",   role: "Local meetup" },
  { name: "Web3.bc",             role: "Provincial" },
  { name: "Recurse Center",      role: "Sister space" },
  { name: "Open Collective",     role: "Treasury" },
];

function Logos() {
  return (
    <section className="section" id="friends">
      <div className="section-head">
        <div>
          <div className="section-tag">// FRIENDS_OF_DCTRL</div>
          <h2 className="section-title">Donors &<br/><span className="accent">friends.</span></h2>
        </div>
        <p className="section-sub">
          dctrl. is funded by member dues, public-goods grants, and friends who
          believe a city needs places to think out loud. Non-exhaustive list.
        </p>
      </div>
      <div className="logos-strip">
        {LOGOS.map((l) => (
          <div key={l.name} className="logo-cell">
            <div className="logo-name">{l.name}</div>
            <div className="logo-meta">{l.role}</div>
          </div>
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
window.Logos = Logos;
window.CTA_OPTIONS = CTA_OPTIONS;


// ─────────────── History ───────────────
const NOTABLE = [
  { name: "Vitalik Buterin",      role: "Co-founder, Ethereum" },
  { name: "Andreas Antonopoulos", role: "Bitcoin educator" },
  { name: "Erik Voorhees",        role: "ShapeShift / Venice.AI" },
  { name: "Jacob Steeves",        role: "Co-founder, Bittensor" },
  { name: "0xMaki",               role: "SushiSwap" },
  { name: "Witek Radomski",       role: "Founder, Enjin" },
  { name: "Peter Rizun",          role: "Bitcoin Unlimited" },
  { name: "Ken Sim",              role: "Mayor of Vancouver" },
];

function History() {
  return (
    <section className="section" id="history">
      <div className="section-head">
        <div>
          <div className="section-tag">// SINCE 2013 · v12.5.0</div>
          <h2 className="section-title">The <span className="accent">story.</span></h2>
        </div>
        <p className="section-sub">
          Twelve years deep. New chapter on West Hastings — same kettle,
          same loud opinions, more room to grow.
        </p>
      </div>

      <div className="story-grid">
        <figure className="story-photo">
          <img src={(window.__resources && window.__resources.founders) || "assets/photos-bundle/founders.jpg"} alt="Co-founders at dctrl." loading="lazy" />
          <figcaption>Cam &amp; Freddie · 436 W Pender · 2014</figcaption>
        </figure>

        <div className="story-body">
          <p className="story-lede">
            Founded 2013 as <em>Decentral Vancouver</em> — Vancouver's
            longest-running home for Bitcoin, crypto and decentralized tech.
            Started as a back room on Pender. Became an <em>Institution</em>.
          </p>
          <p>
            Over twelve years it became an educational hub, a cultural meeting place,
            and an ideation centre for Bitcoin, Ethereum, web3 and everything adjacent.
            Weekly meetups. Talks. Hackathons. Music nights. Quiet Tuesdays where
            someone fixes their compiler at 2am while someone else paints the lounge.
          </p>
          <p>
            For many of the people who walked through the door — students, founders,
            ex-bankers, artists — DCTRL. was the first place they met other people
            who also believed in this stuff and realized they weren't building alone.
          </p>

          <blockquote className="story-quote">
            "The first place I met people who also believed in it,<br/>
            and realized I wasn't building alone."
          </blockquote>

          <p>
            The space became a laboratory for crypto-native physical infrastructure:
            the <strong>Bepsi machine</strong> — a donation-powered vending machine
            running since 2015 that today accepts Lightning and a dozen EVM chains.
            Programmable door access via Discord emoji reactions. A small museum
            of early mining hardware in the back. Glass sidewalk tiles with LEDs underneath.
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
                  <span className="notable-role">{p.role}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="story-callout">
            <div className="callout-tag">// 328_W_HASTINGS · NEW_CHAPTER</div>
            <p>
              For most of its life DCTRL. lived at <strong>436 W Pender</strong> —
              brick-walled basement that hosted thousands of talks, hacks and late-night
              arguments. When the building was slated for demolition, we packed up and
              moved a few blocks west. Same community, same kettle, more room to grow.
            </p>
            <a className="callout-link" href="#">Read the proposal ▸</a>
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
  { key: "shotHack", src: "assets/photos/btc-hackathon-2024.jpg",   caption: "Bitcoin hackathon · 2024",          span: "tall",
    detail: "Annual hackathon — 36 hours, 60 builders, judges from Bitcoin Vancouver and Ethereum Foundation. Winners shipped a Lightning vending-machine prototype that became the Bepsi v2.",
    where: "Main floor · 436 W Pender", when: "Nov 2024" },
  { key: "shotFlag", src: "assets/photos/btc-flag.jpg",             caption: "436 W Pender · the original",        span: "",
    detail: "The flag has hung in every DCTRL. location since day one. The original 2013 storefront on Pender — basement vibes, fluorescent lights, the smell of coffee and toner.",
    where: "436 W Pender (original)", when: "2013–2025" },
  { key: "shotInside3", src: "assets/photos/inside-3.png",             caption: "Hallway · tea wall + workstations",  span: "wide",
    detail: "The hallway between the two studios. Members keep ~20 varieties of loose-leaf tea and a single questionable kettle. The wall of monitors is a self-hosted dashboard rotation — block height, member presence, weather, on-call.",
    where: "Hallway · Studio A → B", when: "ongoing" },
  { key: "shotInside1", src: "assets/photos/inside-1.png",             caption: "Museum of blockchain relics",        span: "",
    detail: "A small museum: a working Bitmain S1, an early ASICMiner block-erupter array, a Ledger prototype, the original whiteboard from the night ETH 2.0 was sketched out (signed by everyone in the room).",
    where: "Back room", when: "curated since 2016" },
  { key: "shotInside5", src: "assets/photos/inside-5.png",             caption: "Members meeting room",               span: "wide",
    detail: "Glass-walled meeting room. Schedulable on Discord with the /book command. Best whiteboard in the building. Hosts our weekly all-hands and the occasional remote conference call back to Berlin / Singapore.",
    where: "Studio B", when: "ongoing" },
  { key: "shotInside2", src: "assets/photos/inside-2.png",             caption: "Cam & Freddie + Vitalik",            span: "",
    detail: "Vitalik dropped in for a Tuesday talk in 2017. No livestream — at his request. The talk is in nobody's archive. The conversation continued at the bar across the street until 2am.",
    where: "Main floor · 436 W Pender", when: "2017" },
  { key: "shotInside4", src: "assets/photos/inside-4.png",             caption: "Mayor Ken Sim · using the Bepsi",    span: "tall",
    detail: "Mayor Ken Sim using the Bepsi machine — the donation-powered vending machine that's been running since 2015. Today it accepts Lightning, twelve EVM chains, and exact change in CAD.",
    where: "Kitchen", when: "Mar 2024" },
  { key: "shotInside7", src: "assets/photos/inside-7.png",             caption: "Pool table & relics room",           span: "wide",
    detail: "The pool table came with the building. We patched the felt twice. Behind it: shelves of donated hardware, books and binders from the early Vancouver crypto scene. Nothing here is for sale.",
    where: "Lounge", when: "ongoing" },
  { key: "shotInside6", src: "assets/photos/inside-6.png",             caption: "Live-stream rig, piano & DJ booth",  span: "wide",
    detail: "Three-camera live-stream rig, upright piano, and a small DJ booth. Used for talks, demo nights, and the occasional Friday party that runs until the upstairs neighbours politely complain.",
    where: "Main floor", when: "ongoing" },
];

function SpaceGallery({ onPhoto }) {
  return (
    <section className="section" id="space">
      <div className="section-head">
        <div>
          <div className="section-tag">// 4,800 SQ_FT · 8 BOOTHS · 2 STUDIOS</div>
          <h2 className="section-title">Inside <span className="accent">DCTRL.</span></h2>
        </div>
        <p className="section-sub">
          Brick. Fir floors. Eight phone booths. Two studios. One absurdly good
          espresso machine. Tap any photo for context.
        </p>
      </div>
      <div className="gallery">
        {SPACE_SHOTS.map((s, i) => (
          <figure key={i} className={`shot ${s.span}`} data-idx={String(i+1).padStart(2,'0')}
                  onClick={() => onPhoto && onPhoto(s)} role="button" tabIndex={0}
                  onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && onPhoto) { e.preventDefault(); onPhoto(s); } }}>
            <img src={(window.__resources && s.key && window.__resources[s.key]) || s.src} alt={s.caption} loading="lazy" />
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


// ─────────────── Events ───────────────
const EVENTS = [
  { day: "02", mon: "May", year: "2026", title: "Local-first software, in practice", host: "with Martin Kleppmann (remote)", room: "Main floor", type: "Talk",
    detail: "Martin Kleppmann joins remote to walk through the state of CRDTs in production: what's working, what's still painful, and the open research problems. Q&A from the floor; the recording is up the next morning.",
    when: "Sat May 02 · 7:00pm PT" },
  { day: "08", mon: "May", year: "2026", title: "Hack night — write a tiny rollup",  host: "BYO laptop · pizza on us",         room: "Studio B",   type: "Build",
    detail: "Bring a laptop, leave with a tiny optimistic rollup running on a local devnet. We provide the scaffold, dinner, and people to argue with. All skill levels welcome — some Solidity helps but isn't required.",
    when: "Fri May 08 · 6:30pm → late" },
  { day: "15", mon: "May", year: "2026", title: "Gastown Founders Coffee",           host: "Open invite · bring a question",   room: "Kitchen",    type: "Coffee",
    detail: "Open coffee. No agenda, no panel. Show up with a problem you're stuck on; leave with two or three new contacts and probably an answer. Free and open to anyone building anything.",
    when: "Fri May 15 · 9:00 → 11:00am" },
  { day: "22", mon: "May", year: "2026", title: "Public goods funding, post-RetroPGF", host: "Panel · Optimism + Giveth",      room: "Main floor", type: "Panel",
    detail: "What did we learn from three rounds of Optimism RetroPGF? Panelists from Optimism Foundation, Giveth and Gitcoin Grants compare notes. Recorded; live-streamed and posted to YouTube the same night.",
    when: "Fri May 22 · 7:00pm PT" },
  { day: "29", mon: "May", year: "2026", title: "Demo night — what members built",   host: "5 demos · 7 minutes each",         room: "Main floor", type: "Demo",
    detail: "Five members, seven minutes each. Working demos only — no pitches, no roadmaps. Audience picks the favourite; winner's drinks are on the DCTRL. society for the evening.",
    when: "Fri May 29 · 7:30pm PT" },
];

function Events({ onApply, onEvent }) {
  return (
    <section className="section" id="events">
      <div className="section-head">
        <div>
          <div className="section-tag">// WHAT_S_ON · ALWAYS_FREE</div>
          <h2 className="section-title">Events <span className="accent">@dctrl.</span></h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
          <button className="tier-cta" onClick={() => onApply("event")}>Host yours ▸</button>
        </div>
      </div>
      <div className="events">
        {EVENTS.map((e, i) => (
          <a key={i} className="event-row" href="#" onClick={(ev) => { ev.preventDefault(); onEvent && onEvent(e); }}>
            <div className="event-date"><span className="day">{e.day}</span>{e.mon} {e.year}</div>
            <div className="event-title">{e.title}</div>
            <div className="event-meta">[{e.type}] · {e.room} · {e.host}</div>
            <div className="event-rsvp">Details ▸</div>
          </a>
        ))}
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
          <h2 className="section-title">From the <span className="accent">archive.</span></h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-end" }}>
          <p className="section-sub" style={{ textAlign: "right", margin: 0 }}>
            We live-record most talks and post them the same day. Highlights here — the rest live on the channel.
          </p>
          <a className="tier-cta" href="https://www.youtube.com/@DCTRL" target="_blank" rel="noreferrer">youtube.com/@dctrl ▸</a>
        </div>
      </div>
      <div className="talks">
        {TALKS.map((t, i) => (
          <a key={i} className="talk" href={`https://www.youtube.com/watch?v=${t.id}`} target="_blank" rel="noreferrer">
            <div className="talk-thumb">
              <img src={`https://i.ytimg.com/vi/${t.id}/hqdefault.jpg`} alt="" loading="lazy" />
              <div className="play"><span>▶</span></div>
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
        <div className="footer-mark"><Logo size="huge" /></div>
        <div className="footer-grid">
          <div>
            <p className="footer-tagline">
              328 W Hastings St<br/>Vancouver, BC · V6B 1L1<br/>Open 24/7 for members.<br/><br/>
              hello@dctrl.club
            </p>
            <pre className="footer-fp">PGP A4F2 8B91 C5D7 E3F0
6B72 9A0E 1F84 D5C2</pre>
          </div>
          <div>
            <div className="footer-h">// CHANNELS</div>
            <ul className="footer-list">
              <li><a href="https://github.com/dctrl">github.com/dctrl</a></li>
              <li><a href="https://twitter.com/dctrlclub">@dctrlclub</a></li>
              <li><a href="https://www.youtube.com/@DCTRL">youtube.com/@dctrl</a></li>
              <li><a href="#">discord.gg/dctrl</a></li>
              <li><a href="#">matrix #dctrl:matrix.org</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-h">// LEGAL</div>
            <ul className="footer-list">
              <li><a href="#">Code of conduct</a></li>
              <li><a href="#">Member agreement</a></li>
              <li><a href="#">Privacy</a></li>
              <li><a href="#">Bylaws · v3</a></li>
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
function ApplyModal({ open, intent, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => { if (open) setSubmitted(false); }, [open, intent]);
  if (!open) return null;
  const titles = {
    desk:       "Request a dedicated desk",
    membership: "Apply for membership",
    event:      "Pitch your event",
    reach:      "Send a signal",
  };
  const meta = {
    desk:       "PRIORITY 0x01 · 24/7 access · ETA 3 business days",
    membership: "PRIORITY 0x02 · hot desks + lounge · ETA 5 business days",
    event:      "PRIORITY 0x03 · talks / hacks / demos · ETA 2 business days",
    reach:      "PRIORITY 0x04 · open channel",
  };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-tag">// {meta[intent]}</div>
            <h3 className="modal-title">{titles[intent]}</h3>
          </div>
          <button className="modal-x" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {!submitted ? (
          <form className="modal-form" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
            <label><span className="lbl">handle / name</span><input type="text" required placeholder="satoshi.eth" /></label>
            <label><span className="lbl">contact channel</span><input               type="text" required placeholder="signal · email · matrix" /></label>
            {intent === "event" && (
              <label><span className="lbl">event_type · headcount</span><input type="text" placeholder="hack night · ~40" /></label>
            )}
            {intent === "desk" && (
              <label><span className="lbl">project / what are you building</span><input type="text" placeholder="rollup, agent, zine, anything" /></label>
            )}
            {intent === "membership" && (
              <label><span className="lbl">vouch · who do you know</span><input type="text" placeholder="member name · or 'walked in'" /></label>
            )}
            <label><span className="lbl">message</span><textarea rows={4} placeholder="tell us what you're up to."></textarea></label>
            <div className="modal-foot">
              <span className="modal-helper">// signed_message · we read every one</span>
              <button type="submit" className="apply-btn">Transmit ▸</button>
            </div>
          </form>
        ) : (
          <div className="modal-success">
            <div className="ok-stamp">RECEIVED</div>
            <p>Signal received. Expected response window: 24–72h.</p>
            <p className="mono small">// log appended to /var/log/dctrl/access_requests.log</p>
            <button className="apply-btn" onClick={onClose}>Close ▸</button>
          </div>
        )}
      </div>
    </div>
  );
}

window.Events = Events;
window.Talks = Talks;
window.Footer = Footer;
window.ApplyModal = ApplyModal;

// ─────────────── Detail Modal (photos + events) ───────────────
function DetailModal({ open, item, kind, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
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
          <button className="modal-x" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {isPhoto && (
          <figure className="detail-photo">
            <img src={(window.__resources && item.key && window.__resources[item.key]) || item.src} alt={item.caption} />
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
            <span className="modal-helper">// {isPhoto ? "frame_id" : "event_id"} · {(titleText || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 24)}</span>
            {!isPhoto && (
              <button className="apply-btn" onClick={onClose}>RSVP ▸</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

window.DetailModal = DetailModal;
