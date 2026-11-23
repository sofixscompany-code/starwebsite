import { useEffect, useState } from "react";
import { doc, onSnapshot } from "@/integrations/aws/firestore";
import { db } from "@/integrations/aws/config";
import { site, type SiteConfig } from "@/lib/site-config";

/**
 * Live site settings (contacts, socials, branding) from `site_settings/config`.
 * Falls back to the static `site` config until an admin saves settings.
 */
export function useSiteSettings(): SiteConfig {
  const [cfg, setCfg] = useState<SiteConfig>(site);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "site_settings", "config"),
      (d) => {
        const data = d.data();
        if (!data) return setCfg(site);
        const phones = Array.isArray(data.phones)
          ? (data.phones as string[]).map((p) => String(p).trim()).filter(Boolean)
          : site.phones;
        setCfg({
          ...site,
          name: data.name || site.name,
          legalName: data.legalName || site.legalName,
          location: data.location || site.location,
          city: data.city || site.city,
          managingDirector: data.managingDirector || site.managingDirector,
          phones: phones.length ? phones : site.phones,
          whatsapp: data.whatsapp || site.whatsapp,
          email: data.email || site.email,
          established: data.established || site.established,
          tagline: data.tagline || site.tagline,
          socials: {
            ...site.socials,
            ...(data.socials && typeof data.socials === "object" && !Array.isArray(data.socials)
              ? data.socials
              : {}),
          },
        });
      },
      () => setCfg(site),
    );
    return unsub;
  }, []);

  return cfg;
}
