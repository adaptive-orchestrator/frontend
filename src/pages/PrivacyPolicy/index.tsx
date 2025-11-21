import { Footer } from '@/components/common/Footer';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  const baseURL = import.meta.env.BASE_URL;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 py-5 sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-6 flex items-center">
          <Link
            to={baseURL}
            className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold ml-4 text-gray-900 dark:text-white">Privacy Policy</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Introduction</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Welcome to OctalTask. This Privacy Policy explains how we collect, use, disclose, and safeguard 
              your information when you use our microservices-based business management platform. This is a 
              university project developed by students from the University of Information Technology - VNUHCM.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Information We Collect</h3>
            
            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-4 mb-2">Personal Information</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              When you register for an account, we may collect:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>Full name</li>
              <li>Email address</li>
              <li>Password (encrypted)</li>
              <li>Role (Customer or Business Owner)</li>
              <li>Business model preferences (for Business Owners)</li>
            </ul>

            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-4 mb-2">Usage Data</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              We automatically collect certain information when you use our platform:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>Browser type and version</li>
              <li>IP address</li>
              <li>Pages visited and time spent</li>
              <li>Device information</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">How We Use Your Information</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li><strong>Account Management:</strong> Create and manage your user account</li>
              <li><strong>Service Delivery:</strong> Provide access to retail, subscription, or freemium business models</li>
              <li><strong>Communication:</strong> Send you updates, newsletters, and important notifications</li>
              <li><strong>Improvement:</strong> Analyze usage patterns to improve our platform</li>
              <li><strong>Security:</strong> Protect against fraud and unauthorized access</li>
              <li><strong>AI Features:</strong> Process data for LLM-based orchestration and recommendations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Data Storage and Security</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li><strong>Encryption:</strong> Passwords are hashed using bcrypt</li>
              <li><strong>JWT Authentication:</strong> Secure token-based authentication</li>
              <li><strong>Database Security:</strong> Data stored in secure MySQL databases</li>
              <li><strong>Kubernetes:</strong> Containerized deployment with namespace isolation</li>
              <li><strong>Access Control:</strong> Role-based access control (RBAC)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Third-Party Services</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Our platform may integrate with the following third-party services:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li><strong>LLM APIs:</strong> For AI-powered orchestration and code generation</li>
              <li><strong>Payment Processors:</strong> For handling subscription payments (if applicable)</li>
              <li><strong>Analytics Tools:</strong> For monitoring and improving service performance</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              Each third-party service has its own privacy policy. We recommend reviewing them.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Cookies</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              We use cookies and similar tracking technologies to enhance your experience:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li><strong>Essential Cookies:</strong> Required for authentication and security</li>
              <li><strong>Preference Cookies:</strong> Remember your theme and language settings</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how you use our platform</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Your Rights</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              You have the following rights regarding your personal data:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Receive your data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Children's Privacy</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Our platform is not intended for users under the age of 18. We do not knowingly collect 
              personal information from children. If you believe we have inadvertently collected such 
              information, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Changes to This Privacy Policy</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We may update this Privacy Policy from time to time. We will notify you of any changes by 
              posting the new policy on this page and updating the "Last updated" date. You are advised 
              to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Academic Project Disclaimer</h3>
            <p className="text-gray-700 dark:text-gray-300">
              OctalTask is an academic project developed for educational purposes at the University of 
              Information Technology - VNUHCM. While we take data security seriously, this platform is 
              primarily for demonstration and learning purposes.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Contact Us</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300"><strong>Email:</strong> 22521278@gm.uit.edu.vn or 22520762@gm.uit.edu.vn</p>
              <p className="text-gray-700 dark:text-gray-300"><strong>Address:</strong> University of Information Technology, Thu Duc City, HCMC, Vietnam</p>
              <p className="text-gray-700 dark:text-gray-300"><strong>GitHub:</strong> <a href="https://github.com/0xt4i" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">github.com/0xt4i</a></p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
