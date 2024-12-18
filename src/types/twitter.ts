export interface TwitterResponse {
  data: Tweet[];
  meta: {
    result_count: number;
    next_token?: string;
  };
}

export interface Tweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  // Add more fields as needed
}