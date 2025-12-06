import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";

export default function Hero() {
    const navigate = useNavigate();

    const baseURL = import.meta.env.BASE_URL;
    const isDemoMode = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';

    return (
      <section
        id="hero"
        className="py-16 md:py-24 px-4 overflow-hidden relative bg-gradient-to-br from-gray-50 to-blue-300 dark:from-gray-900 dark:to-blue-900/20"
      >
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle, #3b82f6 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px',
          }}
        ></div>

        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div
              className="text-center md:text-left transition-all duration-700 transform"
              style={{ transitionDelay: '200ms' }}
            >
              <div className="inline-block px-3 py-1 mb-6 text-sm font-medium rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                Boost your productivity
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
                Manage tasks efficiently with{' '}
                <span className="text-blue-600 dark:text-blue-400">Nexora</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto md:mx-0 mb-8">
                Simplify task management, boost productivity, and collaborate seamlessly with your
                team. The all-in-one solution for personal and team productivity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button
                  onClick={() => navigate(`${baseURL}signup`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg shadow-md hover:shadow-lg transition-all animate-bounce hover:animate-none"
                  size="lg"
                >
                  Get Started - It's Free
                </Button>
                
                {/* Demo Mode Quick Login Button */}
                {isDemoMode && (
                  <Button
                    onClick={() => navigate(`${baseURL}quick-login`)}
                    variant="outline"
                    className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/20 px-8 py-3 text-lg shadow-md hover:shadow-lg transition-all"
                    size="lg"
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Quick Login (Demo)
                  </Button>
                )}
              </div>
              
              {/* Demo Mode Badge */}
              {isDemoMode && (
                <div className="mt-4 inline-block px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  Demo Mode Active - No backend required
                </div>
              )}
            </div>
            <div className="hidden md:block relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg blur-3xl"></div>
              <div className="relative shadow-2xl rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <img
                  src={`${baseURL}/DashBoard.png`}
                  alt="Nexora Dashboard"
                  className="w-full h-auto"
                  onError={e => {
                    e.currentTarget.src =
                      'https://placehold.co/600x400/4f46e5/white?text=Nexora+Dashboard';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    );

}
