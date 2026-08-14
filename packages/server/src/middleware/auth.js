import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing auth token" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

/** Separate, simpler check for the kiosk device — it's a shared device, not a logged-in staff account. */
export function requireKioskKey(req, res, next) {
  const key = req.headers["x-kiosk-key"];
  if (key !== process.env.KIOSK_API_KEY) {
    return res.status(401).json({ message: "Invalid kiosk key" });
  }
  next();
}
