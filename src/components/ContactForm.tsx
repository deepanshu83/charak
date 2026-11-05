"use client";

import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";

interface ContactFormProps {
  selectedConcern?: string;
}

export default function ContactForm({
  selectedConcern = "Panchakarma",
}: ContactFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [concern, setConcern] = useState(selectedConcern);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (selectedConcern) {
      setConcern(selectedConcern);
    }
  }, [selectedConcern]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(
      `Hello Charak Ayurveda\nName: ${name.trim()}\nPhone: ${phone.trim()}\nConcern: ${concern}\nMessage: ${msg.trim()}`
    );
    window.open(`https://wa.me/918852887717?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="contact" id="contact">
      <div className="wrap cgrid">
        <div>
          <span className="tag">Get in touch</span>
          <h2>Begin your journey today</h2>
          <p>
            <b>Address</b>
            <br />
            6A, Beside Birla Hospital, Shyam Vatika, Vidyavihar, Rajasthan 333031
          </p>
          <p>
            <b>Phone</b>
            <br />
            <a href="tel:+918852887717">088528 87717</a>
          </p>
          <p>
            <b>Email</b>
            <br />
            <a href="mailto:charakayurvedapilani@gmail.com">
              charakayurvedapilani@gmail.com
            </a>
          </p>
          <a
            className="btn gold"
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.google.com/maps/place/Charak+Ayurveda+Panchakarma+Skin+Care,+Joint+Care+And+Infertility+Center/@28.3579064,75.6050713,17z/data=!3m1!4b1!4m6!3m5!1s0x3913195b99bca2db:0xaed2af1856272386!8m2!3d28.3579064!4d75.6050713!16s%2Fg%2F11gfm8c7_q"
          >
            Get Directions
          </a>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            required
          />
          <select
            id="concern"
            value={concern}
            onChange={(e) => setConcern(e.target.value)}
          >
            <option>Therapies (Panchakarma &amp; Retreat)</option>
            <option>Body Pain &amp; Spine</option>
            <option>Skin &amp; Hair Care</option>
            <option>Women&apos;s Health (PCOS / Fertility)</option>
            <option>Stomach &amp; Digestion</option>
            <option>Stress &amp; Lifestyle</option>
            <option>Other</option>
          </select>
          <textarea
            id="msg"
            rows={3}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Tell us your concern"
          />
          <button className="btn" type="submit">
            Send on WhatsApp
          </button>
        </form>
      </div>

      {/* Interactive Google Map of Hospital Location */}
      <div className="wrap" style={{ marginTop: "44px" }}>
        <div className="contact-map-wrapper">
          <div className="contact-map-bar">
            <div className="contact-map-info">
              <MapPin size={17} className="contact-map-icon" />
              <span>
                <strong>Charak Ayurveda:</strong> 6A, Beside Birla Hospital, Shyam Vatika, Vidyavihar, Rajasthan 333031
              </span>
            </div>
            <a
              href="https://www.google.com/maps/place/Charak+Ayurveda+Panchakarma+Skin+Care,+Joint+Care+And+Infertility+Center/@28.3579064,75.6050713,17z/data=!3m1!4b1!4m6!3m5!1s0x3913195b99bca2db:0xaed2af1856272386!8m2!3d28.3579064!4d75.6050713!16s%2Fg%2F11gfm8c7_q"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-map-btn"
            >
              Open in Google Maps ↗
            </a>
          </div>
          <iframe
            title="Charak Ayurveda Hospital Location Map"
            src="https://maps.google.com/maps?q=28.3579064%2C75.6050713&z=17&output=embed"
            width="100%"
            height="340"
            style={{ border: 0, display: "block" }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
