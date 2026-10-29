import Image from "next/image";
import Link from "next/link";

export default function Approach() {
  return (
    <section className="wrap split" id="doctor">
      <div className="frame ph6">
        <Image
          src="/FATHER-AYURVEDA.webp"
          alt="Acharya Charak – Father of Ayurveda"
          width={500}
          height={480}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
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
