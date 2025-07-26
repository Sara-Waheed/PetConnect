import React from 'react';
import { Mail, MapPin, Clock, LifeBuoy } from 'lucide-react';

const ContactUs = () => (
  <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold text-gray-700 mb-4 flex items-center justify-center gap-3">
          <LifeBuoy className="w-8 h-8 text-lime-600" />
          Contact PetConnect Support
          <LifeBuoy className="w-8 h-8 text-lime-600" />
        </h1>
        <p className="text-sm text-gray-600 max-w-2xl mx-auto">
          We're here to help you with any questions, technical issues, or feedback about our services.
          Reach out through any of these channels:
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Email Support Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-orange-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Mail className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Email Support</h3>
              <a
                href="mailto:petconnect.it@gmail.com"
                className="text-orange-600 hover:text-orange-700 transition-colors break-all"
              >
                petconnect.it@gmail.com
              </a>
              <p className="text-sm text-gray-600 mt-2">Typical response time: 24 hours</p>
            </div>
          </div>
        </div>

        {/* Office Address Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-orange-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <MapPin className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Our Office</h3>
              <address className="not-italic text-gray-700">
                PetConnect Headquarters<br />
                1234 Paw Lane<br />
                Islamabad, Pakistan
              </address>
              <p className="text-sm text-lime-600 mt-2">
                <Clock className="inline w-4 h-4 mr-1" />
                Mon-Fri: 9AM - 5PM PST
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Immediate Help Section */}
      <div className="bg-orange-50 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Need Immediate Help?
        </h2>
        <p className="text-gray-600 mb-6 max-w-xl mx-auto">
          Click the <span className="text-orange-600 font-medium">FurMate</span> icon 
          in the bottom-right corner to chat with our AI assistant, or browse our{' '}
          <a href="/FAQs" className="text-orange-600 hover:underline font-medium">
            FAQs
          </a>
        </p>
      </div>
    </div>
  </div>
);

export default ContactUs;