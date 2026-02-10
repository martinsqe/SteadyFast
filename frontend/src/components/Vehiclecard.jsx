import "./vehiclecards.css";

function VehicleCard({ title, icon, onClick }) {
  return (
    <div className="vehicle-card" onClick={onClick}>
      <div className="icon">{icon}</div>
      <h3>{title}</h3>
    </div>
  );
}
export default VehicleCard;
