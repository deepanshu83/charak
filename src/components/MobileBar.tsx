import { Phone, MessageCircle } from "lucide-react";

export default function MobileBar() {
  return (
    <div className="mbar" role="region" aria-label="Quick contact actions">
      <a href="tel:+918852887717" className="mbar-btn mbar-call" aria-label="Call Charak Clinic">
        <Phone size={15} />
        <span>Call</span>
      </a>
      <a
        href="https://wa.me/918852887717"
        target="_blank"
        rel="noopener noreferrer"
        className="mbar-btn mbar-wa"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={16} />
        <span>WhatsApp</span>
      </a>
    </div>
  );
}
