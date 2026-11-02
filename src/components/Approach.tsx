import Image from "next/image";
import Link from "next/link";

export default function Approach() {
  return (
    <section className="wrap split" id="doctor">
      <div className="frame ph6" style={{ position: "relative", overflow: "hidden" }}>
        <Image
          src="/Charaka_%20Father%20of%20Ayurveda.png"
          alt="Acharya Charak – Father of Ayurveda"
          fill
          sizes="(max-width: 768px) 100vw, 500px"
          style={{ objectFit: "cover", objectPosition: "center top" }}
          loading="lazy"
        />
      </div>
      <div>
        <span className="tag">Our approach</span>
        <h2>Rooted in the teachings of Acharya Charak</h2>
        <p>
          Our centre is named after Acharya Charak, the father of Ayurvedic medicine. His focus on balance, digestion and prevention guides every plan we create.
        </p>
        <ul className="ticks">
          <li>Honest diagnosis, no unnecessary medicines</li>
          <li>Pure herbal formulations and therapeutic oils</li>
          <li>Calm, private and caring environment</li>
          <li>Located beside Birla Hospital, Vidyavihar</li>
        </ul>
        <Link href="/doctors" className="btn">
          Meet Our Doctor
        </Link>
      </div>
    </section>
  );
}
