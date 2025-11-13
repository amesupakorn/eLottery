export type LedgerItem = {
  id: string;
  type: "DEPOSIT" | "WITHDRAW" | "PRIZE" | "PURCHASE" | "REFUND";
  amount: number;
  note?: string;
  occurredAt: string; 
};

export type TicketItem = {
  id: string;
  ticketNumber: string;
  product: string;
  status: "OWNED" | "CANCELED" | "WIN";
  price: number;
  purchasedAt: string;
  receiptId?: string | null;  
};