import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  FileText,
  Users,
  Receipt,
  FileSignature,
  Plus,
  Search,
  Download,
  Edit,
  Trash2,
  Eye,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Building2,
  RefreshCw,
  Filter,
  ChevronDown,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  X,
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// ============== STATUS BADGES ==============

const QuoteStatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    accepted: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    refused: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  const labels = {
    pending: "En attente",
    accepted: "Accepté",
    refused: "Refusé",
  };
  return (
    <span className={cn("px-2 py-1 text-xs font-medium rounded-full", styles[status])}>
      {labels[status] || status}
    </span>
  );
};

const InvoiceStatusBadge = ({ status }) => {
  const styles = {
    unpaid: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    partial: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  };
  const labels = {
    unpaid: "Impayée",
    paid: "Payée",
    partial: "Partielle",
  };
  return (
    <span className={cn("px-2 py-1 text-xs font-medium rounded-full", styles[status])}>
      {labels[status] || status}
    </span>
  );
};

const ContractStatusBadge = ({ status }) => {
  const styles = {
    draft: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
    active: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    signed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    expired: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  const labels = {
    draft: "Brouillon",
    active: "En cours",
    signed: "Signé",
    expired: "Expiré",
  };
  return (
    <span className={cn("px-2 py-1 text-xs font-medium rounded-full", styles[status])}>
      {labels[status] || status}
    </span>
  );
};

// ============== FORMAT HELPERS ==============

const formatPrice = (amount) => {
  if (!amount && amount !== 0) return "0 FCFA";
  return amount.toLocaleString("fr-FR") + " FCFA";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("fr-FR");
};

// ============== COMMERCIAL DASHBOARD ==============

export function CommercialDashboard({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/commercial/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Vue d'ensemble", icon: TrendingUp },
    { id: "partners", label: "Partenaires", icon: Users },
    { id: "quotes", label: "Devis", icon: FileText },
    { id: "invoices", label: "Factures", icon: Receipt },
    { id: "contracts", label: "Contrats", icon: FileSignature },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestion Commerciale</h1>
          <p className="text-muted-foreground">
            Documents, partenaires et facturation
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap",
              activeTab === id
                ? "bg-black dark:bg-white text-white dark:text-black"
                : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "dashboard" && <DashboardOverview stats={stats} onRefresh={fetchDashboard} />}
      {activeTab === "partners" && <PartnersSection token={token} />}
      {activeTab === "quotes" && <QuotesSection token={token} />}
      {activeTab === "invoices" && <InvoicesSection token={token} />}
      {activeTab === "contracts" && <ContractsSection token={token} />}
    </div>
  );
}

// ============== DASHBOARD OVERVIEW ==============

function DashboardOverview({ stats, onRefresh }) {
  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-muted-foreground">Partenaires</span>
          </div>
          <p className="text-3xl font-bold">{stats.partners?.total || 0}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm text-muted-foreground">Devis</span>
          </div>
          <p className="text-3xl font-bold">{stats.quotes?.total || 0}</p>
          <p className="text-sm text-muted-foreground">{stats.quotes?.pending || 0} en attente</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-muted-foreground">Factures</span>
          </div>
          <p className="text-3xl font-bold">{stats.invoices?.total || 0}</p>
          <p className="text-sm text-green-600">{formatPrice(stats.invoices?.total_paid || 0)} encaissé</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <FileSignature className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-muted-foreground">Contrats</span>
          </div>
          <p className="text-3xl font-bold">{stats.contracts?.total || 0}</p>
          <p className="text-sm text-muted-foreground">{stats.contracts?.active || 0} actifs</p>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Résumé Financier</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-blue-100 text-sm">Total Facturé</p>
            <p className="text-2xl font-bold">{formatPrice(stats.invoices?.total_amount || 0)}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Encaissé</p>
            <p className="text-2xl font-bold text-green-300">{formatPrice(stats.invoices?.total_paid || 0)}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">En Attente</p>
            <p className="text-2xl font-bold text-yellow-300">{formatPrice(stats.invoices?.total_pending || 0)}</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotes */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Derniers Devis
          </h3>
          {stats.recent_quotes?.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_quotes.map((quote) => (
                <div key={quote.quote_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div>
                    <p className="font-medium text-sm">{quote.quote_number}</p>
                    <p className="text-xs text-muted-foreground">{quote.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatPrice(quote.total)}</p>
                    <QuoteStatusBadge status={quote.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Aucun devis</p>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Dernières Factures
          </h3>
          {stats.recent_invoices?.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_invoices.map((invoice) => (
                <div key={invoice.invoice_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div>
                    <p className="font-medium text-sm">{invoice.invoice_number}</p>
                    <p className="text-xs text-muted-foreground">{invoice.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatPrice(invoice.total)}</p>
                    <InvoiceStatusBadge status={invoice.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Aucune facture</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============== PARTNERS SECTION ==============

function PartnersSection({ token }) {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const response = await axios.get(`${API_URL}/api/commercial/partners${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPartners(response.data.partners || []);
    } catch (error) {
      console.error("Error fetching partners:", error);
    } finally {
      setLoading(false);
    }
  }, [token, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPartners();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchPartners]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un partenaire..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
          />
        </div>
        <button
          onClick={() => { setEditingPartner(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-medium rounded-xl"
        >
          <Plus className="w-4 h-4" />
          Nouveau Partenaire
        </button>
      </div>

      {/* Partners List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : partners.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Aucun partenaire trouvé</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg"
          >
            Créer un partenaire
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {partners.map((partner) => (
            <div
              key={partner.partner_id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{partner.company_name || partner.name}</h3>
                  {partner.company_name && partner.name && (
                    <p className="text-sm text-muted-foreground">{partner.name}</p>
                  )}
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                    {partner.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {partner.email}
                      </span>
                    )}
                    {partner.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {partner.phone}
                      </span>
                    )}
                    {partner.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {partner.city}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingPartner(partner); setShowForm(true); }}
                    className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Partner Form Modal */}
      {showForm && (
        <PartnerFormModal
          token={token}
          partner={editingPartner}
          onClose={() => { setShowForm(false); setEditingPartner(null); }}
          onSuccess={() => { setShowForm(false); setEditingPartner(null); fetchPartners(); }}
        />
      )}
    </div>
  );
}

// ============== PARTNER FORM MODAL ==============

function PartnerFormModal({ token, partner, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: partner?.name || "",
    company_name: partner?.company_name || "",
    address: partner?.address || "",
    city: partner?.city || "Dakar",
    country: partner?.country || "Sénégal",
    email: partner?.email || "",
    phone: partner?.phone || "",
    ninea: partner?.ninea || "",
    rccm: partner?.rccm || "",
    logo_url: partner?.logo_url || "",
    notes: partner?.notes || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Le nom est requis");
      return;
    }

    setSaving(true);
    try {
      if (partner) {
        await axios.put(`${API_URL}/api/commercial/partners/${partner.partner_id}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Partenaire mis à jour");
      } else {
        await axios.post(`${API_URL}/api/commercial/partners`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Partenaire créé");
      }
      onSuccess();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {partner ? "Modifier le partenaire" : "Nouveau partenaire"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom du contact *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nom de l'entreprise</label>
            <input
              type="text"
              value={form.company_name}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Téléphone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Adresse</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ville</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pays</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">NINEA</label>
              <input
                type="text"
                value={form.ninea}
                onChange={(e) => setForm({ ...form, ninea: e.target.value })}
                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">RCCM</label>
              <input
                type="text"
                value={form.rccm}
                onChange={(e) => setForm({ ...form, rccm: e.target.value })}
                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL du logo</label>
            <input
              type="url"
              value={form.logo_url}
              onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
              placeholder="https://..."
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-3 bg-black dark:bg-white text-white dark:text-black font-medium rounded-xl disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============== QUOTES SECTION ==============

function QuotesSection({ token }) {
  const [quotes, setQuotes] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [emailModal, setEmailModal] = useState(null);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const response = await axios.get(`${API_URL}/api/commercial/quotes${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuotes(response.data.quotes || []);
      setStats(response.data.stats || {});
    } catch (error) {
      console.error("Error fetching quotes:", error);
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const handleDownloadPdf = async (quoteId, quoteNumber) => {
    try {
      const response = await axios.get(`${API_URL}/api/commercial/quotes/${quoteId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Devis_${quoteNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("PDF téléchargé");
    } catch (error) {
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handleUpdateStatus = async (quoteId, status) => {
    try {
      await axios.put(`${API_URL}/api/commercial/quotes/${quoteId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Statut mis à jour");
      fetchQuotes();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleConvertToInvoice = async (quoteId) => {
    try {
      const response = await axios.post(`${API_URL}/api/commercial/quotes/${quoteId}/convert-to-invoice`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Facture ${response.data.invoice_number} créée`);
      fetchQuotes();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de la conversion");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
        >
          <option value="">Tous les statuts</option>
          <option value="pending">En attente ({stats.pending || 0})</option>
          <option value="accepted">Acceptés ({stats.accepted || 0})</option>
          <option value="refused">Refusés ({stats.refused || 0})</option>
        </select>
        <div className="flex-1" />
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-medium rounded-xl"
        >
          <Plus className="w-4 h-4" />
          Nouveau Devis
        </button>
      </div>

      {/* Quotes List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : quotes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Aucun devis trouvé</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <div
              key={quote.quote_id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-blue-600">{quote.quote_number}</span>
                    <QuoteStatusBadge status={quote.status} />
                  </div>
                  <h3 className="font-semibold">{quote.title}</h3>
                  <p className="text-sm text-muted-foreground">{quote.partner_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Créé le {formatDate(quote.created_at)} • Validité {quote.validity_days || 30} jours
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{formatPrice(quote.total)}</p>
                </div>
                <div className="flex flex-col gap-2 min-w-[140px]">
                  <button
                    onClick={() => handleDownloadPdf(quote.quote_id, quote.quote_number)}
                    className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                  <button
                    onClick={() => setEmailModal({
                      type: "quote",
                      id: quote.quote_id,
                      number: quote.quote_number,
                      email: quote.partner_email,
                      name: quote.partner_name
                    })}
                    className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2"
                    title="Envoyer par email"
                  >
                    <Send className="w-4 h-4" />
                    Email
                  </button>
                  {quote.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(quote.quote_id, "accepted")}
                        className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg"
                      >
                        Accepter
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(quote.quote_id, "refused")}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-sm font-medium rounded-lg"
                      >
                        Refuser
                      </button>
                    </>
                  )}
                  {quote.status === "accepted" && !quote.converted_to_invoice_id && (
                    <button
                      onClick={() => handleConvertToInvoice(quote.quote_id)}
                      className="px-4 py-2 bg-yellow-400 text-black text-sm font-medium rounded-lg flex items-center justify-center gap-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Facturer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quote Form Modal */}
      {showForm && (
        <QuoteFormModal
          token={token}
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); fetchQuotes(); }}
        />
      )}

      {/* Email Modal */}
      {emailModal && (
        <EmailModal
          token={token}
          documentType={emailModal.type}
          documentId={emailModal.id}
          documentNumber={emailModal.number}
          partnerEmail={emailModal.email}
          partnerName={emailModal.name}
          onClose={() => setEmailModal(null)}
          onSuccess={fetchQuotes}
        />
      )}
    </div>
  );
}

// ============== QUOTE FORM MODAL (Simplified for brevity) ==============

function QuoteFormModal({ token, onClose, onSuccess }) {
  const [partners, setPartners] = useState([]);
  const [form, setForm] = useState({
    partner_id: "",
    title: "",
    description: "",
    items: [{ description: "", quantity: 1, unit_price: 0, unit: "forfait" }],
    validity_days: 30,
    payment_terms: "50% à la commande, 50% à la livraison",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/commercial/partners`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPartners(response.data.partners || []);
    } catch (error) {
      console.error("Error fetching partners:", error);
    }
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { description: "", quantity: 1, unit_price: 0, unit: "forfait" }]
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = value;
    setForm({ ...form, items: newItems });
  };

  const removeItem = (index) => {
    if (form.items.length > 1) {
      setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
    }
  };

  const calculateTotal = () => {
    return form.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.partner_id) {
      toast.error("Sélectionnez un partenaire");
      return;
    }
    if (!form.title.trim()) {
      toast.error("L'objet est requis");
      return;
    }
    if (form.items.some(item => !item.description.trim())) {
      toast.error("Toutes les lignes doivent avoir une description");
      return;
    }

    setSaving(true);
    try {
      await axios.post(`${API_URL}/api/commercial/quotes`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Devis créé avec succès");
      onSuccess();
    } catch (error) {
      toast.error("Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Nouveau Devis</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Partner Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Partenaire *</label>
            <select
              value={form.partner_id}
              onChange={(e) => setForm({ ...form, partner_id: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
              required
            >
              <option value="">Sélectionner un partenaire</option>
              {partners.map((p) => (
                <option key={p.partner_id} value={p.partner_id}>
                  {p.company_name || p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Objet *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Développement site web"
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          {/* Items */}
          <div>
            <label className="block text-sm font-medium mb-2">Lignes du devis</label>
            <div className="space-y-3">
              {form.items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                      placeholder="Description"
                      className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 text-sm"
                    />
                  </div>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                    className="w-20 p-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 text-sm"
                    min="0"
                    step="0.5"
                  />
                  <select
                    value={item.unit}
                    onChange={(e) => updateItem(index, "unit", e.target.value)}
                    className="w-24 p-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 text-sm"
                  >
                    <option value="forfait">forfait</option>
                    <option value="heure">heure</option>
                    <option value="jour">jour</option>
                    <option value="mois">mois</option>
                    <option value="unité">unité</option>
                  </select>
                  <input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, "unit_price", parseFloat(e.target.value) || 0)}
                    placeholder="Prix"
                    className="w-28 p-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 text-sm"
                    min="0"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addItem}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Ajouter une ligne
            </button>
          </div>

          {/* Total */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-right">
            <span className="text-muted-foreground">Total: </span>
            <span className="text-2xl font-bold">{formatPrice(calculateTotal())}</span>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Validité (jours)</label>
              <input
                type="number"
                value={form.validity_days}
                onChange={(e) => setForm({ ...form, validity_days: parseInt(e.target.value) || 30 })}
                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Conditions de paiement</label>
              <input
                type="text"
                value={form.payment_terms}
                onChange={(e) => setForm({ ...form, payment_terms: e.target.value })}
                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-3 bg-black dark:bg-white text-white dark:text-black font-medium rounded-xl disabled:opacity-50"
            >
              {saving ? "Création..." : "Créer le devis"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============== INVOICES SECTION (Simplified) ==============

function InvoicesSection({ token }) {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const response = await axios.get(`${API_URL}/api/commercial/invoices${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoices(response.data.invoices || []);
      setStats(response.data.stats || {});
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleDownloadPdf = async (invoiceId, invoiceNumber) => {
    try {
      const response = await axios.get(`${API_URL}/api/commercial/invoices/${invoiceId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Facture_${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("PDF téléchargé");
    } catch (error) {
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handleMarkPaid = async (invoiceId, total) => {
    try {
      await axios.put(`${API_URL}/api/commercial/invoices/${invoiceId}`, { amount_paid: total }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Facture marquée comme payée");
      fetchInvoices();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">{stats.total || 0}</p>
          <p className="text-sm text-muted-foreground">Total</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.unpaid || 0}</p>
          <p className="text-sm text-muted-foreground">Impayées</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{stats.partial || 0}</p>
          <p className="text-sm text-muted-foreground">Partielles</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.paid || 0}</p>
          <p className="text-sm text-muted-foreground">Payées</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
        >
          <option value="">Tous les statuts</option>
          <option value="unpaid">Impayées</option>
          <option value="partial">Partiellement payées</option>
          <option value="paid">Payées</option>
        </select>
      </div>

      {/* Invoices List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
          <Receipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Aucune facture trouvée</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.invoice_id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-green-600">{invoice.invoice_number}</span>
                    <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                      {invoice.invoice_type === "proforma" ? "Pro forma" : "Facture"}
                    </span>
                    <InvoiceStatusBadge status={invoice.status} />
                  </div>
                  <h3 className="font-semibold">{invoice.title}</h3>
                  <p className="text-sm text-muted-foreground">{invoice.partner_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Créée le {formatDate(invoice.created_at)}
                    {invoice.due_date && ` • Échéance: ${formatDate(invoice.due_date)}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{formatPrice(invoice.total)}</p>
                  {invoice.status === "partial" && (
                    <p className="text-sm text-green-600">Payé: {formatPrice(invoice.amount_paid)}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2 min-w-[140px]">
                  <button
                    onClick={() => handleDownloadPdf(invoice.invoice_id, invoice.invoice_number)}
                    className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                  {invoice.status !== "paid" && (
                    <button
                      onClick={() => handleMarkPaid(invoice.invoice_id, invoice.total)}
                      className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg"
                    >
                      Marquer payée
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============== CONTRACTS SECTION (Simplified) ==============

function ContractsSection({ token }) {
  const [contracts, setContracts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const response = await axios.get(`${API_URL}/api/commercial/contracts${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContracts(response.data.contracts || []);
      setStats(response.data.stats || {});
    } catch (error) {
      console.error("Error fetching contracts:", error);
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleDownloadPdf = async (contractId, contractNumber) => {
    try {
      const response = await axios.get(`${API_URL}/api/commercial/contracts/${contractId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Contrat_${contractNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("PDF téléchargé");
    } catch (error) {
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handleUpdateStatus = async (contractId, status) => {
    try {
      await axios.put(`${API_URL}/api/commercial/contracts/${contractId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Statut mis à jour");
      fetchContracts();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const contractTypeLabels = {
    partnership: "Partenariat",
    sponsoring: "Sponsoring",
    vendor: "Vendeur"
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
        >
          <option value="">Tous les statuts</option>
          <option value="draft">Brouillon ({stats.draft || 0})</option>
          <option value="active">En cours ({stats.active || 0})</option>
          <option value="signed">Signé ({stats.signed || 0})</option>
          <option value="expired">Expiré ({stats.expired || 0})</option>
        </select>
        <div className="flex-1" />
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-medium rounded-xl"
        >
          <Plus className="w-4 h-4" />
          Nouveau Contrat
        </button>
      </div>

      {/* Contracts List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : contracts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
          <FileSignature className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Aucun contrat trouvé</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div
              key={contract.contract_id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-purple-600">{contract.contract_number}</span>
                    <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                      {contractTypeLabels[contract.contract_type] || contract.contract_type}
                    </span>
                    <ContractStatusBadge status={contract.status} />
                  </div>
                  <h3 className="font-semibold">{contract.title}</h3>
                  <p className="text-sm text-muted-foreground">{contract.partner_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Du {formatDate(contract.start_date)}
                    {contract.end_date && ` au ${formatDate(contract.end_date)}`}
                    {contract.value && ` • Valeur: ${formatPrice(contract.value)}`}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-w-[140px]">
                  <button
                    onClick={() => handleDownloadPdf(contract.contract_id, contract.contract_number)}
                    className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                  {contract.status === "draft" && (
                    <button
                      onClick={() => handleUpdateStatus(contract.contract_id, "active")}
                      className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg"
                    >
                      Activer
                    </button>
                  )}
                  {contract.status === "active" && (
                    <button
                      onClick={() => handleUpdateStatus(contract.contract_id, "signed")}
                      className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg"
                    >
                      Marquer signé
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contract Form Modal */}
      {showForm && (
        <ContractFormModal
          token={token}
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); fetchContracts(); }}
        />
      )}
    </div>
  );
}

// ============== CONTRACT FORM MODAL ==============

function ContractFormModal({ token, onClose, onSuccess }) {
  const [partners, setPartners] = useState([]);
  const [templates, setTemplates] = useState({});
  const [form, setForm] = useState({
    partner_id: "",
    contract_type: "partnership",
    title: "",
    description: "",
    clauses: [],
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
    value: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPartners();
    fetchTemplates();
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/commercial/partners`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPartners(response.data.partners || []);
    } catch (error) {
      console.error("Error fetching partners:", error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/commercial/contracts/templates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(response.data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const loadTemplate = (type) => {
    const template = templates[type];
    if (template) {
      setForm({
        ...form,
        contract_type: type,
        title: template.title,
        clauses: template.clauses.map(c => ({ ...c }))
      });
    }
  };

  const updateClause = (index, field, value) => {
    const newClauses = [...form.clauses];
    newClauses[index][field] = value;
    setForm({ ...form, clauses: newClauses });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.partner_id) {
      toast.error("Sélectionnez un partenaire");
      return;
    }
    if (!form.title.trim()) {
      toast.error("Le titre est requis");
      return;
    }

    setSaving(true);
    try {
      await axios.post(`${API_URL}/api/commercial/contracts`, {
        ...form,
        value: form.value ? parseFloat(form.value) : null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Contrat créé avec succès");
      onSuccess();
    } catch (error) {
      toast.error("Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Nouveau Contrat</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type & Template */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type de contrat</label>
              <select
                value={form.contract_type}
                onChange={(e) => { setForm({ ...form, contract_type: e.target.value }); loadTemplate(e.target.value); }}
                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="partnership">Partenariat</option>
                <option value="sponsoring">Sponsoring</option>
                <option value="vendor">Vendeur</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Partenaire *</label>
              <select
                value={form.partner_id}
                onChange={(e) => setForm({ ...form, partner_id: e.target.value })}
                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
                required
              >
                <option value="">Sélectionner</option>
                {partners.map((p) => (
                  <option key={p.partner_id} value={p.partner_id}>
                    {p.company_name || p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Titre *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          {/* Dates & Value */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date de début *</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date de fin</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valeur (FCFA)</label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          {/* Clauses */}
          {form.clauses.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Clauses du contrat</label>
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {form.clauses.map((clause, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <p className="font-medium text-sm mb-2">{clause.title}</p>
                    <textarea
                      value={clause.content}
                      onChange={(e) => updateClause(index, "content", e.target.value)}
                      disabled={!clause.is_editable}
                      rows={3}
                      className="w-full p-2 text-sm border rounded-lg dark:bg-gray-600 dark:border-gray-500 disabled:opacity-60"
                    />
                    {!clause.is_editable && (
                      <p className="text-xs text-muted-foreground mt-1">Clause standard non modifiable</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-3 bg-black dark:bg-white text-white dark:text-black font-medium rounded-xl disabled:opacity-50"
            >
              {saving ? "Création..." : "Créer le contrat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============== EMAIL MODAL COMPONENT ==============

function EmailModal({ token, documentType, documentId, documentNumber, partnerEmail, partnerName, onClose, onSuccess }) {
  const [form, setForm] = useState({
    recipient_email: partnerEmail || "",
    recipient_name: partnerName || "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const getDefaultSubject = () => {
    const labels = {
      quote: `Devis ${documentNumber} - GROUPE YAMA+`,
      invoice: `Facture ${documentNumber} - GROUPE YAMA+`,
      contract: `Contrat ${documentNumber} - GROUPE YAMA+`,
    };
    return labels[documentType] || `Document ${documentNumber}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.recipient_email) {
      toast.error("Veuillez saisir une adresse email");
      return;
    }

    setSending(true);
    try {
      const endpoints = {
        quote: `/api/commercial/quotes/${documentId}/send-email`,
        invoice: `/api/commercial/invoices/${documentId}/send-email`,
        contract: `/api/commercial/contracts/${documentId}/send-email`,
      };

      const payload = {
        recipient_email: form.recipient_email,
        recipient_name: form.recipient_name || undefined,
        subject: form.subject || undefined,
        message: form.message || undefined,
      };

      await axios.post(`${API_URL}${endpoints[documentType]}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Document envoyé à ${form.recipient_email}`);
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-500" />
            Envoyer par email
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <strong>Document:</strong> {documentNumber}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email destinataire *</label>
            <input
              type="email"
              required
              value={form.recipient_email}
              onChange={(e) => setForm({ ...form, recipient_email: e.target.value })}
              placeholder="email@exemple.com"
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nom du destinataire</label>
            <input
              type="text"
              value={form.recipient_name}
              onChange={(e) => setForm({ ...form, recipient_name: e.target.value })}
              placeholder="Nom ou entreprise"
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sujet (optionnel)</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder={getDefaultSubject()}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Message personnalisé (optionnel)</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3}
              placeholder="Ajoutez un message personnalisé..."
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={sending}
              className="flex-1 px-4 py-3 bg-blue-500 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Envoyer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CommercialDashboard;
