export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user?.role || "unknown"} is not authorized to access this route`,
      });
    }
    next();
  };
};

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

