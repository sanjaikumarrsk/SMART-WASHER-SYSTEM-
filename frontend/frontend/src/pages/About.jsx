import React from 'react'
import { motion } from 'framer-motion'

export default function About() {
  const teamMembers = [
    {
      id: 1,
      initial: 'RSK',
      name: 'Sanjai Kumar R',
      title: 'AI Systems Architect',
      role: 'Responsible for designing and developing the complete frontend interface and dashboard. Focuses on data visualization, user interaction, and overall system usability. Also handles analysis of sensor data to provide meaningful insights.',
      techStack: [
        'React.js (UI Development)',
        'Tailwind CSS (Styling)',
        'Node.js (Backend Integration)',
        'Recharts (Data Visualization)',
      ],
    },
    {
      id: 2,
      initial: 'S',
      name: 'Sudhir R',
      title: 'Database & Integration Engineer',
      role: 'Handles database design, management, and backend connectivity. Ensures smooth data flow between hardware, backend, and frontend systems.',
      techStack: [
        'SQL / MySQL (Database)',
        'Node.js (Server-side logic)',
        'Express.js (API development)',
      ],
    },
    {
      id: 3,
      initial: 'H',
      name: 'Harishwar S',
      title: 'Hardware Systems Engineer',
      role: 'Responsible for hardware setup, sensor integration, and communication between ESP32 and backend system.',
      techStack: [
        'ESP32 Microcontroller',
        'Ultrasonic Sensor',
        'Turbidity Sensor',
        'Embedded C',
      ],
    },
    {
      id: 4,
      initial: 'K',
      name: 'Kiran T',
      title: 'Testing & Documentation Lead',
      role: 'Handles system testing, validation, and documentation. Ensures reliability of hardware and software integration.',
      techStack: [
        'Testing Tools',
        'System Validation',
        'Technical Documentation',
      ],
    },
  ]

  const scrollToTeam = () => {
    document.getElementById('team').scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="pt-16">
      {/* Hero Section with Video */}
      <section className="w-full h-[80vh] relative overflow-hidden">
        <video
          src="/asset/aboutvdo.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Hero Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
          <h1 className="text-5xl md:text-6xl font-bold drop-shadow-lg">
            Smart Washing System
          </h1>

          <p className="mt-4 text-lg md:text-xl drop-shadow-md max-w-2xl">
            Intelligent IoT-based laundry with smart automation and analytics
          </p>

          <button
            onClick={scrollToTeam}
            className="mt-6 bg-orange-400 text-white px-8 py-3 rounded-lg hover:scale-105 transition duration-300 font-semibold shadow-lg hover:bg-orange-500"
          >
            Meet the Team
          </button>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="w-full bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600">
              Dedicated professionals building the future of smart laundry management
            </p>
          </div>

          {/* Team Cards */}
          <div className="space-y-10">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: '-50px' }}
                className={`flex gap-6 items-start transition-all duration-300 ${
                  index % 2 === 1 ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Left Accent Bar */}
                <div className="w-1 h-auto bg-gradient-to-b from-blue-400 to-cyan-300 rounded-full flex-shrink-0 min-h-full"></div>

                {/* Initial Box */}
                <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center rounded-xl font-bold text-lg shadow-md hover:scale-110 transition-transform duration-300">
                  {member.initial}
                </div>

                {/* Card Content */}
                <div className="flex-1 relative rounded-2xl p-6 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 border border-blue-100 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02]">
                  {/* Top Glow Line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400"></div>

                  {/* Soft Background Shape */}
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-200 opacity-20 rounded-full blur-2xl pointer-events-none"></div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {member.name}
                    </h3>

                    <p className="text-blue-600 font-medium mt-1">
                      {member.title}
                    </p>

                    <p className="text-gray-600 mt-3 leading-relaxed text-sm">
                      {member.role}
                    </p>

                    {/* Tech Stack - Pill Badges */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {member.techStack.map((tech, idx) => (
                        <motion.span
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-blue-100 text-blue-600 px-3 py-1.5 rounded-full text-xs font-semibold border border-blue-200 hover:bg-blue-200 transition-colors duration-200"
                        >
                          {tech}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
