import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { connectToDatabase } from "../../../lib/mongodb";
import { verifyPassword, hashPassword } from "../../../lib/auth";
var CryptoJS = require("crypto-js");

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
          start: new Date(),
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
    session: async (session) => {
      if (!session) return;

      const signature = CryptoJS.AES.encrypt(
        process.env.rwSignature,
        process.env.cryptKey
      ).toString();

      session.session.rwSignature = signature;

      session = session.session;

      return Promise.resolve(session);
    },
  },
  debug: true,
};

export default (req, res) => NextAuth(req, res, options);
