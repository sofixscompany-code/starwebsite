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

  await seed("gallery", [
    {
      title: "Nepal Police physical training",
      url: "https://picsum.photos/seed/star-np/800/600",
      category: "Training",
      order: 1,
      status: "Active",
    },
    {
      title: "Classroom in session",
      url: "https://picsum.photos/seed/star-class/800/600",
      category: "Campus",
      order: 2,
      status: "Active",
    },
    {
      title: "Loksewa mock test day",
      url: "https://picsum.photos/seed/star-loksewa/800/600",
      category: "Exams",
      order: 3,
      status: "Active",
    },
    {
      title: "Staff Nurse practical",
      url: "https://picsum.photos/seed/star-medical/800/600",
      category: "Training",
      order: 4,
      status: "Active",
    },
    {
      title: "Result celebration",
      url: "https://picsum.photos/seed/star-celebrate/800/600",
      category: "Events",
      order: 5,
      status: "Active",
    },
    {
      title: "Faculty session",
      url: "https://picsum.photos/seed/star-faculty/800/600",
      category: "Campus",
      order: 6,
      status: "Active",
    },
    {
      title: "Hostel - Boys & Girls",
      url: "https://picsum.photos/seed/star-hostel/800/600",
      category: "Campus",
      order: 7,
      status: "Active",
    },
    {
      title: "Computer lab",
      url: "https://picsum.photos/seed/star-lab/800/600",
      category: "Campus",
      order: 8,
      status: "Active",
    },
    {
      title: "SEE Preparation batch",
      url: "https://picsum.photos/seed/star-see/800/600",
      category: "Training",
      order: 9,
      status: "Active",
    },
  ]);

  await seed("whatsapp_campaigns", [
    {
      name: "Admission Open 2083",
      message:
        "Admissions open for 2083/84 at Star Coaching Institute, Zeromile Janakpurdham. Call today!",
      recipients: 850,
      delivered: 812,
      status: "Sent",
    },
    {
      name: "Mock Test Weekend",
      message: "Free mock test this Saturday at 8 AM. Register at the office.",
      recipients: 420,
      delivered: 0,
      status: "Scheduled",
    },
  ]);

  await seed("messages", [
    {
      from: "Admin",
      to: "All Teachers",
      subject: "March schedule",
      body: "Please submit your monthly attendance reports by Friday.",
      status: "Read",
    },
    {
      from: "Ramesh Sharma",
      to: "Admin",
      subject: "Room change",
      body: "Monday Physics class moved to Room 203.",
      status: "Read",
    },
    {
      from: "Admin",
      to: "Parents",
      subject: "Parent-teacher meeting",
      body: "Quarterly PTM on 2083/05/01 at 11 AM.",
      status: "Sent",
    },
  ]);

  await seed("roles", [
    {
      name: "Librarian",
      description: "Manages the institute library and issue/return records.",
      status: "Active",
    },
    {
      name: "Receptionist",
      description: "Handles walk-in enquiries and admission counselling.",
      status: "Active",
    },
    {
      name: "Accountant",
      description: "Manages fees, payments and expense records.",
      status: "Active",
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
