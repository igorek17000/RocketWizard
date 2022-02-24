import { hashPassword } from "../../../lib/auth";
import { connectToDatabase } from "../../../lib/mongodb";

export default async (req, res) => {
  if (req.method === "POST") {
    const { name, email, password, rememberMe } = req.body;

    if (
      !email ||
      !email.includes("@") ||
      !password ||
      !password.trim().length > 7
    ) {
      return res.status(422).json({ message: "Invalid input!" });
    }

    const { db } = await connectToDatabase();

    const existingUser = await db.collection("users").findOne({ email: email });

    if (existingUser) {
      return res.status(422).json({ message: "User is already registered." });
    }

    const hashedPassword = await hashPassword(password);

    const dailyBalance = [
      100, 250, 300, 90, 50, 70, 400, 600, 800, 600, 570, 230, 1203, 540, 10,
      760, 650, 120, 130, 140, 210, 254, 230, 450,
    ];

    const weeklyBalance = [
      200, 560, 340, 540, 650, 1200, 760, 100, 200, 500, 1200, 230, 560, 10,
    ];

    const monthlyBalance = [
      1203, 3456, 120, 3012, 3065, 3120, 31023, 123, 1209, 120, 31, 2030, 1230,
      1203, 1220, 12304, 304, 2034, 230, 40234, 23, 40, 230, 1, 100000,
    ];

    const balance = {
      daily: dailyBalance,
      weekly: weeklyBalance,
      monthly: monthlyBalance,
    };

    const result = await db.collection("users").insertOne({
      name: name,
      email: email,
      password: hashedPassword,
      balance,
      rememberMe,
    });

    return res.status(201).json({ message: "Created user!" });
  }
};
