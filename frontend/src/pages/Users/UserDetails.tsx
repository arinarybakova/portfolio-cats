import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getToken, isAdmin } from "../../utils/auth";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type Cat = {
  id: number;
  name: string;
  age: number;
  status: string;
  image?: string;
  owner?: {
    id: number;
    name: string;
  };
  breed?: {
    id: number;
    name: string;
  };
};

type Address = {
  id: number;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  isDefault?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

type TabKey = "info" | "cats" | "addresses" | "settings" | "security";

const styles = `
  * { box-sizing: border-box; }

  .user-page {
    min-height: 100vh;
    padding: 18px;
    color: white;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    background: linear-gradient(180deg, #111827 0%, #0f172a 45%, #020617 100%);
  }

  .user-shell {
    max-width: 1320px;
    margin: 0 auto;
    border-radius: 28px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(15, 23, 42, 0.88);
    box-shadow: 0 10px 30px rgba(0,0,0,0.22);
    padding: 20px;
  }

  .hero {
    text-align: center;
    max-width: 860px;
    margin: 0 auto 20px;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    padding: 8px 14px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05);
    font-size: 12px;
    color: rgba(255,255,255,0.86);
  }

  .page-title {
    margin: 14px 0 8px;
    font-size: clamp(36px, 7vw, 60px);
    line-height: 1;
    font-weight: 800;
    letter-spacing: -0.04em;
    background: linear-gradient(90deg, #fff, #dbeafe, #f5d0fe);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .page-subtitle {
    margin: 0 auto;
    max-width: 760px;
    color: #dbe4f2;
    font-size: 16px;
    line-height: 1.6;
  }

  .top-actions {
    display: flex;
    justify-content: flex-start;
    margin-bottom: 16px;
  }

  .panel {
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    border-radius: 22px;
  }

  .profile-card {
    padding: 18px;
    margin-bottom: 16px;
  }

  .profile-grid {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 18px;
    align-items: start;
  }

  .avatar-panel {
    padding: 20px;
    text-align: center;
    border-radius: 20px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.06);
  }

  .avatar {
    width: 120px;
    height: 120px;
    display: grid;
    place-items: center;
    margin: 0 auto 14px;
    border-radius: 50%;
    background: linear-gradient(135deg, #22d3ee, #d946ef, #f59e0b);
    color: white;
    font-size: 42px;
    font-weight: 800;
  }

  .user-name {
    margin: 0 0 8px;
    font-size: 28px;
    font-weight: 800;
  }

  .role-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 110px;
    padding: 8px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.06em;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.06);
    text-transform: uppercase;
  }

  .role-admin { color: #fde68a; background: rgba(245,158,11,0.14); }
  .role-user { color: #bfdbfe; background: rgba(59,130,246,0.14); }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 16px;
  }

  .stat-card {
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    padding: 14px;
  }

  .stat-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #cbd5e1;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .stat-value {
    font-size: 20px;
    font-weight: 800;
    word-break: break-word;
  }

  .tabs {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .tab-btn {
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.05);
    color: white;
    border-radius: 14px;
    padding: 10px 14px;
    cursor: pointer;
    font-weight: 700;
  }

  .tab-btn.active {
    background: linear-gradient(90deg, #22d3ee, #d946ef, #f59e0b);
    border-color: transparent;
  }

  .content-card {
    padding: 18px;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .field label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #cbd5e1;
    font-weight: 700;
  }

  .input {
    width: 100%;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.06);
    color: white;
    border-radius: 14px;
    padding: 12px 14px;
    outline: none;
  }

  .input::placeholder { color: #94a3b8; }
  .input option { color: #0f172a; }

  .btn, .btn-outline, .btn-danger {
    border: 0;
    cursor: pointer;
    font-weight: 700;
    transition: opacity .15s ease;
  }

  .btn:hover, .btn-outline:hover, .btn-danger:hover { opacity: 0.95; }

  .btn:disabled, .btn-outline:disabled, .btn-danger:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .btn {
    padding: 11px 15px;
    border-radius: 14px;
    color: white;
    background: linear-gradient(90deg, #22d3ee, #d946ef, #f59e0b);
  }

  .btn-outline {
    padding: 11px 15px;
    border-radius: 14px;
    color: white;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
  }

  .btn-danger {
    padding: 10px 12px;
    border-radius: 12px;
    color: white;
    background: linear-gradient(90deg, #ef4444, #f97316);
  }

  .stack { display: flex; flex-direction: column; gap: 12px; }
  .row { display: flex; gap: 10px; flex-wrap: wrap; }

  .cat-list, .address-list {
    display: grid;
    gap: 12px;
    margin-top: 14px;
  }

  .cat-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    padding: 14px;
  }

  .cat-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .cat-thumb {
    width: 56px;
    height: 56px;
    object-fit: cover;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05);
  }

  .muted { color: #94a3b8; }

  .section-title-inline {
    margin: 0 0 12px;
    font-size: 20px;
    font-weight: 800;
  }

  .switch-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
  }

  .loading-box {
    min-height: 60vh;
    display: grid;
    place-items: center;
    text-align: center;
  }

  .message {
    padding: 12px 14px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.08);
    font-weight: 600;
  }

  .message.success {
    background: rgba(34,197,94,0.15);
    color: #bbf7d0;
  }

  .message.error {
    background: rgba(239,68,68,0.15);
    color: #fecaca;
  }

  .tooltip-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .tooltip-icon {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: inline-grid;
    place-items: center;
    font-size: 11px;
    font-weight: 800;
    color: white;
    background: rgba(255,255,255,0.12);
    cursor: help;
  }

  .tooltip-text {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    min-width: 220px;
    max-width: 300px;
    padding: 10px 12px;
    border-radius: 12px;
    background: #0f172a;
    border: 1px solid rgba(255,255,255,0.1);
    color: #dbe4f2;
    font-size: 12px;
    line-height: 1.5;
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    opacity: 0;
    pointer-events: none;
    transform: translateY(-4px);
    transition: 0.15s ease;
    z-index: 10;
  }

  .tooltip-wrap:hover .tooltip-text {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }

  .accordion-card {
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    overflow: hidden;
  }

  .accordion-header {
    width: 100%;
    border: 0;
    background: transparent;
    color: white;
    padding: 14px;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    font-weight: 700;
  }

  .accordion-body {
    padding: 0 14px 14px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }

  .default-pill {
    display: inline-flex;
    padding: 5px 10px;
    border-radius: 999px;
    background: rgba(34,197,94,0.16);
    color: #bbf7d0;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .inline-strong {
    font-weight: 800;
  }

  @media (max-width: 920px) {
    .profile-grid, .grid-2, .stats-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 720px) {
    .user-page { padding: 12px; }
    .user-shell { border-radius: 22px; padding: 14px; }
    .row, .top-actions, .tabs { justify-content: center; }
    .btn, .btn-outline, .btn-danger { width: 100%; }
  }
`;

const emptyAddressForm = {
  label: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  isDefault: false,
  notes: "",
};

export default function UserDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const admin = isAdmin();
  const token = getToken();
  const viewingManagedUser = admin && !!id;
  const routeUserId = id ? Number(id) : null;

  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<User | null>(null);

  const [cats, setCats] = useState<Cat[]>([]);
  const [allCats, setAllCats] = useState<Cat[]>([]);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [expandedAddressId, setExpandedAddressId] = useState<number | null>(
    null,
  );
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);

  const [tab, setTab] = useState<TabKey>("info");
  const [selectedCatId, setSelectedCatId] = useState<number | "">("");

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [infoMessage, setInfoMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [addressMessage, setAddressMessage] = useState("");

  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    marketing: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [addressForm, setAddressForm] = useState(emptyAddressForm);

  const viewedUserId = user?.id ?? routeUserId ?? 0;

  const countryOptions = useMemo(() => {
    const countries = [
      { code: "AF", name: "Afghanistan" },
      { code: "AL", name: "Albania" },
      { code: "DZ", name: "Algeria" },
      { code: "AD", name: "Andorra" },
      { code: "AO", name: "Angola" },
      { code: "AG", name: "Antigua and Barbuda" },
      { code: "AR", name: "Argentina" },
      { code: "AM", name: "Armenia" },
      { code: "AU", name: "Australia" },
      { code: "AT", name: "Austria" },
      { code: "AZ", name: "Azerbaijan" },
      { code: "BS", name: "Bahamas" },
      { code: "BH", name: "Bahrain" },
      { code: "BD", name: "Bangladesh" },
      { code: "BB", name: "Barbados" },
      { code: "BY", name: "Belarus" },
      { code: "BE", name: "Belgium" },
      { code: "BZ", name: "Belize" },
      { code: "BJ", name: "Benin" },
      { code: "BT", name: "Bhutan" },
      { code: "BO", name: "Bolivia" },
      { code: "BA", name: "Bosnia and Herzegovina" },
      { code: "BW", name: "Botswana" },
      { code: "BR", name: "Brazil" },
      { code: "BN", name: "Brunei" },
      { code: "BG", name: "Bulgaria" },
      { code: "BF", name: "Burkina Faso" },
      { code: "BI", name: "Burundi" },
      { code: "CV", name: "Cabo Verde" },
      { code: "KH", name: "Cambodia" },
      { code: "CM", name: "Cameroon" },
      { code: "CA", name: "Canada" },
      { code: "CF", name: "Central African Republic" },
      { code: "TD", name: "Chad" },
      { code: "CL", name: "Chile" },
      { code: "CN", name: "China" },
      { code: "CO", name: "Colombia" },
      { code: "KM", name: "Comoros" },
      { code: "CG", name: "Congo" },
      { code: "CR", name: "Costa Rica" },
      { code: "CI", name: "Côte d’Ivoire" },
      { code: "HR", name: "Croatia" },
      { code: "CU", name: "Cuba" },
      { code: "CY", name: "Cyprus" },
      { code: "CZ", name: "Czech Republic" },
      { code: "CD", name: "Democratic Republic of the Congo" },
      { code: "DK", name: "Denmark" },
      { code: "DJ", name: "Djibouti" },
      { code: "DM", name: "Dominica" },
      { code: "DO", name: "Dominican Republic" },
      { code: "EC", name: "Ecuador" },
      { code: "EG", name: "Egypt" },
      { code: "SV", name: "El Salvador" },
      { code: "GQ", name: "Equatorial Guinea" },
      { code: "ER", name: "Eritrea" },
      { code: "EE", name: "Estonia" },
      { code: "SZ", name: "Eswatini" },
      { code: "ET", name: "Ethiopia" },
      { code: "FJ", name: "Fiji" },
      { code: "FI", name: "Finland" },
      { code: "FR", name: "France" },
      { code: "GA", name: "Gabon" },
      { code: "GM", name: "Gambia" },
      { code: "GE", name: "Georgia" },
      { code: "DE", name: "Germany" },
      { code: "GH", name: "Ghana" },
      { code: "GR", name: "Greece" },
      { code: "GD", name: "Grenada" },
      { code: "GT", name: "Guatemala" },
      { code: "GN", name: "Guinea" },
      { code: "GW", name: "Guinea-Bissau" },
      { code: "GY", name: "Guyana" },
      { code: "HT", name: "Haiti" },
      { code: "HN", name: "Honduras" },
      { code: "HU", name: "Hungary" },
      { code: "IS", name: "Iceland" },
      { code: "IN", name: "India" },
      { code: "ID", name: "Indonesia" },
      { code: "IR", name: "Iran" },
      { code: "IQ", name: "Iraq" },
      { code: "IE", name: "Ireland" },
      { code: "IL", name: "Israel" },
      { code: "IT", name: "Italy" },
      { code: "JM", name: "Jamaica" },
      { code: "JP", name: "Japan" },
      { code: "JO", name: "Jordan" },
      { code: "KZ", name: "Kazakhstan" },
      { code: "KE", name: "Kenya" },
      { code: "KI", name: "Kiribati" },
      { code: "KW", name: "Kuwait" },
      { code: "KG", name: "Kyrgyzstan" },
      { code: "LA", name: "Laos" },
      { code: "LV", name: "Latvia" },
      { code: "LB", name: "Lebanon" },
      { code: "LS", name: "Lesotho" },
      { code: "LR", name: "Liberia" },
      { code: "LY", name: "Libya" },
      { code: "LI", name: "Liechtenstein" },
      { code: "LT", name: "Lithuania" },
      { code: "LU", name: "Luxembourg" },
      { code: "MG", name: "Madagascar" },
      { code: "MW", name: "Malawi" },
      { code: "MY", name: "Malaysia" },
      { code: "MV", name: "Maldives" },
      { code: "ML", name: "Mali" },
      { code: "MT", name: "Malta" },
      { code: "MH", name: "Marshall Islands" },
      { code: "MR", name: "Mauritania" },
      { code: "MU", name: "Mauritius" },
      { code: "MX", name: "Mexico" },
      { code: "FM", name: "Micronesia" },
      { code: "MD", name: "Moldova" },
      { code: "MC", name: "Monaco" },
      { code: "MN", name: "Mongolia" },
      { code: "ME", name: "Montenegro" },
      { code: "MA", name: "Morocco" },
      { code: "MZ", name: "Mozambique" },
      { code: "MM", name: "Myanmar" },
      { code: "NA", name: "Namibia" },
      { code: "NR", name: "Nauru" },
      { code: "NP", name: "Nepal" },
      { code: "NL", name: "Netherlands" },
      { code: "NZ", name: "New Zealand" },
      { code: "NI", name: "Nicaragua" },
      { code: "NE", name: "Niger" },
      { code: "NG", name: "Nigeria" },
      { code: "KP", name: "North Korea" },
      { code: "MK", name: "North Macedonia" },
      { code: "NO", name: "Norway" },
      { code: "OM", name: "Oman" },
      { code: "PK", name: "Pakistan" },
      { code: "PW", name: "Palau" },
      { code: "PS", name: "Palestine" },
      { code: "PA", name: "Panama" },
      { code: "PG", name: "Papua New Guinea" },
      { code: "PY", name: "Paraguay" },
      { code: "PE", name: "Peru" },
      { code: "PH", name: "Philippines" },
      { code: "PL", name: "Poland" },
      { code: "PT", name: "Portugal" },
      { code: "QA", name: "Qatar" },
      { code: "RO", name: "Romania" },
      { code: "RU", name: "Russia" },
      { code: "RW", name: "Rwanda" },
      { code: "KN", name: "Saint Kitts and Nevis" },
      { code: "LC", name: "Saint Lucia" },
      { code: "VC", name: "Saint Vincent and the Grenadines" },
      { code: "WS", name: "Samoa" },
      { code: "SM", name: "San Marino" },
      { code: "ST", name: "Sao Tome and Principe" },
      { code: "SA", name: "Saudi Arabia" },
      { code: "SN", name: "Senegal" },
      { code: "RS", name: "Serbia" },
      { code: "SC", name: "Seychelles" },
      { code: "SL", name: "Sierra Leone" },
      { code: "SG", name: "Singapore" },
      { code: "SK", name: "Slovakia" },
      { code: "SI", name: "Slovenia" },
      { code: "SB", name: "Solomon Islands" },
      { code: "SO", name: "Somalia" },
      { code: "ZA", name: "South Africa" },
      { code: "KR", name: "South Korea" },
      { code: "SS", name: "South Sudan" },
      { code: "ES", name: "Spain" },
      { code: "LK", name: "Sri Lanka" },
      { code: "SD", name: "Sudan" },
      { code: "SR", name: "Suriname" },
      { code: "SE", name: "Sweden" },
      { code: "CH", name: "Switzerland" },
      { code: "SY", name: "Syria" },
      { code: "TJ", name: "Tajikistan" },
      { code: "TZ", name: "Tanzania" },
      { code: "TH", name: "Thailand" },
      { code: "TL", name: "Timor-Leste" },
      { code: "TG", name: "Togo" },
      { code: "TO", name: "Tonga" },
      { code: "TT", name: "Trinidad and Tobago" },
      { code: "TN", name: "Tunisia" },
      { code: "TR", name: "Turkey" },
      { code: "TM", name: "Turkmenistan" },
      { code: "TV", name: "Tuvalu" },
      { code: "UG", name: "Uganda" },
      { code: "UA", name: "Ukraine" },
      { code: "AE", name: "United Arab Emirates" },
      { code: "GB", name: "United Kingdom" },
      { code: "US", name: "United States" },
      { code: "UY", name: "Uruguay" },
      { code: "UZ", name: "Uzbekistan" },
      { code: "VU", name: "Vanuatu" },
      { code: "VA", name: "Vatican City" },
      { code: "VE", name: "Venezuela" },
      { code: "VN", name: "Vietnam" },
      { code: "YE", name: "Yemen" },
      { code: "ZM", name: "Zambia" },
      { code: "ZW", name: "Zimbabwe" },
    ];

    return countries.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const getAuthHeaders = (withJson = false): HeadersInit => ({
    ...(withJson ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token}`,
  });

  const resetAddressForm = () => {
    setAddressForm(emptyAddressForm);
    setEditingAddressId(null);
  };

  const startEditAddress = (address: Address) => {
    setEditingAddressId(address.id);
    setExpandedAddressId(address.id);
    setAddressForm({
      label: address.label || "",
      line1: address.line1 || "",
      line2: address.line2 || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || "",
      country: address.country || "",
      isDefault: Boolean(address.isDefault),
      notes: address.notes || "",
    });
    setAddressMessage("");
  };

  const handleDeleteAddress = async (addressId: number) => {
    const confirmed = window.confirm("Delete this address?");
    if (!confirmed) return;

    try {
      setAddressMessage("");

      const res = await fetch(`http://localhost:5000/addresses/${addressId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.error || `Failed to delete address. Status: ${res.status}`,
        );
      }

      if (editingAddressId === addressId) {
        resetAddressForm();
      }

      if (expandedAddressId === addressId) {
        setExpandedAddressId(null);
      }

      setAddressMessage(data?.message || "Address deleted successfully.");
      await fetchAddresses();
    } catch (err: any) {
      console.error("Failed to delete address", err);
      setAddressMessage(err.message || "Failed to delete address.");
    }
  };

  const fetchUser = async () => {
    const url = viewingManagedUser
      ? `http://localhost:5000/users/${id}`
      : "http://localhost:5000/me";

    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch user. Status: ${res.status}`);
    }

    const data: User = await res.json();

    setUser(data);
    setForm({
      ...data,
      role: String(data.role).toUpperCase(),
    });
  };

  const fetchCats = async () => {
    const url = viewingManagedUser
      ? "http://localhost:5000/cats"
      : "http://localhost:5000/my/cats";

    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch cats. Status: ${res.status}`);
    }

    const data: Cat[] = await res.json();
    setAllCats(data);

    if (viewingManagedUser) {
      const targetUserId = id ? Number(id) : 0;
      setCats(data.filter((cat) => cat.owner?.id === targetUserId));
    } else {
      setCats(data);
    }
  };

  const fetchAddresses = async () => {
    const url = viewingManagedUser
      ? `http://localhost:5000/users/${id}/addresses`
      : "http://localhost:5000/me/addresses";

    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch addresses. Status: ${res.status}`);
    }

    const data: Address[] = await res.json();
    setAddresses(Array.isArray(data) ? data : []);
  };

  const loadPage = async () => {
    try {
      setLoading(true);
      setPageError("");
      setInfoMessage("");
      setPasswordMessage("");
      setAddressMessage("");

      await Promise.all([fetchUser(), fetchCats(), fetchAddresses()]);
    } catch (err) {
      console.error("Failed to load page", err);
      setPageError("User data could not be loaded.");
      setUser(null);
      setForm(null);
      setCats([]);
      setAllCats([]);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, [id, admin, token]);

  const availableCats = useMemo(() => {
    if (!viewingManagedUser || !viewedUserId) return [];
    return allCats.filter((cat) => !cat.owner || cat.owner.id === viewedUserId);
  }, [allCats, viewedUserId, viewingManagedUser]);

  const handleSaveInfo = async () => {
    if (!form || !user) return;

    try {
      setInfoMessage("");

      const payload = viewingManagedUser
        ? {
            name: form.name,
            email: form.email,
            role: String(form.role).toUpperCase(),
          }
        : {
            name: form.name,
            email: form.email,
          };

      const url = viewingManagedUser
        ? `http://localhost:5000/users/${user.id}`
        : "http://localhost:5000/me";

      const res = await fetch(url, {
        method: "PUT",
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.error || `Failed to save user. Status: ${res.status}`,
        );
      }

      const updated: User = data;
      setUser(updated);
      setForm({
        ...updated,
        role: String(updated.role).toUpperCase(),
      });
      setInfoMessage("User info updated successfully.");
    } catch (err: any) {
      console.error("Failed to save user", err);
      setInfoMessage(err.message || "Failed to update user info.");
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    try {
      setPasswordMessage("");

      if (
        !newPassword ||
        !confirmPassword ||
        (!viewingManagedUser && !currentPassword)
      ) {
        setPasswordMessage("Please fill in all password fields.");
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordMessage("New password and confirm password do not match.");
        return;
      }

      if (newPassword.length < 6) {
        setPasswordMessage("New password must be at least 6 characters.");
        return;
      }

      const url = viewingManagedUser
        ? `http://localhost:5000/users/${viewedUserId}/password`
        : "http://localhost:5000/me/password";

      const payload = viewingManagedUser
        ? { newPassword }
        : { currentPassword, newPassword };

      const res = await fetch(url, {
        method: "PUT",
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.error || `Failed to change password. Status: ${res.status}`,
        );
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordMessage(data?.message || "Password changed successfully.");
    } catch (err: any) {
      console.error("Failed to change password", err);
      setPasswordMessage(err.message || "Failed to change password.");
    }
  };

  const handleSaveAddress = async () => {
    try {
      setAddressMessage("");

      if (!addressForm.line1 || !addressForm.city || !addressForm.country) {
        setAddressMessage("Line 1, city and country are required.");
        return;
      }

      const isEditing = editingAddressId !== null;

      const url = isEditing
        ? `http://localhost:5000/addresses/${editingAddressId}`
        : viewingManagedUser
          ? `http://localhost:5000/users/${viewedUserId}/addresses`
          : "http://localhost:5000/me/addresses";

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(true),
        body: JSON.stringify(addressForm),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.error || `Failed to save address. Status: ${res.status}`,
        );
      }

      setAddressMessage(
        isEditing
          ? "Address updated successfully."
          : data?.message || "Address added successfully.",
      );

      resetAddressForm();
      await fetchAddresses();
    } catch (err: any) {
      console.error("Failed to save address", err);
      setAddressMessage(err.message || "Failed to save address.");
    }
  };

  const assignCat = async () => {
    if (!viewingManagedUser || !selectedCatId || !viewedUserId) return;

    try {
      const res = await fetch(
        `http://localhost:5000/cats/${selectedCatId}/assign-owner`,
        {
          method: "POST",
          headers: getAuthHeaders(true),
          body: JSON.stringify({ ownerId: viewedUserId }),
        },
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.error || `Failed to assign cat. Status: ${res.status}`,
        );
      }

      setSelectedCatId("");
      await fetchCats();
    } catch (err) {
      console.error("Failed to assign cat", err);
    }
  };

  const removeCat = async (catId: number) => {
    if (!viewingManagedUser) return;

    try {
      const res = await fetch(
        `http://localhost:5000/cats/${catId}/remove-owner`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        },
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.error || `Failed to remove cat. Status: ${res.status}`,
        );
      }

      await fetchCats();
    } catch (err) {
      console.error("Failed to remove cat", err);
    }
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="user-page">
          <div className="user-shell">
            <div className="loading-box">
              <h2>Loading user...</h2>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (pageError || !user || !form) {
    return (
      <>
        <style>{styles}</style>
        <div className="user-page">
          <div className="user-shell">
            <div className="loading-box">
              <h2>{pageError || "User data could not be loaded."}</h2>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <div className="user-page">
        <div className="user-shell">
          <div className="hero">
            <div className="badge">
              {viewingManagedUser ? "User Details" : "My Profile"}
            </div>
            <h1 className="page-title">{user.name}</h1>
            <p className="page-subtitle">
              {viewingManagedUser
                ? "View and manage user details, owned cats, addresses, security, and settings from one page."
                : "Manage your own profile, update your account information, change your password, and manage your saved addresses."}
            </p>
          </div>

          <div className="top-actions">
            <button
              className="btn-outline"
              onClick={() => navigate(viewingManagedUser ? "/users" : "/cats")}
            >
              ← Back
            </button>
          </div>

          <div className="panel profile-card">
            <div className="profile-grid">
              <div className="avatar-panel">
                <div className="avatar">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <h2 className="user-name">{user.name}</h2>
                <div
                  className={`role-pill ${
                    String(user.role).toLowerCase() === "admin"
                      ? "role-admin"
                      : "role-user"
                  }`}
                >
                  {user.role}
                </div>
              </div>

              <div>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-label">Email</div>
                    <div className="stat-value" style={{ fontSize: 16 }}>
                      {user.email}
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-label">Owned Cats</div>
                    <div className="stat-value">{cats.length}</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-label">Addresses</div>
                    <div className="stat-value">{addresses.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="tabs">
            <button
              className={`tab-btn ${tab === "info" ? "active" : ""}`}
              onClick={() => setTab("info")}
            >
              User Info
            </button>

            <button
              className={`tab-btn ${tab === "cats" ? "active" : ""}`}
              onClick={() => setTab("cats")}
            >
              {viewingManagedUser ? "Owned Cats" : "My Cats"}
            </button>

            <button
              className={`tab-btn ${tab === "addresses" ? "active" : ""}`}
              onClick={() => setTab("addresses")}
              title="Manage saved addresses and future automation-related address data"
            >
              Addresses
            </button>

            <button
              className={`tab-btn ${tab === "security" ? "active" : ""}`}
              onClick={() => setTab("security")}
            >
              Security
            </button>

            <button
              className={`tab-btn ${tab === "settings" ? "active" : ""}`}
              onClick={() => setTab("settings")}
            >
              Settings
            </button>
          </div>

          <div className="panel content-card">
            {tab === "info" && (
              <div className="stack">
                <h3 className="section-title-inline">User Info</h3>

                {infoMessage && (
                  <div
                    className={`message ${infoMessage.includes("successfully") ? "success" : "error"}`}
                  >
                    {infoMessage}
                  </div>
                )}

                <div className="grid-2">
                  <div className="field">
                    <label>Name</label>
                    <input
                      className="input"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="field">
                    <label>Email</label>
                    <input
                      className="input"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </div>

                  {viewingManagedUser && (
                    <div className="field">
                      <label>Role</label>
                      <select
                        className="input"
                        value={String(form.role).toUpperCase()}
                        onChange={(e) =>
                          setForm({ ...form, role: e.target.value })
                        }
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="row">
                  <button className="btn" onClick={handleSaveInfo}>
                    Save User Info
                  </button>
                </div>
              </div>
            )}

            {tab === "cats" && (
              <div className="stack">
                <h3 className="section-title-inline">
                  {viewingManagedUser ? "Owned Cats" : "My Cats"}
                </h3>

                {viewingManagedUser && (
                  <div className="row">
                    <select
                      className="input"
                      value={selectedCatId}
                      onChange={(e) =>
                        setSelectedCatId(
                          e.target.value ? Number(e.target.value) : "",
                        )
                      }
                      style={{ maxWidth: 340 }}
                    >
                      <option value="">Select cat to assign</option>
                      {availableCats.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>

                    <button
                      className="btn"
                      onClick={assignCat}
                      disabled={!selectedCatId}
                    >
                      Assign Cat
                    </button>
                  </div>
                )}

                <div className="cat-list">
                  {cats.length === 0 ? (
                    <div className="muted">
                      {viewingManagedUser
                        ? "This user does not own any cats yet."
                        : "You do not own any cats yet."}
                    </div>
                  ) : (
                    cats.map((cat) => (
                      <div key={cat.id} className="cat-card">
                        <div className="cat-left">
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="cat-thumb"
                            />
                          ) : (
                            <div className="cat-thumb" />
                          )}

                          <div>
                            <div style={{ fontWeight: 800 }}>{cat.name}</div>
                            <div className="muted">
                              {cat.breed?.name || "Unknown breed"} · Age{" "}
                              {cat.age} · {cat.status}
                            </div>
                            {viewingManagedUser && cat.owner && (
                              <div className="muted">
                                Owner: {cat.owner.name}
                              </div>
                            )}
                          </div>
                        </div>

                        <div
                          className="row"
                          style={{ justifyContent: "flex-end" }}
                        >
                          <button
                            className="btn-outline"
                            onClick={() => navigate(`/cats/${cat.id}`)}
                          >
                            Open Cat
                          </button>

                          {viewingManagedUser && (
                            <button
                              className="btn-danger"
                              onClick={() => removeCat(cat.id)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {tab === "addresses" && (
              <div className="stack">
                <div className="tooltip-wrap" style={{ marginBottom: 4 }}>
                  <h3 className="section-title-inline" style={{ margin: 0 }}>
                    Addresses
                  </h3>
                  <span className="tooltip-icon">i</span>
                  <div className="tooltip-text">
                    This section is prepared for future automation flows. You
                    can store multiple addresses, mark one as default, and later
                    connect address-based actions.
                  </div>
                </div>

                {addressMessage && (
                  <div
                    className={`message ${addressMessage.includes("successfully") ? "success" : "error"}`}
                  >
                    {addressMessage}
                  </div>
                )}

                <div className="panel" style={{ padding: 16 }}>
                  <div className="tooltip-wrap" style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 800, fontSize: 18 }}>
                      {editingAddressId ? "Edit Address" : "Add New Address"}
                    </div>
                    <span className="tooltip-icon">?</span>
                    <div className="tooltip-text">
                      Save address details now, then reuse them later for
                      automation, delivery, profile sync, reminders, or admin
                      workflows.
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="field">
                      <label>Label</label>
                      <input
                        className="input"
                        placeholder="Home, Work, Delivery..."
                        value={addressForm.label}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            label: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="field">
                      <label>Country</label>
                      <select
                        className="input"
                        value={addressForm.country}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            country: e.target.value,
                          })
                        }
                      >
                        <option value="">Select country</option>
                        {countryOptions.map((country) => (
                          <option key={country.code} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label>Line 1</label>
                      <input
                        className="input"
                        placeholder="Street and house number"
                        value={addressForm.line1}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            line1: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="field">
                      <label>Line 2</label>
                      <input
                        className="input"
                        placeholder="Apartment, suite, floor..."
                        value={addressForm.line2}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            line2: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="field">
                      <label>City</label>
                      <input
                        className="input"
                        placeholder="City"
                        value={addressForm.city}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            city: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="field">
                      <label>State / Region</label>
                      <input
                        className="input"
                        placeholder="State or region"
                        value={addressForm.state}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            state: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="field">
                      <label>Postal Code</label>
                      <input
                        className="input"
                        placeholder="Postal code"
                        value={addressForm.postalCode}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            postalCode: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="field">
                      <label>Automation Notes</label>
                      <input
                        className="input"
                        placeholder="Optional notes for later automation"
                        value={addressForm.notes}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            notes: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div
                    className="row"
                    style={{ marginTop: 12, alignItems: "center" }}
                  >
                    <label
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            isDefault: e.target.checked,
                          })
                        }
                      />
                      Set as default address
                    </label>

                    <button className="btn" onClick={handleSaveAddress}>
                      {editingAddressId ? "Update Address" : "Add Address"}
                    </button>

                    {editingAddressId && (
                      <button
                        className="btn-outline"
                        onClick={resetAddressForm}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </div>

                <div className="address-list">
                  {addresses.length === 0 ? (
                    <div className="muted">No addresses added yet.</div>
                  ) : (
                    addresses.map((address) => {
                      const expanded = expandedAddressId === address.id;

                      return (
                        <div key={address.id} className="accordion-card">
                          <button
                            className="accordion-header"
                            onClick={() =>
                              setExpandedAddressId(expanded ? null : address.id)
                            }
                          >
                            <div>
                              <div
                                style={{
                                  fontWeight: 800,
                                  display: "flex",
                                  gap: 10,
                                  alignItems: "center",
                                  flexWrap: "wrap",
                                }}
                              >
                                <span>{address.label || "Address"}</span>
                                {address.isDefault && (
                                  <span className="default-pill">Default</span>
                                )}
                              </div>

                              <div className="muted">
                                {address.line1}, {address.city},{" "}
                                {address.country}
                              </div>
                            </div>

                            <div>{expanded ? "−" : "+"}</div>
                          </button>

                          {expanded && (
                            <div className="accordion-body">
                              <div className="stack" style={{ paddingTop: 12 }}>
                                <div>
                                  <span className="inline-strong">Line 1:</span>{" "}
                                  {address.line1}
                                </div>
                                {address.line2 && (
                                  <div>
                                    <span className="inline-strong">
                                      Line 2:
                                    </span>{" "}
                                    {address.line2}
                                  </div>
                                )}
                                <div>
                                  <span className="inline-strong">City:</span>{" "}
                                  {address.city}
                                </div>
                                {address.state && (
                                  <div>
                                    <span className="inline-strong">
                                      State / Region:
                                    </span>{" "}
                                    {address.state}
                                  </div>
                                )}
                                {address.postalCode && (
                                  <div>
                                    <span className="inline-strong">
                                      Postal Code:
                                    </span>{" "}
                                    {address.postalCode}
                                  </div>
                                )}
                                <div>
                                  <span className="inline-strong">
                                    Country:
                                  </span>{" "}
                                  {address.country}
                                </div>
                                {address.notes && (
                                  <div>
                                    <span className="inline-strong">
                                      Automation Notes:
                                    </span>{" "}
                                    {address.notes}
                                  </div>
                                )}

                                <div className="row" style={{ marginTop: 12 }}>
                                  <button
                                    className="btn-outline"
                                    onClick={() => startEditAddress(address)}
                                  >
                                    Edit Address
                                  </button>

                                  <button
                                    className="btn-danger"
                                    onClick={() =>
                                      handleDeleteAddress(address.id)
                                    }
                                  >
                                    Delete Address
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {tab === "security" && (
              <div className="stack">
                <h3 className="section-title-inline">Change Password</h3>

                {passwordMessage && (
                  <div
                    className={`message ${passwordMessage.includes("successfully") ? "success" : "error"}`}
                  >
                    {passwordMessage}
                  </div>
                )}

                <div className="grid-2">
                  {!viewingManagedUser && (
                    <div className="field">
                      <label>Current Password</label>
                      <input
                        type="password"
                        className="input"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value,
                          })
                        }
                        placeholder="Enter current password"
                      />
                    </div>
                  )}

                  <div className="field">
                    <label>New Password</label>
                    <input
                      type="password"
                      className="input"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="field">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      className="input"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="row">
                  <button className="btn" onClick={handleChangePassword}>
                    Change Password
                  </button>
                </div>
              </div>
            )}

            {tab === "settings" && (
              <div className="stack">
                <h3 className="section-title-inline">Settings</h3>

                <div className="switch-row">
                  <div>
                    <div style={{ fontWeight: 800 }}>Notifications</div>
                    <div className="muted">
                      Receive updates about owned cats and profile activity.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: e.target.checked,
                      })
                    }
                  />
                </div>

                <div className="switch-row">
                  <div>
                    <div style={{ fontWeight: 800 }}>Dark Mode</div>
                    <div className="muted">Keep dark interface enabled.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.darkMode}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        darkMode: e.target.checked,
                      })
                    }
                  />
                </div>

                <div className="switch-row">
                  <div>
                    <div style={{ fontWeight: 800 }}>Marketing Emails</div>
                    <div className="muted">
                      Allow promotional emails and product announcements.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.marketing}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        marketing: e.target.checked,
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
