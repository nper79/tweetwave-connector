export interface TwitterResponse {
  timeline: Tweet[];
  next_cursor: string | null;
  prev_cursor: string | null;
  status: string;
  user: TwitterUser;
}

export interface Tweet {
  tweet_id: string;
  bookmarks: number;
  created_at: string;
  favorites: number;
  text: string;
  lang: string;
  views: string;
  quotes: number;
  replies: number;
  retweets: number;
  conversation_id: string;
  media?: {
    photo?: {
      media_url_https: string;
      id: string;
    }[];
  };
  author: {
    name: string;
    screen_name: string;
    avatar: string;
  };
}

interface TwitterUser {
  status: string;
  profile: string;
  rest_id: string;
  blue_verified: boolean;
  affiliates: any;
  business_account: any;
  avatar: string;
  header_image: string;
  desc: string;
  name: string;
  website?: string;
  protected: boolean | null;
  location: string;
  friends: number;
  sub_count: number;
  statuses_count: number;
  media_count: number;
  created_at: string;
  pinned_tweet_ids_str: string[];
  id: string;
}