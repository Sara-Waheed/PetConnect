import React from 'react';
import { Scale, FileText, ClipboardList, UserCheck, CreditCard, Image, AlertTriangle, Edit, XCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsAndConditions = () => (
  <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-4xl mx-auto">
      <Link 
        to="/" 
        className="mb-8 inline-flex items-center text-orange-600 hover:text-orange-700 font-medium text-sm"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Home
      </Link>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold text-gray-900 mb-4 flex items-center justify-center gap-3">
          <Scale className="w-8 h-8 text-orange-600" />
          Terms & Conditions
          <FileText className="w-8 h-8 text-orange-600" />
        </h1>
        <p className="text-sm text-gray-600">
          Effective Date: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-8">
        {/* Acceptance of Terms */}
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Scale className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              1. Acceptance of Terms
            </h2>
          </div>
          <p className="text-gray-700">
            By accessing or using PetConnect, you agree to be bound by these Terms and Conditions. 
            If you do not agree to these terms, you must not use our platform.
          </p>
        </div>

        {/* Services Provided */}
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-orange-100 rounded-lg">
              <ClipboardList className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              2. Services Provided
            </h2>
          </div>
          <p className="text-gray-700">
            PetConnect offers services including veterinary consultations, pet sitting, grooming appointments, 
            pet adoptions, lost and found reporting, and pet memory features. Services are subject to availability 
            and may change without prior notice.
          </p>
        </div>

        {/* User Responsibilities */}
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-orange-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              3. User Responsibilities
            </h2>
          </div>
          <p className="text-gray-700">
            Users must maintain accurate profile information, respect service providers and other users, 
            and comply with all applicable laws when using PetConnect services.
          </p>
        </div>

        {/* Payment and Transactions */}
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-orange-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              4. Payment and Transactions
            </h2>
          </div>
          <p className="text-gray-700">
            All payments must be completed through our secure payment system. PetConnect is not responsible 
            for unauthorized transactions conducted outside the platform.
          </p>
        </div>

        {/* Content and Media Uploads */}
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Image className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              5. Content and Media Uploads
            </h2>
          </div>
          <p className="text-gray-700">
            By uploading pet-related content, users grant PetConnect a non-exclusive right to use this 
            content for platform service provision purposes.
          </p>
        </div>

        {/* Limitation of Liability */}
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              6. Limitation of Liability
            </h2>
          </div>
          <p className="text-gray-700">
            PetConnect is not liable for any direct, indirect, or consequential damages arising from 
            service use. Users assume full responsibility for interactions with service providers.
          </p>
        </div>

        {/* Modifications to Terms */}
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Edit className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              7. Modifications to Terms
            </h2>
          </div>
          <p className="text-gray-700">
            We reserve the right to modify these Terms at any time. Continued platform use after changes 
            constitutes acceptance of updated terms.
          </p>
        </div>

        {/* Termination */}
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-orange-100 rounded-lg">
              <XCircle className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              8. Termination
            </h2>
          </div>
          <p className="text-gray-700">
            PetConnect reserves the right to suspend or terminate accounts violating these Terms or 
            engaging in harmful platform behavior.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default TermsAndConditions;