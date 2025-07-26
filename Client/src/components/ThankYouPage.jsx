// src/components/ThankYouPage.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Sparkles } from "lucide-react";

const ThankYouPage = () => {
  const location = useLocation();
  const message = new URLSearchParams(location.search).get("message") || 
                  "Thank you for your valuable feedback!";

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const childVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-50 flex items-center justify-center p-4">
      <motion.div 
        className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Floating sparkles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-yellow-400"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 360],
                opacity: [0, 0.8, 0]
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            >
              <Sparkles size={20} />
            </motion.div>
          ))}
        </div>

        {/* Main content */}
        <motion.div variants={childVariants}>
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-24 h-24 text-green-500 animate-bounce" />
          </div>
        </motion.div>

        <motion.h1 
          className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4"
          variants={childVariants}
        >
          Feedback Received!
        </motion.h1>

        <motion.p 
          className="text-xl text-gray-600 mb-8 max-w-md mx-auto"
          variants={childVariants}
        >
          {message}
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row justify-center gap-4"
          variants={childVariants}
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-teal-600 to-green-600 text-white rounded-full hover:from-teal-700 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Return Home
          </Link>
        </motion.div>

        <motion.div 
        className="mt-8 text-gray-500 text-sm"
        variants={childVariants}
        >
            <p className="mb-2">Your feedback helps improve our services!</p>
            <div className="flex justify-center space-x-4">
                <Link 
                to="/blogs" 
                className="text-teal-600 hover:text-teal-800 font-medium transition-colors cursor-pointer"
                >
                Read our blogs
                </Link>
                <span className="text-gray-400">•</span>
                <Link 
                to="/FAQs" 
                className="text-teal-600 hover:text-teal-800 font-medium transition-colors cursor-pointer"
                >
                Visit FAQs
                </Link>
            </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ThankYouPage;