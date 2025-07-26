import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faYoutube, faGooglePlay, faAppStore } from '@fortawesome/free-brands-svg-icons';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* About Section */}
          <div className="md:col-span-2">
            <h5 className="text-2xl font-bold text-orange-500 mb-4">PetConnect</h5>
            <p className="text-gray-400 text-lg leading-relaxed">
              Bridging the gap between pet lovers and care providers, ensuring 
              your furry friends receive the best possible attention and services.
            </p>
          </div>

          {/* Services Section */}
          <div className="mt-4 md:mt-0">
            <h6 className="text-lg font-semibold text-white mb-4">Our Services</h6>
            <ul className="space-y-3">
              {[
                ['Consult Veterinarian', '/vets'],
                ['Pet Sitting/Grooming', '/'],
                ['Lost & Found', '/lost'],
                ['Detect Pet Emotion', '/predict-emotion'],
                ['Pet Adoption', '/find-a-pet'],
              ].map(([text, href]) => (
                <li key={text}>
                  <a href={href} className="text-gray-400 hover:text-orange-500 transition-colors">
                    {text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Section */}
          <div className="mt-4 md:mt-0">
            <h6 className="text-lg font-semibold text-white mb-4">Legal</h6>
            <ul className="space-y-3">
              {[
                ['FAQs', '/FAQs'],
                ['Contact', '/contact'],
                ['Privacy Policy', '/privacy-policy'],
                ['Terms & Conditions', '/terms-and-conditions'],
                ['Submit a Complaint', '/complaints'],
              ].map(([text, href]) => (
                <li key={text}>
                  <a href={href} className="text-gray-400 hover:text-orange-500 transition-colors">
                    {text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <div className="order-2 md:order-1 text-center md:text-left">
            <p className="text-gray-400">
              © {new Date().getFullYear()} PetConnect. All rights reserved.
            </p>
          </div>

          {/* Social Links */}
          <div className="order-1 md:order-2 flex items-center gap-6">
            <div className="flex gap-4">
              {[
                [faFacebookF, 'https://facebook.com'],
                [faInstagram, 'https://instagram.com'],
                [faYoutube, 'https://youtube.com'],
              ].map(([icon, href]) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 transition-colors"
                >
                  <FontAwesomeIcon icon={icon} className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* App Stores */}
          <div className="order-3 flex gap-4">
            <a href="#" className="hover:opacity-80 transition-opacity">
              <FontAwesomeIcon 
                icon={faGooglePlay} 
                className="h-8 w-22 text-gray-300" 
              />
            </a>
            <a href="#" className="hover:opacity-80 transition-opacity">
              <FontAwesomeIcon 
                icon={faAppStore} 
                className="h-8 w-22 text-gray-300" 
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}