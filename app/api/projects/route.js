import mongoose from 'mongoose';
import { connectDB } from '../db';

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  technologies: [String],
  link: String,
  period: String,
});

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

export async function GET(req) {
  await connectDB();
  const projects = await Project.find({});
  return Response.json(projects);
}

export async function POST(req) {
  await connectDB();
  const data = await req.json();
  const project = await Project.create(data);
  return Response.json(project);
}