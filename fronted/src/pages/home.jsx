import { useState } from "react";
import "./home.css";

function Home() {
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
      <h3>Tell Us the patient and Get solution in just 10 minutes.</h3>

      {/* VEHICLES */}
      <div className={`vehicle-grid ${vehicle ? "vehicle-selected" : ""}`}>
        {Object.keys(vehicles).map((v) => (
          <div
            key={v}
            className={`vehicle-card ${
              vehicle === v ? "active main" : ""
            } ${vehicle && vehicle !== v ? "faded" : ""}`}
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
            <img
              src={`/icons/${v.toLowerCase()}.png`}
              alt={v}
              className="vehicle-img"
            />
            <h3>{v}</h3>
          </div>
        ))}
      </div>

      {vehicle && (
        <button
          className="change-vehicle-btn"
          onClick={() => {
            setVehicle(null);
            setProblem(null);
            setShowPrice(false);
          }}
        >
          ← Change Vehicle
        </button>
      )}

      {/* PROBLEMS */}
      {vehicle && (
        <div className="problem-section">
          <h2>What’s wrong with your {vehicle}?</h2>

          <div className="problem-grid">
            {vehicles[vehicle].map((p) => (
              <div
                key={p}
                className={`problem-card ${
                  problem === p ? "active" : ""
                }`}
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
        </div>
      )}

      {/* DETAILS */}
      {problem && (
        <div className="detail-box">
          <h3>Vehicle Details</h3>

          <select
            value={energyType}
            onChange={(e) => setEnergyType(e.target.value)}
          >
            <option value="">Select Type</option>
            {Object.keys(vehicleDetails[vehicle]).map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>

          {energyType && (
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            >
              <option value="">Select Brand</option>
              {Object.keys(
                vehicleDetails[vehicle][energyType]
              ).map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          )}

          {brand && (
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="">Select Model</option>
              {vehicleDetails[vehicle][energyType][brand].map(
                (m) => (
                  <option key={m}>{m}</option>
                )
              )}
            </select>
          )}

          {/* TYRE EXTRA */}
          {problem === "Flat Tyre" && model && (
            <>
              <select
                value={tyreOption}
                onChange={(e) =>
                  setTyreOption(e.target.value)
                }
              >
                <option value="">Repair or Replace?</option>
                <option value="Repair">Repair</option>
                <option value="Replacement">Replacement</option>
              </select>

              {tyreOption && (
                <>
                  <select
                    value={tyreSize}
                    onChange={(e) =>
                      setTyreSize(e.target.value)
                    }
                  >
                    <option value="">Select Tyre Size</option>
                    {tyreSizes.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>

                  <select
                    value={tyreType}
                    onChange={(e) =>
                      setTyreType(e.target.value)
                    }
                  >
                    <option value="">Select Tyre Type</option>
                    {tyreTypes.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </>
              )}
            </>
          )}

          {model &&
            (problem !== "Flat Tyre" ||
              (tyreOption && tyreSize && tyreType)) && (
              <button
                className="confirm-btn"
                onClick={() => setShowPrice(true)}
              >
                Continue to Pricing →
              </button>
            )}
        </div>
      )}

      {/* PRICE */}
      {showPrice && finalKey && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Service Price</h2>
            <p>{finalKey}</p>
            <h1>${prices[finalKey]}</h1>

            <button className="pay-btn">
              Request Mechanic
            </button>
            <button
              className="close-btn"
              onClick={() => setShowPrice(false)}
            >
              Cancel
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
