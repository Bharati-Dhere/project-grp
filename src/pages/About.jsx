import React from 'react'; 
import { FaBullseye, FaEye, FaHandshake } from 'react-icons/fa';
import aboutBg from '../assets/about-us.jpeg';

function About() {
  const cards = [
    {
      icon: <FaBullseye size={30} />,
      title: 'Our Mission',
      desc: 'To deliver the best mobile devices and accessories to our customers at competitive prices.',
    },
    {
      icon: <FaEye size={30} />,
      title: 'Our Vision',
      desc: 'Empowering people through technology with high-quality and accessible mobile solutions.',
    },
    {
      icon: <FaHandshake size={30} />,
      title: 'Our Promise',
      desc: 'Reliable service, honest pricing, and a hassle-free shopping experience every time.',
    },
  ];

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat text-white px-6 md:px-12 py-16"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.75)), url(${aboutBg})`,
      }}
    >
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 border-b-4 border-primary pb-3 text-center drop-shadow-lg">
          About Our Mobile Store
        </h1>

        {/* Paragraph */}
        <p className="text-center text-lg md:text-xl leading-relaxed max-w-3xl mb-16 bg-black/50 p-8 rounded-xl shadow-lg">
          Welcome to our mobile store! We offer the latest smartphones at unbeatable prices,
          along with expert advice and top-notch customer service. Whether you're looking
          for flagship models or budget-friendly options, we have something for everyone.
        </p>

        {/* Cards Section */}
        <div className="w-full flex flex-col md:flex-row gap-10 justify-center">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className={`
                flex flex-col items-center p-8 rounded-3xl
                border-2 border-white/40
                shadow-lg shadow-black/40
                transition-transform duration-300 ease-in-out
                hover:scale-105 hover:shadow-2xl hover:border-primary
                cursor-pointer max-w-sm text-center
                text-gray-900
              `}
              style={{
                backgroundColor: [
                  'rgba(255, 255, 255, 0.85)',
                  'rgba(250, 250, 250, 0.9)',
                  'rgba(245, 245, 245, 0.95)',
                ][idx % 3],
              }}
            >
              <div className="text-primary mb-4">{card.icon}</div>
              <h3 className="text-2xl font-semibold mb-2">{card.title}</h3>
              <p className="text-gray-700">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default About;
