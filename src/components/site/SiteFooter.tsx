import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";
import { StarLogo } from "./StarLogo";
import { site } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="bg-navy text-navy-foreground mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-md shrink-0">
              <StarLogo size="sm" />
            </div>
            <div>
              <p className="font-display font-extrabold text-lg leading-tight">
                Star Coaching Institute
              </p>
              <p className="text-xs text-white/60 uppercase tracking-widest">
                Pvt. Ltd. · {site.city}
              </p>
            </div>
          </div>
          <p className="text-sm text-white/70 max-w-md leading-relaxed">
            Nepal's trusted preparation partner for Police, Army, Loksewa, Medical, Technical, and
            school studies. Managed by {site.managingDirector}.
          </p>
          <div className="mt-5 space-y-2 text-sm">
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-brand-red" />
              <span>{site.location}</span>
            </p>
            <p className="flex items-start gap-2">
              <Phone className="w-4 h-4 mt-0.5 text-brand-red" />
              <span>{site.phones.slice(0, 2).join(", ")}</span>
            </p>
            <p className="flex items-start gap-2">
              <Mail className="w-4 h-4 mt-0.5 text-brand-red" />
              <span>{site.email}</span>
            </p>
          </div>
        </div>

        <div>
          <p className="font-display font-bold uppercase tracking-widest text-xs mb-4 text-gold">
            Quick Links
          </p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-gold">About</Link></li>
            <li><Link to="/courses" className="hover:text-gold">Courses</Link></li>
            <li><Link to="/faculty" className="hover:text-gold">Faculty</Link></li>
            <li><Link to="/results" className="hover:text-gold">Results</Link></li>
            <li><Link to="/gallery" className="hover:text-gold">Gallery</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-display font-bold uppercase tracking-widest text-xs mb-4 text-gold">
            Get Started
          </p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/admission" className="hover:text-gold">Online Admission</Link></li>
            <li><Link to="/auth" className="hover:text-gold">Student Login</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact Us</Link></li>
            <li>
              <a href={`https://wa.me/977${site.whatsapp}`} className="hover:text-gold">
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-white/50">
          <p>&copy; 2025 {site.legalName}. All rights reserved.</p>
          <p>Powered by <span className="text-white/70 font-semibold">Sofixs</span></p>
        </div>
      </div>
    </footer>
  );
}

