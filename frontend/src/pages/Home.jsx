import { useState, useContext } from "react";
import "./home.css";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

function Home() {
  const { user } = useContext(AuthContext);
  const [requestStatus, setRequestStatus] = useState(null); // 'loading', 'success', 'error'

  const handleRequestMechanic = async () => {
    if (!user) {
      alert("Please login to request a mechanic");
      return;
    }

    setRequestStatus("loading");
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/services`, {
        vehicleType: vehicle,
        problem: problem,
        details: { energyType, brand, model, tyreOption, tyreSize, tyreType },
        price: prices[finalKey]
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      console.log("Request Success:", response.data);
      setRequestStatus("success");
      setTimeout(() => {
        setShowPrice(false);
        setRequestStatus(null);
        // Reset form
        setVehicle(null);
        setProblem(null);
      }, 2000);
    } catch (error) {
      console.error("Request Error:", error);
      setRequestStatus("error");
      alert("Failed to request mechanic. Please try again.");
    }
  };

  const vehicles = {
    Car: ["Flat Tyre", "Battery Dead", "Engine Overheat", "Out of Fuel", "Break Failure", "Other/Not sure"],
    Bike: ["Chain Broken", "Flat Tyre", "No Spark", "Fuel Leak", "Break Failure", "Other/Not sure"],
    Truck: ["Brake Failure", "Engine Fault", "Flat Tyre", "Battery Dead", "Other/Not sure"],
    Bus: ["Brake Failure", "Engine Fault", "Overheating", "Flat Tyre", "Other/Not sure"],
  };

  const prices = {
    "Flat Tyre-Repair": 15,
    "Flat Tyre-Replacement": 40,
    "Battery Dead": 25,
    "Engine Overheat": 40,
    "Out of Fuel": 10,
    "Chain Broken": 20,
    "No Spark": 18,
    "Fuel Leak": 35,
    "Brake Failure": 50,
    "Engine Fault": 60,
    "Overheating": 45,
    "Break Failure": 50,
    "Other/Not sure": 0
  };

  const vehicleDetails = {
    Car: {
      Electric: { Tesla: ["Model 3", "Model S"], Nissan: ["Leaf"] },
      "Non-Electric": {
        Toyota: ["Corolla", "Camry"],
        Honda: ["Civic", "Accord"],
      },
    },
    Bike: {
      Electric: { Zero: ["SR/F", "FX"] },
      "Non-Electric": {
        Yamaha: ["R15", "MT-15"],
        Bajaj: ["Pulsar", "Dominar"],
      },
    },
    Truck: {
      "Non-Electric": {
        Volvo: ["FH", "FM"],
        Tata: ["Prima", "Signa"],
      },
    },
    Bus: {
      "Non-Electric": {
        AshokLeyland: ["Viking", "Falcon"],
        Tata: ["Starbus"],
      },
    },
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
              <div className={`vehicle-grid ${vehicle ? "compact" : ""}`}>
                {Object.keys(vehicles).map((v) => (
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
                    <img src={`/icons/${v.toLowerCase()}.png`} alt={v} className="vehicle-img" />
                    <span>{v}</span>
                  </div>
                ))}
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


      {/* PRICE */}
      {showPrice && finalKey && (
        <div className="modal-overlay" onClick={() => setShowPrice(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">💰</div>
            <h2>Service Quote</h2>
            <p className="modal-summary">You selected a <strong>{vehicle}</strong> for <strong>{finalKey}</strong>.</p>

            <div className="price-container">
              <span className="price-label">Estimated Cost</span>
              <div className="price-value">${prices[finalKey]}</div>
            </div>

            <button
              className="pay-btn"
              onClick={handleRequestMechanic}
              disabled={requestStatus === 'loading'}
            >
              {requestStatus === 'loading' ? 'Processing...' : requestStatus === 'success' ? 'Request Dispatched!' : 'Request Mechanic Now'}
            </button>
            <button
              className="close-btn"
              onClick={() => setShowPrice(false)}
            >
              Go Back
            </button>
          </div>
        </div>
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
