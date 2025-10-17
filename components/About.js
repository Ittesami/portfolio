'use client';

import { motion } from 'framer-motion';

export default function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <section id="about" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-4xl font-bold mb-12 gradient-text"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          About Me
        </motion.h2>

        <motion.div
          className="grid md:grid-cols-2 gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants}>
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              I am a passionate Full Stack Developer with 1+ years of professional experience building scalable web applications using modern technologies. I love creating innovative solutions to real-world problems.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              When I am not coding, you can find me exploring new technologies, contributing to open-source projects, or learning new frameworks. I am always excited to take on new challenges!
            </p>
          </motion.div>

          <motion.div
            className="space-y-4"
            variants={itemVariants}
          >
            {['React & Next.js', 'Node.js & Express', 'MongoDB & Databases', 'RESTful APIs', 'Problem Solving', 'Team Collaboration'].map((skill, i) => (
              <motion.div
                key={i}
                className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:border-blue-500/50 transition-colors"
                whileHover={{ x: 10 }}
              >
                <p className="font-semibold text-blue-300">{skill}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}