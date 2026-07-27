import * as React from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  CheckCircle, 
  Loader2, 
  LogOut, 
  AlertCircle, 
  Eye, 
  RefreshCw, 
  FileText, 
  ExternalLink, 
  Lock,
  ChevronRight,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { googleSheetsService } from '../../services/googleSheetsService';
import { dashboardService, Product, CustomerLead } from '../../services/dashboardService';
import { Button } from '../ui/Button';

interface GoogleSheetsSyncProps {
  type: 'leads' | 'products';
  onSyncComplete?: () => void;
}

export const GoogleSheetsSync: React.FC<GoogleSheetsSyncProps> = ({ type, onSyncComplete }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
  const [googleUser, setGoogleUser] = React.useState<any>(null);
  const [activeTab, setActiveTab] = React.useState<'export' | 'import'>('export');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [statusMessage, setStatusMessage] = React.useState<{ text: string; isError: boolean } | null>(null);
  const [hasPopupError, setHasPopupError] = React.useState<boolean>(false);
  
  // Export states
  const [createdSpreadsheet, setCreatedSpreadsheet] = React.useState<{ id: string; url: string; title: string } | null>(null);
  const [showExportConfirm, setShowExportConfirm] = React.useState<boolean>(false);

  // Import states
  const [spreadsheets, setSpreadsheets] = React.useState<Array<{ id: string; name: string; modifiedTime: string }>>([]);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = React.useState<string>('');
  const [importRange, setImportRange] = React.useState<string>('Sheet1!A1:H100');
  const [isFetchingFiles, setIsFetchingFiles] = React.useState<boolean>(false);
  const [isFetchingPreview, setIsFetchingPreview] = React.useState<boolean>(false);
  const [previewRows, setPreviewRows] = React.useState<string[][]>([]);
  const [showImportConfirm, setShowImportConfirm] = React.useState<boolean>(false);
  const [columnMappings, setColumnMappings] = React.useState<Record<string, number>>({});

  // Fetch local data count to display in UI
  const localItemsCount = type === 'leads' 
    ? dashboardService.getLeads().length 
    : dashboardService.getProducts().length;

  React.useEffect(() => {
    // Listen for auth changes and initialize token
    const unsubscribe = googleSheetsService.initAuthListener(
      (user, token) => {
        setIsAuthenticated(true);
        setGoogleUser(user);
        fetchGoogleFiles();
      },
      () => {
        if (!googleSheetsService.isDemoModeActive()) {
          setIsAuthenticated(false);
          setGoogleUser(null);
        }
      }
    );

    // Initial instant check if we have a cached token
    const token = googleSheetsService.getAccessToken();
    if (token && (googleSheetsService.getAuthInstance().currentUser || googleSheetsService.isDemoModeActive())) {
      setIsAuthenticated(true);
      setGoogleUser(googleSheetsService.isDemoModeActive() 
        ? { displayName: 'Demo Merchant (Simulated)', email: 'demo@merchant.com' } 
        : googleSheetsService.getAuthInstance().currentUser
      );
      fetchGoogleFiles();
    }

    return () => unsubscribe();
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    setHasPopupError(false);
    try {
      const result = await googleSheetsService.connectGoogle();
      setIsAuthenticated(true);
      setGoogleUser(result.user);
      setStatusMessage({ text: 'Successfully authenticated with Google!', isError: false });
      fetchGoogleFiles();
    } catch (error: any) {
      console.error(error);
      const isPopup = error.isPopupBlocked || error.message?.includes('popup') || error.code?.includes('popup');
      setStatusMessage({ 
        text: isPopup 
          ? "Browser security restricted the Google authentication popup in this embedded frame. Click 'Open in New Tab' at the top-right of AI Studio to link your real Google Account, or click 'Use Simulated Demo Connection' to test immediately."
          : `Connection failed: ${error.message || error}`, 
        isError: true 
      });
      if (isPopup) {
        setHasPopupError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectDemo = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const result = await googleSheetsService.connectGoogle(true);
      setIsAuthenticated(true);
      setGoogleUser(result.user);
      setHasPopupError(false);
      setStatusMessage({ text: 'Connected with Simulated Google Workspace (Demo Mode)! You can now create/export/import mock sheets.', isError: false });
      fetchGoogleFiles();
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    googleSheetsService.disconnect();
    setIsAuthenticated(false);
    setGoogleUser(null);
    setSpreadsheets([]);
    setPreviewRows([]);
    setCreatedSpreadsheet(null);
    setHasPopupError(false);
    setStatusMessage({ text: 'Disconnected Google Workspace session.', isError: false });
  };

  const fetchGoogleFiles = async () => {
    setIsFetchingFiles(true);
    try {
      const files = await googleSheetsService.listSpreadsheets();
      setSpreadsheets(files);
      if (files.length > 0) {
        setSelectedSpreadsheetId(files[0].id);
      }
    } catch (err: any) {
      console.error('Failed to list sheets:', err);
    } finally {
      setIsFetchingFiles(false);
    }
  };

  // --- EXPORT PIPELINE ---
  const handleExportClick = () => {
    setShowExportConfirm(true);
  };

  const confirmAndExecuteExport = async () => {
    setShowExportConfirm(false);
    setIsLoading(true);
    setStatusMessage(null);
    setCreatedSpreadsheet(null);

    try {
      const nowStr = new Date().toLocaleDateString();
      const title = `AdPulse Export - ${type === 'leads' ? 'Leads' : 'Inventory'} (${nowStr})`;
      
      let headers: string[] = [];
      let rows: any[][] = [];

      if (type === 'leads') {
        headers = ['ID', 'Name', 'Email', 'Phone', 'Source', 'Status', 'Inquiry', 'Date'];
        const leads = dashboardService.getLeads();
        rows = leads.map(l => [
          l.id,
          l.name || '',
          l.email || '',
          l.phone || '',
          l.source || '',
          l.status || 'New',
          l.inquiry || '',
          l.date || ''
        ]);
      } else {
        headers = ['ID', 'Product Name', 'Category', 'Price', 'Discount %', 'Stock', 'Status'];
        const products = dashboardService.getProducts();
        rows = products.map(p => [
          p.id,
          p.name || '',
          p.category || '',
          p.price || 0,
          p.discount || 0,
          p.stock || 0,
          p.status || 'In Stock'
        ]);
      }

      const result = await googleSheetsService.createAndPopulateSpreadsheet(title, headers, rows);
      setCreatedSpreadsheet({
        id: result.spreadsheetId,
        url: result.spreadsheetUrl,
        title
      });

      dashboardService.addNotification({
        id: `notif-sheet-${Date.now()}`,
        title: `Google Sheet Export Complete`,
        message: `Successfully synchronized ${rows.length} ${type} to '${title}' on Google Drive.`,
        type: 'success',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
      });

      setStatusMessage({ text: `Successfully exported ${rows.length} records to Google Sheets!`, isError: false });
      if (onSyncComplete) onSyncComplete();
    } catch (error: any) {
      console.error('Export error:', error);
      setStatusMessage({ text: `Failed to export spreadsheet: ${error.message || error}`, isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  // --- IMPORT PIPELINE ---
  const handleFetchPreview = async () => {
    if (!selectedSpreadsheetId) return;
    setIsFetchingPreview(true);
    setStatusMessage(null);
    setPreviewRows([]);

    try {
      const values = await googleSheetsService.getSpreadsheetValues(selectedSpreadsheetId, importRange);
      if (values.length === 0) {
        setStatusMessage({ text: 'No rows or headers found in the selected spreadsheet range.', isError: true });
        return;
      }
      setPreviewRows(values);

      // Attempt automatic mapping of columns based on header strings
      const headers = values[0].map(h => h.trim().toLowerCase());
      const newMappings: Record<string, number> = {};

      if (type === 'leads') {
        const fields = ['name', 'email', 'phone', 'source', 'status', 'inquiry', 'date'];
        fields.forEach(field => {
          const idx = headers.findIndex(h => h.includes(field) || (field === 'phone' && h.includes('mobile')));
          if (idx !== -1) newMappings[field] = idx;
        });
      } else {
        const fields = ['name', 'category', 'price', 'discount', 'stock'];
        fields.forEach(field => {
          const idx = headers.findIndex(h => h.includes(field) || (field === 'name' && h.includes('title')) || (field === 'discount' && h.includes('promo')));
          if (idx !== -1) newMappings[field] = idx;
        });
      }

      setColumnMappings(newMappings);
    } catch (err: any) {
      console.error('Preview error:', err);
      setStatusMessage({ text: `Failed to read spreadsheet preview: ${err.message || err}`, isError: true });
    } finally {
      setIsFetchingPreview(false);
    }
  };

  const handleMappingChange = (field: string, colIndex: number) => {
    setColumnMappings(prev => ({
      ...prev,
      [field]: colIndex
    }));
  };

  const handleImportClick = () => {
    if (previewRows.length <= 1) return;
    setShowImportConfirm(true);
  };

  const confirmAndExecuteImport = () => {
    setShowImportConfirm(false);
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const dataRows = previewRows.slice(1); // skip headers
      let count = 0;

      if (type === 'leads') {
        dataRows.forEach((row, i) => {
          const nameCol = columnMappings['name'];
          const emailCol = columnMappings['email'];
          const phoneCol = columnMappings['phone'];
          const sourceCol = columnMappings['source'];
          const statusCol = columnMappings['status'];
          const inquiryCol = columnMappings['inquiry'];
          const dateCol = columnMappings['date'];

          const leadName = nameCol !== undefined && row[nameCol] ? row[nameCol].trim() : '';
          if (!leadName) return; // skip rows without a name

          const lead: CustomerLead = {
            id: `lead-gsl-${Date.now()}-${i}`,
            name: leadName,
            email: emailCol !== undefined && row[emailCol] ? row[emailCol].trim() : 'n/a',
            phone: phoneCol !== undefined && row[phoneCol] ? row[phoneCol].trim() : 'n/a',
            source: sourceCol !== undefined && row[sourceCol] ? row[sourceCol].trim() : 'Google Sheet Import',
            status: (statusCol !== undefined && row[statusCol] && ['New', 'In Progress', 'Converted', 'Lost'].includes(row[statusCol].trim())) 
              ? (row[statusCol].trim() as any) 
              : 'New',
            inquiry: inquiryCol !== undefined && row[inquiryCol] ? row[inquiryCol].trim() : 'Imported catalog inquiry',
            date: dateCol !== undefined && row[dateCol] ? row[dateCol].trim() : new Date().toISOString().split('T')[0]
          };

          dashboardService.saveLead(lead);
          count++;
        });
      } else {
        dataRows.forEach((row, i) => {
          const nameCol = columnMappings['name'];
          const catCol = columnMappings['category'];
          const priceCol = columnMappings['price'];
          const discCol = columnMappings['discount'];
          const stockCol = columnMappings['stock'];

          const prodName = nameCol !== undefined && row[nameCol] ? row[nameCol].trim() : '';
          if (!prodName) return; // skip rows without name

          const parsedPrice = priceCol !== undefined && row[priceCol] ? parseFloat(row[priceCol].replace(/[^0-9.]/g, '')) || 0 : 0;
          const parsedDisc = discCol !== undefined && row[discCol] ? parseFloat(row[discCol].replace(/[^0-9.]/g, '')) || 0 : 0;
          const parsedStock = stockCol !== undefined && row[stockCol] ? parseInt(row[stockCol].replace(/[^0-9]/g, '')) || 0 : 0;

          const prod: Product = {
            id: `prod-gsl-${Date.now()}-${i}`,
            name: prodName,
            category: catCol !== undefined && row[catCol] ? row[catCol].trim() : 'General',
            price: parsedPrice,
            discount: parsedDisc,
            stock: parsedStock,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&h=150&fit=crop&q=80',
            status: parsedStock === 0 ? 'Out of Stock' : parsedStock < 10 ? 'Low Stock' : 'In Stock'
          };

          dashboardService.saveProduct(prod);
          count++;
        });
      }

      dashboardService.addNotification({
        id: `notif-import-${Date.now()}`,
        title: `Google Sheets Import Succeeded`,
        message: `Successfully mapped and created ${count} ${type} into your local store.`,
        type: 'success',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
      });

      setStatusMessage({ text: `Successfully imported ${count} records from Google Sheets!`, isError: false });
      setPreviewRows([]);
      if (onSyncComplete) onSyncComplete();
    } catch (err: any) {
      console.error('Import process failed:', err);
      setStatusMessage({ text: `Failed to import rows: ${err.message || err}`, isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden" id={`sheets-sync-${type}`}>
      
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-emerald-600/5 to-teal-600/5 p-6 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              Google Sheets Live Sync
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">OAuth V2</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sync {type === 'leads' ? 'customer leads' : 'store products'} directly with Google Drive sheets
            </p>
          </div>
        </div>

        {/* CONNECTION CARD GATE */}
        <div>
          {isAuthenticated ? (
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="truncate max-w-[140px] text-slate-600 font-mono text-[11px]">{googleUser?.email || 'Authenticated User'}</span>
              <button 
                onClick={handleDisconnect}
                className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
                title="Disconnect Google Drive Session"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="gsi-material-button text-xs font-bold py-2 px-4 shadow-sm transition-all hover:shadow-md cursor-pointer flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              ) : (
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-4 w-4 block">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
              )}
              <span>Sign in with Google</span>
            </button>
          )}
        </div>
      </div>

      {/* NOT AUTHENTICATED FALLBACK WATERMARK */}
      {!isAuthenticated ? (
        <div className="p-10 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4 shadow-3xs">
            <Lock className="h-6 w-6 text-slate-400" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">Secure Google Drive Connection Required</h4>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5">
            Authenticate to securely create reports, list existing spreadsheets, and import catalogs directly to your dashboard workspace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
            <Button onClick={handleConnect} disabled={isLoading} className="cursor-pointer font-bold rounded-xl shadow-xs hover:shadow-md bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-white" />}
              Connect Google Workspace
            </Button>
            <Button onClick={handleConnectDemo} variant="outline" className="cursor-pointer font-bold rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700">
              Use Simulated Demo Connection
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          
          {/* TAB HEADERS */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => { setActiveTab('export'); setStatusMessage(null); }}
              className={`pb-3 px-6 text-xs font-bold border-b-2 cursor-pointer transition-all ${
                activeTab === 'export'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export to Google Sheets
              </span>
            </button>
            <button
              onClick={() => { setActiveTab('import'); setStatusMessage(null); }}
              className={`pb-3 px-6 text-xs font-bold border-b-2 cursor-pointer transition-all ${
                activeTab === 'import'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import from Google Sheets
              </span>
            </button>
          </div>

          {/* STATUS NOTIFICATIONS */}
          {statusMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }} 
              animate={{ opacity: 1, y: 0 }}
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 font-medium border ${
                statusMessage.isError 
                  ? 'bg-rose-50 text-rose-800 border-rose-100' 
                  : 'bg-emerald-50 text-emerald-800 border-emerald-100'
              }`}
            >
              <AlertCircle className={`h-4 w-4 shrink-0 mt-0.5 ${statusMessage.isError ? 'text-rose-600' : 'text-emerald-600'}`} />
              <div className="space-y-1">
                <span>{statusMessage.text}</span>
              </div>
            </motion.div>
          )}

          {/* TAB PANEL: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Ready for Synced Export</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Your local storage has <strong className="text-slate-800 font-bold">{localItemsCount}</strong> {type} rows ready to transfer.
                  </p>
                </div>
                <div className="h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs font-bold font-mono flex items-center gap-1.5 text-slate-600 shadow-3xs">
                  <Database className="h-3.5 w-3.5 text-slate-400" />
                  {localItemsCount} Rows
                </div>
              </div>

              {createdSpreadsheet ? (
                <motion.div 
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center shrink-0">
                      <CheckCircle className="h-5 w-5 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Spreadsheet Created Successfully!</h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5 select-all">{createdSpreadsheet.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <a 
                      href={createdSpreadsheet.url} 
                      target="_blank" 
                      referrerPolicy="no-referrer"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer"
                    >
                      <span>Open Live Spreadsheet</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </motion.div>
              ) : (
                <div className="flex justify-start">
                  <Button
                    onClick={handleExportClick}
                    disabled={isLoading || localItemsCount === 0}
                    className="bg-emerald-600 hover:bg-emerald-700 font-bold px-5 py-2.5 rounded-xl shadow-xs text-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4" />
                    )}
                    Generate & Sync Google Sheet
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB PANEL: IMPORT */}
          {activeTab === 'import' && (
            <div className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Spreadsheet Select Box */}
                <div className="md:col-span-6 space-y-2">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">1. Select Google Spreadsheet</label>
                  <div className="flex gap-2">
                    <select
                      value={selectedSpreadsheetId}
                      onChange={(e) => setSelectedSpreadsheetId(e.target.value)}
                      disabled={isFetchingFiles || spreadsheets.length === 0}
                      className="w-full h-10 px-3 py-1 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    >
                      {spreadsheets.length === 0 ? (
                        <option>No Spreadsheets found in Drive</option>
                      ) : (
                        spreadsheets.map(sheet => (
                          <option key={sheet.id} value={sheet.id}>
                            {sheet.name} (Mod: {new Date(sheet.modifiedTime).toLocaleDateString()})
                          </option>
                        ))
                      )}
                    </select>
                    
                    <button
                      onClick={fetchGoogleFiles}
                      disabled={isFetchingFiles}
                      className="h-10 w-10 shrink-0 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-all cursor-pointer"
                      title="Reload Spreadsheets List"
                    >
                      <RefreshCw className={`h-4 w-4 ${isFetchingFiles ? 'animate-spin text-emerald-500' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Range Input */}
                <div className="md:col-span-4 space-y-2">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">2. Sheet Range</label>
                  <input
                    type="text"
                    value={importRange}
                    onChange={(e) => setImportRange(e.target.value)}
                    placeholder="Sheet1!A1:H100"
                    className="w-full h-10 px-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Action Fetch */}
                <div className="md:col-span-2 flex items-end">
                  <Button
                    onClick={handleFetchPreview}
                    disabled={isFetchingPreview || !selectedSpreadsheetId}
                    className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    {isFetchingPreview ? (
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    Preview
                  </Button>
                </div>

              </div>

              {/* SHEET PREVIEW GRID AND HEADER MAPPING */}
              {previewRows.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 pt-2 border-t border-slate-100"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-emerald-600" />
                        Previewing Row Mapping ({previewRows.length - 1} Records Detected)
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Map columns from the spreadsheet below to your local schema fields
                      </p>
                    </div>

                    <Button
                      onClick={handleImportClick}
                      className="bg-emerald-600 hover:bg-emerald-700 font-bold px-4 py-2 text-xs rounded-xl shadow-xs hover:shadow-md cursor-pointer transition-all"
                    >
                      Complete Sync ({previewRows.length - 1} Rows)
                    </Button>
                  </div>

                  {/* Schema Mappers Column Selectors */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                    {type === 'leads' ? (
                      <>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Name Column</span>
                          <select 
                            value={columnMappings['name'] ?? ''} 
                            onChange={(e) => handleMappingChange('name', Number(e.target.value))}
                            className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700"
                          >
                            <option value="">-- Choose Column --</option>
                            {previewRows[0].map((h, i) => <option key={i} value={i}>{h || `Column ${i+1}`}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Email Column</span>
                          <select 
                            value={columnMappings['email'] ?? ''} 
                            onChange={(e) => handleMappingChange('email', Number(e.target.value))}
                            className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700"
                          >
                            <option value="">-- Choose Column --</option>
                            {previewRows[0].map((h, i) => <option key={i} value={i}>{h || `Column ${i+1}`}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Phone Column</span>
                          <select 
                            value={columnMappings['phone'] ?? ''} 
                            onChange={(e) => handleMappingChange('phone', Number(e.target.value))}
                            className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700"
                          >
                            <option value="">-- Choose Column --</option>
                            {previewRows[0].map((h, i) => <option key={i} value={i}>{h || `Column ${i+1}`}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Source Column</span>
                          <select 
                            value={columnMappings['source'] ?? ''} 
                            onChange={(e) => handleMappingChange('source', Number(e.target.value))}
                            className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700"
                          >
                            <option value="">-- Choose Column --</option>
                            {previewRows[0].map((h, i) => <option key={i} value={i}>{h || `Column ${i+1}`}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Inquiry Column</span>
                          <select 
                            value={columnMappings['inquiry'] ?? ''} 
                            onChange={(e) => handleMappingChange('inquiry', Number(e.target.value))}
                            className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700"
                          >
                            <option value="">-- Choose Column --</option>
                            {previewRows[0].map((h, i) => <option key={i} value={i}>{h || `Column ${i+1}`}</option>)}
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Product Name</span>
                          <select 
                            value={columnMappings['name'] ?? ''} 
                            onChange={(e) => handleMappingChange('name', Number(e.target.value))}
                            className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700"
                          >
                            <option value="">-- Choose Column --</option>
                            {previewRows[0].map((h, i) => <option key={i} value={i}>{h || `Column ${i+1}`}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Category</span>
                          <select 
                            value={columnMappings['category'] ?? ''} 
                            onChange={(e) => handleMappingChange('category', Number(e.target.value))}
                            className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700"
                          >
                            <option value="">-- Choose Column --</option>
                            {previewRows[0].map((h, i) => <option key={i} value={i}>{h || `Column ${i+1}`}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Price</span>
                          <select 
                            value={columnMappings['price'] ?? ''} 
                            onChange={(e) => handleMappingChange('price', Number(e.target.value))}
                            className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700"
                          >
                            <option value="">-- Choose Column --</option>
                            {previewRows[0].map((h, i) => <option key={i} value={i}>{h || `Column ${i+1}`}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Discount %</span>
                          <select 
                            value={columnMappings['discount'] ?? ''} 
                            onChange={(e) => handleMappingChange('discount', Number(e.target.value))}
                            className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700"
                          >
                            <option value="">-- Choose Column --</option>
                            {previewRows[0].map((h, i) => <option key={i} value={i}>{h || `Column ${i+1}`}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Stock</span>
                          <select 
                            value={columnMappings['stock'] ?? ''} 
                            onChange={(e) => handleMappingChange('stock', Number(e.target.value))}
                            className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700"
                          >
                            <option value="">-- Choose Column --</option>
                            {previewRows[0].map((h, i) => <option key={i} value={i}>{h || `Column ${i+1}`}</option>)}
                          </select>
                        </div>
                      </>
                    )}
                  </div>

                  {/* PREVIEW TABLE */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs max-h-56 overflow-y-auto">
                    <table className="w-full border-collapse text-left text-[11px] font-medium text-slate-600 bg-white">
                      <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-700 font-bold font-mono">
                        <tr>
                          <th className="px-3 py-2 border-r border-slate-200 w-10 text-center">#</th>
                          {previewRows[0].map((h, idx) => (
                            <th key={idx} className="px-3 py-2 border-r border-slate-200 truncate">
                              {h || `Column ${idx+1}`}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {previewRows.slice(1, 6).map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/50">
                            <td className="px-3 py-1.5 border-r border-slate-100 text-center font-mono text-slate-400 bg-slate-50/30">{rIdx + 1}</td>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-3 py-1.5 border-r border-slate-100 max-w-[150px] truncate">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {previewRows.length > 6 && (
                    <div className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-wider">
                      + {previewRows.length - 6} more rows...
                    </div>
                  )}
                </motion.div>
              )}

            </div>
          )}

        </div>
      )}

      {/* CONFIRM MODAL: EXPORT */}
      <AnimatePresence>
        {showExportConfirm && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 max-w-sm w-full shadow-lg space-y-4"
            >
              <div className="flex items-start gap-3 text-emerald-600">
                <FileSpreadsheet className="h-6 w-6 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Confirm Google Sheets Export</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    You are about to export {localItemsCount} items. This will create a brand new spreadsheet in your Google Drive. Continue?
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button 
                  onClick={() => setShowExportConfirm(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmAndExecuteExport}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Export Now
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM MODAL: IMPORT */}
      <AnimatePresence>
        {showImportConfirm && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 max-w-sm w-full shadow-lg space-y-4"
            >
              <div className="flex items-start gap-3 text-emerald-600">
                <Upload className="h-6 w-6 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Confirm Google Sheets Import</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    You are about to import <strong className="text-slate-800 font-bold">{previewRows.length - 1}</strong> records into your local store list. This operation will add records to your workspace. Continue?
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button 
                  onClick={() => setShowImportConfirm(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmAndExecuteImport}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Import & Save Now
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
