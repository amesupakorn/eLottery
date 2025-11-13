export type TicketPurchase = {
  id: number;
  range_start: number;
  range_end: number;
  unit_price: number;     
  total_price: number;   
  status: "OWNED" | "CANCELED" | "WIN";
  user_id: number;
  wallet_id: number;
  draw_id?: number | null;
  purchased_at: string; 
  Draw?: {
    id?: number;
    draw_code?: string;
    product_name?: string;
  } | null;
};