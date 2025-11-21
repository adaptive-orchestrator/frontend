import { Footer } from '@/components/common/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Code, Rocket, User, Users, CodeXml } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  const team = [
    { 
      name: 'Nguyen Huu Tai', 
      role: 'BackEnd Developer',
      studentId: '22521278',
      description: 'Main responsive for developing BackEnd of the website',
      github: 'https://github.com/0xt4i',
      email: '22521278@gm.uit.edu.vn'
    },
    { 
      name: 'Le Ngoc Duy Linh', 
      role: 'Main BackEnd Developer',
      studentId: '22520762',
      description: 'Main responsive for developing BackEnd of the website',
      github: 'https://github.com/YuilRin',
      email: '22520762@gm.uit.edu.vn'
    },
  ];

  const baseURL = import.meta.env.BASE_URL;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      {/* Header */}
      <header className="bg-transparent py-5 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 flex items-center">
          <Link
            to={baseURL}
            className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold ml-4 tracking-tight">About OctalTask</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-10 space-y-20">
        {/* Hero */}
        <section className="text-center space-y-4">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900/20 mx-auto mb-4">
            <CodeXml className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-4xl font-bold tracking-tight">
            <span className="text-blue-600 dark:text-blue-400">Octal</span>
            <span className="text-gray-800 dark:text-white">Task</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            An AI-integrated microservices system that allows enterprises to flexibly switch or 
            combine multiple business models. Built by students from the University of Information 
            Technology - VNUHCM.
          </p>
        </section>

        {/* Meet the Team */}
        <section>
          <h3 className="text-2xl font-semibold text-center mb-10">Meet the Team</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="h-16 w-16 mx-auto rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
                <h4 className="text-lg font-semibold text-center">{member.name}</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400 text-center mb-1">
                  {member.role}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-2">
                  {member.studentId}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center mb-4">
                  {member.description}
                </p>
                <div className="flex gap-3 justify-center">
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>
                  <a
                    href={`mailto:${member.email}`}
                    className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12.713l-11.985-9.713h23.97l-11.985 9.713zm0 2.574l-12-9.725v15.438h24v-15.438l-12 9.725z" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/20 w-12 h-12 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-lg font-medium mb-2">Collaboration</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Built with shared effort, diverse skills, and a unified vision.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 w-12 h-12 flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="text-lg font-medium mb-2">Learning & Innovation</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  A hands-on project focused on microservices, AI integration, and modern cloud technologies.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/20 w-12 h-12 flex items-center justify-center">
                  <Code className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="text-lg font-medium mb-2">Open Source</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Built with transparency and love for the dev community.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
