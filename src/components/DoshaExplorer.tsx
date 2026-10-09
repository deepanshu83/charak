"use client";

import { useState } from "react";

const DOSHAS: Record<
  "vata" | "pitta" | "kapha",
  { title: string; desc: string; hint: string }
> = {
  vata: {
    title: "Vata · Air & Space",
    desc: "Creative, quick and energetic. When out of balance: dry skin, joint pain, anxiety, irregular digestion.",
    hint: "Balance with: warm oil massage, regular routine, warm cooked food.",
  },
  pitta: {
    title: "Pitta · Fire & Water",
    desc: "Sharp, focused and driven. When out of balance: acidity, skin rashes, anger, excess heat in the body.",
    hint: "Balance with: cooling foods, calm routine, avoiding spicy and fried food.",
  },
  kapha: {
    title: "Kapha · Earth & Water",
    desc: "Calm, steady and strong. When out of balance: weight gain, congestion, sluggishness, heaviness.",
    hint: "Balance with: daily exercise, light warm meals, stimulating routine.",
  },
};

export default function DoshaExplorer() {
  const [active, setActive] = useState<"vata" | "pitta" | "kapha">("vata");
  const cur = DOSHAS[active];

  return (
    <section className="band" id="dosha">
      <div className="wrap">
        <div className="head light">
          <span className="tag">Ayurveda basics</span>
          <h2>Which dosha are you?</h2>
          <p>Every body is a unique mix of three energies. Tap to explore.</p>
        </div>
        <div className="tabs" role="tablist">
          <button
            className={active === "vata" ? "on" : ""}
            onClick={() => setActive("vata")}
            type="button"
          >
            Vata
          </button>
          <button
            className={active === "pitta" ? "on" : ""}
            onClick={() => setActive("pitta")}
            type="button"
          >
            Pitta
          </button>
          <button
            className={active === "kapha" ? "on" : ""}
            onClick={() => setActive("kapha")}
            type="button"
          >
            Kapha
          </button>
        </div>
        <div className="dbox" id="dbox">
          <h3 id="dt">{cur.title}</h3>
          <p id="dp">{cur.desc}</p>
          <p className="hint" id="dh">{cur.hint}</p>
        </div>
      </div>
    </section>
  );
}
