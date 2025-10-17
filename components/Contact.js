'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend } from 'react-icons/fi';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.h2
          className="text-4xl font-bold mb-12 text-center gradient-text"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Get In Touch
        </motion.h2>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <label className="block text-gray-300 mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800 border border-blue-500/30 rounded-lg focus:border-blue-500 outline-none transition-colors text-white"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800 border border-blue-500/30 rounded-lg focus:border-blue-500 outline-none transition-colors text-white"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              className="w-full px-4 py-3 bg-slate-800 border border-blue-500/30 rounded-lg focus:border-blue-500 outline-none transition-colors text-white resize-none"
              required
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Sending...' : 'Send Message'} <FiSend />
          </motion.button>

          {success && (
            <motion.p
              className="text-center text-green-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Message sent successfully! 🎉
            </motion.p>
          )}
        </motion.form>
      </div>
    </section>
  );
}