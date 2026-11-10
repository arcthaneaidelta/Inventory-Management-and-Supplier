import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { AppShell } from '../components/layout/AppShell';

const DashboardPage = lazy(() => import('../pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const SuppliersPage = lazy(() => import('../pages/SuppliersPage').then((m) => ({ default: m.SuppliersPage })));
const SupplierDetailsPage = lazy(() => import('../pages/SupplierDetailsPage').then((m) => ({ default: m.SupplierDetailsPage })));
const IntakePage = lazy(() => import('../pages/IntakePage').then((m) => ({ default: m.IntakePage })));
const AIStudioPage = lazy(() => import('../pages/AIStudioPage').then((m) => ({ default: m.AIStudioPage })));
const CatalogPage = lazy(() => import('../pages/CatalogPage').then((m) => ({ default: m.CatalogPage })));
const ProductDetailsPage = lazy(() => import('../pages/ProductDetailsPage').then((m) => ({ default: m.ProductDetailsPage })));
const PricingPage = lazy(() => import('../pages/PricingPage').then((m) => ({ default: m.PricingPage })));
const InventoryPage = lazy(() => import('../pages/InventoryPage').then((m) => ({ default: m.InventoryPage })));
const ApprovalsPage = lazy(() => import('../pages/ApprovalsPage').then((m) => ({ default: m.ApprovalsPage })));
const IntegrationsPage = lazy(() => import('../pages/IntegrationsPage').then((m) => ({ default: m.IntegrationsPage })));
const AutomationsPage = lazy(() => import('../pages/AutomationsPage').then((m) => ({ default: m.AutomationsPage })));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const SettingsPage = lazy(() => import('../pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const HelpPage = lazy(() => import('../pages/HelpPage').then((m) => ({ default: m.HelpPage })));

const PageLoader = () => (
  <div className="flex items-center justify-center py-20 text-xs text-[#78837C]">
    Loading workspace module...
  </div>
);

const withSuspense = (el: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{el}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/app',
    element: <AppShell />,
    children: [
      { index: true, element: withSuspense(<DashboardPage />) },
      { path: 'suppliers', element: withSuspense(<SuppliersPage />) },
      { path: 'suppliers/:id', element: withSuspense(<SupplierDetailsPage />) },
      { path: 'intake', element: withSuspense(<IntakePage />) },
      { path: 'ai-studio', element: withSuspense(<AIStudioPage />) },
      { path: 'catalog', element: withSuspense(<CatalogPage />) },
      { path: 'catalog/:id', element: withSuspense(<ProductDetailsPage />) },
      { path: 'pricing', element: withSuspense(<PricingPage />) },
      { path: 'inventory', element: withSuspense(<InventoryPage />) },
      { path: 'approvals', element: withSuspense(<ApprovalsPage />) },
      { path: 'integrations', element: withSuspense(<IntegrationsPage />) },
      { path: 'automations', element: withSuspense(<AutomationsPage />) },
      { path: 'notifications', element: withSuspense(<NotificationsPage />) },
      { path: 'settings', element: withSuspense(<SettingsPage />) },
      { path: 'help', element: withSuspense(<HelpPage />) },
      { path: '*', element: <Navigate to="/app" replace /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
