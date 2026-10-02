import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { Image, Loader2, Search, Check } from "lucide-react";
import { Modal, EmptyState } from "@/components/admin/ui";

type GalleryItem = { id: string; url?: string; title?: string };

interface GalleryPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string, title?: string) => void;
}

export function GalleryPicker({ open, onClose, onSelect }: GalleryPickerProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setItems([]);
    const unsub = onSnapshot(
      collection(db, "gallery"),
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as GalleryItem[]);
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );
    return () => unsub();
  }, [open]);

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => (i.title ?? "").toLowerCase().includes(q));
  }, [items, search]);

  return (
    <Modal open={open} onClose={onClose} size="xl" title="Select Image from Gallery">
      <div className="mb-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gallery images..."
            className="ap-input w-full pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />{" "}
          <span className="ml-2 text-sm">Loading gallery...</span>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Image}
          title="No gallery images found"
          desc={
            search
              ? "Try a different search term."
              : "Upload images in the Gallery section first, then reuse them here."
          }
        />
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto pr-1">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.url ?? "", item.title)}
              disabled={!item.url}
              className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40"
              title={item.title}
            >
              {item.url ? (
                <img
                  src={item.url}
                  alt={item.title ?? "Gallery image"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-700 text-gray-300">
                  <Image className="w-6 h-6" />
                </div>
              )}
              <span className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/20 transition flex items-center justify-center">
                <Check className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 drop-shadow" />
              </span>
              {item.title && (
                <span className="absolute bottom-0 inset-x-0 px-1.5 py-1 bg-black/55 text-white text-[10px] truncate">
                  {item.title}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-200 dark:border-slate-700">
        <button onClick={onClose} className="ap-btn-ghost">
          Cancel
        </button>
      </div>
    </Modal>
  );
}
