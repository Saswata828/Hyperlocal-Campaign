import { apiService } from './api';

// Native local placeholders instead of Firebase SDK
const auth = { currentUser: null as any };
const db = {} as any;
const doc = (...args: any[]) => ({}) as any;
const setDoc = async (...args: any[]) => {};
const deleteDoc = async (...args: any[]) => {};
const collection = (...args: any[]) => ({}) as any;
const query = (...args: any[]) => ({}) as any;
const where = (...args: any[]) => ({}) as any;
const getDocs = async (...args: any[]) => ({ forEach: () => {} } as any);
const handleFirestoreError = (...args: any[]) => {};
enum OperationType {
  WRITE = 'WRITE',
  READ = 'READ',
  DELETE = 'DELETE'
}

// --- REACTIVE STATE OBSERVERS FOR REAL-TIME SYNC ---
type DashboardListener = () => void;
const dashboardListeners = new Set<DashboardListener>();
export const subscribeToDashboardState = (listener: DashboardListener) => {
  dashboardListeners.add(listener);
  return () => {
    dashboardListeners.delete(listener);
  };
};

const notifyDashboardListeners = () => {
  dashboardListeners.forEach(l => {
    try {
      l();
    } catch (e) {
      console.error(e);
    }
  });
};

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  category: string;
  hours: string;
  radiusTargetKm: number;
  status: 'Active' | 'Inactive';
  latitude?: number;
  longitude?: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  discount: number; // percentage
  stock: number;
  image: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface Campaign {
  id: string;
  name: string;
  goal: string;
  festival: string;
  audience: string;
  radiusKm: number;
  budget: number;
  offer: string;
  tone: string;
  platforms: string[];
  status: 'Draft' | 'Active' | 'Scheduled' | 'Completed';
  reach: number;
  engagement: number;
  leads: number;
  roi: number; // percentage
  startDate: string;
  generatedCaption?: string;
  generatedHeadline?: string;
  generatedCtas?: string[];
  generatedHashtags?: string[];
}

export interface FestivalInsight {
  id: string;
  name: string;
  date: string;
  historicalRoi: number;
  trendingProducts: string[];
  recommendedOffer: string;
  aiTip: string;
  potentialReach: string;
  engagementMultiplier: number;
}

export interface CustomerLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: 'New' | 'In Progress' | 'Converted' | 'Lost';
  inquiry: string;
  date: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: 'Billing' | 'Campaigns' | 'System Error' | 'Integration';
  status: 'Open' | 'Pending' | 'Closed';
  date: string;
  priority: 'Low' | 'Medium' | 'High';
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'alert' | 'recommendation';
  timestamp: string;
  read: boolean;
}

// Default initial database templates (Clean initialized state for genuine merchant records)
const DEFAULT_STORES: Store[] = [];
const DEFAULT_PRODUCTS: Product[] = [];
const DEFAULT_CAMPAIGNS: Campaign[] = [];

const DEFAULT_FESTIVALS: FestivalInsight[] = [
  {
    id: 'fest-1',
    name: 'Diwali',
    date: 'November 12',
    historicalRoi: 340,
    trendingProducts: ['Festive Ethnic Garments', 'Gold Ornaments', 'Assorted Dryfault Hampers'],
    recommendedOffer: 'Free LED Starlight string set with garments purchase worth INR 3,000+',
    aiTip: 'High intent local traffic peaks 4 days prior. Schedule Instagram visual dynamic carousels using localized coordinates.',
    potentialReach: '120k within 5km',
    engagementMultiplier: 2.8
  },
  {
    id: 'fest-2',
    name: 'Holi',
    date: 'March 14',
    historicalRoi: 210,
    trendingProducts: ['White Cotton Apparel', 'Sturdier Slip-ons', 'Organic Skin Protectants'],
    recommendedOffer: 'Flat 15% discount + complimentary packet of Non-toxic Herbal Gulal',
    aiTip: 'Prioritize WhatsApp broadcasts with clear local maps delivery pins. Focus campaigns within a tight 3km store radius.',
    potentialReach: '65k within 5km',
    engagementMultiplier: 1.9
  },
  {
    id: 'fest-3',
    name: 'New Year Special',
    date: 'January 1',
    historicalRoi: 280,
    trendingProducts: ['Party Footwear', 'Sparkling Home Accessories', 'Unisex Gift Combinations'],
    recommendedOffer: 'Buy 1 Get 50% Off on second item + midnight courier guarantee',
    aiTip: 'High visual search spikes starting December 26. Run targeted radius offers to nearby office complexes.',
    potentialReach: '95k within 5km',
    engagementMultiplier: 2.2
  },
  {
    id: 'fest-4',
    name: 'Eid Al-Fitr',
    date: 'April 20',
    historicalRoi: 295,
    trendingProducts: ['Sheer Shalwar Suits', 'Premium Leather Mojris', 'Assorted Attar Collections'],
    recommendedOffer: 'Complimentary luxury gift box + 15% VIP neighbor priority rebate',
    aiTip: 'Engage local micro-influencers. High conversion rates witnessed on Facebook Local Groups directory tags.',
    potentialReach: '80k within 5km',
    engagementMultiplier: 2.4
  }
];

const DEFAULT_LEADS: CustomerLead[] = [];
const DEFAULT_NOTIFICATIONS: DashboardNotification[] = [];

class DashboardService {
  public async syncFromFirestore(userId: string): Promise<void> {
    // Firebase Firestore is disabled, using local device memory storage
    return;
  }

  private getScopedKey(key: string): string {
    const email = localStorage.getItem('_logged_user_email') || 'merchant@demo.com';
    return `${key}_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  }

  public clearLocalOnSignout(): void {
    // Keep user-scoped records intact so they aren't lost on re-login
    localStorage.removeItem('adpulse_stores');
    localStorage.removeItem('adpulse_products');
    localStorage.removeItem('adpulse_campaigns');
    localStorage.removeItem('adpulse_leads');
    localStorage.removeItem('adpulse_notifs');
  }

  private getStorageItem<T>(key: string, defaultValue: T): T {
    try {
      const scopedKey = this.getScopedKey(key);
      const stored = localStorage.getItem(scopedKey) || localStorage.getItem(key);
      if (stored) {
        let parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          if (key === 'adpulse_stores') {
            parsed = parsed.filter((s: any) =>
              s.id !== 'store-1' && s.id !== 'store-2' &&
              s.name !== 'AdPulse Hyperlocal Hub - Main Branch' &&
              s.name !== 'AdPulse Premium Express' &&
              s.name !== 'Demo Store'
            );
          } else if (key === 'adpulse_campaigns') {
            parsed = parsed.filter((c: any) =>
              c.id !== 'camp-1' && c.id !== 'camp-2' && c.id !== 'camp-3' &&
              !c.id?.startsWith('camp-onb-') &&
              c.name !== 'Diwali Festive Sparkle Mega Drive' &&
              c.name !== 'Holi Organic Colors Carnival' &&
              c.name !== 'First Launch Celebration Wave' &&
              c.name !== 'Local Launch Promo'
            );
          } else if (key === 'adpulse_products') {
            parsed = parsed.filter((p: any) => !['prod-1', 'prod-2', 'prod-3', 'prod-4'].includes(p.id));
          } else if (key === 'adpulse_leads') {
            parsed = parsed.filter((l: any) => !['lead-1', 'lead-2', 'lead-3', 'lead-4'].includes(l.id));
          } else if (key === 'adpulse_notifs') {
            parsed = parsed.filter((n: any) => !['notif-1', 'notif-2', 'notif-3'].includes(n.id));
          }
        }
        return parsed as T;
      }
    } catch (e) {
      console.warn('Dashboard storage retrieve failed: ', e);
    }
    return defaultValue;
  }

  private setStorageItem<T>(key: string, value: T): void {
    try {
      const scopedKey = this.getScopedKey(key);
      localStorage.setItem(scopedKey, JSON.stringify(value));
    } catch (e) {
      console.warn('Dashboard storage save failed: ', e);
    }
  }

  // --- STORES ---
  public getStores(): Store[] {
    const cached = this.getStorageItem<Store[]>('adpulse_stores', DEFAULT_STORES);
    
    // Background fetch from live Fullstack Express API only if authorized
    const token = localStorage.getItem("_hyperlocal_access_token");
    if (token) {
      apiService.getStores().then((fetched) => {
        const cleanFetched = Array.isArray(fetched) ? fetched.filter((s: any) =>
          s.id !== 'store-1' && s.id !== 'store-2' &&
          s.name !== 'AdPulse Hyperlocal Hub - Main Branch' &&
          s.name !== 'AdPulse Premium Express' &&
          s.name !== 'Demo Store'
        ) : [];
        const cachedStr = JSON.stringify(cached);
        const fetchedStr = JSON.stringify(cleanFetched);
        if (cachedStr !== fetchedStr && Array.isArray(fetched)) {
          this.setStorageItem('adpulse_stores', cleanFetched);
          notifyDashboardListeners();
        }
      }).catch(e => console.warn("[BACKGROUND SYNC] Stores background fetch failed, using local caching fallback:", e));
    }
    
    return cached;
  }

  public saveStore(store: Store): void {
    const current = this.getStores();
    const index = current.findIndex(s => s.id === store.id);
    if (index >= 0) {
      current[index] = store;
    } else {
      current.push(store);
    }
    this.setStorageItem('adpulse_stores', current);
    notifyDashboardListeners();

    // Axios backend push
    const isNew = store.id.includes("tmp") || Number(store.id.split('-')[1]) > 1700000000000;
    if (isNew) {
      apiService.createStore(store).then(saved => {
        const fresh = this.getStorageItem<Store[]>('adpulse_stores', DEFAULT_STORES);
        const idx = fresh.findIndex(s => s.id === store.id);
        if (idx >= 0) {
          fresh[idx] = saved;
          this.setStorageItem('adpulse_stores', fresh);
          notifyDashboardListeners();
        }
      }).catch(e => console.error(e));
    } else {
      apiService.updateStore(store.id, store).catch(e => console.error(e));
    }

    // Sync with Firestore
    const uid = auth.currentUser?.uid;
    if (uid) {
      setDoc(doc(db, 'stores', store.id), { ...store, ownerId: uid }).catch(error => {
        handleFirestoreError(error, OperationType.WRITE, `stores/${store.id}`);
      });
    }

    this.addNotification({
      id: `notif-${Date.now()}`,
      title: `Store ${store.name} saved`,
      message: `The hyperlocal targeting and operational hours of store have been successfully registered.`,
      type: 'success',
      timestamp: 'Just now',
      read: false
    });
  }

  public deleteStore(id: string): void {
    const current = this.getStores();
    const updated = current.filter(s => s.id !== id);
    this.setStorageItem('adpulse_stores', updated);
    notifyDashboardListeners();

    // Axios delete sync
    apiService.deleteStore(id).catch(e => console.error(e));

    // Sync deletion on Firestore
    const uid = auth.currentUser?.uid;
    if (uid) {
      deleteDoc(doc(db, 'stores', id)).catch(error => {
        console.warn('Silent fallback: Could not delete store in Firestore (probably a default local mock item or permission limitation):', error);
      });
    }
  }

  public toggleStoreStatus(id: string): void {
    const current = this.getStores();
    const index = current.findIndex(s => s.id === id);
    if (index >= 0) {
      const store = current[index];
      const updatedStatus: 'Active' | 'Inactive' = store.status === 'Active' ? 'Inactive' : 'Active';
      const updatedStore = {
        ...store,
        status: updatedStatus
      };
      current[index] = updatedStore;
      this.setStorageItem('adpulse_stores', current);
      notifyDashboardListeners();

      // Axios put sync
      apiService.updateStore(id, updatedStore).catch(e => console.error(e));

      const uid = auth.currentUser?.uid;
      if (uid) {
        setDoc(doc(db, 'stores', id), { ...updatedStore, ownerId: uid }).catch(error => {
          console.warn('Silent fallback: Could not update store status in Firestore:', error);
        });
      }

      this.addNotification({
        id: `notif-${Date.now()}`,
        title: `Store ${store.name} set to ${updatedStatus}`,
        message: `Successfully set branch state to ${updatedStatus} locally and synchronized.`,
        type: 'success',
        timestamp: 'Just now',
        read: false
      });
    }
  }

  // --- PRODUCTS ---
  public getProducts(): Product[] {
    const cached = this.getStorageItem<Product[]>('adpulse_products', DEFAULT_PRODUCTS);

    // Live background fetch from Fullstack Express APIs only if authorized
    const token = localStorage.getItem("_hyperlocal_access_token");
    if (token) {
      apiService.getProducts().then((fetched) => {
        const cleanFetched = Array.isArray(fetched) ? fetched.filter((p: any) =>
          !['prod-1', 'prod-2', 'prod-3', 'prod-4'].includes(p.id)
        ) : [];
        const cachedStr = JSON.stringify(cached);
        const fetchedStr = JSON.stringify(cleanFetched);
        if (cachedStr !== fetchedStr && Array.isArray(fetched)) {
          this.setStorageItem('adpulse_products', cleanFetched);
          notifyDashboardListeners();
        }
      }).catch(e => console.warn("[BACKGROUND SYNC] Products background fetch failed, using local caching fallback:", e));
    }

    return cached;
  }

  public saveProduct(product: Product): void {
    const current = this.getProducts();
    const index = current.findIndex(p => p.id === product.id);
    if (index >= 0) {
      current[index] = product;
    } else {
      current.push(product);
    }
    this.setStorageItem('adpulse_products', current);
    notifyDashboardListeners();

    // Axios sync
    const isNew = product.id.includes("tmp") || Number(product.id.split('-')[1]) > 1700000000000;
    if (isNew) {
      apiService.createProduct(product).then(saved => {
        const fresh = this.getStorageItem<Product[]>('adpulse_products', DEFAULT_PRODUCTS);
        const idx = fresh.findIndex(p => p.id === product.id);
        if (idx >= 0) {
          fresh[idx] = saved;
          this.setStorageItem('adpulse_products', fresh);
          notifyDashboardListeners();
        }
      }).catch(e => console.error(e));
    } else {
      apiService.updateProduct(product.id, product).catch(e => console.error(e));
    }

    // Sync with Firestore
    const uid = auth.currentUser?.uid;
    if (uid) {
      setDoc(doc(db, 'products', product.id), { ...product, ownerId: uid }).catch(error => {
        handleFirestoreError(error, OperationType.WRITE, `products/${product.id}`);
      });
    }
  }

  public deleteProduct(id: string): void {
    const current = this.getProducts();
    const updated = current.filter(p => p.id !== id);
    this.setStorageItem('adpulse_products', updated);
    notifyDashboardListeners();

    // Axios delete sync
    apiService.deleteProduct(id).catch(e => console.error(e));

    // Sync delete on Firestore
    const uid = auth.currentUser?.uid;
    if (uid) {
      deleteDoc(doc(db, 'products', id)).catch(error => {
        console.warn('Silent fallback: Could not delete product from Firestore (probably default local item):', error);
      });
    }
  }

  public importProductsCsv(rawCsv: string): number {
    const lines = rawCsv.split('\n');
    let importedCount = 0;
    const currentProducts = this.getProducts();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      // Simple parse comma separated
      const parts = line.split(',');
      if (parts.length >= 5) {
        const name = parts[0].trim();
        const category = parts[1].trim();
        const price = parseFloat(parts[2].trim()) || 0;
        const discount = parseFloat(parts[3].trim()) || 0;
        const stock = parseInt(parts[4].trim()) || 0;

        const newProd: Product = {
          id: `prod-csv-${Date.now()}-${i}`,
          name,
          category,
          price,
          discount,
          stock,
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&h=150&fit=crop&q=80',
          status: stock === 0 ? 'Out of Stock' : stock < 10 ? 'Low Stock' : 'In Stock'
        };
        currentProducts.push(newProd);
        importedCount++;

        // Sync CSV imports to Firestore
        const uid = auth.currentUser?.uid;
        if (uid) {
          setDoc(doc(db, 'products', newProd.id), { ...newProd, ownerId: uid }).catch(error => {
            handleFirestoreError(error, OperationType.WRITE, `products/${newProd.id}`);
          });
        }
      }
    }

    if (importedCount > 0) {
      this.setStorageItem('adpulse_products', currentProducts);
      this.addNotification({
        id: `notif-${Date.now()}`,
        title: `CSV Products Import Succeeded`,
        message: `Successfully mapped and updated ${importedCount} items into your store apparel directory.`,
        type: 'success',
        timestamp: 'Just now',
        read: false
      });
    }

    return importedCount;
  }

  // --- CAMPAIGNS ---
  public getCampaigns(): Campaign[] {
    const cached = this.getStorageItem<Campaign[]>('adpulse_campaigns', DEFAULT_CAMPAIGNS);

    // Background fetch from live Fullstack Express API only if authorized
    const token = localStorage.getItem("_hyperlocal_access_token");
    if (token) {
      apiService.getCampaigns().then((fetched) => {
        const cleanFetched = Array.isArray(fetched) ? fetched.filter((c: any) =>
          c.id !== 'camp-1' && c.id !== 'camp-2' && c.id !== 'camp-3' &&
          !c.id?.startsWith('camp-onb-') &&
          c.name !== 'Diwali Festive Sparkle Mega Drive' &&
          c.name !== 'Holi Organic Colors Carnival' &&
          c.name !== 'First Launch Celebration Wave' &&
          c.name !== 'Local Launch Promo'
        ) : [];
        const cachedStr = JSON.stringify(cached);
        const fetchedStr = JSON.stringify(cleanFetched);
        if (cachedStr !== fetchedStr && Array.isArray(fetched)) {
          this.setStorageItem('adpulse_campaigns', cleanFetched);
          notifyDashboardListeners();
        }
      }).catch(e => console.warn("[BACKGROUND SYNC] Campaigns background fetch failed, using local caching fallback:", e));
    }

    return cached;
  }

  public saveCampaign(campaign: Campaign): void {
    const current = this.getCampaigns();
    const index = current.findIndex(c => c.id === campaign.id);
    if (index >= 0) {
      current[index] = campaign;
    } else {
      current.push(campaign);
    }
    this.setStorageItem('adpulse_campaigns', current);
    notifyDashboardListeners();

    // Axios backend push
    const isNew = campaign.id.includes("tmp") || campaign.id.startsWith("camp-") && Number(campaign.id.split('-')[1]) > 1700000000000;
    if (isNew) {
      apiService.createCampaign(campaign).then(saved => {
        const fresh = this.getStorageItem<Campaign[]>('adpulse_campaigns', DEFAULT_CAMPAIGNS);
        const idx = fresh.findIndex(c => c.id === campaign.id);
        if (idx >= 0) {
          fresh[idx] = saved;
          this.setStorageItem('adpulse_campaigns', fresh);
          notifyDashboardListeners();
        }
      }).catch(e => console.error("[CAMPAIGNS API] Error creating campaign:", e));
    } else {
      apiService.updateCampaign(campaign.id, campaign).catch(e => console.error("[CAMPAIGNS API] Error updating campaign:", e));
    }

    // Sync with Firestore
    const uid = auth.currentUser?.uid;
    if (uid) {
      setDoc(doc(db, 'campaigns', campaign.id), { ...campaign, ownerId: uid }).catch(error => {
        handleFirestoreError(error, OperationType.WRITE, `campaigns/${campaign.id}`);
      });
    }

    // Trigger success notification
    if (campaign.status === 'Active') {
      this.addNotification({
        id: `notif-camp-${Date.now()}`,
        title: `Campaign Activated: ${campaign.name}`,
        message: `Hyperlocal campaign configured in a ${campaign.radiusKm}km radius has been successfully pushed.`,
        type: 'success',
        timestamp: 'Just now',
        read: false
      });
    }
  }

  public deleteCampaign(id: string): void {
    const current = this.getCampaigns();
    const updated = current.filter(c => c.id !== id);
    this.setStorageItem('adpulse_campaigns', updated);
    notifyDashboardListeners();

    // Axios delete sync
    apiService.deleteCampaign(id).catch(e => console.error("[CAMPAIGNS API] Error deleting campaign:", e));

    // Sync details deletion
    const uid = auth.currentUser?.uid;
    if (uid) {
      deleteDoc(doc(db, 'campaigns', id)).catch(error => {
        console.warn('Silent fallback: Could not delete campaign from Firestore (probably default local item):', error);
      });
    }
  }

  // --- FESTIVALS ---
  public getFestivals(): FestivalInsight[] {
    return DEFAULT_FESTIVALS;
  }

  // --- LEADS ---
  public getLeads(): CustomerLead[] {
    return this.getStorageItem<CustomerLead[]>('adpulse_leads', DEFAULT_LEADS);
  }

  public saveLead(lead: CustomerLead): void {
    const current = this.getLeads();
    const index = current.findIndex(l => l.id === lead.id);
    if (index >= 0) {
      current[index] = lead;
    } else {
      current.push(lead);
    }
    this.setStorageItem('adpulse_leads', current);

    // Sync with Firestore
    const uid = auth.currentUser?.uid;
    if (uid) {
      setDoc(doc(db, 'leads', lead.id), { ...lead, ownerId: uid }).catch(error => {
        handleFirestoreError(error, OperationType.WRITE, `leads/${lead.id}`);
      });
    }
  }

  // --- NOTIFICATIONS ---
  public getNotifications(): DashboardNotification[] {
    return this.getStorageItem<DashboardNotification[]>('adpulse_notifs', DEFAULT_NOTIFICATIONS);
  }

  public addNotification(notif: DashboardNotification): void {
    const current = this.getNotifications();
    current.unshift(notif);
    this.setStorageItem('adpulse_notifs', current);

    // Sync with Firestore
    const uid = auth.currentUser?.uid;
    if (uid) {
      setDoc(doc(db, 'notifications', notif.id), { ...notif, ownerId: uid }).catch(error => {
        handleFirestoreError(error, OperationType.WRITE, `notifications/${notif.id}`);
      });
    }
  }

  public markAllAsRead(): void {
    const current = this.getNotifications();
    current.forEach(n => {
      n.read = true;
      // Sync on Firestore
      const uid = auth.currentUser?.uid;
      if (uid) {
        setDoc(doc(db, 'notifications', n.id), { ...n, ownerId: uid }).catch(error => {
          handleFirestoreError(error, OperationType.WRITE, `notifications/${n.id}`);
        });
      }
    });
    this.setStorageItem('adpulse_notifs', current);
  }

  // --- GENERATE AI CAMPAIGN DIALOGUE ---
  public generateAiCampaignData(params: {
    name: string;
    goal: string;
    festival: string;
    audience: string;
    radiusKm: number;
    budget: number;
    offer: string;
    tone: string;
    platforms: string[];
  }): Campaign {
    const toneEmoji = params.tone === 'Premium & Trustworthy' ? '⭐' : params.tone === 'Playful & Vibrant' ? '🎨' : '✨';
    const cleanFestival = params.festival ? params.festival.replace(' Celebration', '').replace(' Carnival', '') : 'In-Store';

    const generatedCaption = `${toneEmoji} EXCLUSIVE LOCAL SPECIAL DEALS! Nearby ${params.audience} and residents within a ${params.radiusKm}km radius - get ready for our beautiful ${cleanFestival}! We are offering: ${params.offer}. Made with premium precision. Stop by today or click link to claim! #HyperlocalCampaign #${cleanFestival}Special #${params.tone.replace('& ', '').replace(' ', '')}`;
    
    const generatedHeadline = `${toneEmoji} ${cleanFestival} Neighborhood Exclusive Offer: ${params.offer.slice(0, 48)}...`;
    
    const generatedCtas = [
      'Get Directions to Store',
      'Claim Offer on WhatsApp',
      'Shop Premium Inventory Online'
    ];

    const generatedHashtags = [
      `#${cleanFestival}Deals`,
      `#ShopLocal`,
      `#${params.audience.replace(/ & /g, '').replace(/ /g, '')}`,
      `#ExclusiveCampaign`
    ];

    return {
      id: `camp-${Date.now()}`,
      name: params.name || `${cleanFestival} Targeted Drive`,
      goal: params.goal || 'Increase Offline Traffic',
      festival: params.festival || 'None',
      audience: params.audience || 'Local Residents',
      radiusKm: params.radiusKm,
      budget: params.budget,
      offer: params.offer,
      tone: params.tone,
      platforms: params.platforms,
      status: 'Draft',
      reach: 0,
      engagement: 0,
      leads: 0,
      roi: 0,
      startDate: new Date().toISOString().split('T')[0],
      generatedCaption,
      generatedHeadline,
      generatedCtas,
      generatedHashtags
    };
  }
}

export const dashboardService = new DashboardService();
