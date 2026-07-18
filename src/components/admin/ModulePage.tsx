import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/admin/AdminShell";
import {
  StatCard,
  Panel,
  Badge,
  DataTable,
  Toolbar,
  Modal,
  Tabs,
  ProgressBar,
  Drawer,
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  EmptyState,
} from "@/components/admin/ui";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Plus,
  Download,
  Upload,
  ChevronUp,
  ChevronDown,
  Check,
  X,
  Loader2,
  Save,
  FileText,
  MoreHorizontal,
  ArrowUpDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

/* ================================================================
   TYPES
   ================================================================ */

interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: string;
  trend?: { value: number; positive: boolean };
  delta?: number;
}

interface ColumnDef {
  key: string;
  label: string;
  render?: (row: any) => React.ReactNode;
  sortable?: boolean;
}

interface FilterDef {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface FieldDef {
  key: string;
  label: string;
  type:
    | "text"
    | "email"
    | "tel"
    | "number"
    | "select"
    | "textarea"
    | "date"
    | "checkbox"
    | "password";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export interface ModulePageProps {
  title: string;
  subtitle?: string;
  stats?: StatItem[];
  columns: ColumnDef[];
  rows: any[];
  filters?: FilterDef[];
  fields?: FieldDef[];
  onCreate?: (data: any) => Promise<void>;
  onUpdate?: (id: string, data: any) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onBulkDelete?: (ids: string[]) => Promise<void>;
  onBulkUpdate?: (ids: string[], data: any) => Promise<void>;
  onExport?: () => void;
  onImport?: (file: File) => Promise<void>;
  actions?: React.ReactNode;
  idKey?: string;
  searchPlaceholder?: string;
  enableSearch?: boolean;
  enableFilters?: boolean;
  enableExport?: boolean;
  enableImport?: boolean;
  enableBulkActions?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
}

/* Legacy compat */
export type ModuleConfig = {
  title: string;
  subtitle?: string;
  stats: {
    label: string;
    value: number | string;
    delta?: number;
    icon: LucideIcon;
    tone?: "purple" | "orange" | "success" | "info" | "danger" | "warning";
  }[];
  columns: { key: string; label: string }[];
  rows: Record<string, string | number>[];
  addLabel?: string;
  extra?: React.ReactNode;
};

/* ================================================================
   MAIN COMPONENT
   ================================================================ */

export function ModulePage({
  title,
  subtitle,
  stats = [],
  columns = [],
  rows = [],
  filters = [],
  fields = [],
  onCreate,
  onUpdate,
  onDelete,
  onBulkDelete,
  onBulkUpdate,
  onExport,
  onImport,
  actions,
  idKey = "id",
  searchPlaceholder = "Search...",
  enableSearch = true,
  enableFilters = true,
  enableExport = true,
  enableImport = false,
  enableBulkActions = true,
  enablePagination = true,
  pageSize: initialPageSize = 10,
}: ModulePageProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState("");
  const [viewRow, setViewRow] = useState<any | null>(null);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkFormData, setBulkFormData] = useState<Record<string, any>>({});
  const [actionMenuRow, setActionMenuRow] = useState<any | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const getId = useCallback(
    (row: any) => String(row[idKey] ?? ""),
    [idKey]
  );

  /* ---- Filtering ---- */
  const filteredRows = useMemo(() => {
    let result = [...rows];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          const val = row[col.key];
          return val != null && String(val).toLowerCase().includes(q);
        })
      );
    }

    Object.entries(filterValues).forEach(([key, val]) => {
      if (val && val !== "__all__") {
        result = result.filter((row) => String(row[key]) === val);
      }
    });

    return result;
  }, [rows, search, filterValues, columns]);

  /* ---- Sorting ---- */
  const sortedRows = useMemo(() => {
    if (!sortKey) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const aStr = aVal == null ? "" : String(aVal);
      const bStr = bVal == null ? "" : String(bVal);
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDir === "asc" ? aNum - bNum : bNum - aNum;
      }
      return sortDir === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [filteredRows, sortKey, sortDir]);

  /* ---- Pagination ---- */
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedRows = useMemo(() => {
    if (!enablePagination) return sortedRows;
    const start = (safePage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, safePage, pageSize, enablePagination]);

  useEffect(() => {
    setPage(1);
  }, [search, filterValues, pageSize]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set<string>();
      paginatedRows.forEach((r) => {
        const id = getId(r);
        if (prev.has(id)) next.add(id);
      });
      return next;
    });
  }, [paginatedRows]);

  /* ---- Sort handler ---- */
  const handleSort = useCallback(
    (key: string) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey]
  );

  /* ---- Select handlers ---- */
  const allSelected =
    paginatedRows.length > 0 &&
    paginatedRows.every((r) => selectedIds.has(getId(r)));

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedRows.map((r) => getId(r))));
    }
  }, [allSelected, paginatedRows, getId]);

  const toggleOne = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    []
  );

  /* ---- Form handlers ---- */
  const openCreate = useCallback(() => {
    setEditingRow(null);
    const initial: Record<string, any> = {};
    fields.forEach((f) => {
      initial[f.key] = f.type === "checkbox" ? false : "";
    });
    setFormData(initial);
    setFormOpen(true);
  }, [fields]);

  const openEdit = useCallback(
    (row: any) => {
      setEditingRow(row);
      const initial: Record<string, any> = {};
      fields.forEach((f) => {
        initial[f.key] = row[f.key] ?? (f.type === "checkbox" ? false : "");
      });
      setFormData(initial);
      setFormOpen(true);
    },
    [fields]
  );

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditingRow(null);
    setFormData({});
  }, []);

  const handleFormChange = useCallback(
    (key: string, value: any) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    for (const f of fields) {
      if (f.required && !formData[f.key] && formData[f.key] !== false) {
        toast.error(`${f.label} is required`);
        return;
      }
    }
    setSaving(true);
    try {
      if (editingRow && onUpdate) {
        await onUpdate(getId(editingRow), formData);
        toast.success("Updated successfully");
      } else if (!editingRow && onCreate) {
        await onCreate(formData);
        toast.success("Created successfully");
      }
      closeForm();
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }, [fields, formData, editingRow, onUpdate, onCreate, closeForm, getId]);

  /* ---- Delete handler ---- */
  const requestDelete = useCallback(
    (id: string) => {
      setConfirmMessage("Are you sure you want to delete this item?");
      setConfirmAction(() => async () => {
        if (!onDelete) return;
        try {
          await onDelete(id);
          toast.success("Deleted successfully", {
            description: "Click undo to restore",
            action: {
              label: "Undo",
              onClick: () => toast.info("Undo requested — implement restore logic in parent"),
            },
          });
        } catch (err: any) {
          toast.error(err?.message || "Delete failed");
        }
      });
      setConfirmOpen(true);
    },
    [onDelete]
  );

  /* ---- Bulk delete ---- */
  const requestBulkDelete = useCallback(() => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return toast.error("No items selected");
    setConfirmMessage(`Delete ${ids.length} selected item${ids.length > 1 ? "s" : ""}?`);
    setConfirmAction(() => async () => {
      if (!onBulkDelete) return;
      try {
        await onBulkDelete(ids);
        setSelectedIds(new Set());
        toast.success(`${ids.length} item${ids.length > 1 ? "s" : ""} deleted`);
      } catch (err: any) {
        toast.error(err?.message || "Bulk delete failed");
      }
    });
    setConfirmOpen(true);
  }, [selectedIds, onBulkDelete]);

  /* ---- Bulk edit ---- */
  const openBulkEdit = useCallback(() => {
    if (selectedIds.size === 0) return toast.error("No items selected");
    setBulkFormData({});
    setBulkEditOpen(true);
  }, [selectedIds]);

  const handleBulkUpdate = useCallback(async () => {
    if (!onBulkUpdate) return;
    const ids = Array.from(selectedIds);
    const data = Object.fromEntries(
      Object.entries(bulkFormData).filter(([, v]) => v !== "" && v !== undefined)
    );
    if (Object.keys(data).length === 0) return toast.error("No changes specified");
    setSaving(true);
    try {
      await onBulkUpdate(ids, data);
      setSelectedIds(new Set());
      setBulkEditOpen(false);
      toast.success(`${ids.length} item${ids.length > 1 ? "s" : ""} updated`);
    } catch (err: any) {
      toast.error(err?.message || "Bulk update failed");
    } finally {
      setSaving(false);
    }
  }, [selectedIds, bulkFormData, onBulkUpdate]);

  /* ---- Export ---- */
  const handleExport = useCallback(() => {
    if (onExport) {
      onExport();
      return;
    }
    if (sortedRows.length === 0) return toast.error("No data to export");
    const headers = columns.map((c) => c.label);
    const csvRows = sortedRows.map((row) =>
      columns.map((c) => {
        const val = row[c.key];
        const str = val == null ? "" : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      })
    );
    const csv = [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported successfully");
  }, [sortedRows, columns, title, onExport]);

  /* ---- Import ---- */
  const handleImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (onImport) {
        try {
          await onImport(file);
          toast.success("Imported successfully");
        } catch (err: any) {
          toast.error(err?.message || "Import failed");
        }
      } else {
        toast.info("Import handler not configured");
      }
      if (importRef.current) importRef.current.value = "";
    },
    [onImport]
  );

  /* ---- Status toggle helper ---- */
  const handleToggleField = useCallback(
    (row: any, fieldKey: string) => {
      if (onUpdate) {
        onUpdate(getId(row), { [fieldKey]: !row[fieldKey] }).catch(() =>
          toast.error("Toggle failed")
        );
      }
    },
    [onUpdate, getId]
  );

  /* ---- Close confirm ---- */
  const closeConfirm = useCallback(() => {
    setConfirmOpen(false);
    setConfirmAction(() => {});
    setConfirmMessage("");
  }, []);

  const executeConfirm = useCallback(async () => {
    await confirmAction();
    closeConfirm();
  }, [confirmAction, closeConfirm]);

  /* ---- Sort icon ---- */
  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortKey !== colKey)
      return <ArrowUpDown className="w-3 h-3 text-gray-400 ml-1" />;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 text-blue-500 ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 text-blue-500 ml-1" />
    );
  };

  /* ---- Render cell ---- */
  const renderCell = useCallback(
    (col: ColumnDef, row: any) => {
      if (col.render) return col.render(row);
      const val = row[col.key];
      if (val == null) return <span className="text-gray-400">—</span>;
      if (typeof val === "boolean") {
        return (
          <button
            onClick={() => handleToggleField(row, col.key)}
            className={`w-9 h-5 rounded-full transition-colors relative ${
              val ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                val ? "translate-x-4" : ""
              }`}
            />
          </button>
        );
      }
      const s = String(val);
      if (
        ["Active", "Paid", "Approved", "Success", "Completed", "Published", "Yes", "Enabled"].includes(s)
      )
        return <Badge tone="success">{s}</Badge>;
      if (["Pending", "Partial", "Scheduled", "Draft", "Processing"].includes(s))
        return <Badge tone="warning">{s}</Badge>;
      if (
        ["Failed", "Rejected", "Inactive", "Overdue", "No", "Disabled", "Cancelled"].includes(s)
      )
        return <Badge tone="danger">{s}</Badge>;
      return <span>{s}</span>;
    },
    [handleToggleField]
  );

  /* ---- Stat grid ---- */
  const statCols =
    stats.length <= 2
      ? "grid-cols-2"
      : stats.length === 3
      ? "grid-cols-2 md:grid-cols-3"
      : stats.length === 4
      ? "grid-cols-2 md:grid-cols-4"
      : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <div>
      {/* Header */}
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <div className="flex items-center gap-2">
            {actions}
            {enableExport && (
              <button onClick={handleExport} className="ap-btn-ghost">
                <Download className="w-4 h-4" /> Export
              </button>
            )}
            {enableImport && (
              <>
                <input
                  ref={importRef}
                  type="file"
                  accept=".csv,.json"
                  className="hidden"
                  onChange={handleImport}
                />
                <button
                  onClick={() => importRef.current?.click()}
                  className="ap-btn-ghost"
                >
                  <Upload className="w-4 h-4" /> Import
                </button>
              </>
            )}
            {onCreate && (
              <button onClick={openCreate} className="ap-btn">
                <Plus className="w-4 h-4" /> Add New
              </button>
            )}
          </div>
        }
      />

      {/* Stats */}
      {stats.length > 0 && (
        <div className={`grid ${statCols} gap-4 mb-6`}>
          {stats.map((s, i) => (
            <StatCard
              key={i}
              label={s.label}
              value={s.value}
              icon={s.icon}
              tone={(s.tone as any) ?? "purple"}
              trend={s.trend}
              delta={s.delta}
            />
          ))}
        </div>
      )}

      {/* Toolbar */}
      {(enableSearch || enableFilters || (enableBulkActions && selectedIds.size > 0)) && (
        <Toolbar>
          {enableSearch && (
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="ap-input pl-9"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-100"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
          )}

          {enableFilters &&
            filters.map((f) => (
              <select
                key={f.key}
                value={filterValues[f.key] || "__all__"}
                onChange={(e) =>
                  setFilterValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                }
                className="ap-input max-w-[160px]"
              >
                <option value="__all__">{f.label}</option>
                {f.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ))}

          {enableBulkActions && selectedIds.size > 0 && (
            <>
              <span className="text-xs text-gray-500 font-medium ml-2">
                {selectedIds.size} selected
              </span>
              {onBulkUpdate && (
                <button onClick={openBulkEdit} className="ap-btn-ghost text-xs">
                  <Edit className="w-3.5 h-3.5" /> Bulk Edit
                </button>
              )}
              {onBulkDelete && (
                <button
                  onClick={requestBulkDelete}
                  className="ap-btn-ghost text-xs text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )}
            </>
          )}
        </Toolbar>
      )}

      {/* Table */}
      {paginatedRows.length === 0 && !search && Object.values(filterValues).every((v) => !v || v === "__all__") ? (
        <Panel title="" subtitle="">
          <EmptyState
            icon={FileText}
            title={`No ${title.toLowerCase()} yet`}
            desc={`Get started by creating your first ${title.toLowerCase().slice(0, -1) || "item"}.`}
            action={onCreate ? { label: "Create First Item", onClick: openCreate } : undefined}
          />
        </Panel>
      ) : (
        <Panel title="" subtitle="">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  {enableBulkActions && (onBulkDelete || onBulkUpdate) && (
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        className="rounded"
                      />
                    </th>
                  )}
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable !== false && handleSort(col.key)}
                      className={`text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider ${
                        col.sortable !== false
                          ? "cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-300"
                          : ""
                      }`}
                    >
                      <span className="flex items-center">
                        {col.label}
                        {col.sortable !== false && <SortIcon colKey={col.key} />}
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row, i) => {
                  const rowId = getId(row);
                  return (
                    <motion.tr
                      key={rowId || i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition"
                    >
                      {enableBulkActions && (onBulkDelete || onBulkUpdate) && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(rowId)}
                            onChange={() => toggleOne(rowId)}
                            className="rounded"
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td key={col.key} className="px-4 py-3">
                          {renderCell(col, row)}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 relative">
                          <button
                            onClick={() => setViewRow(row)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          {onUpdate && (
                            <button
                              onClick={() => openEdit(row)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-gray-500" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => requestDelete(rowId)}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          )}
                          <div className="relative">
                            <button
                              onClick={() =>
                                setActionMenuRow(
                                  actionMenuRow === row ? null : row
                                )
                              }
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                            >
                              <MoreHorizontal className="w-4 h-4 text-gray-500" />
                            </button>
                            <AnimatePresence>
                              {actionMenuRow === row && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg z-20 py-1"
                                >
                                  <button
                                    onClick={() => {
                                      setViewRow(row);
                                      setActionMenuRow(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                  >
                                    <Eye className="w-3.5 h-3.5" /> View Details
                                  </button>
                                  {onUpdate && (
                                    <button
                                      onClick={() => {
                                        openEdit(row);
                                        setActionMenuRow(null);
                                      }}
                                      className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                    >
                                      <Edit className="w-3.5 h-3.5" /> Edit
                                    </button>
                                  )}
                                  {onDelete && (
                                    <button
                                      onClick={() => {
                                        requestDelete(rowId);
                                        setActionMenuRow(null);
                                      }}
                                      className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Pagination */}
      {enablePagination && sortedRows.length > pageSize && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="ap-input max-w-[80px] py-1 text-xs"
            >
              {[5, 10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>
              of {sortedRows.length} item{sortedRows.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-slate-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (safePage <= 4) {
                pageNum = i + 1;
              } else if (safePage >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = safePage - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 text-xs rounded-lg transition ${
                    safePage === pageNum
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-slate-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal open={formOpen} onClose={closeForm} size="lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingRow ? `Edit ${title.slice(0, -1) || "Item"}` : `New ${title.slice(0, -1) || "Item"}`}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {editingRow ? "Update the details below" : "Fill in the details to create a new record"}
              </p>
            </div>
            <button onClick={closeForm} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    value={formData[field.key] ?? ""}
                    onChange={(e) => handleFormChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                    className="ap-input w-full resize-none"
                  />
                ) : field.type === "select" ? (
                  <select
                    value={formData[field.key] ?? ""}
                    onChange={(e) => handleFormChange(field.key, e.target.value)}
                    className="ap-input w-full"
                  >
                    <option value="">{field.placeholder || "Select..."}</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "checkbox" ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData[field.key] ?? false}
                      onChange={(e) => handleFormChange(field.key, e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{field.label}</span>
                  </label>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.key] ?? ""}
                    onChange={(e) =>
                      handleFormChange(
                        field.key,
                        field.type === "number" ? e.target.valueAsNumber || e.target.value : e.target.value
                      )
                    }
                    placeholder={field.placeholder}
                    className="ap-input w-full"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button onClick={closeForm} className="ap-btn-ghost">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || (!onCreate && !editingRow)}
              className="ap-btn"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {editingRow ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Drawer */}
      <Drawer open={!!viewRow} onClose={() => setViewRow(null)}>
        {viewRow && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Details</h2>
              <button
                onClick={() => setViewRow(null)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {columns.map((col) => (
                <div key={col.key} className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                    {col.label}
                  </span>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {col.render ? col.render(viewRow) : renderCell(col, viewRow)}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-8">
              {onUpdate && (
                <button
                  onClick={() => {
                    setViewRow(null);
                    openEdit(viewRow);
                  }}
                  className="ap-btn flex-1"
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => {
                    setViewRow(null);
                    requestDelete(getId(viewRow));
                  }}
                  className="ap-btn bg-red-600 hover:bg-red-700 text-white flex-1"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Confirmation Dialog */}
      <Modal open={confirmOpen} onClose={closeConfirm} size="sm">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Confirm Action</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{confirmMessage}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={closeConfirm} className="ap-btn-ghost px-6">
              Cancel
            </button>
            <button
              onClick={executeConfirm}
              className="ap-btn bg-red-600 hover:bg-red-700 text-white px-6"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>

      {/* Bulk Edit Modal */}
      <Modal open={bulkEditOpen} onClose={() => setBulkEditOpen(false)} size="md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Bulk Edit ({selectedIds.size} items)
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Only filled fields will be applied to all selected records
              </p>
            </div>
            <button
              onClick={() => setBulkEditOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">
                  {field.label}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    value={bulkFormData[field.key] ?? ""}
                    onChange={(e) =>
                      setBulkFormData((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    placeholder={`Leave empty to skip`}
                    rows={2}
                    className="ap-input w-full resize-none"
                  />
                ) : field.type === "select" ? (
                  <select
                    value={bulkFormData[field.key] ?? ""}
                    onChange={(e) =>
                      setBulkFormData((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    className="ap-input w-full"
                  >
                    <option value="">— Skip —</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "checkbox" ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bulkFormData[field.key] ?? false}
                      onChange={(e) =>
                        setBulkFormData((prev) => ({ ...prev, [field.key]: e.target.checked }))
                      }
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{field.label}</span>
                  </label>
                ) : (
                  <input
                    type={field.type}
                    value={bulkFormData[field.key] ?? ""}
                    onChange={(e) =>
                      setBulkFormData((prev) => ({
                        ...prev,
                        [field.key]: field.type === "number" ? e.target.valueAsNumber || e.target.value : e.target.value,
                      }))
                    }
                    placeholder="Leave empty to skip"
                    className="ap-input w-full"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button onClick={() => setBulkEditOpen(false)} className="ap-btn-ghost">
              Cancel
            </button>
            <button onClick={handleBulkUpdate} disabled={saving} className="ap-btn">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Apply to {selectedIds.size} items
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ================================================================
   LEGACY COMPAT — SectionGrid (kept for existing imports)
   ================================================================ */

export function SectionGrid({
  items,
}: {
  items: { title: string; hint: string; icon: LucideIcon; tone?: string }[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <motion.div
            key={i}
            whileHover={{ y: -3 }}
            className="ap-card p-4 flex items-start gap-3 hover:shadow-lg transition"
          >
            <div className="w-11 h-11 rounded-xl ap-grad flex items-center justify-center text-white">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold">{it.title}</p>
              <p className="text-xs text-[hsl(var(--ap-muted))] mt-0.5">{it.hint}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export { Panel, Badge, StatCard, EmptyState, DataTable, Toolbar, Tabs, Modal, Drawer };
