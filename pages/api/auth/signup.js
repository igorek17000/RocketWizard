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

    const result = await db.collection("users").insertOne({
      name: name,
      email: email,
      password: hashedPassword,
      start: new Date(),
      rememberMe,
    });

    return res.status(201).json({ message: "Created user!" });
  }
};
