import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const app = initializeApp({
  apiKey: "AIzaSyC5eZvLkCskpmgeAYBmAPmtOeL_0UsuiMA",
  authDomain: "starcoachinginstitutenepal.firebaseapp.com",
  projectId: "starcoachinginstitutenepal",
});
const db = getFirestore(app);
const auth = getAuth(app);

const iso = (offsetDays = 0) => new Date(Date.now() + offsetDays * 86400000).toISOString();

async function seed(name, docs) {
  const snap = await getDocs(collection(db, name));
  if (snap.size > 0) {
    console.log(`${name}: already has ${snap.size} docs — skipping seed`);
    return;
  }
  for (const d of docs) {
    await addDoc(collection(db, name), { ...d, createdAt: d.createdAt || iso() });
  }
  console.log(`${name}: ${docs.length} seeded`);
}

async function main() {
  await signInWithEmailAndPassword(auth, "super_admin@demo.starcoaching.edu.np", "Demo@2026!");
  console.log("Signed in");

  await seed("live_classes", [
    {
      name: "NP Full Mock — General Knowledge",
      teacher: "Hare Kripal Yadav",
      date: iso(0).slice(0, 16).replace("T", " "),
      status: "Upcoming",
      course: "Nepal Police Preparation",
    },
    {
      name: "Staff Nurse — Biology Live Session",
      teacher: "Ramesh Yadav",
      date: iso(0).slice(0, 16).replace("T", " "),
      status: "Upcoming",
      course: "Medical Entrance",
    },
    {
      name: "Loksewa — Paper & Essay Writing",
      teacher: "Suraj Pandit",
      date: iso(-1).slice(0, 16).replace("T", " "),
      status: "Recorded",
      course: "Loksewa Officer Prep",
    },
    {
      name: "Police Physical — Drill Practice",
      teacher: "Phuleshwar Pandit",
      date: iso(-1).slice(0, 16).replace("T", " "),
      status: "Completed",
      course: "Nepal Police Preparation",
    },
    {
      name: "IOE — Physics Numericals",
      teacher: "Chandan Thakur",
      date: iso(-2).slice(0, 16).replace("T", " "),
      status: "Recorded",
      course: "IOE Preparation",
    },
    {
      name: "English Grammar — Board Exam Booster",
      teacher: "Bishesh Mandal",
      date: iso(-3).slice(0, 16).replace("T", " "),
      status: "Completed",
      course: "SEE Bridge Course",
    },
  ]);

  await seed("light_manager", [
    {
      location: "Main Building – Hall A",
      fixtureType: "LED Tube (36W)",
      meterNo: "L-101",
      unitsConsumed: 142,
      lastMaintenance: "2083/02/10",
      status: "Active",
    },
    {
      location: "Main Building – Hall B",
      fixtureType: "LED Tube (36W)",
      meterNo: "L-102",
      unitsConsumed: 118,
      lastMaintenance: "2083/02/10",
      status: "Active",
    },
    {
      location: "Hostel – Girls Block",
      fixtureType: "LED Bulb (15W)",
      meterNo: "L-203",
      unitsConsumed: 96,
      lastMaintenance: "2083/01/22",
      status: "Active",
    },
    {
      location: "Hostel – Boys Block",
      fixtureType: "LED Bulb (15W)",
      meterNo: "L-204",
      unitsConsumed: 88,
      lastMaintenance: "2082/12/05",
      status: "Maintenance Due",
    },
    {
      location: "Office",
      fixtureType: "LED Panel (34W)",
      meterNo: "L-301",
      unitsConsumed: 54,
      lastMaintenance: "2083/03/01",
      status: "Active",
    },
    {
      location: "Cafeteria",
      fixtureType: "LED Tube (36W)",
      meterNo: "L-302",
      unitsConsumed: 73,
      lastMaintenance: "2083/03/01",
      status: "Active",
    },
  ]);

  await seed("sms_campaigns", [
    {
      name: "Admission Open 2083",
      recipients: 1200,
      sent: 1185,
      delivered: 1102,
      status: "Sent",
      date: iso(-2).slice(0, 10),
    },
    {
      name: "NP Mock Test Reminder",
      recipients: 340,
      sent: 340,
      delivered: 331,
      status: "Sent",
      date: iso(-5).slice(0, 10),
    },
  ]);

  await seed("email_campaigns", [
    {
      name: "March Parent Newsletter",
      recipients: 480,
      opened: 312,
      clicked: 96,
      status: "Completed",
      date: iso(-4).slice(0, 10),
    },
  ]);

  await seed("push_notifications", [
    {
      title: "New Test Result Published",
      audience: "All Students",
      status: "Sent",
      date: iso(-1).slice(0, 10),
    },
    {
      title: "Fee Payment Reminder",
      audience: "Students",
      status: "Scheduled",
      date: iso(1).slice(0, 10),
    },
  ]);

  await seed("integrations", [
    {
      name: "WhatsApp Business",
      type: "Messaging",
      status: "Connected",
      config: { apiKeySet: true, phone: "97798XXXXXXXX" },
    },
    {
      name: "Ncell A2P SMS",
      type: "SMS Gateway",
      status: "Connected",
      config: { apiKeySet: true },
    },
  ]);

  await seed("ai_prompts", [
    {
      title: "Homework Assistant",
      prompt: "You are a coaching institute assistant...",
      enabled: true,
      model: "Default",
    },
    {
      title: "Doubt Solver",
      prompt: "Answer student doubts clearly and briefly...",
      enabled: true,
      model: "Default",
    },
  ]);

  console.log("ALL DONE");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("SEED FAILED:", e.message);
    process.exit(1);
  });
