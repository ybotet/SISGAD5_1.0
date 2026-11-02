import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  materialService,
  type StockTrabajadorItem,
} from "../../services/materialService";
import { trabajadorService } from "../../services/trabajadorService";
import type { TrabajadorItem } from "../../services/trabajadorService";
import StockHeader from "../../components/stock/StockHeader";
import StockError from "../../components/stock/StockError";
import StockStats from "../../components/stock/StockStats";
import StockFilters from "../../components/stock/StockFilters";
import StockTable from "../../components/stock/StockTable";
import StockDetailsModal from "../../components/stock/StockDetailsModal";

export default function StockTrabajadorPage() {
  const { t } = useTranslation();

  const [stockData, setStockData] = useState<StockTrabajadorItem[]>([]);
  const [trabajadorMap, setTrabajadorMap] = useState<Record<number, string>>({});
  const [trabajadoresById, setTrabajadoresById] = useState<Record<number, TrabajadorItem>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [claveTrabajador, setClaveTrabajador] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsItem, setDetailsItem] = useState<StockTrabajadorItem | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [stock, trabajadoresResp] = await Promise.all([
        materialService.getStockTrabajadores(),
        trabajadorService.getTrabajadores(1, 10000),
      ]);

      const map: Record<number, string> = {};
      const byId: Record<number, TrabajadorItem> = {};
      (trabajadoresResp.data || []).forEach((t) => {
        const label =
          t.clave_trabajador?.trim() ||
          t.nombre?.trim() ||
          `ID ${t.id_trabajador}`;
        map[t.id_trabajador] = label;
        byId[t.id_trabajador] = t;
      });

      setTrabajadorMap(map);
      setTrabajadoresById(byId);
      setStockData(stock);
    } catch (err) {
      console.error("Error cargando stock por trabajador", err);
      setError("Error al cargar el stock por trabajador");
      setStockData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [searchTerm, claveTrabajador]);

  const filteredData = useMemo(() => {
    let result = stockData;
    const term = searchTerm.trim().toLowerCase();

    if (term) {
      result = result.filter((item) => {
        const label =
          trabajadorMap[item.trabajador_id] || `ID ${item.trabajador_id}`;
        if (label.toLowerCase().includes(term)) return true;
        return item.materiales.some(
          (m) =>
            m.codigo.toLowerCase().includes(term) ||
            m.nombre.toLowerCase().includes(term),
        );
      });
    }

    if (claveTrabajador?.trim()) {
      const clave = claveTrabajador.trim().toLowerCase();
      result = result.filter((item) => {
        const t = trabajadoresById[item.trabajador_id];
        const claveT = t?.clave_trabajador?.toLowerCase() || "";
        const nombre = t?.nombre?.toLowerCase() || "";
        return claveT.includes(clave) || nombre.includes(clave);
      });
    }

    return result;
  }, [stockData, searchTerm, claveTrabajador, trabajadorMap, trabajadoresById]);

  const paginatedItems = useMemo(() => {
    const total = filteredData.length;
    const pages = Math.max(1, Math.ceil(total / pagination.limit));
    const page = Math.min(pagination.page, pages);
    const offset = (page - 1) * pagination.limit;
    return {
      items: filteredData.slice(offset, offset + pagination.limit),
      total,
      pages,
      page,
    };
  }, [filteredData, pagination.page, pagination.limit]);

  const summary = useMemo(() => {
    const stockTotal = filteredData.reduce((sum, t) => sum + t.total_stock, 0);
    const negativos = filteredData.reduce(
      (sum, t) => sum + t.materiales.filter((m) => m.stock < 0).length,
      0,
    );
    return { stockTotal, negativos };
  }, [filteredData]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= paginatedItems.pages) {
      setPagination((prev) => ({ ...prev, page }));
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination({ page: 1, limit: newLimit, total: filteredData.length, pages: 1 });
  };

  const handleView = (item: StockTrabajadorItem) => {
    setDetailsItem(item);
    setShowDetailsModal(true);
  };

  if (loading && stockData.length === 0) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-2xl text-blue-600 mb-2"></i>
          <p className="text-gray-600">Cargando stock por trabajador...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <StockHeader
        title={t("menu.stock_trabajador")}
        description="Consulta el stock actual de cada trabajador (asignaciones − consumos)"
      />

      <StockError message={error} onClose={() => setError("")} />

      <StockStats
        showing={paginatedItems.items.length}
        total={paginatedItems.total}
        stockTotal={summary.stockTotal}
        negativos={summary.negativos}
      />

      <StockFilters
        searchTerm={searchTerm}
        claveTrabajador={claveTrabajador}
        onSearchChange={setSearchTerm}
        onClaveChange={setClaveTrabajador}
        onRefresh={loadData}
      />

      <StockTable
        items={paginatedItems.items}
        trabajadorMap={trabajadorMap}
        onView={handleView}
        startIndex={(paginatedItems.page - 1) * pagination.limit}
        loading={loading && stockData.length > 0}
      />

      {paginatedItems.pages > 1 && (
        <div className="bg-white rounded-lg shadow p-4 mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">Mostrar:</label>
            <select
              value={pagination.limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Página {paginatedItems.page} de {paginatedItems.pages} ({paginatedItems.total} total)
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => goToPage(paginatedItems.page - 1)}
              disabled={paginatedItems.page === 1}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => goToPage(paginatedItems.page + 1)}
              disabled={paginatedItems.page === paginatedItems.pages}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      <StockDetailsModal
        show={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setDetailsItem(null);
        }}
        stockItem={detailsItem}
        trabajador={
          detailsItem ? trabajadoresById[detailsItem.trabajador_id] ?? null : null
        }
      />
    </div>
  );
}
