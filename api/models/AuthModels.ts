export interface OtpSendRequest {
  phone: string;
  fullName?: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export interface ProductCategory {
  id?: string;
  name?: string;
  slug?: string;
}
