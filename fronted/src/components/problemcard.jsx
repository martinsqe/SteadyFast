import "./problemcards.css";

function ProblemCard({ title, active, onClick }) {
  return (
    <div
      className={`problem-card ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <h4>{title}</h4>
    </div>
  );
}

export default ProblemCard;
