export type ResponseTypes = {
  name: string;
  expiration_date: string;
  expiration_type?: "best_before" | "use_by";
  image_url: string;
  amount: number;
  unit: string;
  content?: string;
  category: string;
};
