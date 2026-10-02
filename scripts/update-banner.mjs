// Seeds/repairs the homepage banner in Firestore `banners` using the
// firebase-admin SDK (bypasses security rules — server side).
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import path from "node:path";

const SA_PATH = path.resolve(
  process.cwd(),
  "../star-coaching-mobile/starcoachinginstitutenepal-dd3be24872b4.json",
);

// Hosted copy of public/BANNER/BANNER 1.png — absolute so the mobile app
// dashboards can load it too.
const IMAGE_URL = "https://starcoachinginstitutenepal.web.app/BANNER/BANNER%201.png";

const isBroken = (url) => !url || String(url).includes("firebasestorage.googleapis.com");

try {
  initializeApp({ credential: cert(SA_PATH) });
  const db = getFirestore();
  const snap = await db.collection("banners").get();

  if (snap.empty) {
    const ref = await db.collection("banners").add({
      title: null,
      subtitle: null,
      ctaText: null,
      ctaLink: null,
      sortOrder: 0,
      imageUrl: IMAGE_URL,
      isActive: true,
      createdAt: Timestamp.now(),
    });
    console.log("ADDED banner doc:", ref.id);
  } else {
    let updated = 0;
    for (const d of snap.docs) {
      const b = d.data();
      if (isBroken(b.imageUrl)) {
        await d.ref.update({ imageUrl: IMAGE_URL, isActive: b.isActive !== false });
        console.log("UPDATED broken imageUrl on doc:", d.id);
        updated++;
      } else {
        console.log("KEPT healthy doc:", d.id, "-", String(b.imageUrl).slice(0, 90));
      }
    }
    console.log(`done — ${updated} updated, ${snap.size - updated} healthy`);
  }

  // Verify final state.
  const after = await db.collection("banners").get();
  console.log(`\nfinal banners (${after.size}):`);
  after.docs.forEach((d) => {
    const b = d.data();
    console.log(
      "-",
      d.id,
      "| active:",
      b.isActive !== false,
      "|",
      String(b.imageUrl).slice(0, 100),
    );
  });
} catch (e) {
  console.error("ERROR:", e.message);
  process.exitCode = 1;
}
process.exit(process.exitCode ?? 0);
