import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { BadgeCheck, BedDouble, GraduationCap } from "lucide-react";

/**
 * "My Admission" — the applicant's own verified admission record.
 *
 * Firestore rules only let a student/parent read the admission doc linked to
 * their account (`studentUid` / `parentUid`, stamped at verify time), so this
 * hook always filters by the caller's own uid. Shows the granted discount +
 * payable — fields NO other applicant can ever see.
 */
export function useMyAdmission(field: "studentUid" | "parentUid", uid?: string) {
  return useQuery({
    queryKey: ["my-admission", field, uid ?? ""],
    enabled: !!uid,
    queryFn: async () => {
      const snap = await getDocs(
        query(collection(db, "admissions"), where(field, "==", uid), limit(5)),
      );
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Record<string, unknown>[];
      docs.sort((a, b) => Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0));
      return docs[0] ?? null;
    },
    staleTime: 60_000,
  });
}

const STATUS_STYLES: Record<string, string> = {
  verified: "bg-emerald-100 text-emerald-700",
  approved: "bg-emerald-100 text-emerald-700",
  submitted: "bg-amber-100 text-amber-700",
  draft: "bg-gray-100 text-gray-600",
  rejected: "bg-red-100 text-red-700",
};

function num(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function rs(n: number): string {
  return `Rs. ${n.toLocaleString("en-IN")}`;
}

export function MyAdmissionCard({
  field,
  uid,
}: {
  field: "studentUid" | "parentUid";
  uid?: string;
}) {
  const { data: adm, isLoading } = useMyAdmission(field, uid);
  if (isLoading || !adm) return null;

  const status = String(adm.status ?? "");
  const discount = num(adm.discount);
  const total = num(adm.totalPayment);
  const payable = num(adm.payable) || Math.max(total - discount, 0);
  const username =
    field === "studentUid" ? String(adm.studentUsername ?? "") : String(adm.parentUsername ?? "");

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/10 text-navy dark:bg-blue-500/10 dark:text-blue-300">
          <GraduationCap size={18} />
        </span>
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-navy dark:text-white">
          My Admission
        </h3>
        {status && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLES[status.toLowerCase()] ?? "bg-gray-100 text-gray-600"}`}
          >
            {status}
          </span>
        )}
        {Boolean(adm.applicationId) && (
          <span className="ml-auto font-mono text-xs text-gray-500 dark:text-gray-400">
            {String(adm.applicationId)}
          </span>
        )}
      </div>

      <dl className="mt-3 space-y-1.5 text-sm">
        <Row k="Course" v={String(adm.courseName || "—")} />
        {Boolean(adm.coursePackage) && <Row k="Package" v={String(adm.coursePackage)} />}
        {String(adm.hostel) === "Yes" && (
          <div className="flex items-center justify-between gap-3">
            <dt className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <BedDouble size={13} /> Hostel
            </dt>
            <dd className="font-semibold text-green-700 dark:text-green-400">
              Yes{num(adm.hostelFee) > 0 ? ` — ${rs(num(adm.hostelFee))}` : ""}
            </dd>
          </div>
        )}
        {total > 0 && <Row k="Total fee" v={rs(total)} />}
        {discount > 0 && (
          <div className="flex items-center justify-between gap-3">
            <dt className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <BadgeCheck size={13} /> Discount (छुट)
            </dt>
            <dd className="font-bold text-green-700 dark:text-green-400">
              − {rs(discount)}{" "}
              <span className="text-[11px] font-semibold text-gray-400">granted by institute</span>
            </dd>
          </div>
        )}
        {payable > 0 && (
          <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-1.5 dark:border-gray-700">
            <dt className="font-bold text-navy dark:text-white">Payable (दिनुपर्ने)</dt>
            <dd className="font-extrabold text-brand-red">{rs(payable)}</dd>
          </div>
        )}
      </dl>

      {username && (
        <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-gray-900 dark:text-gray-300">
          Portal login: <b className="font-mono">{username}</b> (password issued by the institute
          office)
        </p>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-gray-500 dark:text-gray-400">{k}</dt>
      <dd className="text-right font-semibold">{v}</dd>
    </div>
  );
}
