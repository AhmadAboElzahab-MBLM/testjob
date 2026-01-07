// Umbraco Event Type
export interface UmbracoEvent {
  id: string;
  eventId: string;
  lastUpdatedDate: string;
  name: string;
}

// CRM Event Type
export interface CrmEvent {
  title: string;
  featuredImage: string;
  pageContent: string;
  imagesCarousel: string;
  startDate: string;
  endDate: string;
  location: string | null;
  eventAudiences: string | null;
  eventSectors: string[];
  eventId: number;
  eventType: string;
  eventVenues: string[];
  eventOrganiser: string;
  websiteURL: string | null;
  dWTCEvent: boolean;
  eventLogo: string | null;
  socialMedia: {
    facebook: string;
    linkedIn: string;
    instagram: string;
    youtube: string;
    tiktok: string;
  };
  lastUpdatedDate: string;
  WebsiteStatus: string;
}

// Environment variables type
export interface Env {
  CRM_API_URL: string;
  OCP_APIM_SUBSCRIPTION_KEY: string;
  UMBRACO_PROJECT_ALIAS: string;
  API_KEY: string;
  AHMAD?: string;
}

// Response types
export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: string;
}

export type ServiceResponse<T> = SuccessResponse<T> | ErrorResponse;
