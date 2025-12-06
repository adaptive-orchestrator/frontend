import { Footer } from '@/components/common/Footer';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsOfService() {
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
          <h1 className="text-xl font-semibold ml-4 text-gray-900 dark:text-white">Terms of Service</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Terms of Service</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Agreement to Terms</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              By accessing and using Nexora ("the Platform"), you accept and agree to be bound by these 
              Terms of Service. If you do not agree to these terms, please do not use our platform. This is 
              an academic project developed by students from the University of Information Technology - VNUHCM.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Description of Service</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Nexora provides an AI-integrated microservices system that allows enterprises to:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>Switch between or combine multiple business models (Retail, Subscription, Freemium, Multi-Model)</li>
              <li>Manage products, orders, subscriptions, and inventory</li>
              <li>Utilize AI-powered orchestration for configuration changes</li>
              <li>Deploy microservices with Kubernetes and Docker</li>
              <li>Access analytics and monitoring dashboards</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. User Accounts</h3>
            
            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-4 mb-2">3.1 Account Types</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              We offer two primary account types:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li><strong>Customer Account:</strong> For end-users accessing retail or subscription services</li>
              <li><strong>Business Owner Account:</strong> For administrators managing business operations and models</li>
            </ul>

            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-4 mb-2">3.2 Account Responsibilities</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>Maintaining the confidentiality of your password</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
              <li>Providing accurate and up-to-date information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Acceptable Use Policy</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              When using Nexora, you agree NOT to:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit malicious code, viruses, or harmful software</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the platform's functionality</li>
              <li>Use the platform for any unlawful or fraudulent purposes</li>
              <li>Scrape or harvest data without permission</li>
              <li>Impersonate other users or entities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Business Models and Pricing</h3>
            
            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-4 mb-2">5.1 Retail Model</h4>
            <p className="text-gray-700 dark:text-gray-300">
              One-time purchases with immediate payment processing. Products are delivered according to 
              specified terms. All sales are final unless otherwise stated.
            </p>

            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-4 mb-2">5.2 Subscription Model</h4>
            <p className="text-gray-700 dark:text-gray-300">
              Recurring billing for subscription plans. You will be charged automatically according to your 
              chosen billing period (monthly/yearly). You may cancel your subscription at any time.
            </p>

            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-4 mb-2">5.3 Freemium Model</h4>
            <p className="text-gray-700 dark:text-gray-300">
              Basic features are provided free of charge. Premium features require a paid subscription. 
              Free tier usage may be subject to limitations.
            </p>

            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-4 mb-2">5.4 Multi-Model</h4>
            <p className="text-gray-700 dark:text-gray-300">
              Combines multiple business models simultaneously. Pricing and terms depend on selected model 
              configurations.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Payment Terms</h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>All prices are displayed in Vietnamese Dong (VND)</li>
              <li>Payment processing is handled securely through our payment service</li>
              <li>Subscription renewals are automatic unless canceled</li>
              <li>Refund policies vary by business model and will be communicated clearly</li>
              <li>You are responsible for any applicable taxes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Intellectual Property</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              All content, features, and functionality of Nexora, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>Source code and software architecture</li>
              <li>Text, graphics, logos, and images</li>
              <li>AI models and orchestration logic</li>
              <li>Database schemas and structures</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              Are the intellectual property of the development team and the University of Information 
              Technology - VNUHCM. This is an open-source academic project.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. Data and Privacy</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Your use of the platform is also governed by our Privacy Policy. We collect and process data 
              as described in our <Link to={`${baseURL}privacy-policy`} className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</Link>. 
              By using Nexora, you consent to such collection and processing.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9. Service Availability</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              We strive to maintain 99% uptime, but we do not guarantee:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>Uninterrupted or error-free service</li>
              <li>That defects will be corrected immediately</li>
              <li>That the platform is free from viruses or harmful components</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              Scheduled maintenance will be announced in advance when possible.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">10. Limitation of Liability</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              To the maximum extent permitted by law, Nexora and its developers shall not be liable for:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>Any indirect, incidental, or consequential damages</li>
              <li>Loss of profits, data, or business opportunities</li>
              <li>Service interruptions or technical issues</li>
              <li>Actions of third-party services</li>
              <li>User errors or misconfigurations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">11. Termination</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              We reserve the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>Suspend or terminate your account for violations of these Terms</li>
              <li>Modify or discontinue the platform at any time</li>
              <li>Refuse service to anyone for any reason</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              You may terminate your account at any time by contacting us or using the account deletion feature.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">12. Changes to Terms</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We may modify these Terms of Service at any time. Changes will be effective immediately upon 
              posting. Your continued use of the platform after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">13. Academic Project Disclaimer</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              <strong>IMPORTANT:</strong> Nexora is an academic project developed for educational purposes. 
              While we implement industry best practices:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>This platform is primarily for demonstration and learning</li>
              <li>It should not be used for critical production workloads without additional hardening</li>
              <li>Support is provided on a best-effort basis by the development team</li>
              <li>The platform may be discontinued after the academic term ends</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">14. Governing Law</h3>
            <p className="text-gray-700 dark:text-gray-300">
              These Terms shall be governed by and construed in accordance with the laws of Vietnam. Any 
              disputes shall be resolved in the courts of Ho Chi Minh City.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">15. Contact Information</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              For questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300"><strong>Development Team:</strong></p>
              <p className="text-gray-700 dark:text-gray-300 mt-2">Nguyen Huu Tai - 22521278@gm.uit.edu.vn</p>
              <p className="text-gray-700 dark:text-gray-300">Le Ngoc Duy Linh - 22520762@gm.uit.edu.vn</p>
              <p className="text-gray-700 dark:text-gray-300 mt-2"><strong>Institution:</strong> University of Information Technology - VNUHCM</p>
              <p className="text-gray-700 dark:text-gray-300"><strong>Address:</strong> Thu Duc City, Ho Chi Minh City, Vietnam</p>
              <p className="text-gray-700 dark:text-gray-300 mt-2"><strong>GitHub:</strong> <a href="https://github.com/0xt4i" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">github.com/0xt4i</a> | <a href="https://github.com/YuilRin" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">github.com/YuilRin</a></p>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">16. Acknowledgment</h3>
            <p className="text-gray-700 dark:text-gray-300">
              By using Nexora, you acknowledge that you have read, understood, and agree to be bound by 
              these Terms of Service.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
