'use client';

import { motion } from 'framer-motion';

export default function Skills() {
  const skillCategories = [
    {
      category: 'Frontend',
      skills: ['React', 'Next.js', 'HTML5', 'CSS3', 'Tailwind CSS', 'Framer Motion'],
      color: 'from-blue-500 to-cyan-500',
    },
    {
      category: 'Backend',
      skills: ['Node.js', 'Express.js', 'Django', 'REST APIs', 'Authentication'],
      color: 'from-purple-500 to-pink-500',
    },
    {
      category: 'Databases',
      skills: ['MongoDB', 'MySQL', 'PostgreSQL', 'Data Modeling'],
      color: 'from-green-500 to-teal-500',
    },
    {
      category: 'Tools',
      skills: ['Git', 'Docker', 'Postman', 'VS Code', 'Jira'],
      color: 'from-orange-500 to-red-500',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <section id="skills" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-4xl font-bold mb-12 gradient-text"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Skills & Technologies
        </motion.h2>

        <motion.div
          className="grid md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {skillCategories.map((cat, i) => (
            <motion.div
              key={i}
              className={`bg-gradient-to-r ${cat.color} p-0.5 rounded-lg`}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-slate-900 p-8 rounded-lg">
                <h3 className={`text-2xl font-bold bg-gradient-to-r ${cat.color} bg-clip-text text-transparent mb-6`}>
                  {cat.category}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {cat.skills.map((skill, j) => (
                    <motion.span
                      key={j}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}