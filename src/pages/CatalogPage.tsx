import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowUpDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
} from 'lucide-react';
import { useSupplyFlow } from '../context/SupplyFlowContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProductImage } from '../components/common/ProductImage';
import { formatCurrency } from '../services/mockPricing';
import { getProductStockStatus, getProductTotalStock } from '../services/mockInventory';

const PAGE_SIZE = 10;

export const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    products,
    suppliers,
    settings,
    approveProduct,
    updateProduct,
    pushToast,
  } = useSupplyFlow();

  const initialStage = searchParams.get('stage') || 'All';

  const [search, setSearch] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState(initialStage);
  const [stockFilter, setStockFilter] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'updated'>('updated');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => {
        if (
          q &&
          !p.name.toLowerCase().includes(q) &&
          !p.sku.toLowerCase().includes(q) &&
          !p.brand.toLowerCase().includes(q)
        ) {
          return false;
        }
        if (supplierFilter !== 'All' && p.supplierId !== supplierFilter) return false;
        if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;

        if (statusFilter !== 'All') {
          if (statusFilter === 'Review') {
            if (!['Awaiting Review', 'Ready for Approval', 'Needs Changes'].includes(p.approvalStatus)) {
              return false;
            }
          } else if (p.approvalStatus !== statusFilter) {
            return false;
          }
        }

        if (stockFilter !== 'All') {
          const st = getProductStockStatus(p, settings.lowStockThreshold);
          if (st !== stockFilter) return false;
        }

        if (priceRange === 'Under50' && p.pricing.sellingPrice >= 50) return false;
        if (priceRange === '50to100' && (p.pricing.sellingPrice < 50 || p.pricing.sellingPrice > 100)) return false;
        if (priceRange === 'Over100' && p.pricing.sellingPrice <= 100) return false;

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'name') diff = a.name.localeCompare(b.name);
        else if (sortBy === 'price') diff = a.pricing.sellingPrice - b.pricing.sellingPrice;
        else if (sortBy === 'stock') diff = getProductTotalStock(a) - getProductTotalStock(b);
        else diff = a.lastUpdated.localeCompare(b.lastUpdated);
        return sortDir === 'asc' ? diff : -diff;
      });
  }, [
    products,
    search,
    supplierFilter,
    categoryFilter,
    statusFilter,
    stockFilter,
    priceRange,
    sortBy,
    sortDir,
    settings.lowStockThreshold,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAllVisible = () => {
    const visibleIds = paginated.map((p) => p.id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleBulkApprove = () => {
    selectedIds.forEach((id) => approveProduct(id, 'Shopify Ready'));
    pushToast({
      title: `Approved ${selectedIds.length} products`,
      description: 'Marked as Shopify Ready.',
      variant: 'success',
    });
    setSelectedIds([]);
  };

  const handleBulkStageReview = () => {
    selectedIds.forEach((id) =>
      updateProduct(id, { approvalStatus: 'Ready for Approval' })
    );
    pushToast({
      title: `Staged ${selectedIds.length} products for review`,
      variant: 'info',
    });
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#26352F]">Product Catalog</h1>
          <p className="mt-1 text-sm text-[#78837C]">
            Centralized catalog across all suppliers with bilingual descriptions, pricing, and variant stock.
          </p>
        </div>
        <Link
          to="/app/intake"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#344D3D] px-4 py-2 text-xs font-medium text-white hover:bg-[#293E31]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Via Intake
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-[#E6EAE4] bg-white p-4 shadow-sf-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9AA39C]" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by product name, SKU, or brand..."
              className="w-full rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] pl-8 pr-3 py-2 text-xs focus:border-[#526D5B] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <select
              value={supplierFilter}
              onChange={(e) => { setSupplierFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] px-2.5 py-2"
            >
              <option value="All">All Suppliers</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] px-2.5 py-2"
            >
              <option value="All">All Categories</option>
              <option value="Apparel">Apparel</option>
              <option value="Shoes">Shoes</option>
              <option value="Accessories">Accessories</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] px-2.5 py-2"
            >
              <option value="All">All Statuses</option>
              <option value="Review">Pending Review (All)</option>
              <option value="Received">Received</option>
              <option value="Processing">Processing</option>
              <option value="Awaiting Review">Awaiting Review</option>
              <option value="Ready for Approval">Ready for Approval</option>
              <option value="Needs Changes">Needs Changes</option>
              <option value="Approved">Approved</option>
              <option value="Shopify Ready">Shopify Ready</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={stockFilter}
              onChange={(e) => { setStockFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] px-2.5 py-2"
            >
              <option value="All">All Stock States</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>

            <select
              value={priceRange}
              onChange={(e) => { setPriceRange(e.target.value); setPage(1); }}
              className="rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] px-2.5 py-2"
            >
              <option value="All">Any Price</option>
              <option value="Under50">Under $50</option>
              <option value="50to100">$50 – $100</option>
              <option value="Over100">Over $100</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#C9DBC9] bg-[#E9F0E9]/60 px-3.5 py-2 text-xs">
            <span className="font-semibold text-[#344D3D]">
              {selectedIds.length} product(s) selected
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleBulkStageReview}
                className="rounded-lg border border-[#E6EAE4] bg-white px-3 py-1 font-medium text-[#26352F]"
              >
                Mark Ready for Approval
              </button>
              <button
                type="button"
                onClick={handleBulkApprove}
                className="inline-flex items-center gap-1 rounded-lg bg-[#344D3D] px-3 py-1 font-medium text-white"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approve Selected
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="rounded-lg px-2.5 py-1 text-[#78837C] hover:text-[#26352F]"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Catalog Table */}
      <div className="rounded-2xl border border-[#E6EAE4] bg-white shadow-sf-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E6EAE4] bg-[#F7F8F5] text-[11px] font-semibold text-[#78837C]">
                <th className="py-3 pl-4 pr-2 w-9">
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && paginated.every((p) => selectedIds.includes(p.id))}
                    onChange={toggleAllVisible}
                    aria-label="Select all visible products"
                    className="h-3.5 w-3.5 accent-[#344D3D]"
                  />
                </th>
                <th className="py-3 px-3">
                  <button type="button" onClick={() => toggleSort('name')} className="inline-flex items-center gap-1 hover:text-[#26352F]">
                    Product <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3">Supplier</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">Cost</th>
                <th className="py-3 px-3 text-right">
                  <button type="button" onClick={() => toggleSort('price')} className="inline-flex items-center gap-1 hover:text-[#26352F]">
                    Selling Price <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-3 px-3 text-right">
                  <button type="button" onClick={() => toggleSort('stock')} className="inline-flex items-center gap-1 hover:text-[#26352F]">
                    Stock <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 pl-3 pr-5 text-right">
                  <button type="button" onClick={() => toggleSort('updated')} className="inline-flex items-center gap-1 hover:text-[#26352F]">
                    Updated <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6EAE4]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-xs text-[#78837C]">
                    No products match the active filters.
                  </td>
                </tr>
              ) : (
                paginated.map((p) => {
                  const sup = suppliers.find((s) => s.id === p.supplierId);
                  const primaryImg = p.images.find((i) => i.isPrimary) ?? p.images[0];
                  const totalStock = getProductTotalStock(p);
                  const stockSt = getProductStockStatus(p, settings.lowStockThreshold);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/app/catalog/${p.id}`)}
                      className="cursor-pointer hover:bg-[#F7F8F5] transition-colors"
                    >
                      <td className="py-3 pl-4 pr-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(p.id)}
                          onChange={() => toggleSelect(p.id)}
                          aria-label={`Select ${p.name}`}
                          className="h-3.5 w-3.5 accent-[#344D3D]"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <ProductImage
                            src={primaryImg?.url}
                            alt={p.name}
                            className="h-10 w-10 rounded-lg border border-[#E6EAE4] shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-[#26352F] truncate">{p.name}</p>
                            <p className="text-[11px] text-[#78837C]">{p.variants.length} variants</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[#78837C] whitespace-nowrap">
                        {p.sku}
                      </td>
                      <td className="py-3 px-3 text-[#26352F] whitespace-nowrap">{sup?.name}</td>
                      <td className="py-3 px-3 text-[#78837C]">{p.category}</td>
                      <td className="py-3 px-3 text-right tabular-nums text-[#78837C] whitespace-nowrap">
                        {formatCurrency(p.pricing.supplierCost, p.pricing.supplierCurrency)}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums font-semibold text-[#26352F] whitespace-nowrap">
                        {formatCurrency(p.pricing.sellingPrice, settings.baseCurrency)}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums whitespace-nowrap">
                        <span
                          className={
                            stockSt === 'Out of Stock'
                              ? 'font-semibold text-[#9F514B]'
                              : stockSt === 'Low Stock'
                              ? 'font-semibold text-[#8E6932]'
                              : 'text-[#26352F]'
                          }
                        >
                          {totalStock}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge label={p.approvalStatus} />
                      </td>
                      <td className="py-3 pl-3 pr-5 text-right tabular-nums text-[#78837C] whitespace-nowrap">
                        {p.lastUpdated}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[#E6EAE4] bg-[#F7F8F5] px-5 py-3 text-xs text-[#78837C]">
          <span>
            Showing {(safePage - 1) * PAGE_SIZE + (filtered.length ? 1 : 0)}–
            {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} products
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-[#E6EAE4] bg-white p-1.5 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 font-medium text-[#26352F] tabular-nums">
              Page {safePage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-[#E6EAE4] bg-white p-1.5 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

