import { useState } from 'react';
import { ChevronDown, PawPrint } from 'lucide-react';

const faqs = [
  {
    question: 'What is PetConnect?',
    answer: 'PetConnect is your one-stop platform for all pet care needs, bringing together services like veterinary consultations, grooming, pet sitting, adoption, and more in a few clicks.'
  },
  {
    question: 'Who can use PetConnect?',
    answer: 'Anyone who loves pets! Pet owners, adopters looking for a new furry friend, or anyone who finds a lost pet can use PetConnect without any special technical knowledge.'
  },
  {
    question: 'How do I create an account?',
    answer: 'Simply click Sign Up, fill in your details, choose your role (pet owner, adopter, or service provider), and verify your email to get started.' },
  {
    question: 'How can I book a pet care service?',
    answer: 'Go to the Services section, pick the service you need (like vet consult or grooming), choose your preferred date and time, and confirm your booking.'
  },
  {
    question: 'How do I adopt a pet?',
    answer: 'Browse pets available for adoption, read their profiles, and click Adopt. You’ll be guided through the adoption steps right on the platform.'
  },
  {
    question: 'What should I do if I find a lost pet?',
    answer: 'Head to the Lost & Found page, post details and a photo of the pet you found. We’ll help match them with their owner.'
  },
  {
    question: 'How does pet emotion detection work?',
    answer: 'Upload a clear photo of your pet, and our system will analyze their expression to give you insights into how they might be feeling.'
  },
  {
    question: 'What is the digital pet memory book?',
    answer: 'A personalized album where you can save and share your pet’s photos, milestones, and special moments all in one place.'
  },
  {
    question: 'Where can I find pet care tips and articles?',
    answer: 'Visit our Pet Care Blog for expert advice, tips, and the latest news on pet health and well-being.'
  },
  {
    question: 'How do I make a payment?',
    answer: 'Payments are easy and secure. After booking, choose your payment method and complete the transaction through our encrypted gateway.'
  },
  {
    question: 'I still have questions. How can I get help?',
    answer: 'No problem! Visit the Contact Us page to send us a message or chat with our support team.'
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <PawPrint className="w-8 h-8 text-orange-600" />
            PetConnect FAQs
            <PawPrint className="w-8 h-8 text-orange-600" />
          </h1>
          <p className="text-lg text-gray-600">
            Quick answers to common questions about our services
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((item, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-orange-100"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-xl"
              >
                <span className="text-lg font-semibold text-gray-800 pr-4">
                  {item.question}
                </span>
                <ChevronDown 
                  className={`w-6 h-6 text-orange-600 transform transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-6 pb-5 pt-2 border-t border-orange-50">
                  <p className="text-gray-700 leading-relaxed">
                    {item.answer}
                    {index === 9 && ( // For the last question about contact
                      <a 
                        href="/contact" 
                        className="ml-2 text-orange-600 hover:underline font-medium"
                      >
                        Contact us here
                      </a>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Help Section */}
        <div className="mt-12 text-center bg-orange-50 rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Still need help?
          </h2>
          <p className="text-gray-600 mb-6">
            Our support team is ready to assist you
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-lime-600 to-teal-700 text-white font-medium rounded-lg hover:opacity-90 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}