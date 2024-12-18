export interface TwitterResponse {
  timeline: Tweet[];
}

export interface Tweet {
  tweet_id: string;
  text: string;
  created_at: string;
  favorites: number;
  retweets: number;
  replies: number;
  views: string;
  author: {
    name: string;
    screen_name: string;
    avatar: string;
  };
  media?: {
    photo?: {
      media_url_https: string;
      id: string;
    }[];
  };
}