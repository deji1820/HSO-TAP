import "dotenv/config";
import mongoose from "mongoose";
import Student from "../src/models/Student.js";
import { connectDB } from "../src/config/db.js";

// Usage: node scripts/seedStudent.js 2024-100123 "Maria" "Santos" "BS Information Technology" "2nd Year"
async function main() {
  const [studentId, firstName, lastName, program, yearLevel] = process.argv.slice(2);
  if (!studentId || !firstName || !lastName) {
    console.error('Usage: node scripts/seedStudent.js 2024-100123 "Maria" "Santos" "BS Information Technology" "2nd Year"');
    process.exit(1);
  }

  await connectDB();

  const student = await Student.findOneAndUpdate(
    { studentId },
    { studentId, firstName, lastName, program, yearLevel, schoolYear: "2026-2027", isActive: true },
    { upsert: true, new: true }
  );

  console.log(`Student ready: ${student.studentId} — ${student.firstName} ${student.lastName}`);
  await mongoose.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
