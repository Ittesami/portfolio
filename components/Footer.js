'use client';

import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-slate-900/50 to-blue-900/50 border-t border-blue-500/20 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="grid md:grid-cols-3 gap-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <h3 className="text-xl font-bold gradient-text mb-4">ITTEHAD</h3>
            <p className="text-gray-400">Full Stack Developer | Building amazing web experiences</p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#home" className="hover:text-blue-400 transition">Home</a></li>
              <li><a href="#projects" className="hover:text-blue-400 transition">Projects</a></li>
              <li><a href="#contact" className="hover:text-blue-400 transition">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Follow Me</h4>
            <div className="flex gap-4">
              {[
                { icon: FaGithub, link: 'https://github.com/ittehadrahman' },
                { icon: FaLinkedin, link: 'https://linkedin.com' },
                { icon: FaTwitter, link: 'https://twitter.com' },
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl text-gray-400 hover:text-blue-400 transition-colors"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                >
                  <social.icon />
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="border-t border-blue-500/20 pt-8 text-center text-gray-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p>© 2025 Mohammad Ittehad. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
}