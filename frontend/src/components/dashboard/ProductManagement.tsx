import * as React from 'react';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Upload, 
  Trash2, 
  Tag, 
  Check, 
  Bookmark, 
  RefreshCw,
  MoreVertical,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dashboardService, Product, subscribeToDashboardState } from '../../services/dashboardService';
import { Button } from '../ui/Button';
import { GoogleSheetsSync } from './GoogleSheetsSync';

export const ProductManagement: React.FC = () => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  
  // CSV simulator state
  const [isCsvModalOpen, setIsCsvModalOpen] = React.useState(false);
  const [csvContent, setCsvContent] = React.useState('');
  const [csvSuccessCount, setCsvSuccessCount] = React.useState<number | null>(null);

  // Form parameters
  const [name, setName] = React.useState('');
  const [category, setCategory] = React.useState('Fashion & Apparel');
  const [price, setPrice] = React.useState(1200);
  const [discount, setDiscount] = React.useState(10);
  const [stock, setStock] = React.useState(50);
  const [imageUrl, setImageUrl] = React.useState('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&q=80');

  const fetchItems = () => {
    setProducts(dashboardService.getProducts());
  };

  React.useEffect(() => {
    fetchItems();
    const unsubscribe = subscribeToDashboardState(() => {
      fetchItems();
    });
    return () => unsubscribe();
  }, []);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name,
      category,
      price: Number(price),
      discount: Number(discount),
      stock: Number(stock),
      image: imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&h=150&fit=crop&q=80',
      status: stock === 0 ? 'Out of Stock' : stock < 10 ? 'Low Stock' : 'In Stock'
    };

    dashboardService.saveProduct(newProd);
    fetchItems();
    setIsAddModalOpen(false);
    
    // Clear inputs
    setName('');
    setStock(50);
  };

  const handleDeleteProduct = (id: string) => {
    dashboardService.deleteProduct(id);
    fetchItems();
  };

  const handleCsvImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent.trim()) return;

    const count = dashboardService.importProductsCsv(csvContent);
    setCsvSuccessCount(count);
    fetchItems();

    setTimeout(() => {
      setIsCsvModalOpen(false);
      setCsvSuccessCount(null);
      setCsvContent('');
    }, 2000);
  };

  const loadSampleCsv = () => {
    const rawTemplate = `Product Name, Category, Price, Discount, Stock
Draped Evening Dress, Fashion & Apparel, 4999, 15, 65
Water-resistant Trail Sneakers, Footwear, 6200, 10, 4
Bohemian Fringe Necklace, Jewelry, 1290, 5, 18
Organic Bamboo Bed Sheet Set, Home Decor, 3800, 25, 30`;
    setCsvContent(rawTemplate);
  };

  // Filter lists
  const categoriesList = ['All', 'Fashion & Apparel', 'Footwear', 'Jewelry', 'Home Decor'];
  
  const filteredProducts = products.filter(p => {
    const term = (searchTerm || '').toLowerCase();
    const matchSearch = (p.name || '').toLowerCase().includes(term) || 
                        (p.category || '').toLowerCase().includes(term);
    
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6 text-left" id="product-management-tab-view">
      
      {/* Header operations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Store Catalog Directory</h3>
          <p className="text-[11px] text-slate-400 font-medium">Add boutique inventory items, track low stock triggers, or upload CSV records.</p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Upload className="h-4 w-4" /> Import CSV List
          </button>
          
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4.5 py-2.5 rounded-xl border border-transparent shadow-md hover:shadow-indigo-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Inputs Filters bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 border border-slate-100 rounded-2xl shadow-xs">
        
        {/* Search bar inputs */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products, brands, or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent hover:border-slate-100 focus:border-indigo-500 text-xs font-semibold rounded-xl outline-none transition-all placeholder:text-slate-400 text-slate-800"
          />
        </div>

        {/* Categories sliding indicators */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categoriesList.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[10px] font-extrabold px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white border-transparent'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Main product card layout items grids */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {filteredProducts.map(prod => (
          <motion.div
            key={prod.id}
            layoutId={prod.id}
            whileHover={{ y: -3 }}
            className="bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden flex flex-col justify-between"
          >
            
            {/* Upper preview frame */}
            <div className="relative h-44 bg-slate-50 overflow-hidden group">
              <img
                src={prod.image}
                alt={prod.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Badges layer */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between select-none">
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md text-white ${
                  prod.status === 'In Stock' 
                    ? 'bg-emerald-500' 
                    : prod.status === 'Low Stock' 
                    ? 'bg-amber-500 animate-pulse' 
                    : 'bg-rose-500'
                }`}>
                  {prod.status}
                </span>

                {prod.discount > 0 && (
                  <span className="text-[9px] font-extrabold bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-0.5">
                    <Tag className="h-2.5 w-2.5" />
                    {prod.discount}% Off
                  </span>
                )}
              </div>
            </div>

            {/* Bottom details page */}
            <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between text-left">
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-wide text-indigo-600">{prod.category}</span>
                <h4 className="text-xs font-black text-slate-800 leading-tight truncate mt-0.5" title={prod.name}>
                  {prod.name}
                </h4>
              </div>

              {/* Specs parameters lists */}
              <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-[8px] text-slate-450 font-bold block">PRICE</span>
                  <span className="text-xs font-black text-slate-800">INR {prod.price.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] text-slate-455 font-bold block">STOCK LEVEL</span>
                  <span className="text-xs font-bold text-slate-600 font-mono">{prod.stock} units</span>
                </div>
              </div>

              {/* Delete trash button */}
              <div className="pt-2.5 border-t border-slate-50 flex items-center justify-end">
                <button
                  onClick={() => handleDeleteProduct(prod.id)}
                  className="text-slate-400 hover:text-rose-500 font-bold text-[10px] flex items-center gap-0.5 cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" /> Remove File
                </button>
              </div>

            </div>

          </motion.div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-1 sm:col-span-4 text-center p-16 bg-white border border-slate-100 rounded-3xl text-slate-400 space-y-3">
            <SlidersHorizontal className="h-10 w-10 mx-auto text-slate-350" />
            <div>
              <p className="text-xs font-bold text-slate-800">No Matched Items Found</p>
              <p className="text-[11px] text-slate-400">Try relaxing your search directory or select All categories to reseed.</p>
            </div>
          </div>
        )}
      </div>

      {/* POPUP 1: Add single item */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 text-slate-800">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-50 text-left"
            >
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-50 pb-3 mb-4">
                ➕ Create Catalog Record
              </h4>

              <form onSubmit={handleCreateProduct} className="space-y-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Product Title</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Linen Gown Kurti"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Boutique Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Jewelry">Jewelry</option>
                    <option value="Home Decor">Home Decor</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider block">Price (INR)</label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-455 uppercase tracking-wider block">Discount (%)</label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-460 uppercase tracking-wider block">StockQty</label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value) || 1)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Image Asset Mock Link</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-[10.5px] font-mono outline-none"
                  />
                </div>

                <div className="border-t border-slate-50 pt-4 flex items-center justify-end gap-2 text-xs font-extrabold">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="rounded-xl"
                  >
                    Save Item Record
                  </Button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP 2: CSV Import form */}
      <AnimatePresence>
        {isCsvModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 text-slate-800">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-50 text-left"
            >
              <h4 className="text-xs font-black text-slate-850 uppercase tracking-widest border-b border-slate-50 pb-3 mb-4">
                📊 Bulk CSV Parsing Portal
              </h4>

              <form onSubmit={handleCsvImport} className="space-y-4">
                
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-450 uppercase">Paste your raw CSV matrix lines</span>
                  <button
                    type="button"
                    onClick={loadSampleCsv}
                    className="text-indigo-600 hover:underline"
                  >
                    Load Sample Template
                  </button>
                </div>

                <textarea
                  rows={6}
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  placeholder="Product Name, Category, Price, Discount, Stock&#10;Ethnic Silk Saree, Fashion & Apparel, 7500, 10, 150"
                  className="w-full p-3 border border-slate-205 rounded-xl font-mono text-[10px] leading-relaxed outline-none focus:ring-1 focus:ring-indigo-500"
                />

                {csvSuccessCount !== null ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-center text-xs font-extrabold flex items-center justify-center gap-2">
                    <Check className="h-4.5 w-4.5" />
                    <span>Mapped and loaded {csvSuccessCount} products successfully!</span>
                  </div>
                ) : (
                  <div className="border-t border-slate-50 pt-4 flex items-center justify-end gap-2 text-xs font-extrabold">
                    <Button
                      variant="outline"
                      onClick={() => setIsCsvModalOpen(false)}
                      className="rounded-xl"
                    >
                      Dismiss
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={!csvContent.trim()}
                      className="rounded-xl shadow-md shadow-indigo-50"
                    >
                      Execute bulk parsing
                    </Button>
                  </div>
                )}

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <GoogleSheetsSync type="products" onSyncComplete={fetchItems} />

    </div>
  );
};
