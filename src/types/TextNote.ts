export interface TextNote {
  id: string;
  pubkey: string;
  created_at: number;
  kind: number;
  tags: string[];
  content: string;
  sig: string;
  relay: string;
}
