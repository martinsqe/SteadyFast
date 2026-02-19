export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin only." });
  }
};

export const mechanicOnly = (req, res, next) => {
  if (req.user && req.user.role === "mechanic") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Mechanic only." });
  }
};

export const clientOnly = (req, res, next) => {
  if (req.user && req.user.role === "client") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Client only." });
  }
};

