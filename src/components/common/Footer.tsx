import { MapPin, Github, Linkedin, Mail, Phone } from 'lucide-react';
import { Logo } from '../common/Logo';
import { useTheme } from '@/contexts/ThemeContext';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  const darkMode = useTheme();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const baseURL = import.meta.env.BASE_URL;

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setSubscribeStatus('error');
      setTimeout(() => setSubscribeStatus('idle'), 3000);
      return;
    }
    setSubscribeStatus('loading');
    // TODO: Call API when backend is ready
    // await subscribeNewsletter(newsletterEmail);
    setTimeout(() => {
      setSubscribeStatus('success');
      setNewsletterEmail('');
      setTimeout(() => setSubscribeStatus('idle'), 3000);
    }, 1000);
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1 space-y-6">
            <div className="flex items-center space-x-2">
              <Logo
                size="md"
                color={darkMode ? 'blueDark' : 'blueLight'}
                fontWeight="semibold"
                className="font-sans"
              />
            </div>

            <p className="text-gray-300 text-sm leading-relaxed">
              Your comprehensive task management solution designed to streamline workflows and boost
              productivity.
            </p>

            <div className="flex items-start gap-3 bg-gray-800 bg-opacity-50 p-4 rounded-lg border-l-4 border-blue-500">
              <MapPin className="text-blue-400 mt-1 shrink-0" size={18} />
              <div className="text-gray-300 text-sm">
                <p className="font-medium text-white mb-1">
                  University of Information Technology - VNUHCM
                </p>
                <p>Han Thuyen Street, Quarter 6, Linh Trung Ward</p>
                <p>Thu Duc City, Ho Chi Minh City, Vietnam</p>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold mb-4 text-white relative inline-block">
              Quick Links
              <span className="absolute -bottom-1 left-0 w-12 h-1 bg-blue-500 rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              {[
                { id: 'hero', label: 'Home', href: '#' },
                { id: 'features', label: 'Features', href: '#features' },
                { id: 'about', label: 'About OctalTask', href: '#about' },
                { id: 'testimonials', label: 'Testimonials', href: '#testimonials' },
                { id: 'faq', label: 'FAQ', href: '#faq' },
              ].map(({ id, label }) => (
                <li key={id} className="group">
                  <a
                    href={id === 'hero' ? '#' : `#${id}`}
                    className="text-gray-300 hover:text-blue-400 transition-colors flex items-center"
                  >
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* University Links Column */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold mb-4 text-white relative inline-block">
              University Links
              <span className="absolute -bottom-1 left-0 w-12 h-1 bg-blue-500 rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'UIT Website', url: 'https://www.uit.edu.vn/' },
                { name: 'Academic Programs', url: 'https://www.uit.edu.vn/dao-tao' },
                { name: 'Student Resources', url: 'https://www.uit.edu.vn/sinh-vien' },
                { name: 'Contact UIT', url: 'https://www.uit.edu.vn/thong-tin-lien-he' },
              ].map(link => (
                <li key={link.name} className="group">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-blue-400 transition-colors flex items-center"
                  >
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold mb-4 text-white relative inline-block">
              Connect With Us
              <span className="absolute -bottom-1 left-0 w-12 h-1 bg-blue-500 rounded-full"></span>
            </h4>

            <div className="flex flex-wrap gap-3">
              {[
                { icon: Github, link: 'https://github.com/jiraops', label: 'GitHub' },
                { icon: Linkedin, link: '#', label: 'LinkedIn' },
                { icon: Mail, link: 'mailto:contact@octaltask.com', label: 'Email' },
                { icon: Phone, link: 'tel:+84123456789', label: 'Phone' },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.link}
                  aria-label={social.label}
                  className="group w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-500 hover:text-white transition-all transform hover:-translate-y-1"
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>

            <div className="pt-4">
              <p className="text-gray-300 text-sm mb-4">Subscribe to our newsletter</p>
              <form onSubmit={handleNewsletterSubmit}>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    disabled={subscribeStatus === 'loading'}
                    className="bg-gray-800 text-white px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow text-sm disabled:opacity-50"
                  />
                  <button 
                    type="submit"
                    disabled={subscribeStatus === 'loading'}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-lg transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {subscribeStatus === 'loading' ? 'Subscribing...' : subscribeStatus === 'success' ? '✓ Subscribed!' : 'Subscribe'}
                  </button>
                </div>
                {subscribeStatus === 'error' && (
                  <p className="text-red-400 text-xs mt-2">Please enter a valid email address</p>
                )}
                {subscribeStatus === 'success' && (
                  <p className="text-green-400 text-xs mt-2">Successfully subscribed to our newsletter!</p>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-16 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} OctalTask. All rights reserved. A project created for
            Web Development course at UIT.
          </p>

          <div className="mt-4 md:mt-0 flex space-x-4 text-sm text-gray-400">
            <Link to={`${baseURL}privacy-policy`} className="hover:text-blue-400 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-gray-600">•</span>
            <Link to={`${baseURL}terms-of-service`} className="hover:text-blue-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
