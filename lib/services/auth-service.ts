
import { apiRequest } from "../api-client";

export class AuthService {
  static login(credentials: any) {
    return apiRequest("/auth/login", { method: "POST", body: JSON.stringify(credentials) });
  }

  static register(data: any) {
    return apiRequest("/auth/register", { method: "POST", body: JSON.stringify(data) });
  }

  static getProfile() {
    return apiRequest("/auth/profile", { method: "GET" });
  }

  static updateProfile(formData: FormData) {
    return apiRequest("/auth/profile", { method: "PUT", body: formData });
  }

  static requestPasswordReset(email: string) {
    return apiRequest("/auth/request-password-reset", { method: "POST", body: JSON.stringify({ email }) });
  }

  static resetPassword(data: any) {
    return apiRequest("/auth/reset-password", { method: "POST", body: JSON.stringify(data) });
  }

  static changePassword(data: any) {
    return apiRequest("/auth/change-password", { method: "POST", body: JSON.stringify({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    })
  });
  }

  static verifyEmail(code: string) {
    return apiRequest("/auth/verify-email", { method: "POST", body: JSON.stringify({ code }) });
  }

  static resendEmailCode(email: string) {
    return apiRequest("/auth/resend-verification-email", { method: "POST",body: JSON.stringify({ email }) 
  });
  }

  static requestPhoneOtp() {
    return apiRequest("/auth/request-verification-otp", { method: "POST" });
  }

  static verifyPhone(otp: string) {
    return apiRequest("/auth/verify-phone", { method: "POST", body: JSON.stringify({ otp }) });
  }

  static generate2FA() {
    return apiRequest("/auth/2fa/generate", { method: "POST" });
  }

  static turnOn2FA(code: string) {
    return apiRequest("/auth/2fa/turn-on", { method: "POST", body: JSON.stringify({ code }) });
  }

  static authenticate2FA(code: string) {
    return apiRequest("/auth/2fa/authenticate", { method: "POST", body: JSON.stringify({ code }) });
  }
}