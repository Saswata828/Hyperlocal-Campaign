import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Add required Google Drive and Google Sheets scopes
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');

let cachedToken: string | null = null;
let activeUser: any | null = null;
let isDemoMode = false;

// Load token from local storage if available for instant connection feeling,
// but always back it with proper in-memory session handling.
try {
  cachedToken = localStorage.getItem('_google_sheets_cached_token');
  isDemoMode = localStorage.getItem('_google_sheets_demo_mode') === 'true';
  if (isDemoMode && cachedToken) {
    activeUser = {
      uid: 'demo-google-user',
      displayName: 'Demo Merchant (Simulated)',
      email: 'demo@merchant.com',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80'
    };
  }
} catch (e) {}

export const googleSheetsService = {
  getAuthInstance() {
    return auth;
  },

  isDemoModeActive(): boolean {
    return isDemoMode;
  },

  async connectGoogle(forceDemo = false): Promise<{ user: any; accessToken: string }> {
    if (forceDemo) {
      isDemoMode = true;
      cachedToken = 'demo-google-token-xyz';
      activeUser = {
        uid: 'demo-google-user',
        displayName: 'Demo Merchant (Simulated)',
        email: 'demo@merchant.com',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80'
      };
      try {
        localStorage.setItem('_google_sheets_cached_token', cachedToken);
        localStorage.setItem('_google_sheets_demo_mode', 'true');
      } catch (e) {}
      return { user: activeUser, accessToken: cachedToken };
    }

    try {
      if (isDemoMode) {
        return this.connectGoogle(true);
      }
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) {
        throw new Error('Failed to obtain Google OAuth access token.');
      }
      cachedToken = credential.accessToken;
      activeUser = result.user;
      isDemoMode = false;
      
      try {
        localStorage.setItem('_google_sheets_cached_token', cachedToken);
        localStorage.setItem('_google_sheets_demo_mode', 'false');
      } catch (e) {}

      return { user: result.user, accessToken: cachedToken };
    } catch (error: any) {
      console.error('Google Sheets Sign-In Error:', error);
      if (
        error.code === 'auth/popup-closed-by-user' || 
        error.message?.includes('popup-closed-by-user') || 
        error.code?.includes('popup') ||
        error.message?.includes('popup')
      ) {
        const enrichedError = new Error(
          "Popup Blocked/Closed: Browser security blocked the popup in the iframe. " +
          "To connect your real Google Sheets, click 'Open in New Tab' in the top right. " +
          "Or click 'Use Simulated Demo Connection' to test all sync features immediately."
        );
        (enrichedError as any).code = error.code || 'auth/popup-closed-by-user';
        (enrichedError as any).isPopupBlocked = true;
        throw enrichedError;
      }
      throw error;
    }
  },

  getAccessToken(): string | null {
    return cachedToken;
  },

  disconnect() {
    if (!isDemoMode) {
      try {
        auth.signOut();
      } catch (e) {}
    }
    cachedToken = null;
    activeUser = null;
    isDemoMode = false;
    try {
      localStorage.removeItem('_google_sheets_cached_token');
      localStorage.removeItem('_google_sheets_demo_mode');
    } catch (e) {}
  },

  initAuthListener(
    onSuccess: (user: any, token: string) => void,
    onFailure: () => void
  ) {
    if (isDemoMode && cachedToken && activeUser) {
      setTimeout(() => {
        if (isDemoMode && cachedToken && activeUser) {
          onSuccess(activeUser, cachedToken);
        }
      }, 100);
    }
    return onAuthStateChanged(auth, (user) => {
      if (isDemoMode && cachedToken && activeUser) {
        onSuccess(activeUser, cachedToken);
      } else if (user && cachedToken) {
        activeUser = user;
        onSuccess(user, cachedToken);
      } else {
        onFailure();
      }
    });
  },

  /**
   * List spreadsheets from the user's Google Drive.
   */
  async listSpreadsheets(): Promise<Array<{ id: string; name: string; modifiedTime: string }>> {
    if (isDemoMode) {
      const storedMock = localStorage.getItem('_google_sheets_mock_files');
      let mockFiles = storedMock ? JSON.parse(storedMock) : [];
      if (mockFiles.length === 0) {
        mockFiles = [
          { id: 'demo-sheet-1', name: 'Hyperlocal_leads_export_june.xlsx', modifiedTime: new Date(Date.now() - 100000).toISOString() },
          { id: 'demo-sheet-2', name: 'Product_inventory_cp_branch.xlsx', modifiedTime: new Date(Date.now() - 3600000).toISOString() }
        ];
        localStorage.setItem('_google_sheets_mock_files', JSON.stringify(mockFiles));
      }
      return mockFiles;
    }

    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated with Google');

    const query = encodeURIComponent("mimeType = 'application/vnd.google-apps.spreadsheet'");
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc&pageSize=20`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Drive API error: ${response.status} - ${errBody}`);
    }

    const data = await response.json();
    return data.files || [];
  },

  /**
   * Retrieve cells from a specific spreadsheet range.
   */
  async getSpreadsheetValues(spreadsheetId: string, range: string): Promise<string[][]> {
    if (isDemoMode) {
      const storedData = localStorage.getItem(`_google_sheets_mock_data_${spreadsheetId}`);
      if (storedData) {
        return JSON.parse(storedData);
      }

      if (spreadsheetId === 'demo-sheet-1' || range.toLowerCase().includes('lead')) {
        return [
          ["Name", "Phone", "Email", "Store", "Platform", "Status", "Created At"],
          ["Aarav Sharma", "+919876543210", "aarav@example.com", "AdPulse Hyperlocal Hub", "WhatsApp", "Verified Lead", "2026-06-25"],
          ["Priya Patel", "+919812345678", "priya@example.com", "AdPulse Hyperlocal Hub", "Facebook", "Verified Lead", "2026-06-26"],
          ["Rahul Verma", "+919988776655", "rahul@example.com", "AdPulse Hyperlocal Hub", "WhatsApp", "Follow Up Pending", "2026-06-27"],
          ["Neha Gupta", "+919555443322", "neha@example.com", "AdPulse Hyperlocal Hub", "Instagram", "Follow Up Pending", "2026-06-28"],
          ["Amit Singh", "+919111223344", "amit@example.com", "AdPulse Hyperlocal Hub", "Facebook", "Disengaged", "2026-06-29"]
        ];
      } else {
        return [
          ["Product Name", "Category", "Price", "Discount", "Stock", "Status"],
          ["Festive Silk Saree", "Fashion & Apparel", "5999", "10", "50", "In Stock"],
          ["Brass Puja Thali", "Home Decor", "1299", "15", "12", "In Stock"],
          ["Terracotta Diya Set", "Home Decor", "299", "0", "150", "In Stock"],
          ["Kashmiri Shawl", "Fashion & Apparel", "4500", "20", "5", "Low Stock"]
        ];
      }
    }

    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated with Google');

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Sheets API read error: ${response.status} - ${errBody}`);
    }

    const data = await response.json();
    return data.values || [];
  },

  /**
   * Create a new Google Spreadsheet and populate it.
   */
  async createAndPopulateSpreadsheet(title: string, headers: string[], rows: any[][]): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
    if (isDemoMode) {
      const spreadsheetId = 'demo-created-' + Date.now();
      const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#demo`;
      
      const storedMock = localStorage.getItem('_google_sheets_mock_files');
      const mockFiles = storedMock ? JSON.parse(storedMock) : [];
      mockFiles.unshift({
        id: spreadsheetId,
        name: title,
        modifiedTime: new Date().toISOString()
      });
      localStorage.setItem('_google_sheets_mock_files', JSON.stringify(mockFiles));

      const valuesMatrix = [headers, ...rows];
      localStorage.setItem(`_google_sheets_mock_data_${spreadsheetId}`, JSON.stringify(valuesMatrix));

      return { spreadsheetId, spreadsheetUrl };
    }

    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated with Google');

    // 1. Create empty spreadsheet
    const createUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: { title }
      })
    });

    if (!createResponse.ok) {
      const errBody = await createResponse.text();
      throw new Error(`Sheets API create error: ${createResponse.status} - ${errBody}`);
    }

    const spreadsheet = await createResponse.json();
    const spreadsheetId = spreadsheet.spreadsheetId;
    const spreadsheetUrl = spreadsheet.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

    // 2. Format values matrix
    const valuesMatrix = [headers, ...rows];

    // 3. Write data to sheet (default Range is usually Sheet1!A1)
    const endColLetter = String.fromCharCode(65 + headers.length - 1); // 65 is 'A'
    const endRow = valuesMatrix.length;
    const range = `Sheet1!A1:${endColLetter}${endRow}`;

    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values: valuesMatrix
      })
    });

    if (!updateResponse.ok) {
      const errBody = await updateResponse.text();
      throw new Error(`Sheets API populate error: ${updateResponse.status} - ${errBody}`);
    }

    return { spreadsheetId, spreadsheetUrl };
  }
};
