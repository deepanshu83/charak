"use client";

import { useState, useEffect } from "react";

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
    const f = (v: string) => encodeURIComponent(v);
    const text = `Hello Charak Ayurveda%0AName: ${f(name)}%0APhone: ${f(
      phone
    )}%0AConcern: ${f(concern)}%0AMessage: ${f(msg)}`;
    window.open(`https://wa.me/918852887717?text=${text}`, "_blank");
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
            href="https://www.google.com/maps/search/?api=1&query=Charak+Ayurveda+Panchakarma+Vidyavihar+Pilani"
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
            <option>Panchakarma</option>
            <option>Skin Care</option>
            <option>Joint Care</option>
            <option>Infertility Care</option>
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
    </section>
  );
}
