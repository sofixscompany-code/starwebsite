import { useMemo } from "react";
import { ModulePage, type ModulePageProps } from "./ModulePage";
import { useModuleData } from "@/hooks/use-module-data";
import { canCreate, canManage } from "@/lib/access";
import { getUserRole } from "@/lib/api-auth";
import type { FieldDef } from "./ModulePage";

type FirestoreModulePageProps = Omit<ModulePageProps, "rows"> & {
  collectionName: string;
  /** Optional dev-only fallback rows shown while Firestore data is empty */
  rows?: ModulePageProps["rows"];
};

const SELECT_HINTS: Record<string, string[]> = {
  status: ["Active", "Inactive", "Pending"],
  type: ["General", "Priority"],
  priority: ["Low", "Medium", "High"],
};

/**
 * Drop-in replacement for ModulePage backed by a Firestore collection.
 * Provides live rows + role-gated CRUD (create / update / delete / bulk —
 * only offered when firestore.rules will accept the action for this role).
 * Form fields are auto-derived from columns unless overridden.
 * Static `rows` fallbacks render only in dev builds; production shows live
 * data (or an honest empty state).
 */
export function FirestoreModulePage({
  collectionName,
  columns,
  fields,
  ...rest
}: FirestoreModulePageProps) {
  const { rows, error, create, update, remove, bulkDelete, bulkUpdate } =
    useModuleData(collectionName);

  const role = getUserRole();
  const allowCreate = canCreate(collectionName, role);
  const allowManage = canManage(collectionName, role);

  const effectiveFields = useMemo<FieldDef[]>(() => {
    if (fields && fields.length > 0) return fields;
    return columns
      .filter((c) => c.key !== "id" && c.key !== "actions")
      .map((c) => {
        const hint = SELECT_HINTS[c.key.toLowerCase()];
        if (hint) {
          return {
            key: c.key,
            label: c.label,
            type: "select" as const,
            options: hint.map((o) => ({ value: o, label: o })),
          };
        }
        return { key: c.key, label: c.label, type: "text" as const };
      });
  }, [fields, columns]);

  // Demo/fallback rows are a development aid only — production must never
  // display them alongside (or instead of) real Firestore data.
  const liveRows = rows;
  const demoRows = import.meta.env.DEV ? (rest.rows ?? []) : [];
  const effectiveRows = liveRows.length ? liveRows : demoRows;

  return (
    <ModulePage
      {...rest}
      columns={columns}
      fields={effectiveFields}
      rows={effectiveRows}
      loadError={error}
      onCreate={allowCreate ? async (data) => create(data) : undefined}
      onUpdate={allowManage ? async (id, data) => update(id, data) : undefined}
      onDelete={allowManage ? remove : undefined}
      onBulkDelete={allowManage ? bulkDelete : undefined}
      onBulkUpdate={allowManage ? bulkUpdate : undefined}
    />
  );
}
