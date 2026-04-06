export interface Store {
  userConfig?: UserConfig
  customQuotes?: UserQuote[]
  /** When false, widgets only pick from custom quotes (falls back to built-ins if none). */
  useDefaultQuotes?: boolean
}

export enum UserConfigKey {
  YouTubeHomeFeed = 'YouTubeHomeFeed',
  YouTubeHomeFeedShorts = 'YouTubeHomeFeedShorts',
  YouTubeVideoSidebarSuggestions = 'YouTubeVideoSidebarSuggestions',
  YouTubeVideoComments = 'YouTubeVideoComments',
  YouTubeVideoEndRecommendations = 'YouTubeVideoEndRecommendations',
  YouTubeShorts = 'YouTubeShorts',
  YouTubeSubscriptionsFeed = 'YouTubeSubscriptionsFeed',
  YouTubeSubscriptionsFeedShorts = 'YouTubeSubscriptionsFeedShorts',
  YouTubeSearchResultsShorts = 'YouTubeSearchResultsShorts',
  YouTubeMobileHomeFeed = 'YouTubeMobileHomeFeed',
  YouTubeMobileVideoSuggestions = 'YouTubeMobileVideoSuggestions',
  YouTubeMobileShorts = 'YouTubeMobileShorts',
  YouTubeMobileSubscriptionsFeed = 'YouTubeMobileSubscriptionsFeed',
  XHomeFeed = 'XHomeFeed',
  XSidebarTrends = 'XSidebarTrends',
  XSidebarFollowSuggestions = 'XSidebarFollowSuggestions',
  InstagramHomeFeed = 'InstagramHomeFeed',
  InstagramExplore = 'InstagramExplore',
  InstagramReels = 'InstagramReels',
  FacebookHomeFeed = 'FacebookHomeFeed',
  TikTokHomeFeed = 'TikTokHomeFeed',
  TikTokVideoComments = 'TikTokVideoComments',
  PinterestHomeFeed = 'PinterestHomeFeed',
  PinterestRelatedPins = 'PinterestRelatedPins',
  LinkedInHomeFeed = 'LinkedInHomeFeed',
  LinkedInSidebarFeed = 'LinkedInSidebarFeed',
  TwitchHomeFeed = 'TwitchHomeFeed',
  RedditHomeFeed = 'RedditHomeFeed',
  RedditSubFeed = 'RedditSubFeed',
  GitHubHomeFeed = 'GitHubHomeFeed',
  HackerNewsHomeFeed = 'HackerNewsHomeFeed',
  HackerNewsNewestFeed = 'HackerNewsNewestFeed',
  HackerNewsFrontFeed = 'HackerNewsFrontFeed',
}

type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
}

export type UserConfig = PartialRecord<UserConfigKey, boolean>

export interface Quote {
  author?: string
  text: string
}

export interface UserQuote extends Quote {
  id: string
}
