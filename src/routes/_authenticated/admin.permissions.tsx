import { Fragment } from "react";
import { PageHeader } from "@/components/admin/AdminShell";
import { Panel } from "@/components/admin/ui";
import { ShieldCheck, Info, Check, Minus } from "lucide-react";
import { NAV_SECTIONS, ALL_ROLES, type NavItem } from "@/components/admin/nav";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
  accountant: "Accountant",
};

/**
 * Read-only capability matrix derived from the real navigation config
 * (`src/components/admin/nav.ts`) — the single source of truth the Sidebar
 * uses to filter menu items per role.
 *
 * Rules mirrored from `getNavSectionsForRole()`:
 *  - missing `roles` on an item/section ⇒ visible to EVERY role
 *  - `roles` present ⇒ only those roles see it
 */
export function PermissionsPage() {
  const canSee = (sectionRoles: string[] | undefined, item: NavItem, role: string): boolean => {
    if (sectionRoles && !sectionRoles.includes(role)) return false;
    return !item.roles || item.roles.includes(role);
  };

  const totalItems = NAV_SECTIONS.reduce((s, sec) => s + sec.items.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permissions"
        subtitle="Which sidebar pages each role can see, read straight from the navigation config"
      />

      <div className="flex items-start gap-2 rounded-xl border border-[hsl(var(--ap-border))] bg-[hsl(var(--ap-surface))] px-4 py-3">
        <Info className="w-4 h-4 text-[hsl(var(--ap-muted))] mt-0.5 shrink-0" />
        <p className="text-xs text-[hsl(var(--ap-muted))]">
          Reflects live sidebar access — navigation is enforced centrally. Read-only: this matrix is
          derived from <span className="font-semibold">nav.ts</span> and cannot be edited here. A ✓
          means the role sees that page; a — means it is hidden from the sidebar.
        </p>
      </div>

      <Panel
        title="Role Capability Matrix"
        subtitle={`${NAV_SECTIONS.length} sections · ${totalItems} menu items · ${ALL_ROLES.length} roles`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--ap-border))]">
                <th className="text-left py-3 px-3 font-semibold min-w-[220px]">Menu item</th>
                <th className="text-left py-3 px-3 font-semibold min-w-[180px]">Route</th>
                {ALL_ROLES.map((r) => (
                  <th key={r} className="py-3 px-2 font-semibold text-center min-w-[96px]">
                    {ROLE_LABELS[r] ?? r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NAV_SECTIONS.map((section, si) => (
                <Fragment key={`${si}-${section.header}`}>
                  <tr className="bg-[hsl(var(--ap-surface))]">
                    <td
                      colSpan={2 + ALL_ROLES.length}
                      className="py-2 px-3 text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]"
                    >
                      {section.header}
                      {section.roles && (
                        <span className="ml-2 font-normal normal-case tracking-normal">
                          · restricted to {section.roles.map((r) => ROLE_LABELS[r] ?? r).join(", ")}
                        </span>
                      )}
                    </td>
                  </tr>
                  {section.items.map((item) => (
                    <tr
                      key={`${section.header}-${item.label}-${item.to ?? item.label}`}
                      className="border-b border-[hsl(var(--ap-border)/0.5)] hover:bg-[hsl(var(--ap-bg))] transition-colors"
                    >
                      <td className="py-2.5 px-3 font-medium flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[hsl(var(--ap-purple))] shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {!item.roles && !section.roles && (
                          <span className="text-[10px] font-bold uppercase text-[hsl(var(--ap-muted))]">
                            all
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs text-[hsl(var(--ap-muted))] truncate">
                        {item.to ?? "—"}
                      </td>
                      {ALL_ROLES.map((role) => {
                        const allowed = canSee(section.roles, item, role);
                        return (
                          <td key={role} className="py-2.5 px-2 text-center">
                            {allowed ? (
                              <Check
                                className="w-4 h-4 mx-auto text-[hsl(var(--ap-success))]"
                                aria-label="visible"
                              />
                            ) : (
                              <Minus
                                className="w-4 h-4 mx-auto text-[hsl(var(--ap-muted))] opacity-50"
                                aria-label="hidden"
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
