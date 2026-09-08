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
  regionalName?: string;
  region: 'All India' | 'Odisha & East' | 'North' | 'West' | 'South';
  date: string;
  daysRemaining?: number;
  categoryFit?: string[];
  historicalRoi: number;
  trendingProducts: string[];
  trendingHashtags?: string[];
  recommendedOffer: string;
  aiTip: string;
  potentialReach: string;
  engagementMultiplier: number;
  peakWindow?: string;
  culturalHook?: string;
  radarScores?: {
    visualClicks: number;
    whatsappShares: number;
    storeFootfall: number;
    leadConversion: number;
    urgencyRate: number;
  };
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
    id: 'fest-nuakhai',
    name: 'Nuakhai Juhar Celebration',
    regionalName: 'ନୂଆଁଖାଇ ଜୁହାର (Western Odisha Agrarian Fest)',
    region: 'Odisha & East',
    date: 'September 20',
    daysRemaining: 11,
    categoryFit: ['Fashion & Apparel', 'Food & Sweets', 'Jewelry', 'Grocery'],
    historicalRoi: 360,
    trendingProducts: ['Sambalpuri Silk Handloom Saree', 'Traditional Kurta Sets', 'Local Arisa Pitha & Sweets', 'New Harvest Rice Gifting Hampers'],
    trendingHashtags: ['#NuakhaiJuhar', '#SambalpuriHandloom', '#WesternOdishaFest', '#LocalWeaves', '#NuakhaiBhetghat'],
    recommendedOffer: 'Flat 20% OFF on all authentic Sambalpuri Handlooms + Free Festive Gifting Box',
    aiTip: 'Pre-festival family buying surges 5 days prior across Gole Bazar and regional craft corridors. Deploy localized dialect video hooks on WhatsApp and Instagram Reels.',
    potentialReach: '145k within 10km',
    engagementMultiplier: 3.2,
    peakWindow: '4 days before Nuakhai through 2 days after',
    culturalHook: 'Celebrate the sacred agrarian harvest with new traditional attire, greetings to elders, and family feasts.',
    radarScores: { visualClicks: 95, whatsappShares: 98, storeFootfall: 92, leadConversion: 88, urgencyRate: 90 }
  },
  {
    id: 'fest-raja',
    name: 'Raja Parba Special',
    regionalName: 'ରଜ ପର୍ବ (Festival of Swings & Womanhood)',
    region: 'Odisha & East',
    date: 'June 14',
    daysRemaining: 278,
    categoryFit: ['Fashion & Apparel', 'Food & Sweets', 'Jewelry', 'Beauty & Salon'],
    historicalRoi: 310,
    trendingProducts: ['Cotton Ikkat Salwar Suits', 'Silver Filigree (Tarakasi)', 'Poda Pitha Hampers', 'Festive Henna & Mehendi Kits'],
    trendingHashtags: ['#RajaFestival', '#OdishaTradition', '#PodaPithaSpecial', '#RajaDoli', '#HandloomLove'],
    recommendedOffer: 'Buy 2 Get 1 FREE on all Women Festive Ensembles + Free Henna Voucher',
    aiTip: 'Target women 18-45 within 5km radius with swing visuals and celebration quotes. High WhatsApp group sharing multiplier.',
    potentialReach: '95k within 5km',
    engagementMultiplier: 2.7,
    peakWindow: '3 days across Pahili Raja, Raja Sankranti & Bhuin Dahana',
    culturalHook: 'Celebrating womanhood, traditional swings, authentic Poda Pitha, and rich Odia handlooms.',
    radarScores: { visualClicks: 88, whatsappShares: 94, storeFootfall: 90, leadConversion: 82, urgencyRate: 85 }
  },
  {
    id: 'fest-durga-puja',
    name: 'Durga Puja & Navratri Grand Fest',
    regionalName: 'ଦୁର୍ଗା ପୂଜା / শারদোৎসব / नवरात्रि',
    region: 'Odisha & East',
    date: 'October 18',
    daysRemaining: 39,
    categoryFit: ['Fashion & Apparel', 'Food & Sweets', 'Jewelry', 'Electronics'],
    historicalRoi: 410,
    trendingProducts: ['Dhakai Jamdani & Silk Sarees', 'Traditional Dhoti Kurta', 'Gold Plated Ornaments', 'Pandal Hopping Street Bites'],
    trendingHashtags: ['#DurgaPujaVibes', '#PandalHopping', '#FestiveLook', '#PujorShopping', '#NavratriFashion'],
    recommendedOffer: 'Mega Festive Splash: Flat 25% OFF + Surprise Gift on bills above INR 2,999',
    aiTip: 'Highest physical footfall and late-night shopping of the year. Run geofenced Instagram dynamic ads with real-time countdowns.',
    potentialReach: '280k within 12km',
    engagementMultiplier: 3.8,
    peakWindow: 'Mahalaya through Vijaya Dashami (10-day shopping frenzy)',
    culturalHook: 'The grandest festive homecoming, pandal hopping in traditional finery, and celebratory feasts.',
    radarScores: { visualClicks: 96, whatsappShares: 92, storeFootfall: 99, leadConversion: 94, urgencyRate: 95 }
  },
  {
    id: 'fest-diwali',
    name: 'Diwali & Dhanteras Mega Drive',
    regionalName: 'दीपावली एवं धनतेरस / ଦୀପାବଳି',
    region: 'All India',
    date: 'November 12',
    daysRemaining: 64,
    categoryFit: ['Jewelry', 'Electronics', 'Home Decor', 'Fashion & Apparel', 'Grocery'],
    historicalRoi: 450,
    trendingProducts: ['22K Gold & Diamond Jewelry', 'Designer LED Strip Lights', 'Luxury Sweet & Dryfruit Hampers', 'Festive Ethnic Kurtis'],
    trendingHashtags: ['#DiwaliSparkle', '#DhanterasShopping', '#GiftingSeason', '#LightUpYourHome', '#DiwaliDealsNearby'],
    recommendedOffer: 'Pre-book Gold with 0% Making Charges + Complimentary 24-Piece Diya Gift Set',
    aiTip: 'High-intent digital gift bookings start 10 days before Dhanteras. Focus ads on WhatsApp direct chat and localized map directions.',
    potentialReach: '320k within 15km',
    engagementMultiplier: 4.1,
    peakWindow: '7 days leading up to Diwali night',
    culturalHook: 'Auspicious prosperity purchases, lighting lamps, and premium gifting for loved ones.',
    radarScores: { visualClicks: 98, whatsappShares: 90, storeFootfall: 97, leadConversion: 96, urgencyRate: 98 }
  },
  {
    id: 'fest-holi',
    name: 'Holi Colors Carnival',
    regionalName: 'रंगों का त्यौहार - होली / ହୋଲି',
    region: 'All India',
    date: 'March 14',
    daysRemaining: 186,
    categoryFit: ['Fashion & Apparel', 'Food & Sweets', 'Grocery', 'Beauty & Salon'],
    historicalRoi: 240,
    trendingProducts: ['White Cotton Chikan Kurtas', 'Herbal Non-Toxic Gulal Sets', 'Gujiya & Thandai Sweets', 'Waterproof Accessories'],
    trendingHashtags: ['#HoliFest', '#OrganicColors', '#WhiteInStyle', '#HoliCelebrations', '#LocalHoliDeals'],
    recommendedOffer: 'Flat 20% OFF on all White Apparel + Free 4-Pack Herbal Organic Gulal',
    aiTip: 'Young adults and families purchase within 48 hours of festival day. Highlight same-day neighborhood delivery.',
    potentialReach: '110k within 6km',
    engagementMultiplier: 2.5,
    peakWindow: '3 days prior to Holika Dahan',
    culturalHook: 'Joyful celebration of colors, spring renewal, sweets, and community get-togethers.',
    radarScores: { visualClicks: 89, whatsappShares: 95, storeFootfall: 84, leadConversion: 80, urgencyRate: 92 }
  },
  {
    id: 'fest-ganesh',
    name: 'Ganesh Utsav Celebration',
    regionalName: 'गणेशोत्सव / ବିନାୟକ ଚତୁର୍ଥୀ',
    region: 'West',
    date: 'September 19',
    daysRemaining: 10,
    categoryFit: ['Food & Sweets', 'Home Decor', 'Jewelry', 'Fashion & Apparel'],
    historicalRoi: 320,
    trendingProducts: ['Artisanal Modak Boxes', 'Eco-friendly Pooja Decor', 'Traditional Silk Dhotis', 'Brass Pooja Articles'],
    trendingHashtags: ['#GaneshUtsav', '#ModakSpecial', '#BappaMoraya', '#FestiveDecor', '#LocalStoreDeals'],
    recommendedOffer: 'Buy 1kg Premium Modak Box and get 25% OFF on Festive Sweets Assortment',
    aiTip: 'Local community Mandals drive huge neighborhood demand. Target residential societies in 3km store vicinity.',
    potentialReach: '160k within 8km',
    engagementMultiplier: 3.0,
    peakWindow: '2 days before installation through 10-day Visarjan period',
    culturalHook: 'Welcoming Lord Ganesha with devotion, eco-friendly celebrations, and sweet offerings.',
    radarScores: { visualClicks: 91, whatsappShares: 93, storeFootfall: 95, leadConversion: 86, urgencyRate: 88 }
  },
  {
    id: 'fest-eid',
    name: 'Eid Festive Splendor',
    regionalName: 'عيد الفطر المبارك (Eid Al-Fitr)',
    region: 'All India',
    date: 'April 10',
    daysRemaining: 213,
    categoryFit: ['Fashion & Apparel', 'Food & Sweets', 'Jewelry', 'Beauty & Salon'],
    historicalRoi: 310,
    trendingProducts: ['Embroidered Shararas & Kurta Sets', 'Traditional Sheer Khurma Ingredients', 'Non-Alcoholic Attar Perfumes', 'Designer Footwear'],
    trendingHashtags: ['#EidMubarak', '#EidFashion', '#FestiveElegance', '#LocalBoutique', '#EidShopping'],
    recommendedOffer: 'Complimentary Luxury Attar & Gift Box with purchases above INR 2,499',
    aiTip: 'Night market footfall surges during Chaand Raat. Run evening ad broadcasts between 7 PM and 11 PM.',
    potentialReach: '130k within 7km',
    engagementMultiplier: 2.9,
    peakWindow: 'Last week of Ramadan through Chaand Raat',
    culturalHook: 'Celebrating gratitude, community bonding, elegant new garments, and delicious family feasts.',
    radarScores: { visualClicks: 92, whatsappShares: 89, storeFootfall: 93, leadConversion: 87, urgencyRate: 91 }
  },
  {
    id: 'fest-newyear',
    name: 'New Year & Winter Flash',
    regionalName: 'Happy New Year & Winter Clearance',
    region: 'All India',
    date: 'January 1',
    daysRemaining: 114,
    categoryFit: ['Fashion & Apparel', 'Electronics', 'Food & Dining', 'Beauty & Salon'],
    historicalRoi: 290,
    trendingProducts: ['Glamorous Party Attire', 'Bluetooth Audio & Gadgets', 'Winter Fashion Jackets', 'Gourmet Party Platters'],
    trendingHashtags: ['#NewYearDeals', '#PartyReady', '#FlashSaleNearby', '#Welcome2027', '#LocalShopping'],
    recommendedOffer: 'Buy 1 Get 1 at 50% OFF on all Lifestyle & Winter Collections',
    aiTip: 'High visual search spikes starting December 26. Run targeted radius offers to nearby office complexes and youth hangouts.',
    potentialReach: '125k within 8km',
    engagementMultiplier: 2.6,
    peakWindow: 'December 27 through January 2',
    culturalHook: 'Ringing in the New Year with parties, wardrobe revamps, resolution gifts, and winter specials.',
    radarScores: { visualClicks: 94, whatsappShares: 87, storeFootfall: 88, leadConversion: 84, urgencyRate: 89 }
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
