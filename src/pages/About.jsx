import React from 'react';
// import aboutBg from '../assets/about-us.jpeg';

function About() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat text-white px-4 md:px-8 py-12"
      // style={{ backgroundImage: `url(${aboutBg})` }}
    >
      {/* Overlay for better contrast */}
      <div className="bg-black/60 backdrop-blur-sm min-h-screen flex flex-col items-center justify-center px-4 py-10">
        <h1 className="text-3xl md:text-5xl font-bold mb-8 text-center border-b-4 border-white pb-3 shadow-xl">
          About Our Mobile Store
        </h1>

        <p className="max-w-3xl text-center text-base md:text-lg leading-relaxed mb-12 bg-black/70 p-6 rounded-lg shadow-lg">
          Welcome to our mobile store! We offer the latest smartphones at unbeatable prices,
          along with expert advice and top-notch customer service. Whether you're looking
          for flagship models or budget-friendly options, we have something for everyone.
        </p>

        {/* Cards Section */}
        <div className="w-full max-w-6xl flex flex-col md:flex-row flex-wrap items-center justify-center gap-6 md:gap-10">
          {[
            {
              title: 'Our Mission',
              desc: 'To deliver the best mobile devices and accessories to our customers at competitive prices.',
            },
            {
              title: 'Our Vision',
              desc: 'Empowering people through technology with high-quality and accessible mobile solutions.',
            },
            {
              title: 'Our Promise',
              desc: 'Reliable service, honest pricing, and a hassle-free shopping experience every time.',
            },
          ].map((item, index) => (
            <div
              key={index}
              className="w-full sm:w-[300px] bg-white/10 backdrop-blur-md text-white p-6 rounded-xl shadow-2xl hover:scale-105 transition-transform duration-300"
            >
              <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
              <p className="text-sm text-gray-200">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default About;
