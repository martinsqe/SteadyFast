import { useState, useContext, useEffect } from "react";
import "./home.css";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import PlatformFeeModal from "../components/Client/PlatformFeeModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_BASE = API_URL.replace("/api", "");

function Home() {
  const { user } = useContext(AuthContext);
  // ── dynamic vehicle data from DB ────────────────────────────────────────────
  const [vehicleTypes, setVehicleTypes] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/vehicles`)
      .then(res => setVehicleTypes(res.data.vehicleTypes || []))
      .catch(() => setVehicleTypes([]));
  }, []);

  // Build the shape the rest of the UI expects from fetched data,
  // falling back to hardcoded defaults if nothing is in the DB yet.
  const FALLBACK_VEHICLES = {
    Car:   ["Flat Tyre", "Battery Dead", "Engine Overheat", "Out of Fuel", "Break Failure", "Other/Not sure"],
    Bike:  ["Chain Broken", "Flat Tyre", "No Spark", "Fuel Leak", "Break Failure", "Other/Not sure"],
    Truck: ["Brake Failure", "Engine Fault", "Flat Tyre", "Battery Dead", "Other/Not sure"],
    Bus:   ["Brake Failure", "Engine Fault", "Overheating", "Flat Tyre", "Other/Not sure"],
  };

  const FALLBACK_PRICES = {
    "Flat Tyre-Repair": 15, "Flat Tyre-Replacement": 40, "Battery Dead": 25,
    "Engine Overheat": 40, "Out of Fuel": 10, "Chain Broken": 20,
    "No Spark": 18, "Fuel Leak": 35, "Brake Failure": 50,
    "Engine Fault": 60, "Overheating": 45, "Break Failure": 50, "Other/Not sure": 0
  };

  const FALLBACK_DETAILS = {
    Car:  { Electric: { Tesla: ["Model 3", "Model S"], Nissan: ["Leaf"] }, "Non-Electric": { Toyota: ["Corolla", "Camry"], Honda: ["Civic", "Accord"] } },
    Bike: { Electric: { Zero: ["SR/F", "FX"] }, "Non-Electric": { Yamaha: ["R15", "MT-15"], Bajaj: ["Pulsar", "Dominar"] } },
    Truck:{ "Non-Electric": { Volvo: ["FH", "FM"], Tata: ["Prima", "Signa"] } },
    Bus:  { "Non-Electric": { AshokLeyland: ["Viking", "Falcon"], Tata: ["Starbus"] } },
  };

  const useDB = vehicleTypes.length > 0;

  // vehicles map: { name -> [problem names] }
  const vehicles = useDB
    ? Object.fromEntries(vehicleTypes.map(vt => [vt.name, vt.problems.map(p => p.name)]))
    : FALLBACK_VEHICLES;

  // prices map: { "Problem" or "Problem-SubOption" -> price }
  const prices = useDB
    ? vehicleTypes.reduce((acc, vt) => {
        vt.problems.forEach(p => {
          if (p.hasSubOptions && p.subOptions.length > 0) {
            p.subOptions.forEach(so => { acc[`${p.name}-${so.label}`] = so.price; });
          } else {
            acc[p.name] = p.price;
          }
        });
        return acc;
      }, {})
    : FALLBACK_PRICES;

  // vehicleDetails: { name -> { energyType -> { brand -> [models] } } }
  const vehicleDetails = useDB
    ? Object.fromEntries(vehicleTypes.map(vt => [
        vt.name,
        Object.fromEntries(
          (vt.details?.energyTypes || []).map(et => [
            et.name,
            Object.fromEntries(et.brands.map(b => [b.name, b.models]))
          ])
        )
      ]))
    : FALLBACK_DETAILS;

  // icon lookup
  const getVehicleIcon = (name, iconPath) => {
    if (!iconPath) return `/icons/${name.toLowerCase()}.png`;
    if (iconPath.startsWith("http")) return iconPath;
    if (iconPath.startsWith("/uploads/")) return `${API_BASE}${iconPath}`;
    return iconPath;
  };

  const tyreSizes = ["14 inch", "15 inch", "16 inch", "17 inch"];
  const tyreTypes = ["Tubeless", "Tube", "All-Terrain"];

  const [vehicle, setVehicle] = useState(null);
  const [problem, setProblem] = useState(null);
  const [energyType, setEnergyType] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [tyreOption, setTyreOption] = useState("");
  const [tyreSize, setTyreSize] = useState("");
  const [tyreType, setTyreType] = useState("");
  const [showPrice, setShowPrice] = useState(false);
  const [showFeePayment, setShowFeePayment] = useState(false);

  const finalKey =
    problem === "Flat Tyre" ? `Flat Tyre-${tyreOption}` : problem;

  return (
    <div className="home-container">
      <h1 className="hero-title">SteadyFast</h1>
      <p className="hero-sub">24/7 Online Roadside Assistance,
        Let's get you back on the road fast!
      </p>

      {user && (
        <div className="welcome-banner">
          <h2>Welcome, <span className="user-highlight">{user.name}</span>!</h2>
        </div>
      )}

      <section className="diagnosis-section">
        <div className="diagnosis-header">
          <h2>Diagnosis & Assistance</h2>
          <p>Tell us what's wrong and get a solution in just 10 minutes.</p>
        </div>

        <div className="diagnosis-card">
          {/* STEP 1: VEHICLE */}
          <div className="diagnosis-step active">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Select Vehicle</h3>
              <div className={`vehicle-carousel ${vehicle ? "compact" : ""}`}>
                {(useDB ? vehicleTypes : Object.keys(vehicles).map(n => ({ name: n, iconPath: "" }))).map((vt) => {
                  const v = vt.name;
                  return (
                    <div
                      key={v}
                      className={`vehicle-card ${vehicle === v ? "active" : ""} ${vehicle && vehicle !== v ? "faded" : ""}`}
                      onClick={() => {
                        setVehicle(v);
                        setProblem(null);
                        setEnergyType("");
                        setBrand("");
                        setModel("");
                        setTyreOption("");
                        setTyreSize("");
                        setTyreType("");
                        setShowPrice(false);
                      }}
                    >
                      <img src={getVehicleIcon(v, vt.iconPath)} alt={v} className="vehicle-img" />
                      <span>{v}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* STEP 2: PROBLEM */}
          <div className={`diagnosis-step ${vehicle ? "active" : "disabled"}`}>
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>What's wrong?</h3>
              {vehicle ? (
                <div className="problem-grid">
                  {vehicles[vehicle].map((p) => (
                    <div
                      key={p}
                      className={`problem-card ${problem === p ? "active" : ""}`}
                      onClick={() => {
                        setProblem(p);
                        setEnergyType("");
                        setBrand("");
                        setModel("");
                        setTyreOption("");
                        setTyreSize("");
                        setTyreType("");
                        setShowPrice(false);
                      }}
                    >
                      {p}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="step-placeholder">Select a vehicle first</p>
              )}
            </div>
          </div>

          {/* STEP 3: DETAILS */}
          <div className={`diagnosis-step ${problem ? "active" : "disabled"}`}>
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Vehicle Details</h3>
              {problem ? (
                <div className="detail-grid">
                  <div className="detail-col">
                    <label>Fuel/Energy Type</label>
                    <select value={energyType} onChange={(e) => setEnergyType(e.target.value)}>
                      <option value="">Select Type</option>
                      {Object.keys(vehicleDetails[vehicle]).map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {energyType && (
                    <div className="detail-col">
                      <label>Brand</label>
                      <select value={brand} onChange={(e) => setBrand(e.target.value)}>
                        <option value="">Select Brand</option>
                        {Object.keys(vehicleDetails[vehicle][energyType]).map((b) => (
                          <option key={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {brand && (
                    <div className="detail-col">
                      <label>Model</label>
                      <select value={model} onChange={(e) => setModel(e.target.value)}>
                        <option value="">Select Model</option>
                        {vehicleDetails[vehicle][energyType][brand].map((m) => (
                          <option key={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* TYRE EXTRA */}
                  {problem === "Flat Tyre" && model && (
                    <div className="tyre-details full-width">
                      <div className="detail-col">
                        <label>Service Type</label>
                        <select value={tyreOption} onChange={(e) => setTyreOption(e.target.value)}>
                          <option value="">Repair or Replace?</option>
                          <option value="Repair">Repair</option>
                          <option value="Replacement">Replacement</option>
                        </select>
                      </div>

                      {tyreOption && (
                        <>
                          <div className="detail-col">
                            <label>Tyre Size</label>
                            <select value={tyreSize} onChange={(e) => setTyreSize(e.target.value)}>
                              <option value="">Select Tyre Size</option>
                              {tyreSizes.map((s) => (
                                <option key={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                          <div className="detail-col">
                            <label>Tyre Type</label>
                            <select value={tyreType} onChange={(e) => setTyreType(e.target.value)}>
                              <option value="">Select Tyre Type</option>
                              {tyreTypes.map((t) => (
                                <option key={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {model && (problem !== "Flat Tyre" || (tyreOption && tyreSize && tyreType)) && (
                    <button className="confirm-btn full-width" onClick={() => setShowPrice(true)}>
                      Continue to Pricing →
                    </button>
                  )}
                </div>
              ) : (
                <p className="step-placeholder">Specify the problem first</p>
              )}
            </div>
          </div>
        </div>
      </section>


      {/* STEP 1 — SERVICE QUOTE */}
      {showPrice && !showFeePayment && finalKey && (
        <div className="modal-overlay" onClick={() => setShowPrice(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">💰</div>
            <h2>Service Quote</h2>
            <p className="modal-summary">You selected a <strong>{vehicle}</strong> for <strong>{finalKey}</strong>.</p>

            <div className="price-container">
              <span className="price-label">Estimated Service Cost</span>
              <div className="price-value">${prices[finalKey]}</div>
            </div>

            <div className="platform-fee-note">
              <span>Pay $1 to dispatch mechanic</span>
            </div>

            <button className="pay-btn" onClick={() => setShowFeePayment(true)}>
              Continue to Payment →
            </button>
            <button className="close-btn" onClick={() => setShowPrice(false)}>
              Go Back
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 — PLATFORM FEE PAYMENT MODAL */}
      {showFeePayment && (
        <PlatformFeeModal
          vehicle={vehicle}
          problem={finalKey}
          servicePayload={{
            vehicleType: vehicle,
            problem: problem,
            details: { energyType, brand, model, tyreOption, tyreSize, tyreType },
            price: prices[finalKey],
          }}
          onClose={() => setShowFeePayment(false)}
          onSuccess={(_, requestId, mechanicsCount) => {
            setShowFeePayment(false);
            setShowPrice(false);
            const message = mechanicsCount > 0
              ? `Payment confirmed! Your request has been sent to ${mechanicsCount} nearby mechanic${mechanicsCount > 1 ? "s" : ""}. Check "Active Jobs" to track progress!`
              : `Payment confirmed! Searching for available mechanics. Check "Active Jobs" to track your request.`;
            alert(message);
            setVehicle(null);
            setProblem(null);
          }}
        />
      )}

      {/* CAROUSEL */}
      <div className="carousel-section">
        <h2>Common Roadside Problems</h2>
        <div className="carousel-track">
          {[
            "accidents",
            "wiring",
            "wheel",
            "radiator",
            "oil",
            "tyre",
            "truck_tyre",
            "let_us_help_you",
            "glass",
            "fuel",
            "fraud",
            "breakdown",
            "battery",
            "approved",
            "chain",
          ].map((img, i) => (
            <div key={i} className="carousel-card">
              <img src={`/problems/${img}.jpg`} alt={img} />
              <div className="carousel-overlay">
                <span>{img.replace("-", " ")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
