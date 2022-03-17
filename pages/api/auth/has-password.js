import { connectToDatabase } from "../../../lib/mongodb";
import { getSession } from "next-auth/react";
const { db } = await connectToDatabase();
