import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Avatar() {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const letter = user.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="avatar">
      {letter}
    </div>
  );
}

export default Avatar;
