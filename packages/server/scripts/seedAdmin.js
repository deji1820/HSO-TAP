import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User.js";
import { connectDB } from "../src/config/db.js";

// Usage: node scripts/seedAdmin.js "Admin Name" admin@nufv.edu.ph yourpassword
async function main() {
  const [name, email, password] = process.argv.slice(2);
  if (!name || !email || !password) {
    console.error('Usage: node scripts/seedAdmin.js "Admin Name" admin@nufv.edu.ph yourpassword');
    process.exit(1);
  }

  await connectDB();

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { name, email: email.toLowerCase(), passwordHash, role: "admin" },
    { upsert: true, new: true }
  );

  console.log(`Admin user ready: ${user.email} (role: ${user.role})`);
  await mongoose.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
