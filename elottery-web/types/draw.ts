import { PrizeTier } from "./prizeTier";

export interface Draw {
  id: number;
  draw_code: string;
  product_name: string | null;
  status: string;
  prize_tiers: { name: string; amount: string; count: number }[];
  total_results: number;
  created_at: string;
}

export const statusColors: Record<string, string> = {
    SCHEDULED: "bg-gray-100 text-gray-700 border-gray-200",
    LOCKED: "bg-yellow-100 text-yellow-800 border-yellow-200",
    DRAWING: "bg-blue-100 text-blue-800 border-blue-200",
    PUBLISHED: "bg-green-100 text-green-800 border-green-200",
    CLOSED: "bg-red-100 text-red-800 border-red-200",
};

export type ResultItem = {
  id: number;
  prize_tier: string;     // tier name
  ticket_number: string;  // "000123"
  prize_amount: string;   // Decimal
  user_id: number | null;
  purchase_item_id: number | null;
  published_at: string;
};

export type DrawDetail = {
  id: number;
  draw_code: string;
  product_name: string | null;
  status: "SCHEDULED" | "LOCKED" | "DRAWING" | "PUBLISHED" | "CLOSED";
  created_at: string;
  prize_tiers: PrizeTier[];
  results: ResultItem[];
};