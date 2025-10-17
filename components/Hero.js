'use client';

import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-20">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Animated Badge */}
          <motion.div
            className="inline-block"
            variants={itemVariants}
          >
            <span className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-sm text-blue-300">
              👋 Welcome to my portfolio
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6"
            variants={itemVariants}
          >
            <span className="gradient-text">Mohammad Ittehad</span>
            <br />
            <span className="text-white">Full Stack Developer</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            I build innovative web applications using modern technologies. Specializing in Next.js, Node.js, and MongoDB. Let us create something amazing together!
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            variants={itemVariants}
          >
            <motion.a
              href="#projects"
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View My Work <FiArrowRight />
            </motion.a>
            <motion.a
              href="#contact"
              className="px-8 py-3 border-2 border-blue-500 rounded-lg font-semibold hover:bg-blue-500/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get In Touch
            </motion.a>
          </motion.div>

          {/* Social Links */}
          <motion.div
            className="flex gap-6 justify-center pt-8"
            variants={itemVariants}
          >
            {[
              { icon: FaGithub, link: 'https://github.com/ittehadrahman' },
              { icon: FaLinkedin, link: 'https://linkedin.com' },
              { icon: FaEnvelope, link: 'mailto:mohammadittehad@gmail.com' },
            ].map((social, i) => (
              <motion.a
                key={i}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl text-gray-400 hover:text-blue-400 transition-colors"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <social.icon />
              </motion.a>
            ))}
          </motion.div>
        </motion.div>

        {/* Animated Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg
            className="w-6 h-6 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}