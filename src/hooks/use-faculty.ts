import { useEffect, useState } from "react";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

export interface FacultyMember {
  id: string;
  name: string;
  role: string;
  subject: string;
  initials: string;
  order?: number;
}

const FALLBACK_FACULTY: FacultyMember[] = [
  {
    id: "f1",
    name: "Suraj Pandit",
    role: "Senior Faculty",
    subject: "Veterinary Science",
    initials: "SP",
  },
  {
    id: "f2",
    name: "Ramesh Yadav",
    role: "Senior Faculty",
    subject: "Staff Nurse / HA",
    initials: "RY",
  },
  {
    id: "f3",
    name: "Purushotam Mandal",
    role: "Faculty",
    subject: "Electrical Engineering",
    initials: "PM",
  },
  {
    id: "f4",
    name: "Chandan Thakur",
    role: "Faculty",
    subject: "Electrical Engineering",
    initials: "CT",
  },
  {
    id: "f5",
    name: "Rajababu Yadav",
    role: "Faculty",
    subject: "Geomatic Engineering",
    initials: "RY",
  },
  { id: "f6", name: "Bishesh Mandal", role: "Faculty", subject: "Agriculture", initials: "BM" },
  {
    id: "f7",
    name: "Hare Kripal Yadav",
    role: "Faculty",
    subject: "Nepal Police Coaching",
    initials: "HY",
  },
  {
    id: "f8",
    name: "Phuleshwar Pandit",
    role: "Faculty",
    subject: "Nepal Police Physical",
    initials: "PP",
  },
];

export function useFaculty() {
  const [faculty, setFaculty] = useState<FacultyMember[]>(FALLBACK_FACULTY);

  useEffect(() => {
    let cancelled = false;
    const q = query(collection(db, "faculty"), limit(50));
    getDocs(q)
      .then((snap) => {
        if (cancelled || snap.empty) return;
        const rows = snap.docs.map((d) => {
          const data = d.data();
          const name = (data.name as string) ?? "";
          const initials =
            (data.initials as string) ??
            name
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();
          return {
            id: d.id,
            name,
            role: (data.role as string) ?? "",
            subject: (data.subject as string) ?? "",
            initials,
            order: (data.order as number) ?? 9999,
          };
        });
        rows.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
        setFaculty(rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return faculty;
}
