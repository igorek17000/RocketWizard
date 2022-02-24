import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { connectToDatabase } from "../../../lib/mongodb";
import { verifyPassword, hashPassword } from "../../../lib/auth";

const dailyBalance = [
  100, 250, 300, 90, 50, 70, 400, 600, 800, 600, 570, 230, 1203, 540, 10, 760,
  650, 120, 130, 140, 210, 254, 230, 450,
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

const options = {
  session: {
    jwt: true,
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        try {
          const { db } = await connectToDatabase();
          const user = await db.collection("users").findOne({
            email: credentials.email,
          });

          if (!user) throw new Error("No user found");

          if (!user.password) {
            if (!credentials.replacePassword) {
              throw new Error("Password is not valid");
            } else {
              const hashedPassword = await hashPassword(credentials.password);

              await db
                .collection("users")
                .updateOne(
                  { email: user.email },
                  { $set: { password: hashedPassword } }
                );
            }
          } else {
            const isPasswordValid = await verifyPassword(
              credentials.password,
              user.password
            );

            if (!isPasswordValid) throw new Error("Password is not valid");
          }

          return {
            name: user.name,
            email: user.email,
            image: user.image || null,
          };
        } catch (error) {
          throw new Error(error);
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const { db } = await connectToDatabase();

      const existingUser = await db
        .collection("users")
        .findOne({ email: user.email });

      if (!existingUser) {
        const result = await db.collection("users").insertOne({
          name: user.name,
          email: user.email,
          image: user.image,
          balance,
        });
      } else {
        if (user.image) {
          await db
            .collection("users")
            .updateOne({ email: user.email }, { $set: { image: user.image } });
        }
      }

      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/complete-registration",
  },
  debug: true,
};

export default (req, res) => NextAuth(req, res, options);
