import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

export interface CmsItem {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  order?: number;
  isActive?: boolean;
  isPublished?: boolean;
  category?: string;
  eventDate?: string;
  eventTime?: string;
  location?: string;
  author?: string;
  tags?: string[];
  createdAt?: any;
}

function useCmsCollection(collectionName: string) {
  const queryClient = useQueryClient();
  const queryKey = ["cms", collectionName];

  const { data: items = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const q = query(collection(db, collectionName), orderBy("order", "asc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as CmsItem[];
    },
  });

  const addItem = useMutation({
    mutationFn: async (item: Omit<CmsItem, "id">) => {
      const docRef = await addDoc(collection(db, collectionName), { ...item, createdAt: serverTimestamp() });
      return docRef.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateItem = useMutation({
    mutationFn: async (item: CmsItem) => {
      const { id, ...data } = item;
      await updateDoc(doc(db, collectionName, id), { ...data, updatedAt: serverTimestamp() });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, collectionName, id));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const toggleItem = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: any }) => {
      await updateDoc(doc(db, collectionName, id), { [field]: value, updatedAt: serverTimestamp() });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { items, isLoading, addItem, updateItem, deleteItem, toggleItem };
}

export function useCmsNotices() {
  return useCmsCollection("cms_notices");
}
export function useCmsEvents() {
  return useCmsCollection("cms_events");
}
export function useCmsBlogs() {
  return useCmsCollection("cms_blogs");
}
