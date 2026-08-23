import { useMemo } from "react";
import { ModulePage, type ModulePageProps } from "./ModulePage";
import { useModuleData } from "@/hooks/use-module-data";
import type { FieldDef } from "./ModulePage";

type FirestoreModulePageProps = Omit<ModulePageProps, "rows"> & {
  collectionName: string;
  /** Optional fallback/demo rows shown until Firestore data exists */
  rows?: ModulePageProps["rows"];
};

const SELECT_HINTS: Record<string, string[]> = {
  status: ["Active", "Inactive", "Pending"],
  type: ["General", "Priority"],
  priority: ["Low", "Medium", "High"],
};

/**
 * Drop-in replacement for ModulePage backed by a Firestore collection.
 * Provides live rows + full CRUD (create / update / delete / bulk).
 * Form fields are auto-derived from columns unless overridden.
 */
export function FirestoreModulePage({
  collectionName,
  columns,
  fields,
  ...rest
}: FirestoreModulePageProps) {
  const { rows, create, update, remove, bulkDelete, bulkUpdate } = useModuleData(collectionName);

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

  const effectiveRows = rows.length ? rows : (rest.rows ?? []);

  return (
    <ModulePage
      {...rest}
      columns={columns}
      fields={effectiveFields}
      rows={effectiveRows}
      onCreate={async (data) => create(data)}
      onUpdate={async (id, data) => update(id, data)}
      onDelete={remove}
      onBulkDelete={bulkDelete}
      onBulkUpdate={bulkUpdate}
    />
  );
}
