import axios from "axios";

// Centralized API Base URL configuration
export const DEFAULT_PRODUCTION_BACKEND = "https://hyperlocal-campaign.onrender.com";

export const API_BASE = (
  (import.meta as any).env?.VITE_API_BASE_URL ||
  ((import.meta as any).env?.VITE_BACKEND_URL ? `${(import.meta as any).env.VITE_BACKEND_URL}/api` : `${DEFAULT_PRODUCTION_BACKEND}/api`)
).replace(/\/+$/, "");

export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (cleanPath.startsWith("/api/")) {
    return `${API_BASE}${cleanPath.substring(4)}`;
  }
  return `${API_BASE}${cleanPath}`;
};

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Axios Request Interceptor: Inject JWT token into headers securely
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("_hyperlocal_access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Axios Response Interceptor: Catch JWT token expiry (401 Unauthorized) and auto logout
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && response.data.otp) {
      localStorage.setItem("_dev_latest_otp", response.data.otp);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("dev-otp-received"));
      }
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.data && error.response.data.otp) {
      localStorage.setItem("_dev_latest_otp", error.response.data.otp);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("dev-otp-received"));
      }
    }
    if (error.response && error.response.status === 401) {
      const isLoginRequest = error.config && error.config.url && error.config.url.includes("/auth/login");
      if (!isLoginRequest) {
        console.warn("[AXIOS INTERCEPTOR] Access token expired or rejected. Triggering auto-logout sequence...");
        localStorage.removeItem("_hyperlocal_access_token");
        localStorage.removeItem("_hyperlocal_refresh_token");
        localStorage.removeItem("_hyperlocal_current_user");
        
        // Force trigger window-wide logout redirect fallback
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("unauthorized-session-expired"));
        }
      }
    }
    return Promise.reject(error);
  }
);

// CENTRALIZED BACKEND SERVICES WRAPPER WITH EMBEDDED ENGINE FOR OFFLINE / NETLIFY / STATIC FALLBACK

// --- EMULATED CLIENT STATE HELPERS ---
const getEmulatedUsers = (): any[] => {
  try {
    const raw = localStorage.getItem("_emulated_users");
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const defaults = [
    {
      email: "saswatamishra828@gmail.com",
      businessName: "AdPulse Dev Labs",
      ownerName: "Saswata",
      mobileNumber: "9876543210",
      gstin: "27AAAAA1111A1Z1",
      enabled: true,
      onboarded: true,
      onboardingStep: "completed",
      password: "123456789"
    }
  ];
  localStorage.setItem("_emulated_users", JSON.stringify(defaults));
  return defaults;
};

const saveEmulatedUsers = (users: any[]) => {
  localStorage.setItem("_emulated_users", JSON.stringify(users));
};

const getEmulatedOtps = (): Record<string, { otp: string; expiresAt: number; registerData?: any }> => {
  try {
    const raw = localStorage.getItem("_emulated_active_otps");
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
};

const saveEmulatedOtps = (otps: any) => {
  localStorage.setItem("_emulated_active_otps", JSON.stringify(otps));
};

const getEmulatedStores = () => {
  try {
    const raw = localStorage.getItem("_emulated_stores") || localStorage.getItem("adpulse_stores");
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const defaults = [
    {
      id: 'store-1',
      name: 'AdPulse Hyperlocal Hub - Main Branch',
      address: '102, Connaught Place, New Delhi, 110001',
      phone: '+91 98765 43210',
      category: 'SaaS & Ad Services',
      hours: '09:00 AM - 08:00 PM',
      radiusTargetKm: 5,
      status: 'Active',
      latitude: 28.6304,
      longitude: 77.2177
    },
    {
      id: 'store-2',
      name: 'AdPulse Premium Express',
      address: '405, Sector 5, Salt Lake, Kolkata, 700091',
      phone: '+91 98765 11223',
      category: 'Retail Apparel',
      hours: '10:00 AM - 09:30 PM',
      radiusTargetKm: 8,
      status: 'Active',
      latitude: 22.5726,
      longitude: 88.4339
    }
  ];
  return defaults;
};

const saveEmulatedStores = (stores: any[]) => {
  localStorage.setItem("_emulated_stores", JSON.stringify(stores));
  localStorage.setItem("adpulse_stores", JSON.stringify(stores));
};

const getEmulatedProducts = () => {
  try {
    const raw = localStorage.getItem("_emulated_products") || localStorage.getItem("adpulse_products");
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const defaults = [
    {
      id: 'prod-1',
      name: 'Summer Linen Kurti',
      category: 'Fashion & Apparel',
      price: 1499,
      discount: 15,
      stock: 120,
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&q=80',
      status: 'In Stock'
    },
    {
      id: 'prod-2',
      name: 'Designer Leather Sandals',
      category: 'Footwear',
      price: 3499,
      discount: 20,
      stock: 8,
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=150&h=150&fit=crop&q=80',
      status: 'Low Stock'
    }
  ];
  return defaults;
};

const saveEmulatedProducts = (products: any[]) => {
  localStorage.setItem("_emulated_products", JSON.stringify(products));
};

const getEmulatedCampaigns = () => {
  try {
    const raw = localStorage.getItem("_emulated_campaigns") || localStorage.getItem("adpulse_campaigns");
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [
    {
      id: 'camp-1',
      name: 'Summer Linen Fashion Warmup',
      goal: 'Increase Offline Footfall',
      festival: 'None',
      audience: 'Young Adults & Professionals',
      radiusKm: 5,
      budget: 15000,
      offer: 'Flat 15% discount on Linen collection',
      tone: 'Trendy & Engaging',
      platforms: ['Instagram', 'Facebook'],
      headline: 'Beat the Heat with Chic Summer Linens',
      caption: 'Stay cool and professional this season with our handcrafted Linen Kurtis. Crafted with love, available at our Connaught Place store!',
      hashtags: ['SummerFashion', 'LinenStyle', 'DelhiBoutique', 'HyperlocalAd'],
      performanceTrend: [120, 180, 240, 310, 420],
      clicks: 420,
      views: 7800
    }
  ];
};

const saveEmulatedCampaigns = (campaigns: any[]) => {
  localStorage.setItem("_emulated_campaigns", JSON.stringify(campaigns));
  localStorage.setItem("adpulse_campaigns", JSON.stringify(campaigns));
};

const getEmulatedCurrentUser = (): any => {
  try {
    const raw = localStorage.getItem("_hyperlocal_current_user");
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
};

const saveEmulatedCurrentUser = (user: any) => {
  localStorage.setItem("_hyperlocal_current_user", JSON.stringify(user));
};

// --- API MODE REGULATION AND AUTOMATED SWITCHOVER ---
const isEmulationActive = () => {
  return localStorage.getItem("__api_use_client_emulation") === "true";
};

async function runApi<T>(apiPromise: Promise<T>, emulatedFn: () => Promise<T>): Promise<T> {
  if (isEmulationActive()) {
    return emulatedFn();
  }
  try {
    return await apiPromise;
  } catch (error: any) {
    const responseData = error.response?.data;
    const isHtml = responseData && typeof responseData === "string" && (
      responseData.includes("<!DOCTYPE html>") || 
      responseData.includes("<html") || 
      responseData.includes("netlify") || 
      responseData.includes("Page not found")
    );
    
    const isStatic404 = error.response?.status === 404;
    const isConnectionError = !error.response;
    
    if (isHtml || isStatic404 || isConnectionError) {
      console.warn("[API_SERVICE] Client Emulation Engine activated due to server response:", error.message);
      localStorage.setItem("__api_use_client_emulation", "true");
      return emulatedFn();
    }
    throw error;
  }
}

export const apiService = {
  // --- AUTH SERVICES ---
  async getGoogleAuthUrl() {
    const appUrl = (import.meta as any).env?.VITE_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
    const redirectUri = `${appUrl.replace(/\/+$/, "")}/auth/google/callback`;
    return runApi(
      apiClient.get(`/auth/google/url?redirect_uri=${encodeURIComponent(redirectUri)}`).then(res => res.data),
      async () => {
        return {
          url: "/auth/google/mock",
          isMock: true
        };
      }
    );
  },

  async exchangeGoogleCode(code: string) {
    const appUrl = (import.meta as any).env?.VITE_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
    const redirectUri = `${appUrl.replace(/\/+$/, "")}/auth/google/callback`;
    return runApi(
      apiClient.get(`/auth/google/exchange?code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(redirectUri)}`).then(res => res.data),
      async () => {
        // Mock success fallback for client emulation
        const token = "mock-jwt-access-google-" + Date.now();
        localStorage.setItem("_hyperlocal_access_token", token);
        const user = {
          id: 999,
          email: "saswatamishra828@gmail.com",
          name: "Saswata",
          ownerName: "Saswata",
          fullName: "Saswata",
          businessName: "AdPulse Dev Labs",
          role: "MERCHANT",
          profilePicture: "",
          provider: "GOOGLE",
          authProvider: "GOOGLE",
          providerId: "mock-google-123456",
          enabled: true,
          registrationCompleted: true,
          onboarded: true,
          onboardingStep: "completed"
        };
        return { success: true, user, accessToken: token };
      }
    );
  },

  async getAuthMode() {
    return runApi(
      apiClient.get("/auth/mode").then(res => res.data),
      async () => {
        const clientMode = (import.meta as any).env?.VITE_AUTH_MODE || "production";
        return { authMode: clientMode };
      }
    );
  },

  async demoLogin() {
    return runApi(
      apiClient.post("/auth/demo-login").then(res => res.data),
      async () => {
        const token = "mock-jwt-access-demo-" + Date.now();
        localStorage.setItem("_hyperlocal_access_token", token);
        const demoUser = {
          id: 1,
          name: "Demo Merchant",
          email: "demo@merchant.com",
          role: "MERCHANT",
          businessName: "Demo Merchant Business",
          ownerName: "Demo Merchant",
          mobileNumber: "9999999999",
          gstin: "27AAAAA1111A1Z1",
          enabled: true,
          onboarded: true,
          onboardingStep: "completed"
        };
        saveEmulatedCurrentUser(demoUser);
        
        const users = getEmulatedUsers();
        if (!users.some(u => u.email.toLowerCase() === "demo@merchant.com")) {
          users.push(demoUser);
          saveEmulatedUsers(users);
        }
        
        return { 
          success: true, 
          accessToken: token, 
          user: {
            id: 1,
            name: "Demo Merchant",
            email: "demo@merchant.com",
            role: "MERCHANT"
          } 
        };
      }
    );
  },

  async login(credentials: any) {
    return runApi(
      apiClient.post("/auth/login", credentials).then(res => {
        const { data } = res;
        if (data.accessToken) {
          localStorage.setItem("_hyperlocal_access_token", data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem("_hyperlocal_refresh_token", data.refreshToken);
          }
          localStorage.setItem("_hyperlocal_current_user", JSON.stringify(data.user));
        }
        return data;
      }),
      async () => {
        const users = getEmulatedUsers();
        const cleanEmail = credentials.email.trim().toLowerCase();
        const matched = users.find(u => u.email.toLowerCase() === cleanEmail);
        if (!matched) {
          throw { response: { status: 401, data: { message: "Account mapping not found. Please complete profile registration or try again." } } };
        }
        
        // Dynamically initialize password in emulation if none exists
        if (!matched.password) {
          matched.password = credentials.password || "password";
          saveEmulatedUsers(users);
        }

        const isMatch = credentials.password === "password" || 
                        credentials.password === "Password123!" || 
                        credentials.password === "123456789" || 
                        credentials.password === matched.password;

        if (!isMatch) {
          throw { response: { status: 401, data: { message: "Invalid credentials. In local client mode, please use registered password, '123456789', or 'password'." } } };
        }
        const token = "mock-jwt-access-" + Date.now();
        localStorage.setItem("_hyperlocal_access_token", token);
        saveEmulatedCurrentUser(matched);
        return { success: true, accessToken: token, user: matched };
      }
    );
  },

  async register(merchantData: any) {
    return runApi(
      apiClient.post("/auth/register", merchantData).then(res => res.data),
      async () => {
        const users = getEmulatedUsers();
        const cleanEmail = merchantData.email.trim().toLowerCase();
        const exists = users.some(u => u.email.toLowerCase() === cleanEmail);
        const isSpecialEmail = cleanEmail === "saswatamishra828@gmail.com" || 
                               cleanEmail.endsWith("@hyperlocal.ai") ||
                               cleanEmail.startsWith("demo");
        if (exists && !isSpecialEmail) {
          throw { response: { status: 409, data: { message: "Conflict - Merchant account matching this email address already exists." } } };
        }
        const otpCode = "123456";
        const otps = getEmulatedOtps();
        otps[cleanEmail] = {
          otp: otpCode,
          expiresAt: Date.now() + 300000,
          registerData: { ...merchantData, enabled: true, onboardingStep: "business" }
        };
        saveEmulatedOtps(otps);
        
        console.log(`[EMULATION-SMTP] Verification code for ${cleanEmail} is ${otpCode}`);
        localStorage.setItem("_dev_latest_otp", otpCode);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("dev-otp-received"));
        }
        return {
          success: true,
          message: `Profile registered but unverified. A verification OTP was dispatched to ${cleanEmail}. (Code is 123456)`,
          otp: otpCode
        };
      }
    );
  },

  async verifyOtp(payload: { email: string; otp: string; actionType: string; merchantData?: any }) {
    return runApi(
      apiClient.post("/auth/verify-email-otp", payload).then(res => {
        const { data } = res;
        if (data.accessToken) {
          localStorage.setItem("_hyperlocal_access_token", data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem("_hyperlocal_refresh_token", data.refreshToken);
          }
          localStorage.setItem("_hyperlocal_current_user", JSON.stringify(data.user));
        }
        return data;
      }),
      async () => {
        const cleanEmail = payload.email.trim().toLowerCase();
        const otps = getEmulatedOtps();
        const record = otps[cleanEmail];
        if (!record || record.otp !== payload.otp) {
          throw { response: { status: 400, data: { message: "Invalid verification OTP. Please try using standard code '123456' inside emulation." } } };
        }
        
        const users = getEmulatedUsers();
        const existingIdx = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
        const newUser = {
          ...record.registerData,
          onboarded: false,
          onboardingStep: "business"
        };
        
        if (existingIdx >= 0) {
          users[existingIdx] = newUser;
        } else {
          users.push(newUser);
        }
        saveEmulatedUsers(users);
        
        delete otps[cleanEmail];
        saveEmulatedOtps(otps);
        
        const token = "mock-jwt-access-" + Date.now();
        localStorage.setItem("_hyperlocal_access_token", token);
        saveEmulatedCurrentUser(newUser);
        
        return {
          success: true,
          accessToken: token,
          user: newUser
        };
      }
    );
  },

  async resendOtp(email: string) {
    return runApi(
      apiClient.post("/auth/resend-email-otp", { email }).then(res => res.data),
      async () => {
        const cleanEmail = email.trim().toLowerCase();
        const otps = getEmulatedOtps();
        const otpCode = "123456";
        otps[cleanEmail] = {
          otp: otpCode,
          expiresAt: Date.now() + 300000,
          registerData: otps[cleanEmail]?.registerData || { email: cleanEmail }
        };
        saveEmulatedOtps(otps);
        console.log(`[EMULATION-SMTP] Verification code resent for ${cleanEmail}: ${otpCode}`);
        return {
          success: true,
          message: `Verification OTP code dispatched to ${cleanEmail}. (Code is 123456)`
        };
      }
    );
  },

  async resetPassword(payload: any) {
    return runApi(
      apiClient.post("/auth/reset-password", payload).then(res => res.data),
      async () => {
        const cleanEmail = payload.email.trim().toLowerCase();
        const users = getEmulatedUsers();
        const userExists = users.some(u => u.email.toLowerCase() === cleanEmail);
        if (!userExists) {
          throw { response: { status: 404, data: { message: "Merchant account matching this email address does not exist." } } };
        }
        const otps = getEmulatedOtps();
        const otpCode = "123456";
        otps[cleanEmail] = {
          otp: otpCode,
          expiresAt: Date.now() + 300000,
          registerData: { ...users.find(u => u.email.toLowerCase() === cleanEmail), password: payload.password }
        };
        saveEmulatedOtps(otps);
        console.log(`[EMULATION-SMTP] Password reset verification code for ${cleanEmail}: ${otpCode}`);
        return {
          success: true,
          message: "Verification OTP code dispatched to standard registered channels."
        };
      }
    );
  },

  async getCurrentProfile() {
    return runApi(
      apiClient.get("/auth/profile").then(res => res.data),
      async () => {
        const user = getEmulatedCurrentUser();
        if (!user) {
          throw { response: { status: 401, data: { message: "Unauthorized. Session expired." } } };
        }
        return user;
      }
    );
  },

  async updateProfile(profileData: any) {
    return runApi(
      apiClient.put("/auth/profile", profileData).then(res => {
        const { data } = res;
        if (data.user) {
          localStorage.setItem("_hyperlocal_current_user", JSON.stringify(data.user));
        }
        return data;
      }),
      async () => {
        const currentUser = getEmulatedCurrentUser();
        if (!currentUser) {
          throw { response: { status: 401, data: { message: "Unauthorized. Session expired." } } };
        }
        const updated = { ...currentUser, ...profileData };
        saveEmulatedCurrentUser(updated);

        // also update in emulated users list
        const users = getEmulatedUsers();
        const idx = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
        if (idx >= 0) {
          users[idx] = { ...users[idx], ...profileData };
          saveEmulatedUsers(users);
        }
        return { success: true, user: updated };
      }
    );
  },

  async forgotPassword(email: string) {
    return runApi(
      apiClient.post("/auth/forgot-password", { email }).then(res => res.data),
      async () => {
        const cleanEmail = email.trim().toLowerCase();
        const users = getEmulatedUsers();
        const matched = users.find(u => u.email.toLowerCase() === cleanEmail);
        if (!matched) {
          throw { response: { status: 404, data: { message: "Account lookup missing: No merchant profile exists matching that email directory." } } };
        }
        const otpCode = "123456";
        const otps = getEmulatedOtps();
        otps[cleanEmail] = {
          otp: otpCode,
          expiresAt: Date.now() + 300000,
          registerData: matched
        };
        saveEmulatedOtps(otps);
        console.log(`[EMULATION-SMTP] Forgot password OTP reset code for ${cleanEmail}: ${otpCode}`);
        return {
          success: true,
          message: `A password-reset OTP verification pin was generated. (Code: 123456)`,
          otp: "123456"
        };
      }
    );
  },

  async completeRegistration(payload: { email: string; password: any }) {
    return runApi(
      apiClient.post("/auth/complete-registration", payload).then(res => {
        const { data } = res;
        if (data.accessToken) {
          localStorage.setItem("_hyperlocal_access_token", data.accessToken);
          localStorage.setItem("_hyperlocal_current_user", JSON.stringify(data.user));
        }
        return data;
      }),
      async () => {
        const cleanEmail = payload.email.trim().toLowerCase();
        const users = getEmulatedUsers();
        const user = users.find(u => u.email.toLowerCase() === cleanEmail);
        if (!user) {
          throw { response: { status: 404, data: { message: "User not found." } } };
        }
        user.password = payload.password;
        user.registrationCompleted = true;
        user.enabled = true;
        saveEmulatedUsers(users);
        saveEmulatedCurrentUser(user);

        const token = "mock-jwt-access-" + Date.now();
        localStorage.setItem("_hyperlocal_access_token", token);

        return {
          success: true,
          message: "Registration completed successfully!",
          user,
          accessToken: token
        };
      }
    );
  },

  async getNearbyTrends(lat: number, lng: number) {
    return runApi(
      apiClient.get(`/trends/nearby?lat=${lat}&lng=${lng}`).then(res => res.data),
      async () => {
        return {
          success: true,
          locationName: `Region [${lat.toFixed(4)}, ${lng.toFixed(4)}]`,
          footTraffic: "High Traffic (Weekend Peak)",
          localSearchSurge: [
            { keyword: "Sambalpuri Handlooms", change: "+148%", trend: "up" },
            { keyword: "Organic Cotton Kurtas", change: "+85%", trend: "up" },
            { keyword: "Dahibara Aludum Fastfood", change: "+60%", trend: "up" }
          ],
          competitorBidding: [
            { category: "Ethnic Wear", density: "High", averageBid: "₹45/click" },
            { category: "Sweet Shops", density: "Medium", averageBid: "₹28/click" }
          ],
          events: [
            { name: "Ratha Yatra Local Bazaar", date: "Ongoing", impact: "High Density" },
            { name: "Budharaja Evening Food Fest", date: "Starts 6 PM", impact: "Medium Density" }
          ],
          recommendedCampaign: {
            title: "Weekend Handloom Carnival",
            description: "Launch a WhatsApp broadcast targeting Handloom enthusiasts within 2km.",
            potentialReach: "12,400 customers"
          }
        };
      }
    );
  },

  async logout() {
    try {
      await apiClient.post("/auth/logout");
    } catch (e) {
      // ignore
    }
    localStorage.removeItem("_hyperlocal_access_token");
    localStorage.removeItem("_hyperlocal_refresh_token");
    localStorage.removeItem("_hyperlocal_current_user");
    localStorage.removeItem("__api_use_client_emulation");
  },

  // --- STORE SERVICES ---
  async getStores() {
    return runApi(
      apiClient.get("/stores").then(res => res.data),
      async () => getEmulatedStores()
    );
  },

  async createStore(storeData: any) {
    return runApi(
      apiClient.post("/stores", storeData).then(res => res.data),
      async () => {
        const stores = getEmulatedStores();
        const newStore = { ...storeData, id: storeData.id || "store-" + Date.now() };
        stores.push(newStore);
        saveEmulatedStores(stores);
        return newStore;
      }
    );
  },

  async updateStore(id: string, storeData: any) {
    return runApi(
      apiClient.put(`/stores/${id}`, storeData).then(res => res.data),
      async () => {
        const stores = getEmulatedStores();
        const idx = stores.findIndex(s => s.id === id);
        if (idx >= 0) {
          stores[idx] = { ...stores[idx], ...storeData };
          saveEmulatedStores(stores);
          return stores[idx];
        }
        throw new Error("Store not found");
      }
    );
  },

  async deleteStore(id: string) {
    return runApi(
      apiClient.delete(`/stores/${id}`).then(res => res.data),
      async () => {
        const stores = getEmulatedStores();
        const filtered = stores.filter(s => s.id !== id);
        saveEmulatedStores(filtered);
        return { success: true };
      }
    );
  },

  // --- PRODUCT SERVICES ---
  async getProducts(params?: { search?: string; category?: string }) {
    return runApi(
      apiClient.get("/products", { params }).then(res => res.data),
      async () => {
        let p = getEmulatedProducts();
        if (params?.search) {
          const s = params.search.toLowerCase();
          p = p.filter((item: any) => item.name.toLowerCase().includes(s) || item.category.toLowerCase().includes(s));
        }
        return p;
      }
    );
  },

  async createProduct(productData: any) {
    return runApi(
      apiClient.post("/products", productData).then(res => res.data),
      async () => {
        const products = getEmulatedProducts();
        const newProduct = { ...productData, id: productData.id || "prod-" + Date.now() };
        products.push(newProduct);
        saveEmulatedProducts(products);
        return newProduct;
      }
    );
  },

  async updateProduct(id: string, productData: any) {
    return runApi(
      apiClient.put(`/products/${id}`, productData).then(res => res.data),
      async () => {
        const products = getEmulatedProducts();
        const idx = products.findIndex(p => p.id === id);
        if (idx >= 0) {
          products[idx] = { ...products[idx], ...productData };
          saveEmulatedProducts(products);
          return products[idx];
        }
        throw new Error("Product not found");
      }
    );
  },

  async deleteProduct(id: string) {
    return runApi(
      apiClient.delete(`/products/${id}`).then(res => res.data),
      async () => {
        const products = getEmulatedProducts();
        const filtered = products.filter(p => p.id !== id);
        saveEmulatedProducts(filtered);
        return { success: true };
      }
    );
  },

  // --- AI CAMPAIGN GENERATOR SERVICES ---
  async getOnboardingFirstRecommendation(payload: { businessName: string; category: string; location: string }) {
    return runApi(
      apiClient.post("/onboarding/first-recommendation", payload).then(res => res.data),
      async () => {
        return {
          recommendation: `Target a selective 5km radius around ${payload.location || "your hub"} favoring mobile shoppers. For a ${payload.category || "General Store"} business, launching a premium seasonal welcome voucher will stimulate foot traffic.`,
          budgetSuggestion: "Premium campaign on Instagram and Facebook with ₹15,000 budget."
        };
      }
    );
  },

  // --- SPRING BOOT ONBOARDING ROADMAP COMPATIBLE SERVICES ---
  async saveOnboardingBusiness(payload: {
    businessName: string;
    category: string;
    description: string;
    gstNumber?: string;
    website?: string;
  }) {
    return runApi(
      apiClient.post("/onboarding/business", payload).then(res => res.data),
      async () => {
        const user = getEmulatedCurrentUser();
        if (user) {
          user.businessName = payload.businessName;
          user.category = payload.category;
          user.onboardingStep = "store";
          saveEmulatedCurrentUser(user);
        }
        return { success: true, nextStep: "store" };
      }
    );
  },

  async saveOnboardingStore(payload: {
    storeName: string;
    storeAddress: string;
    contactNumber: string;
    openingHours: string;
    storeType: "Single Store" | "Multiple Stores";
  }) {
    return runApi(
      apiClient.post("/onboarding/store", payload).then(res => res.data),
      async () => {
        const user = getEmulatedCurrentUser();
        if (user) {
          user.onboardingStep = "location";
          saveEmulatedCurrentUser(user);
        }
        return { success: true, nextStep: "location" };
      }
    );
  },

  async saveOnboardingLocation(payload: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  }) {
    return runApi(
      apiClient.post("/onboarding/location", payload).then(res => res.data),
      async () => {
        const user = getEmulatedCurrentUser();
        if (user) {
          user.onboardingStep = "audience";
          saveEmulatedCurrentUser(user);
        }
        return { success: true, nextStep: "audience" };
      }
    );
  },

  async saveOnboardingAudience(payload: {
    ageGroups: string[];
    gender: string;
    customerTypes: string[];
  }) {
    return runApi(
      apiClient.post("/onboarding/audience", payload).then(res => res.data),
      async () => {
        const user = getEmulatedCurrentUser();
        if (user) {
          user.onboardingStep = "social";
          saveEmulatedCurrentUser(user);
        }
        return { success: true, nextStep: "social" };
      }
    );
  },

  async saveOnboardingSocial(payload: {
    instagram?: string;
    facebook?: string;
    whatsApp?: string;
    twitter?: string;
  }) {
    return runApi(
      apiClient.post("/onboarding/social", payload).then(res => res.data),
      async () => {
        const user = getEmulatedCurrentUser();
        if (user) {
          user.onboardingStep = "preferences";
          saveEmulatedCurrentUser(user);
        }
        return { success: true, nextStep: "preferences" };
      }
    );
  },

  async saveOnboardingPreferences(payload: {
    campaignGoal: string;
    budgetRange: string;
    tone: string;
  }) {
    return runApi(
      apiClient.post("/onboarding/preferences", payload).then(res => res.data),
      async () => {
        const user = getEmulatedCurrentUser();
        if (user) {
          user.onboardingStep = "completed";
          user.onboarded = true;
          saveEmulatedCurrentUser(user);
          
          const users = getEmulatedUsers();
          const idx = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
          if (idx >= 0) {
            users[idx] = { ...users[idx], ...user };
            saveEmulatedUsers(users);
          }
        }
        return { success: true, nextStep: "completed" };
      }
    );
  },

  async completeOnboarding() {
    return runApi(
      apiClient.post("/onboarding/complete").then(res => res.data),
      async () => {
        const user = getEmulatedCurrentUser();
        if (user) {
          user.onboarded = true;
          user.onboardingStep = "completed";
          saveEmulatedCurrentUser(user);
        }
        return { success: true };
      }
    );
  },

  async getOnboardingStatus() {
    return runApi(
      apiClient.get("/onboarding/status").then(res => res.data),
      async () => {
        const user = getEmulatedCurrentUser();
        return {
          onboarded: user ? !!user.onboarded : false,
          currentStep: user ? (user.onboardingStep || "business") : "business"
        };
      }
    );
  },

  async generateCampaign(campaignParams: any) {
    return runApi(
      apiClient.post("/campaigns/generate", campaignParams).then(res => res.data),
      async () => {
        const offer = campaignParams.offer || "Special Discount";
        const festival = campaignParams.festival || "Regular Market Offer";
        return {
          headline: `Sensational ${festival}!`,
          caption: `🔥 Incredible offers at our store! Get ${offer}. Experience premium quality at exclusive localized rates. Visit us today to secure this offer!`,
          hashtags: ["HyperlocalMarketing", "BigSavings", "ExclusiveDeals", "StorePremium"]
        };
      }
    );
  },

  async copilotGenerateCampaign(params: {
    businessCategory?: string;
    storeLocation?: string;
    festival?: string;
    product?: string;
    offer?: string;
    audience?: string;
    objective?: string;
    platforms?: string[];
    budget?: number;
    language?: string;
  }) {
    return runApi(
      apiClient.post("/campaigns/copilot-generate", params).then(res => res.data),
      async () => {
        const prod = params.product || "premium selections";
        const festival = params.festival && params.festival !== "None" ? params.festival : "Festive Event";
        const offer = params.offer || "Special 15% discount";
        const language = params.language || "English";
        
        let headline = `Unmissable ${festival} Spark!`;
        let caption = `✨ Elevate your style standard this season with our handcrafted ${prod}. To spread joy, we are introducing a: ${offer}! Valid exclusively for shoppers inside our targeting radius.`;
        let hashtags = ["FestiveMood", "LocalLove", "AdPulseSmartAd", "StoreOffer"];
        
        if (language.toLowerCase().includes("hindi")) {
          headline = `${festival} का सबसे बड़ा धमाका!`;
          caption = `✨ इस त्यौहार के शुभ अवसर पर पाइए हमारे बेहतरीन ${prod} पर ख़ास ऑफर: ${offer}! स्टॉक सीमित है, आज ही नजदीकी स्टोर पर आएं!`;
          hashtags = ["त्यौहारकीतैयारी", "शानदारऑफर", "लोकलस्टोर"];
        }

        return { headline, caption, hashtags };
      }
    );
  },

  async copilotRewriteCampaign(params: {
    headline: string;
    caption: string;
    hashtags: string[];
    action: string;
  }) {
    return runApi(
      apiClient.post("/campaigns/copilot-rewrite", params).then(res => res.data),
      async () => {
        const h = params.headline || "";
        const c = params.caption || "";
        const originalTags = params.hashtags || [];
        return {
          headline: `💥 ${h.replace(/[✨🔥🚩💥⚡⚠️]/g, '').trim()} — Don't Miss Out!`,
          caption: `⚡ ENHANCED AUDIENCE ENGAGEMENT: ${c}\n\n📍 Crafted with AdPulse hyper-targeting for peak physical store traffic. Visit us immediately!`,
          hashtags: [...originalTags, "ShopLocal", "ExclusiveAdPulse"]
        };
      }
    );
  },

  async copilotGenerateCalendar(params: {
    businessCategory?: string;
    storeLocation?: string;
  }) {
    return runApi(
      apiClient.post("/campaigns/copilot-calendar", params).then(res => res.data),
      async () => {
        return {
          calendar: [
            {
              day: "Monday",
              campaignName: "Weekly Starter Spotlight",
              audience: "Working Professionals & Local Commuters",
              channels: ["Instagram", "WhatsApp"],
              briefGoal: "Encourage early-week footfall with a 'Monday Rush' check-in coupon."
            },
            {
              day: "Wednesday",
              campaignName: "Mid-Week VIP Secret Deal",
              audience: "Loyal Customers & Repeat Shoppers",
              channels: ["Facebook", "WhatsApp"],
              briefGoal: "A special VIP private broadcast offering 10% off high-margin products."
            },
            {
              day: "Friday",
              campaignName: "Weekend Warmup Banner",
              audience: "Families & Leisurely Weekend Walkers",
              channels: ["Instagram", "Facebook", "Twitter"],
              briefGoal: "Generate evening interest for Saturday walk-ins with engaging visual reels."
            }
          ]
        };
      }
    );
  },

  async copilotGeneratePosterPrompt(params: {
    headline: string;
    caption: string;
    product: string;
    festival?: string;
  }) {
    return runApi(
      apiClient.post("/campaigns/copilot-poster-prompt", params).then(res => res.data),
      async () => {
        const product = params.product || "Premium selection";
        return {
          prompt: `A high-end, clean commercial photography graphic of ${product}. Modern professional lighting, flat-lay arrangement, elegant minimalist studio background matching slate color palettes. 4k resolution, optimized for Instagram feeds.`
        };
      }
    );
  },

  async copilotCampaignScoreAudit(params: {
    headline: string;
    caption: string;
    offer: string;
    objective?: string;
    language?: string;
  }) {
    return runApi(
      apiClient.post("/campaigns/copilot-score", params).then(res => res.data),
      async () => {
        return {
          score: 88,
          feedback: [
            "Your headline has a great emotional hook. Perfect use of strong, inviting words.",
            "Visual composition matches high-converting patterns, but adding a localized phone number inside the copy could boost immediate phone actions by 14%.",
            "Hashtag distribution is fully optimized for local search indexes."
          ]
        };
      }
    );
  },

  async copilotAskAi(params: {
    message: string;
    history?: any[];
    draftContext?: any;
  }) {
    return runApi(
      apiClient.post("/campaigns/copilot-ask", params).then(res => res.data),
      async () => {
        const userMsg = params.message.toLowerCase();
        let reply = "I am your virtual AdPulse marketing strategist. You can ask me to help build a new target audience, structure an invite campaign, or proofread your creative layouts!";
        if (userMsg.includes("audience")) {
          reply = "For hyperlocal campaigns, building a custom demographic tier of young professionals aged 21-35 who regularly visit surrounding business districts is your best bet. Leverage Instagram ads coupled with small offline flyers with QR codes.";
        } else if (userMsg.includes("budget") || userMsg.includes("money")) {
          reply = "A sound budget is to spend 60% on Facebook/Instagram localized impressions and 40% on WhatsApp Broadcaster updates. Keep a threshold of ₹10,000 for standard 7-day visual runs.";
        } else if (userMsg.includes("help") || userMsg.includes("generate")) {
          reply = "I suggest generating a 'Grand Weekend Carnival' campaign targeting families in a 4km radius, providing a free gift for children on entry.";
        }
        return { answer: reply };
      }
    );
  },

  async copilotGetRecommendations(params: {
    location?: string;
    products?: any[];
  }) {
    return runApi(
      apiClient.post("/campaigns/copilot-recommendations", params).then(res => res.data),
      async () => {
        return {
          recommendations: [
            {
              id: "rec-1",
              title: "Weekend Flash Sale Trigger",
              goal: "Clear stock & boost urgency",
              audience: "Bargain Shoppers inside 3km",
              potentialLift: "+24% foot traffic",
              description: "Publish a high-urgency Saturday-only deal featuring a specific product with high inventory."
            },
            {
              id: "rec-2",
              title: "Festival Family Package Campaign",
              goal: "Increase average cart value",
              audience: "Residential Household groups",
              potentialLift: "+18% revenue lift",
              description: "Group fashion items and accessories into a bundle offering a combined 20% discount."
            }
          ]
        };
      }
    );
  },

  async getCampaigns() {
    return runApi(
      apiClient.get("/campaigns").then(res => res.data),
      async () => getEmulatedCampaigns()
    );
  },

  async createCampaign(campaignData: any) {
    return runApi(
      apiClient.post("/campaigns", campaignData).then(res => res.data),
      async () => {
        const campaigns = getEmulatedCampaigns();
        const newCamp = { 
          ...campaignData, 
          id: campaignData.id || "camp-" + Date.now(),
          performanceTrend: [100, 150, 220, 280, 410],
          clicks: Math.floor(Math.random() * 200) + 100,
          views: Math.floor(Math.random() * 5000) + 3000
        };
        campaigns.push(newCamp);
        saveEmulatedCampaigns(campaigns);
        return newCamp;
      }
    );
  },

  async updateCampaign(id: string, campaignData: any) {
    return runApi(
      apiClient.put(`/campaigns/${id}`, campaignData).then(res => res.data),
      async () => {
        const campaigns = getEmulatedCampaigns();
        const idx = campaigns.findIndex(c => c.id === id);
        if (idx >= 0) {
          campaigns[idx] = { ...campaigns[idx], ...campaignData };
          saveEmulatedCampaigns(campaigns);
          return campaigns[idx];
        }
        throw new Error("Campaign not found");
      }
    );
  },

  async deleteCampaign(id: string) {
    return runApi(
      apiClient.delete(`/campaigns/${id}`).then(res => res.data),
      async () => {
        const campaigns = getEmulatedCampaigns();
        const filtered = campaigns.filter(c => c.id !== id);
        saveEmulatedCampaigns(filtered);
        return { success: true };
      }
    );
  },

  // --- DASHBOARD ANALYTICS SERVICES ---
  async getDashboardMetrics() {
    return runApi(
      apiClient.get("/dashboard/metrics").then(res => res.data),
      async () => {
        return {
          stats: {
            totalReach: 14780,
            reachChange: 12.8,
            activeCampaigns: 2,
            activeCampaignsChange: 1,
            avgScore: 84,
            avgScoreChange: 4.5,
            footfallEstimated: 412,
            footfallChange: 18.2
          },
          conversionChart: [
            { name: "Mon", impressions: 1200, clicks: 80, footfall: 15 },
            { name: "Tue", impressions: 1500, clicks: 110, footfall: 22 },
            { name: "Wed", impressions: 1800, clicks: 130, footfall: 28 },
            { name: "Thu", impressions: 2200, clicks: 160, footfall: 35 },
            { name: "Fri", impressions: 3100, clicks: 230, footfall: 52 },
            { name: "Sat", impressions: 4500, clicks: 350, footfall: 85 },
            { name: "Sun", impressions: 3800, clicks: 290, footfall: 70 }
          ],
          corridors: [
            { id: "corr-1", name: "Metro Station Exit Route", views: 4800, weight: "High" },
            { id: "corr-2", name: "Central Tech Park Crossing", views: 3200, weight: "Medium" },
            { id: "corr-3", name: "High Street Market Arcades", views: 6780, weight: "High" }
          ]
        };
      }
    );
  }
};
