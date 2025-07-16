import { NextResponse } from 'next/server';
import clientPromise from "../../../lib/mongodb";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";

// This API route handles user signup and email verification
export async function POST(request) {
  let newUser;

  // ---------------------- DB and User Creation Block ----------------------
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ritul");

    const existingUser = await db.collection("users").findOne({ email });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    newUser = {
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken
    };

    await db.collection("users").insertOne(newUser);
  } catch (error) {
    console.log("MongoDB URI:", process.env.MONGODB_URI);
    console.error("Database/User creation error:", error.stack || error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }

  // ---------------------- Email Sending Block ----------------------
  try {
    const transporter = nodemailer.createTransport({
      service: "SendGrid",
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
      },

      tls: {
        rejectUnauthorized: false, 
      },
    });

    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/emailconfirmation?token=${newUser.verificationToken}`;

    await transporter.sendMail({
      from: "Ritul <e.rmullur@gmail.com>",
      to: newUser.email,
      replyTo: "Ritul <e.rmullur@gmail.com>",
      subject: "Medist Email Verification",
      html: `
        <h2>Email Verification</h2>
        <p>Hello ${newUser.name},</p>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationUrl}">Verify Email</a>
      `,
    });

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Email sending error:", error.stack || error);
    return NextResponse.json({ error: "User created, but failed to send verification email" }, { status: 500 });
  }
}