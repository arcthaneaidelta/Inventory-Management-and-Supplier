import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  Building2,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Compass,
  DollarSign,
  Inbox,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Store,
  Workflow,
  X,
  ArrowUpRight,
} from 'lucide-react';
import { SupplyFlowLogo } from '../common/SupplyFlowLogo';
import { useSupplyFlow } from '../../context/SupplyFlowContext';
import { Modal } from '../common/Modal';

const PRIMARY_NAV = [
  { label: 'Overview', to: '/app', icon: LayoutDashboard, end: true },
  { label: 'Suppliers', to: '/app/suppliers', icon: Building2 },
  { label: 'Product Intake', to: '/app/intake', icon: Inbox },
  { label: 'AI Studio', to: '/app/ai-studio', icon: Camera },
  { label: 'Product Catalog', to: '/app/catalog', icon: Package },
  { label: 'Pricing Engine', to: '/app/pricing', icon: DollarSign },
  { label: 'Inventory', to: '/app/inventory', icon: Package },
  { label: 'Approval Center', to: '/app/approvals', icon: ShieldCheck, badgeKey: 'pendingApprovals' as const },
  { label: 'Integrations', to: '/app/integrations', icon: Store },
  { label: 'Automation Center', to: '/app/automations', icon: Workflow },
  { label: 'Settings', to: '/app/settings', icon: Settings },
];

const ROUTE_TITLES: Record<string, string> = {
  '/app': 'Overview',
  '/app/suppliers': 'Suppliers',
  '/app/intake': 'Product Intake',
  '/app/ai-studio': 'AI Studio',
  '/app/catalog': 'Product Catalog',
  '/app/pricing': 'Pricing Engine',
  '/app/inventory': 'Inventory',
  '/app/approvals': 'Approval Center',
  '/app/integrations': 'Integrations',
  '/app/automations': 'Automation Center',
  '/app/notifications': 'Notifications',
  '/app/settings': 'Settings',
  '/app/help': 'Documentation & Support',
};

const DEMO_TOUR_STEPS = [
  { step: '01', title: 'Landing Page', desc: 'Introduces SUPPLYFLOW value proposition, workflow, and photography comparison.', to: '/' },
  { step: '02', title: 'Operations Overview', desc: 'Inspect live KPIs, product processing pipeline, and inventory health.', to: '/app' },
  { step: '03', title: 'Product Intake Center', desc: 'Explore messaging chat intake, CSV/Excel upload, and AI extraction.', to: '/app/intake' },
  { step: '04', title: 'AI Product Studio', desc: 'Compare original supplier photos against prepared studio presets.', to: '/app/ai-studio' },
  { step: '05', title: 'Product Catalog', desc: 'View bilingual EN/ES descriptions, attributes, and variant records.', to: '/app/catalog/prod-01' },
  { step: '06', title: 'Pricing Engine', desc: 'Adjust FX, freight, duty, and gross margin with live formula updates.', to: '/app/pricing' },
  { step: '07', title: 'Inventory Matrix', desc: 'Edit variant stock counts across Color × Size and resolve alerts.', to: '/app/inventory' },
  { step: '08', title: 'Approval Center', desc: 'Exercise full owner control—approve, request changes, or reject.', to: '/app/approvals' },
  { step: '09', title: 'Shopify Readiness', desc: 'Inspect field-by-field synchronization preview for approved products.', to: '/app/integrations' },
];

export const AppShell: React.FC = () => {
  const {
    metrics,
    products,
    suppliers,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
    settings,
    resetDemoData,
  } = useSupplyFlow();

  const location = useLocation();
  const navigate = useNavigate();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileNavOpen(false);
    setSearchFocused(false);
    setNotifOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchFocused(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { products: [], suppliers: [] };
    return {
      products: products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        )
        .slice(0, 5),
      suppliers: suppliers
        .filter((s) => s.name.toLowerCase().includes(q) || s.country.toLowerCase().includes(q))
        .slice(0, 3),
    };
  }, [searchQuery, products, suppliers]);

  const breadcrumbs = useMemo(() => {
    const path = location.pathname;
    const crumbs: { label: string; to?: string }[] = [{ label: 'Workspace', to: '/app' }];
    if (path === '/app') return crumbs;

    if (path.startsWith('/app/suppliers/')) {
      const id = path.split('/').pop();
      const sup = suppliers.find((s) => s.id === id);
      crumbs.push({ label: 'Suppliers', to: '/app/suppliers' });
      crumbs.push({ label: sup?.name ?? 'Supplier Profile' });
      return crumbs;
    }

    if (path.startsWith('/app/catalog/')) {
      const id = path.split('/').pop();
      const prod = products.find((p) => p.id === id);
      crumbs.push({ label: 'Product Catalog', to: '/app/catalog' });
      crumbs.push({ label: prod ? `${prod.name} (${prod.sku})` : 'Product Details' });
      return crumbs;
    }

    const label = ROUTE_TITLES[path] ?? 'Module';
    crumbs.push({ label });
    return crumbs;
  }, [location.pathname, suppliers, products]);

  const SidebarNavContent = ({ compact = false }: { compact?: boolean }) => (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#E6EAE4] px-4">
          <Link to="/" className="min-w-0" aria-label="Go to landing page">
            {compact ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E9F0E9] text-[#344D3D] font-display font-bold text-xs">
                SF
              </div>
            ) : (
              <SupplyFlowLogo size="sm" />
            )}
          </Link>
        </div>

        {/* Workspace Badge */}
        {!compact && (
          <div className="px-3 pt-3 pb-1">
            <div className="rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="truncate text-[11px] font-semibold text-[#26352F]">
                  {settings.workspaceName}
                </span>
                <span className="h-2 w-2 rounded-full bg-[#526D5B]" title="Local Demo Active" />
              </div>
              <p className="mt-0.5 text-[10px] text-[#78837C]">
                {settings.baseCurrency} Base • Manual Approval On
              </p>
            </div>
          </div>
        )}

        {/* Primary 11 Navigation Items */}
        <nav className="px-2.5 py-2 space-y-0.5" aria-label="Workspace navigation">
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const badgeCount = item.badgeKey ? metrics[item.badgeKey] : 0;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={compact ? item.label : undefined}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors ${
                    isActive
                      ? 'bg-[#E9F0E9] text-[#344D3D]'
                      : 'text-[#5C6660] hover:bg-[#F0F2ED] hover:text-[#26352F]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? 'text-[#344D3D]' : 'text-[#78837C] group-hover:text-[#26352F]'
                        }`}
                      />
                      {!compact && <span className="truncate">{item.label}</span>}
                    </div>
                    {!compact && badgeCount > 0 && (
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                          isActive
                            ? 'bg-[#344D3D] text-white'
                            : 'bg-[#FAF3E6] text-[#8E6932]'
                        }`}
                      >
                        {badgeCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Utility Links */}
      <div className="border-t border-[#E6EAE4] p-2.5 space-y-1">
        <NavLink
          to="/app/notifications"
          className={({ isActive }) =>
            `flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors ${
              isActive
                ? 'bg-[#E9F0E9] text-[#344D3D]'
                : 'text-[#5C6660] hover:bg-[#F0F2ED] hover:text-[#26352F]'
            }`
          }
        >
          <div className="flex items-center gap-2.5">
            <Bell className="h-4 w-4 text-[#78837C]" />
            {!compact && <span>Notifications</span>}
          </div>
          {!compact && metrics.unreadNotificationsCount > 0 && (
            <span className="rounded-md bg-[#E9F0E9] px-1.5 py-0.5 text-[10px] font-semibold text-[#344D3D] tabular-nums">
              {metrics.unreadNotificationsCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/app/help"
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors ${
              isActive
                ? 'bg-[#E9F0E9] text-[#344D3D]'
                : 'text-[#5C6660] hover:bg-[#F0F2ED] hover:text-[#26352F]'
            }`
          }
        >
          <BookOpen className="h-4 w-4 text-[#78837C]" />
          {!compact && <span>Docs & Training</span>}
        </NavLink>

        {!compact && (
          <button
            type="button"
            onClick={() => setTourOpen(true)}
            className="w-full flex items-center gap-2.5 rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] px-2.5 py-2 text-left text-xs font-medium text-[#344D3D] hover:bg-[#E9F0E9]/60 transition-colors"
          >
            <Compass className="h-4 w-4 shrink-0 text-[#526D5B]" />
            <span>2-Min Demo Guide</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#26352F] flex">
      {/* Desktop / Tablet Fixed Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 border-r border-[#E6EAE4] bg-white sticky top-0 h-screen transition-all duration-200 ${
          sidebarCollapsed ? 'w-[68px]' : 'w-[252px]'
        }`}
      >
        <SidebarNavContent compact={sidebarCollapsed} />
        <button
          type="button"
          onClick={() => setSidebarCollapsed((c) => !c)}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:flex absolute -right-3 top-20 h-6 w-6 items-center justify-center rounded-full border border-[#E6EAE4] bg-white text-[#78837C] shadow-sf-xs hover:text-[#26352F]"
        >
          <ChevronRight
            className={`h-3.5 w-3.5 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`}
          />
        </button>
      </aside>

      {/* Mobile Slide-Out Navigation Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#26352F]/35"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] bg-white h-full border-r border-[#E6EAE4] shadow-sf-lg">
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-[#78837C] hover:bg-[#F0F2ED]"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarNavContent />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Utility Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-[#E6EAE4] bg-white/95 px-4 sm:px-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="md:hidden rounded-lg p-2 text-[#26352F] hover:bg-[#F0F2ED]"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs min-w-0">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-[#9AA39C] shrink-0" />}
                  {crumb.to ? (
                    <Link
                      to={crumb.to}
                      className="text-[#78837C] hover:text-[#26352F] truncate font-medium"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-[#26352F] font-semibold truncate">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>

            <span className="sm:hidden font-display text-sm font-semibold text-[#26352F] truncate">
              {breadcrumbs[breadcrumbs.length - 1]?.label}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Search */}
            <div ref={searchRef} className="relative hidden sm:block w-56 lg:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9AA39C]" />
              <input
                type="search"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchFocused(true);
                }}
                placeholder="Search SKU, product, supplier..."
                className="w-full rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] pl-8 pr-3 py-1.5 text-xs text-[#26352F] placeholder:text-[#9AA39C] focus:border-[#526D5B] focus:bg-white focus:outline-none"
              />

              {searchFocused && searchQuery.trim().length > 0 && (
                <div className="absolute right-0 mt-1.5 w-80 rounded-xl border border-[#E6EAE4] bg-white p-2 shadow-sf-lg z-40">
                  {searchResults.products.length === 0 && searchResults.suppliers.length === 0 ? (
                    <p className="px-3 py-4 text-center text-xs text-[#78837C]">
                      No matching products or suppliers found.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {searchResults.products.length > 0 && (
                        <div>
                          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#9AA39C]">
                            Products
                          </p>
                          {searchResults.products.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                navigate(`/app/catalog/${p.id}`);
                                setSearchFocused(false);
                                setSearchQuery('');
                              }}
                              className="w-full flex items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs hover:bg-[#F7F8F5]"
                            >
                              <span className="font-medium text-[#26352F] truncate">{p.name}</span>
                              <span className="ml-2 shrink-0 text-[11px] text-[#78837C] tabular-nums">
                                {p.sku}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                      {searchResults.suppliers.length > 0 && (
                        <div>
                          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#9AA39C]">
                            Suppliers
                          </p>
                          {searchResults.suppliers.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                navigate(`/app/suppliers/${s.id}`);
                                setSearchFocused(false);
                                setSearchQuery('');
                              }}
                              className="w-full flex items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs hover:bg-[#F7F8F5]"
                            >
                              <span className="font-medium text-[#26352F] truncate">{s.name}</span>
                              <span className="ml-2 text-[11px] text-[#78837C]">{s.country}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Action Button */}
            <Link
              to="/app/intake"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#344D3D] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#293E31] transition-colors shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add Product</span>
            </Link>

            {/* Notifications Popover */}
            <div ref={notifRef} className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((o) => !o)}
                className="relative rounded-lg border border-[#E6EAE4] bg-white p-2 text-[#5C6660] hover:bg-[#F7F8F5] hover:text-[#26352F]"
                aria-label="Open notifications"
              >
                <Bell className="h-4 w-4" />
                {metrics.unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#B58A4B] px-1 text-[10px] font-semibold text-white tabular-nums">
                    {metrics.unreadNotificationsCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#E6EAE4] bg-white shadow-sf-lg z-50 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[#E6EAE4] px-4 py-3">
                    <div>
                      <p className="text-xs font-semibold text-[#26352F]">Notifications</p>
                      <p className="text-[11px] text-[#78837C]">
                        {metrics.unreadNotificationsCount} unread alerts
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-[11px] font-medium text-[#526D5B] hover:text-[#344D3D]"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-[#E6EAE4]">
                    {notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 text-xs transition-colors ${
                          n.read ? 'bg-white' : 'bg-[#F7F8F5]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              markNotificationRead(n.id);
                              setNotifOpen(false);
                              navigate(n.targetRoute);
                            }}
                            className="text-left flex-1"
                          >
                            <p className="font-medium text-[#26352F] flex items-center gap-1.5">
                              {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-[#526D5B]" />}
                              <span>{n.title}</span>
                            </p>
                            <p className="mt-0.5 text-[11px] text-[#78837C] leading-relaxed">
                              {n.message}
                            </p>
                            <p className="mt-1 text-[10px] text-[#9AA39C]">{n.timestamp}</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => dismissNotification(n.id)}
                            className="rounded p-1 text-[#9AA39C] hover:bg-[#F0F2ED]"
                            aria-label="Dismiss notification"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[#E6EAE4] bg-[#F7F8F5] px-4 py-2.5 text-center">
                    <Link
                      to="/app/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="text-xs font-medium text-[#344D3D] hover:underline"
                    >
                      View all notifications →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Menu */}
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((p) => !p)}
                className="flex items-center gap-2 rounded-lg border border-[#E6EAE4] bg-white py-1 pl-1.5 pr-2.5 hover:bg-[#F7F8F5] transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#344D3D] text-[11px] font-semibold text-white">
                  JK
                </div>
                <span className="hidden lg:inline text-xs font-medium text-[#26352F]">Jack</span>
                <ChevronDown className="h-3.5 w-3.5 text-[#78837C]" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#E6EAE4] bg-white p-1.5 shadow-sf-lg z-50 text-xs">
                  <div className="px-3 py-2 border-b border-[#E6EAE4] mb-1">
                    <p className="font-semibold text-[#26352F]">{settings.ownerName}</p>
                    <p className="text-[11px] text-[#78837C]">Owner • Demo Workspace</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setProfileOpen(false); setTourOpen(true); }}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-[#26352F] hover:bg-[#F7F8F5]"
                  >
                    <Compass className="h-3.5 w-3.5 text-[#526D5B]" />
                    2-Minute Demo Walkthrough
                  </button>
                  <button
                    type="button"
                    onClick={() => { setProfileOpen(false); navigate('/app/settings'); }}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-[#26352F] hover:bg-[#F7F8F5]"
                  >
                    <Settings className="h-3.5 w-3.5 text-[#78837C]" />
                    Workspace Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => { setProfileOpen(false); navigate('/'); }}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-[#26352F] hover:bg-[#F7F8F5]"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#78837C]" />
                    Public Landing Page
                  </button>
                  <div className="my-1 border-t border-[#E6EAE4]" />
                  <button
                    type="button"
                    onClick={() => { setProfileOpen(false); resetDemoData(); }}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-[#9F514B] hover:bg-[#FBF0EF]"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Reset Demo Data
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 max-w-[1440px] w-full mx-auto">
          <div key={location.pathname} className="sf-page-enter">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Quick Bar */}
        <nav
          aria-label="Mobile quick navigation"
          className="md:hidden fixed bottom-0 inset-x-0 z-30 flex items-center justify-around border-t border-[#E6EAE4] bg-white/95 backdrop-blur-sm py-1.5 px-2"
        >
          {[
            { label: 'Overview', to: '/app', icon: LayoutDashboard, end: true },
            { label: 'Intake', to: '/app/intake', icon: Inbox },
            { label: 'Catalog', to: '/app/catalog', icon: Package },
            { label: 'Approvals', to: '/app/approvals', icon: ShieldCheck },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[10px] font-medium ${
                    isActive ? 'text-[#344D3D]' : 'text-[#78837C]'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[10px] font-medium text-[#78837C]"
          >
            <Menu className="h-4 w-4" />
            <span>More</span>
          </button>
        </nav>
      </div>

      {/* Two-Minute Guided Demo Walkthrough Modal */}
      <Modal
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        title="2-Minute Product Demonstration Journey"
        subtitle="Walk through the complete SUPPLYFLOW supplier-to-Shopify lifecycle"
        maxWidthClass="max-w-2xl"
      >
        <div className="space-y-2.5">
          {DEMO_TOUR_STEPS.map((s) => (
            <button
              key={s.step}
              type="button"
              onClick={() => {
                setTourOpen(false);
                navigate(s.to);
              }}
              className="w-full flex items-center justify-between gap-4 rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] px-4 py-3 text-left hover:border-[#526D5B] hover:bg-[#E9F0E9]/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#344D3D] text-[11px] font-semibold text-white tabular-nums">
                  {s.step}
                </span>
                <div>
                  <p className="text-xs font-semibold text-[#26352F]">{s.title}</p>
                  <p className="mt-0.5 text-[11px] text-[#78837C]">{s.desc}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#78837C]" />
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
};

