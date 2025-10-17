'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiExternalLink, FiGithub } from 'react-icons/fi';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const defaultProjects = [
      {
        title: 'Production Management System',
        description: 'Garment factory tracking system with RBAC and analytics dashboard.',
        technologies: ['Next.js', 'Node.js', 'MongoDB', 'React'],
        image: '/projects/kernel.jpg',
        link: '#',
      },
      {
        title: 'Hospital Website',
        description: 'Professional hospital website with doctor directory and appointments.',
        technologies: ['Next.js', 'Express.js', 'MongoDB'],
        image: '/projects/albayt.jpg',
        link: '#',
      },
      {
        title: 'Admin Dashboard',
        description: 'Full-featured admin panel with real-time data visualization.',
        technologies: ['React', 'Node.js', 'PostgreSQL'],
        image: '/projects/singularity.jpg',
        link: '#',
      },
    ];
    setProjects(defaultProjects);
    setLoading(false);
  }, []);

  return (
    <section id="projects" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-4xl font-bold mb-12 gradient-text"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Featured Projects
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, i) => (
            <motion.div
              key={i}
              className="group relative overflow-hidden rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-slate-800 p-6 rounded-lg h-full flex flex-col group-hover:bg-slate-800/80 transition-colors">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray-300 mb-4 flex-grow">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((tech, j) => (
                    <span key={j} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4">
                  <motion.a
                    href={project.link}
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
                    whileHover={{ x: 5 }}
                  >
                    Live <FiExternalLink />
                  </motion.a>
                  <motion.a
                    href="https://github.com/ittehadrahman"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
                    whileHover={{ x: 5 }}
                  >
                    Code <FiGithub />
                  </motion.a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}