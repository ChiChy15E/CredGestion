import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Truck, 
  Plus, 
  Trash2, 
  Edit2, 
  ChevronLeft, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Wallet,
  Search,
  Settings,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff
} from 'lucide-react';

import { Button } from './components/Button';
import { Modal } from './components/Modal';
import { Screen, Client, Supplier, Transaction } from './types';

// --- Helper Functions ---
const generateId = () => Math.random().toString(36).substring(2, 9);

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es-DO', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

// --- Constants ---
const CURRENCIES = [
  { code: 'DOP', locale: 'es-DO', name: 'Peso Dominicano (RD$)' },
  { code: 'USD', locale: 'en-US', name: 'Dólar Estadounidense ($)' },
  { code: 'EUR', locale: 'es-ES', name: 'Euro (€)' },
  { code: 'COP', locale: 'es-CO', name: 'Peso Colombiano ($)' },
  { code: 'MXN', locale: 'es-MX', name: 'Peso Mexicano ($)' },
  { code: 'ARS', locale: 'es-AR', name: 'Peso Argentino ($)' },
  { code: 'CLP', locale: 'es-CL', name: 'Peso Chileno ($)' },
  { code: 'PEN', locale: 'es-PE', name: 'Sol Peruano (S/)' },
  { code: 'VES', locale: 'es-VE', name: 'Bolívar (Bs)' },
  { code: 'GTQ', locale: 'es-GT', name: 'Quetzal (Q)' },
  { code: 'HNL', locale: 'es-HN', name: 'Lempira (L)' },
  { code: 'NIO', locale: 'es-NI', name: 'Córdoba (C$)' },
  { code: 'CRC', locale: 'es-CR', name: 'Colón (₡)' },
  { code: 'PYG', locale: 'es-PY', name: 'Guaraní (₲)' },
  { code: 'UYU', locale: 'es-UY', name: 'Peso Uruguayo ($)' },
  { code: 'BOB', locale: 'es-BO', name: 'Boliviano (Bs)' },
];

// --- Shared Styles ---
// Class for cards to have the lift effect
const cardHoverClass = "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg";

// --- Simple Bar Chart Component (SVG) ---
const SimpleBarChart = ({ 
  data, 
  height = 200,
  formatCurrency 
}: { 
  data: { label: string, sales: number, payments: number }[], 
  height?: number,
  formatCurrency: (val: number) => string
}) => {
  const [activeSeries, setActiveSeries] = useState<'all' | 'sales' | 'payments'>('all');

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 text-slate-400 text-sm`} style={{ height }}>
        No hay datos suficientes para el gráfico
      </div>
    );
  }

  // Calculate scales
  const maxValue = Math.max(...data.map(d => Math.max(d.sales, d.payments)), 1);
  const bottomLabelHeight = 30;
  const chartHeight = height - bottomLabelHeight;
  const barGroupGap = 20;
  
  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex-1 w-full relative" style={{ height }}>
        <svg width="100%" height="100%" viewBox={`0 0 1000 ${height}`} preserveAspectRatio="none" className="overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const y = chartHeight - (tick * chartHeight);
            return (
              <g key={tick}>
                <line x1="0" y1={y} x2="1000" y2={y} stroke="#e2e8f0" strokeDasharray="4 4" />
              </g>
            );
          })}

          {data.map((d, i) => {
            // Calculate heights relative to max value
            const salesH = (d.sales / maxValue) * chartHeight;
            const paymentsH = (d.payments / maxValue) * chartHeight;
            
            // X positions
            const groupX = (i * (1000 / data.length));
            const barWidthPx = (1000 / data.length) * 0.35; // 35% of group width
            const gap = (1000 / data.length) * 0.1;
            const startX = groupX + ((1000 / data.length) - (barWidthPx * 2 + gap)) / 2;

            // Opacity logic based on active series
            const salesOpacity = activeSeries === 'all' || activeSeries === 'sales' ? 1 : 0.1;
            const paymentsOpacity = activeSeries === 'all' || activeSeries === 'payments' ? 1 : 0.1;

            return (
              <g key={i}>
                {/* Sales Bar (Blue) */}
                <rect 
                  x={startX} 
                  y={chartHeight - salesH} 
                  width={barWidthPx} 
                  height={salesH} 
                  className="fill-primary transition-all duration-300" 
                  style={{ opacity: salesOpacity }}
                  rx="4"
                />
                {/* Payments Bar (Green) */}
                <rect 
                  x={startX + barWidthPx + gap} 
                  y={chartHeight - paymentsH} 
                  width={barWidthPx} 
                  height={paymentsH} 
                  className="fill-success transition-all duration-300" 
                  style={{ opacity: paymentsOpacity }}
                  rx="4"
                />
                
                {/* X Axis Label */}
                <text 
                  x={groupX + (1000 / data.length) / 2} 
                  y={height - 5} 
                  textAnchor="middle" 
                  className="fill-slate-500 text-xs font-medium"
                  style={{ fontSize: '24px' }} 
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Interactive Legend */}
      <div className="flex justify-center gap-6 mt-4 select-none">
        <div 
          onClick={() => setActiveSeries(prev => prev === 'sales' ? 'all' : 'sales')}
          className={`flex items-center gap-2 cursor-pointer transition-opacity ${activeSeries === 'payments' ? 'opacity-40' : 'opacity-100'}`}
        >
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span className="text-xs font-medium text-slate-600">Ventas (Crédito)</span>
        </div>
        <div 
          onClick={() => setActiveSeries(prev => prev === 'payments' ? 'all' : 'payments')}
          className={`flex items-center gap-2 cursor-pointer transition-opacity ${activeSeries === 'sales' ? 'opacity-40' : 'opacity-100'}`}
        >
          <div className="w-3 h-3 rounded-full bg-success"></div>
          <span className="text-xs font-medium text-slate-600">Cobros (Abonos)</span>
        </div>
      </div>
      <p className="text-center text-[10px] text-slate-400 mt-2">Toca la leyenda para filtrar</p>
    </div>
  );
};

// --- Bottom Navigation Component ---
const BottomNavigation = ({ currentScreen, onNavigate }: { currentScreen: Screen, onNavigate: (s: Screen) => void }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 pb-4 z-40 md:hidden flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <button 
        onClick={() => onNavigate('DASHBOARD')}
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${currentScreen === 'DASHBOARD' ? 'text-primary bg-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <LayoutDashboard size={24} />
        <span className="text-[10px] font-medium">Resumen</span>
      </button>
      
      <button 
        onClick={() => onNavigate('SUPPLIERS')}
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${currentScreen === 'SUPPLIERS' ? 'text-primary bg-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <Truck size={24} />
        <span className="text-[10px] font-medium">Proveedores</span>
      </button>

      <button 
        onClick={() => onNavigate('CLIENTS')}
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${currentScreen === 'CLIENTS' ? 'text-primary bg-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <Users size={24} />
        <span className="text-[10px] font-medium">Clientes</span>
      </button>
    </div>
  );
};

// --- Views Components ---

const DashboardView: React.FC<{
  clients: Client[];
  suppliers: Supplier[];
  onNavigate: (screen: Screen) => void;
  formatCurrency: (val: number) => string;
  onOpenSettings: () => void;
}> = ({ clients, suppliers, onNavigate, formatCurrency, onOpenSettings }) => {
  const [selectedAnalysisSupplierId, setSelectedAnalysisSupplierId] = useState<string>('all');

  // Calculate Global Totals
  const stats = useMemo(() => {
    let totalSales = 0;
    let totalPaid = 0;
    let totalPending = 0;

    clients.forEach(c => {
      c.transactions.forEach(t => {
        if (t.type === 'SALE') totalSales += t.amount;
        if (t.type === 'PAYMENT') totalPaid += t.amount;
      });
    });

    totalPending = totalSales - totalPaid;

    return { totalSales, totalPaid, totalPending };
  }, [clients]);

  // Calculate Monthly Analysis Data
  const monthlyData = useMemo(() => {
    const data: Record<string, { sales: number; payments: number }> = {};
    const months: string[] = [];

    // Filter clients based on selection
    const filteredClients = selectedAnalysisSupplierId === 'all' 
      ? clients 
      : clients.filter(c => c.supplierId === selectedAnalysisSupplierId);

    filteredClients.forEach(c => {
      c.transactions.forEach(t => {
        const date = new Date(t.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = date.toLocaleDateString('es-DO', { month: 'short' });
        
        if (!data[key]) {
          data[key] = { sales: 0, payments: 0 };
          months.push(key);
        }

        if (t.type === 'SALE') data[key].sales += t.amount;
        else data[key].payments += t.amount;
      });
    });

    // Sort by date and take last 6 months
    return months.sort().slice(-6).map(key => {
        const [year, month] = key.split('-');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1);
        return {
            label: dateObj.toLocaleDateString('es-DO', { month: 'short' }).toUpperCase(),
            sales: data[key].sales,
            payments: data[key].payments
        };
    });
  }, [clients, selectedAnalysisSupplierId]);

  // Calculate Stats per Supplier
  const supplierStats = useMemo(() => {
    return suppliers.map(supplier => {
      const supplierClients = clients.filter(c => c.supplierId === supplier.id);
      let sales = 0;
      let paid = 0;
      
      supplierClients.forEach(c => {
        c.transactions.forEach(t => {
          if (t.type === 'SALE') sales += t.amount;
          if (t.type === 'PAYMENT') paid += t.amount;
        });
      });

      return {
        ...supplier,
        sales,
        paid,
        pending: sales - paid
      };
    }).sort((a, b) => b.pending - a.pending); // Sort by highest debt
  }, [suppliers, clients]);

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Resumen</h1>
          <p className="text-slate-500 text-sm">Estado general de tu negocio</p>
        </div>
        <button 
          onClick={onOpenSettings}
          className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 hover:bg-slate-50 transition-colors hover:rotate-45 duration-300"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {/* Total Vendido */}
        <div className={`bg-white p-4 rounded-2xl shadow-sm border border-slate-100 col-span-2 sm:col-span-1 ${cardHoverClass}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <span className="text-sm font-medium text-slate-500">Total Vendido</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.totalSales)}</p>
        </div>

        {/* Total Cobrado */}
        <div className={`bg-white p-4 rounded-2xl shadow-sm border border-slate-100 col-span-2 sm:col-span-1 ${cardHoverClass}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Wallet size={20} />
            </div>
            <span className="text-sm font-medium text-slate-500">Total Cobrado</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.totalPaid)}</p>
        </div>

        {/* Total Por Cobrar */}
        <div className={`bg-white p-4 rounded-2xl shadow-sm border border-slate-100 col-span-2 ${cardHoverClass}`}>
          <div className="flex items-center justify-between mb-2">
             <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <DollarSign size={20} />
              </div>
              <span className="text-sm font-medium text-slate-500">Pendiente Global</span>
            </div>
            <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
              Por Cobrar
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{formatCurrency(stats.totalPending)}</p>
        </div>

        {/* Navigation Buttons as Cards - Hidden on Mobile since we have bottom nav */}
        <div 
          onClick={() => onNavigate('SUPPLIERS')}
          className={`hidden md:flex bg-white p-4 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:bg-slate-50 flex-col justify-center ${cardHoverClass}`}
        >
          <div className="flex items-center justify-between mb-2">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Truck size={20} />
             </div>
             <span className="text-2xl font-bold text-slate-800">{suppliers.length}</span>
          </div>
          <span className="text-sm font-medium text-slate-500">Proveedores</span>
        </div>

        <div 
          onClick={() => onNavigate('CLIENTS')}
          className={`hidden md:flex bg-white p-4 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:bg-slate-50 flex-col justify-center ${cardHoverClass}`}
        >
          <div className="flex items-center justify-between mb-2">
             <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Users size={20} />
             </div>
             <span className="text-2xl font-bold text-slate-800">{clients.length}</span>
          </div>
          <span className="text-sm font-medium text-slate-500">Clientes</span>
        </div>
      </div>

      {/* Supplier Breakdown Carousel/Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-800 px-1">Estado por Proveedor</h2>
        
        {/* Improved Mobile Carousel Container */}
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 lg:grid-cols-4 md:overflow-visible snap-x snap-mandatory no-scrollbar">
          {supplierStats.length === 0 ? (
            <div className="w-full col-span-full text-center py-4 text-slate-400 text-sm bg-slate-50 rounded-xl border border-slate-100 border-dashed snap-center">
              No hay proveedores con actividad
            </div>
          ) : (
            supplierStats.map(stat => (
              <div 
                key={stat.id} 
                className={`min-w-[85vw] sm:min-w-[280px] md:min-w-0 snap-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-3 ${cardHoverClass}`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                    {stat.name.substring(0, 2).toUpperCase()}
                  </div>
                  <h3 className="font-semibold text-slate-700 truncate flex-1" title={stat.name}>{stat.name}</h3>
                </div>
                
                <div className="space-y-2">
                   <div className="flex justify-between items-end">
                      <span className="text-xs text-slate-500">Por cobrar</span>
                      <span className="text-sm font-bold text-orange-600">{formatCurrency(stat.pending)}</span>
                   </div>
                   <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min((stat.pending / (stat.sales || 1)) * 100, 100)}%` }}></div>
                   </div>

                   <div className="flex justify-between items-end mt-2">
                      <span className="text-xs text-slate-500">Cobrado</span>
                      <span className="text-sm font-bold text-emerald-600">{formatCurrency(stat.paid)}</span>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Analysis Section */}
      <div className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-100 ${cardHoverClass}`}>
        <div className="flex flex-wrap items-center justify-between mb-6 gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 size={20} className="text-slate-400" />
            <h3 className="font-bold text-slate-800">Análisis Mensual</h3>
          </div>
          
          <select 
            value={selectedAnalysisSupplierId}
            onChange={(e) => setSelectedAnalysisSupplierId(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50 text-slate-600 min-w-[150px]"
          >
            <option value="all">Todos los proveedores</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <SimpleBarChart data={monthlyData} formatCurrency={formatCurrency} height={250} />
      </div>
    </div>
  );
};

const SuppliersView: React.FC<{
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  onBack: () => void;
  clients: Client[];
}> = ({ suppliers, setSuppliers, onBack, clients }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleOpenModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setName(supplier.name);
      setDescription(supplier.description || '');
    } else {
      setEditingSupplier(null);
      setName('');
      setDescription('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    if (editingSupplier) {
      setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? { ...s, name, description } : s));
    } else {
      const newSupplier: Supplier = {
        id: generateId(),
        name,
        description,
        createdAt: new Date().toISOString()
      };
      setSuppliers(prev => [...prev, newSupplier]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    // Check if supplier has clients
    const hasClients = clients.some(c => c.supplierId === id);
    if (hasClients) {
      alert("No se puede eliminar este proveedor porque tiene clientes asociados.");
      return;
    }
    if (confirm('¿Estás seguro de eliminar este proveedor?')) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <div className="pb-24 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors md:hidden">
          <ChevronLeft size={24} className="text-slate-600" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Proveedores</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {suppliers.map(supplier => (
          <div key={supplier.id} className={`bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex justify-between items-start ${cardHoverClass}`}>
            <div className="flex-1 mr-2">
              <h3 className="font-semibold text-slate-800 text-lg truncate">{supplier.name}</h3>
              {supplier.description && <p className="text-slate-500 text-sm mt-1 line-clamp-2">{supplier.description}</p>}
              <p className="text-xs text-slate-400 mt-2">Registrado: {formatDate(supplier.createdAt)}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => handleOpenModal(supplier)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Edit2 size={18} />
              </button>
              <button onClick={() => handleDelete(supplier.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        
        {suppliers.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400">
            <Truck size={48} className="mx-auto mb-3 opacity-20" />
            <p>No hay proveedores registrados</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-24 md:bottom-6 right-6 z-20">
        <Button onClick={() => handleOpenModal()} className="shadow-lg shadow-indigo-200 rounded-full w-14 h-14 !p-0 flex items-center justify-center transform hover:scale-105 transition-transform">
          <Plus size={28} />
        </Button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
            <input 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej. Distribuidora Central"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción (Opcional)</label>
            <textarea 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detalles adicionales..."
              rows={3}
            />
          </div>
          <div className="pt-2">
            <Button fullWidth onClick={handleSubmit}>Guardar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const ClientsView: React.FC<{
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  suppliers: Supplier[];
  onBack: () => void;
  formatCurrency: (val: number) => string;
}> = ({ clients, setClients, suppliers, onBack, formatCurrency }) => {
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClientForTx, setSelectedClientForTx] = useState<Client | null>(null);
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

  // Client Form
  const [clientName, setClientName] = useState('');
  const [clientSupplierId, setClientSupplierId] = useState('');

  // Transaction Form
  const [txType, setTxType] = useState<'SALE' | 'PAYMENT'>('SALE');
  const [txAmount, setTxAmount] = useState('');
  const [txNote, setTxNote] = useState('');

  // Search Filter
  const [searchTerm, setSearchTerm] = useState('');

  // Grouped Clients Logic
  const groupedClients = useMemo(() => {
    // 1. Filter by search
    const filtered = clients.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Group by Supplier
    const groups: { supplier: Supplier | undefined, clients: Client[], totalPending: number }[] = [];
    
    // Create a map for existing suppliers
    const supplierMap = new Map<string, Supplier>();
    suppliers.forEach(s => supplierMap.set(s.id, s));

    // Grouping
    const groupsMap = new Map<string, Client[]>();
    
    filtered.forEach(client => {
      const sId = client.supplierId;
      if (!groupsMap.has(sId)) {
        groupsMap.set(sId, []);
      }
      groupsMap.get(sId)?.push(client);
    });

    // Convert map to array and calculate totals
    groupsMap.forEach((groupClients, supplierId) => {
      const supplier = supplierMap.get(supplierId);
      if (supplier || groupClients.length > 0) { // Show even if supplier deleted but clients exist (edge case)
         let groupPending = 0;
         groupClients.forEach(c => {
            const sold = c.transactions.filter(t => t.type === 'SALE').reduce((acc, t) => acc + t.amount, 0);
            const paid = c.transactions.filter(t => t.type === 'PAYMENT').reduce((acc, t) => acc + t.amount, 0);
            groupPending += (sold - paid);
         });

         groups.push({
            supplier,
            clients: groupClients,
            totalPending: groupPending
         });
      }
    });

    // Sort: Suppliers with highest pending total first
    return groups.sort((a, b) => b.totalPending - a.totalPending);
  }, [clients, suppliers, searchTerm]);


  const handleOpenClientModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setClientName(client.name);
      setClientSupplierId(client.supplierId);
    } else {
      setEditingClient(null);
      setClientName('');
      // Default to first supplier if available
      setClientSupplierId(suppliers.length > 0 ? suppliers[0].id : '');
    }
    setIsClientModalOpen(true);
  };

  const handleClientSubmit = () => {
    if (!clientName.trim() || !clientSupplierId) return;

    if (editingClient) {
      setClients(prev => prev.map(c => c.id === editingClient.id ? { ...c, name: clientName, supplierId: clientSupplierId } : c));
    } else {
      const newClient: Client = {
        id: generateId(),
        name: clientName,
        supplierId: clientSupplierId,
        transactions: []
      };
      setClients(prev => [...prev, newClient]);
    }
    setIsClientModalOpen(false);
  };

  const handleOpenTxModal = (client: Client) => {
    setSelectedClientForTx(client);
    setTxAmount('');
    setTxNote('');
    setTxType('SALE'); // Reset to Sale default
    setIsTxModalOpen(true);
  };

  const handleTxSubmit = () => {
    if (!selectedClientForTx || !txAmount) return;
    const amountVal = parseFloat(txAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    const newTx: Transaction = {
      id: generateId(),
      type: txType,
      amount: amountVal,
      date: new Date().toISOString(),
      note: txNote
    };

    setClients(prev => prev.map(c => {
      if (c.id === selectedClientForTx.id) {
        return { ...c, transactions: [newTx, ...c.transactions] };
      }
      return c;
    }));

    setIsTxModalOpen(false);
  };

  const getClientBalance = (client: Client) => {
    const sold = client.transactions.filter(t => t.type === 'SALE').reduce((acc, t) => acc + t.amount, 0);
    const paid = client.transactions.filter(t => t.type === 'PAYMENT').reduce((acc, t) => acc + t.amount, 0);
    return { sold, paid, balance: sold - paid };
  };

  return (
    <div className="pb-24 max-w-7xl mx-auto">
      <div className="sticky top-0 bg-slate-50 z-10 pb-4 pt-1">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors md:hidden">
            <ChevronLeft size={24} className="text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm transition-shadow"
          />
        </div>
      </div>

      <div className="space-y-6">
        {groupedClients.map((group, idx) => (
          <div key={group.supplier?.id || `unknown-${idx}`} className="space-y-3">
             {/* Group Header */}
             <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                   <Truck size={16} className="text-slate-400" />
                   <h2 className="font-bold text-slate-700">{group.supplier?.name || "Proveedor Desconocido"}</h2>
                </div>
                <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                   Deuda Total: {formatCurrency(group.totalPending)}
                </span>
             </div>

             {/* Clients List for this group */}
             <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
               {group.clients.map(client => {
                 const { sold, balance } = getClientBalance(client);
                 const isExpanded = expandedClientId === client.id;
                 
                 return (
                   <div key={client.id} className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden ${cardHoverClass}`}>
                     {/* Client Main Card */}
                     <div 
                        className="p-4 flex items-center justify-between cursor-pointer active:bg-slate-50"
                        onClick={() => setExpandedClientId(isExpanded ? null : client.id)}
                     >
                       <div className="flex-1 min-w-0">
                         <h3 className="font-bold text-slate-800 text-lg truncate">{client.name}</h3>
                         <div className="flex items-center gap-2 mt-1">
                            <span className={`text-sm font-semibold ${balance > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                              {balance > 0 ? 'Debe: ' : 'Saldo: '} {formatCurrency(Math.abs(balance))}
                            </span>
                            <span className="text-slate-300">|</span>
                            <span className="text-xs text-slate-400">Total Crédito: {formatCurrency(sold)}</span>
                         </div>
                       </div>
                       <div className="flex items-center gap-2 pl-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleOpenTxModal(client); }}
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                          >
                            <DollarSign size={20} />
                          </button>
                          {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                       </div>
                     </div>

                     {/* Expanded History */}
                     {isExpanded && (
                       <div className="bg-slate-50 border-t border-slate-100 p-4 animate-in slide-in-from-top-2 duration-200">
                         <div className="flex justify-between items-center mb-3">
                           <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Historial</h4>
                           <button 
                              onClick={(e) => { e.stopPropagation(); handleOpenClientModal(client); }}
                              className="text-xs text-blue-600 flex items-center gap-1 hover:underline"
                           >
                              <Edit2 size={12} /> Editar Cliente
                           </button>
                         </div>
                         
                         {client.transactions.length === 0 ? (
                           <p className="text-center text-slate-400 text-sm py-2">Sin movimientos</p>
                         ) : (
                           <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                             {client.transactions.map(tx => (
                               <div key={tx.id} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200">
                                 <div className="flex items-center gap-3">
                                   <div className={`p-1.5 rounded-md ${tx.type === 'SALE' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                     {tx.type === 'SALE' ? <TrendingUp size={14} /> : <Wallet size={14} />}
                                   </div>
                                   <div>
                                     <p className={`text-sm font-bold ${tx.type === 'SALE' ? 'text-indigo-900' : 'text-emerald-900'}`}>
                                       {tx.type === 'SALE' ? 'Venta' : 'Abono'}
                                     </p>
                                     <p className="text-[10px] text-slate-400">{formatDate(tx.date)}</p>
                                   </div>
                                 </div>
                                 <div className="text-right">
                                    <p className={`text-sm font-bold ${tx.type === 'SALE' ? 'text-indigo-600' : 'text-emerald-600'}`}>
                                       {tx.type === 'SALE' ? '+' : '-'}{formatCurrency(tx.amount)}
                                    </p>
                                    {tx.note && <p className="text-[10px] text-slate-400 max-w-[100px] truncate">{tx.note}</p>}
                                 </div>
                               </div>
                             ))}
                           </div>
                         )}
                       </div>
                     )}
                   </div>
                 );
               })}
             </div>
          </div>
        ))}

        {groupedClients.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400">
            <Users size={48} className="mx-auto mb-3 opacity-20" />
            <p>{searchTerm ? "No se encontraron clientes" : "No hay clientes registrados"}</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-24 md:bottom-6 right-6 z-20">
        <Button onClick={() => handleOpenClientModal()} className="shadow-lg shadow-indigo-200 rounded-full w-14 h-14 !p-0 flex items-center justify-center transform hover:scale-105 transition-transform">
          <Plus size={28} />
        </Button>
      </div>

      {/* Client Modal */}
      <Modal 
        isOpen={isClientModalOpen} 
        onClose={() => setIsClientModalOpen(false)} 
        title={editingClient ? "Editar Cliente" : "Nuevo Cliente"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
            <input 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="Ej. Juan Pérez"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Proveedor Asociado</label>
            <select 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
              value={clientSupplierId}
              onChange={e => setClientSupplierId(e.target.value)}
            >
              {suppliers.length === 0 && <option value="">Crea un proveedor primero</option>}
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="pt-2">
            <Button fullWidth onClick={handleClientSubmit} disabled={suppliers.length === 0}>Guardar</Button>
          </div>
        </div>
      </Modal>

      {/* Transaction Modal */}
      <Modal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        title={`Registrar Movimiento - ${selectedClientForTx?.name}`}
      >
        <div className="space-y-4">
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button 
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${txType === 'SALE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
              onClick={() => setTxType('SALE')}
            >
              Venta (Crédito)
            </button>
            <button 
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${txType === 'PAYMENT' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
              onClick={() => setTxType('PAYMENT')}
            >
              Abono (Pago)
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Monto</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input 
                type="number"
                className="w-full pl-8 pr-4 py-3 text-xl font-bold rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                value={txAmount}
                onChange={e => setTxAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nota (Opcional)</label>
            <input 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              value={txNote}
              onChange={e => setTxNote(e.target.value)}
              placeholder="Ej. Factura #123"
            />
          </div>

          <div className="pt-2">
            <Button 
              fullWidth 
              onClick={handleTxSubmit}
              variant={txType === 'SALE' ? 'primary' : 'success'}
            >
              {txType === 'SALE' ? 'Registrar Venta' : 'Registrar Abono'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};


// --- Main App Component ---

interface CurrencyConfig {
  code: string;
  locale: string;
  showDecimals: boolean;
}

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('DASHBOARD');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  
  // Currency State - Default to DOP
  const [currencyConfig, setCurrencyConfig] = useState<CurrencyConfig>({
    code: 'DOP',
    locale: 'es-DO',
    showDecimals: true
  });

  // Load Data
  useEffect(() => {
    try {
      const savedSuppliers = localStorage.getItem('suppliers');
      const savedClients = localStorage.getItem('clients');
      const savedCurrency = localStorage.getItem('currencyConfig');

      if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers));
      if (savedClients) setClients(JSON.parse(savedClients));
      if (savedCurrency) setCurrencyConfig(JSON.parse(savedCurrency));
    } catch (e) {
      console.error("Error loading data from local storage", e);
      // Fallback if data is corrupted
      localStorage.removeItem('suppliers');
      localStorage.removeItem('clients');
    }
  }, []);

  // Save Data
  useEffect(() => {
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('currencyConfig', JSON.stringify(currencyConfig));
  }, [currencyConfig]);

  // Global Currency Formatter
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(currencyConfig.locale, {
      style: 'currency',
      currency: currencyConfig.code,
      minimumFractionDigits: currencyConfig.showDecimals ? 2 : 0,
      maximumFractionDigits: currencyConfig.showDecimals ? 2 : 0,
    }).format(value);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'DASHBOARD':
        return (
          <DashboardView 
            clients={clients} 
            suppliers={suppliers} 
            onNavigate={setCurrentScreen}
            formatCurrency={formatCurrency}
            onOpenSettings={() => setShowSettings(true)}
          />
        );
      case 'SUPPLIERS':
        return (
          <SuppliersView 
            suppliers={suppliers} 
            setSuppliers={setSuppliers} 
            onBack={() => setCurrentScreen('DASHBOARD')}
            clients={clients}
          />
        );
      case 'CLIENTS':
        return (
          <ClientsView 
            clients={clients} 
            setClients={setClients} 
            suppliers={suppliers} 
            onBack={() => setCurrentScreen('DASHBOARD')}
            formatCurrency={formatCurrency}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center">
      {/* Main Container - Responsive Width */}
      <div className="w-full max-w-7xl shadow-2xl bg-slate-50 min-h-screen relative flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20">
            {renderScreen()}
          </div>
          
          {/* Mobile Bottom Navigation */}
          <BottomNavigation currentScreen={currentScreen} onNavigate={setCurrentScreen} />
      </div>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Configuración"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Moneda</label>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto custom-scrollbar p-1">
              {CURRENCIES.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => setCurrencyConfig(prev => ({ ...prev, code: curr.code, locale: curr.locale }))}
                  className={`px-3 py-2 text-left text-sm rounded-lg border transition-all ${
                    currencyConfig.code === curr.code 
                      ? 'bg-indigo-50 border-primary text-primary font-medium ring-1 ring-primary' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {curr.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-800">Mostrar Decimales</p>
              <p className="text-xs text-slate-500">Ej: $1,234.56 vs $1,235</p>
            </div>
            <button 
              onClick={() => setCurrencyConfig(prev => ({ ...prev, showDecimals: !prev.showDecimals }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                currencyConfig.showDecimals ? 'bg-primary' : 'bg-slate-300'
              }`}
            >
              <span 
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  currencyConfig.showDecimals ? 'translate-x-6' : 'translate-x-1'
                }`} 
              />
            </button>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
             <p className="text-xs text-slate-400 mb-1">Vista Previa</p>
             <p className="text-xl font-bold text-slate-800">{formatCurrency(12345.67)}</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;