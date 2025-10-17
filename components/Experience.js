'use client';

import { motion } from 'framer-motion';

export default function Experience() {
  const experiences = [
    {
      title: 'Full Stack Developer',
      company: 'Kernel',
      period: 'Jan 2024 - Aug 2024',
      description: 'Built production management system with RBAC, analytics dashboard, and real-time tracking.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Full Stack Developer Intern',
      company: 'Singularity Limited',
      period: 'Jun 2024 - Sep 2024',
      description: 'Developed 5+ web applications and admin dashboards using Next.js and Express.js.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Full Stack Developer',
      company: 'Al Bayt Hospital',
      period: 'Apr 2025 - May 2025',
      description: 'Deployed professional hospital website with doctor directory and appointment system.',
      color: 'from-green-500 to-teal-500',
    },
  ];

  return (
    <section id="experience" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-4xl font-bold mb-12 gradient-text"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Experience
        </motion.h2>

        <div className="space-y-8">
          {experiences.map((exp, i) => (
            <motion.div
              key={i}
              className="relative"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
            >
              <div className={`bg-gradient-to-r ${exp.color} p-0.5 rounded-lg`}>
                <div className="bg-slate-900 p-6 rounded-lg">
                  <h3 className="text-2xl font-bold text-white mb-2">{exp.title}</h3>
                  <p className={`text-lg font-semibold bg-gradient-to-r ${exp.color} bg-clip-text text-transparent mb-2`}>
                    {exp.company}
                  </p>
                  <p className="text-gray-400 mb-4">{exp.period}</p>
                  <p className="text-gray-300">{exp.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}