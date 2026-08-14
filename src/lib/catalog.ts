import { supabase } from "@/integrations/supabase/client";

import bandsImg from "@/assets/cat-bands.jpg";
import dholImg from "@/assets/cat-dhol.jpg";
import ghodiImg from "@/assets/cat-ghodi.jpg";
import lightsImg from "@/assets/cat-lights.jpg";

export const categoryImages: Record<string, string> = {
  bands: bandsImg,
  dhol: dholImg,
  "ghodi-baggi": ghodiImg,
  lights: lightsImg,
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
};

export type Vendor = {
  id: string;
  name: string;
  category_id: string;
  city: string;
  description: string;
  price: number;
  rating: number;
  members: number;
  featured: boolean;
};

export const categoriesQuery = {
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("service_categories")
      .select("id, name, slug, description, sort_order")
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },
};

export const vendorsQuery = {
  queryKey: ["vendors"],
  queryFn: async (): Promise<Vendor[]> => {
    const { data, error } = await supabase
      .from("vendors")
      .select("id, name, category_id, city, description, price, rating, members, featured")
      .eq("active", true)
      .order("featured", { ascending: false })
      .order("price");
    if (error) throw error;
    return (data ?? []) as Vendor[];
  },
};
