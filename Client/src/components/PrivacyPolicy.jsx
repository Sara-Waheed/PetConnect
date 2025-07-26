import React from 'react';
import { Scale, Lock, Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-4xl mx-auto">
      <Link 
        to="/" 
        className="mb-8 inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </Link>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
          <Scale className="w-8 h-8 text-orange-600" />
          Privacy Policy
          <Lock className="w-8 h-8 text-orange-600" />
        </h1>
        <p className="text-lg text-gray-600">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-8">
        {/* Information & Use Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Lock className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              1. Information & Use
            </h2>
          </div>
          <div className="space-y-4 text-gray-700">
            <p>
              At PetConnect, we collect various types of information to deliver and improve our services. 
              This includes account details, profile information, data related to adoptions and 
              lost-and-found reports, service data, uploaded media for features like emotion detection 
              and the digital memory book, and usage data.
            </p>
            <p>
              We use this information to provide and manage pet care services, securely process payments, 
              facilitate pet adoptions and reunions for lost pets, power features like emotion detection 
              and the digital memory book, send confirmations, reminders, and optional updates, and 
              analyze usage patterns to enhance performance, security, and overall user experience.
            </p>
          </div>
        </div>

        {/* Sharing & Security Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              2. Sharing & Security
            </h2>
          </div>
          <div className="space-y-4 text-gray-700">
            <p>
              PetConnect may share your information with trusted service providers strictly to perform 
              services on our behalf. We also disclose data when required by law or to protect the rights, 
              safety, or property of PetConnect or its users, and in connection with business transfers 
              such as mergers, acquisitions, or sales, always under the same privacy commitments.
            </p>
            <p>
              To protect your data, we implement reasonable administrative, technical, and physical 
              safeguards and continuously review our measures. We use cookies and similar technologies 
              to keep you logged in, remember preferences, and analyze site usage; you can manage 
              cookies via your browser settings, but some functionality may be limited. PetConnect is 
              not intended for children under 16, and we do not knowingly collect personal data from 
              minors. If you believe we have, please contact us to have it removed.
            </p>
          </div>
        </div>

        {/* Your Rights Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Scale className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              3. Your Rights & Changes
            </h2>
          </div>
          <div className="space-y-4 text-gray-700">
            <p>
              We may update this Privacy Policy to reflect changes in our practices or for legal, 
              operational, or regulatory reasons. We will notify you of major changes via email 
              or a notice on our platform.
            </p>
            <p>
              You have the right to access and correct your personal information, request deletion 
              of your account and data, and opt out of marketing communications at any time. To 
              exercise these rights, please visit your account settings or contact our support team.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Reference */}
      <div className="mt-12 text-center bg-orange-50 rounded-xl p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Need Privacy Help?
        </h2>
        <p className="text-gray-600 mb-6">
          Contact our Data Protection Officer at{' '}
          <a 
            href="mailto:privacy@petconnect.com" 
            className="text-orange-600 hover:underline font-medium"
          >
            petconnect.it@gmail.com
          </a>
        </p>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;