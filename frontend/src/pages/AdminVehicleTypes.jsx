import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import "./AdminVehicleTypes.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

function getIconUrl(iconPath) {
  if (!iconPath) return null;
  if (iconPath.startsWith("http")) return iconPath;
  if (iconPath.startsWith("/uploads/")) return `${API_BASE}${iconPath}`;
  return iconPath;
}

// ── helpers for blank structures ──────────────────────────────────────────────
const blankProblem = () => ({ name: "", price: "", hasSubOptions: false, subOptions: [] });
const blankSubOption = () => ({ label: "", price: "" });
const blankBrand = () => ({ name: "", models: [""] });
const blankEnergyType = () => ({ name: "", brands: [blankBrand()] });

// ── immutable helpers ─────────────────────────────────────────────────────────
function setAt(arr, i, fn) {
  return arr.map((item, idx) => (idx === i ? (typeof fn === "function" ? fn(item) : fn) : item));
}
function removeAt(arr, i) {
  return arr.filter((_, idx) => idx !== i);
}

// ── form state builder ────────────────────────────────────────────────────────
function buildForm(vt) {
  if (!vt) return {
    name: "", isActive: true, order: 0,
    problems: [],
    energyTypes: []
  };
  return {
    name: vt.name,
    isActive: vt.isActive,
    order: vt.order ?? 0,
    problems: vt.problems.map(p => ({
      name: p.name, price: String(p.price),
      hasSubOptions: p.hasSubOptions,
      subOptions: p.subOptions.map(s => ({ label: s.label, price: String(s.price) }))
    })),
    energyTypes: (vt.details?.energyTypes || []).map(et => ({
      name: et.name,
      brands: et.brands.map(b => ({ name: b.name, models: [...b.models] }))
    }))
  };
}

export default function AdminVehicleTypes() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(buildForm(null));
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await api.get("/vehicles/all");
      setTypes(res.data.vehicleTypes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => {
    setSelected(null);
    setForm(buildForm(null));
    setIconFile(null);
    setIconPreview(null);
    setModal("add");
  };

  const openEdit = (vt) => {
    setSelected(vt);
    setForm(buildForm(vt));
    setIconFile(null);
    setIconPreview(getIconUrl(vt.iconPath));
    setModal("edit");
  };

  const openDelete = (vt) => {
    setSelected(vt);
    setModal("delete");
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setIconFile(null);
    setIconPreview(null);
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Name is required");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("isActive", String(form.isActive));
      fd.append("order", String(form.order));
      const parsedProblems = form.problems.map(p => ({
        ...p,
        price: parseFloat(p.price) || 0,
        subOptions: p.subOptions.map(s => ({ ...s, price: parseFloat(s.price) || 0 }))
      }));
      fd.append("problems", JSON.stringify(parsedProblems));
      fd.append("details", JSON.stringify(form.energyTypes));
      if (iconFile) fd.append("icon", iconFile);

      if (modal === "add") {
        await api.post("/vehicles", fd, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await api.put(`/vehicles/${selected._id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      }
      await fetchAll();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/vehicles/${selected._id}`);
      await fetchAll();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  // ── form mutators ────────────────────────────────────────────────────────────
  const setF = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Problems
  const addProblem = () => setF("problems", [...form.problems, blankProblem()]);
  const removeProblem = (i) => setF("problems", removeAt(form.problems, i));
  const updateProblem = (i, key, val) =>
    setF("problems", setAt(form.problems, i, p => ({ ...p, [key]: val })));
  const addSubOption = (pi) =>
    setF("problems", setAt(form.problems, pi, p => ({ ...p, subOptions: [...p.subOptions, blankSubOption()] })));
  const removeSubOption = (pi, si) =>
    setF("problems", setAt(form.problems, pi, p => ({ ...p, subOptions: removeAt(p.subOptions, si) })));
  const updateSubOption = (pi, si, key, val) =>
    setF("problems", setAt(form.problems, pi, p => ({
      ...p,
      subOptions: setAt(p.subOptions, si, s => ({ ...s, [key]: val }))
    })));

  // Details / energy types
  const addEnergyType = () => setF("energyTypes", [...form.energyTypes, blankEnergyType()]);
  const removeEnergyType = (ei) => setF("energyTypes", removeAt(form.energyTypes, ei));
  const updateEnergyType = (ei, val) =>
    setF("energyTypes", setAt(form.energyTypes, ei, et => ({ ...et, name: val })));
  const addBrand = (ei) =>
    setF("energyTypes", setAt(form.energyTypes, ei, et => ({ ...et, brands: [...et.brands, blankBrand()] })));
  const removeBrand = (ei, bi) =>
    setF("energyTypes", setAt(form.energyTypes, ei, et => ({ ...et, brands: removeAt(et.brands, bi) })));
  const updateBrand = (ei, bi, val) =>
    setF("energyTypes", setAt(form.energyTypes, ei, et => ({
      ...et, brands: setAt(et.brands, bi, b => ({ ...b, name: val }))
    })));
  const addModel = (ei, bi) =>
    setF("energyTypes", setAt(form.energyTypes, ei, et => ({
      ...et, brands: setAt(et.brands, bi, b => ({ ...b, models: [...b.models, ""] }))
    })));
  const removeModel = (ei, bi, mi) =>
    setF("energyTypes", setAt(form.energyTypes, ei, et => ({
      ...et, brands: setAt(et.brands, bi, b => ({ ...b, models: removeAt(b.models, mi) }))
    })));
  const updateModel = (ei, bi, mi, val) =>
    setF("energyTypes", setAt(form.energyTypes, ei, et => ({
      ...et, brands: setAt(et.brands, bi, b => ({
        ...b, models: setAt(b.models, mi, val)
      }))
    })));

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="avt-container">
      <div className="avt-header">
        <div>
          <h1>Vehicle Types</h1>
          <p className="avt-sub">Manage vehicle icons, problems, details and pricing</p>
        </div>
        <button className="avt-add-btn" onClick={openAdd}>+ Add Vehicle Type</button>
      </div>

      {loading ? (
        <div className="avt-loading-wrap">
          <div className="avt-spinner" />
          <p>Loading vehicle types...</p>
        </div>
      ) : types.length === 0 ? (
        <div className="avt-empty-wrap">
          <div className="avt-empty-icon">🚗</div>
          <p>No vehicle types yet.</p>
          <button className="avt-add-btn" onClick={openAdd}>Add your first one</button>
        </div>
      ) : (
        <div className="avt-grid">
          {types.map(vt => {
            const iconUrl = getIconUrl(vt.iconPath);
            const totalPrices = vt.problems.reduce((acc, p) => {
              if (p.hasSubOptions && p.subOptions.length) return acc + p.subOptions.length;
              return acc + 1;
            }, 0);
            return (
              <div key={vt._id} className={`avt-card ${vt.isActive ? "" : "inactive"}`}>
                <div className="avt-card-top">
                  <div className="avt-card-icon">
                    {iconUrl
                      ? <img src={iconUrl} alt={vt.name} />
                      : <span className="avt-icon-placeholder">{vt.name.charAt(0)}</span>
                    }
                  </div>
                  <span className={`avt-badge ${vt.isActive ? "active" : "off"}`}>
                    {vt.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="avt-card-body">
                  <strong className="avt-card-name">{vt.name}</strong>
                  <div className="avt-card-stats">
                    <span>🔧 {vt.problems.length} problem{vt.problems.length !== 1 ? "s" : ""}</span>
                    <span>💰 {totalPrices} price{totalPrices !== 1 ? "s" : ""}</span>
                    <span>⚡ {(vt.details?.energyTypes || []).length} energy type{(vt.details?.energyTypes || []).length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div className="avt-card-actions">
                  <button className="avt-btn-edit" onClick={() => openEdit(vt)}>
                    ✏️ Edit
                  </button>
                  <button className="avt-btn-delete" onClick={() => openDelete(vt)}>
                    🗑 Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ADD / EDIT MODAL ─────────────────────────────────── */}
      {(modal === "add" || modal === "edit") && (
        <div className="avt-overlay" onClick={closeModal}>
          <div className="avt-modal" onClick={e => e.stopPropagation()}>
            <div className="avt-modal-header">
              <h2>{modal === "add" ? "Add Vehicle Type" : `Edit: ${selected?.name}`}</h2>
              <button className="avt-modal-close" onClick={closeModal}>✕</button>
            </div>

            <form className="avt-form" onSubmit={handleSave}>

              {/* BASICS */}
              <section className="avt-section">
                <h3>Basic Info</h3>
                <div className="avt-row">
                  <label>
                    Name
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setF("name", e.target.value)}
                      placeholder="e.g. Car"
                      required
                    />
                  </label>
                  <label>
                    Display Order
                    <input
                      type="number"
                      min="0"
                      value={form.order}
                      onChange={e => setF("order", Number(e.target.value))}
                    />
                  </label>
                  <label className="avt-toggle-label">
                    Active
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={e => setF("isActive", e.target.checked)}
                    />
                    <span className="avt-toggle-slider" />
                  </label>
                </div>
              </section>

              {/* ICON */}
              <section className="avt-section">
                <h3>Icon</h3>
                <div className="avt-icon-upload">
                  <div className="avt-icon-preview" onClick={() => fileRef.current.click()}>
                    {iconPreview
                      ? <img src={iconPreview} alt="preview" />
                      : <span>Click to upload</span>
                    }
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleIconChange}
                  />
                  <button type="button" className="avt-upload-btn" onClick={() => fileRef.current.click()}>
                    {iconPreview ? "Change Icon" : "Upload Icon"}
                  </button>
                </div>
              </section>

              {/* PROBLEMS */}
              <section className="avt-section">
                <div className="avt-section-head">
                  <h3>Problems & Pricing</h3>
                  <button type="button" className="avt-add-row" onClick={addProblem}>+ Add Problem</button>
                </div>

                {form.problems.length === 0 && (
                  <p className="avt-hint">No problems added yet.</p>
                )}

                {form.problems.map((prob, pi) => (
                  <div key={pi} className="avt-problem-block">
                    <div className="avt-problem-row">
                      <input
                        className="avt-input-grow"
                        type="text"
                        placeholder="Problem name"
                        value={prob.name}
                        onChange={e => updateProblem(pi, "name", e.target.value)}
                      />
                      <div className="avt-price-wrap">
                        <span className="avt-price-sym">$</span>
                        <input
                          className="avt-input-price"
                          type="text"
                          inputMode="decimal"
                          placeholder="0"
                          value={prob.price}
                          onChange={e => updateProblem(pi, "price", e.target.value.replace(/[^0-9.]/g, ""))}
                        />
                      </div>
                      <label className="avt-check-label">
                        <input
                          type="checkbox"
                          checked={prob.hasSubOptions}
                          onChange={e => updateProblem(pi, "hasSubOptions", e.target.checked)}
                        />
                        Sub-options
                      </label>
                      <button type="button" className="avt-remove" onClick={() => removeProblem(pi)}>✕</button>
                    </div>

                    {prob.hasSubOptions && (
                      <div className="avt-suboptions">
                        {prob.subOptions.map((so, si) => (
                          <div key={si} className="avt-suboption-row">
                            <input
                              type="text"
                              placeholder="Option label (e.g. Repair)"
                              value={so.label}
                              onChange={e => updateSubOption(pi, si, "label", e.target.value)}
                            />
                            <div className="avt-price-wrap">
                              <span className="avt-price-sym">$</span>
                              <input
                                type="text"
                                inputMode="decimal"
                                placeholder="0"
                                value={so.price}
                                onChange={e => updateSubOption(pi, si, "price", e.target.value.replace(/[^0-9.]/g, ""))}
                              />
                            </div>
                            <button type="button" className="avt-remove" onClick={() => removeSubOption(pi, si)}>✕</button>
                          </div>
                        ))}
                        <button type="button" className="avt-add-row sm" onClick={() => addSubOption(pi)}>+ Add option</button>
                      </div>
                    )}
                  </div>
                ))}
              </section>

              {/* DETAILS */}
              <section className="avt-section">
                <div className="avt-section-head">
                  <h3>Vehicle Details (Energy / Brand / Model)</h3>
                  <button type="button" className="avt-add-row" onClick={addEnergyType}>+ Add Energy Type</button>
                </div>

                {form.energyTypes.length === 0 && (
                  <p className="avt-hint">No energy types added yet.</p>
                )}

                {form.energyTypes.map((et, ei) => (
                  <div key={ei} className="avt-energy-block">
                    <div className="avt-energy-header">
                      <input
                        type="text"
                        placeholder="Energy type (e.g. Electric)"
                        value={et.name}
                        onChange={e => updateEnergyType(ei, e.target.value)}
                      />
                      <button type="button" className="avt-add-row sm" onClick={() => addBrand(ei)}>+ Brand</button>
                      <button type="button" className="avt-remove" onClick={() => removeEnergyType(ei)}>✕</button>
                    </div>

                    {et.brands.map((br, bi) => (
                      <div key={bi} className="avt-brand-block">
                        <div className="avt-brand-header">
                          <input
                            type="text"
                            placeholder="Brand name"
                            value={br.name}
                            onChange={e => updateBrand(ei, bi, e.target.value)}
                          />
                          <button type="button" className="avt-add-row sm" onClick={() => addModel(ei, bi)}>+ Model</button>
                          <button type="button" className="avt-remove" onClick={() => removeBrand(ei, bi)}>✕</button>
                        </div>

                        <div className="avt-models">
                          {br.models.map((m, mi) => (
                            <div key={mi} className="avt-model-row">
                              <input
                                type="text"
                                placeholder="Model"
                                value={m}
                                onChange={e => updateModel(ei, bi, mi, e.target.value)}
                              />
                              <button type="button" className="avt-remove" onClick={() => removeModel(ei, bi, mi)}>✕</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </section>

              <div className="avt-form-actions">
                <button type="submit" className="avt-save-btn" disabled={saving}>
                  {saving ? "Saving..." : modal === "add" ? "Create Vehicle Type" : "Save Changes"}
                </button>
                <button type="button" className="avt-cancel-btn" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ─────────────────────────────────────── */}
      {modal === "delete" && selected && (
        <div className="avt-overlay" onClick={closeModal}>
          <div className="avt-modal avt-modal-sm" onClick={e => e.stopPropagation()}>
            <h2 style={{ color: "#ef4444" }}>Delete Vehicle Type</h2>
            <p>Are you sure you want to delete <strong>{selected.name}</strong>? This cannot be undone.</p>
            <div className="avt-form-actions">
              <button className="avt-delete-confirm-btn" onClick={handleDelete} disabled={saving}>
                {saving ? "Deleting..." : "Yes, Delete"}
              </button>
              <button className="avt-cancel-btn" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
