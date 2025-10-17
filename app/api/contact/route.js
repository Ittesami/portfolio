import { connectDB } from '../db';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req) {
  try {
    await connectDB();
    const { name, email, message } = await req.json();

    // Save to database
    const contact = await Contact.create({ name, email, message });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Portfolio - Message Received',
      html: `<h1>Thank you, ${name}!</h1><p>I received your message and will get back to you soon.</p>`,
    });

    return Response.json({ success: true, contact });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}