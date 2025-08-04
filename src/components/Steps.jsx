import React from 'react';

const steps = [
  {
    id: 1,
    title: 'Browse Products',
    description: 'Explore our wide range of smartphones and gadgets.',
    icon: (
      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L7.5 11H3v-7zM16 11v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6h10z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Add to Cart',
    description: 'Select your favorite products and add them to your cart.',
    icon: (
      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 7h13l-1.5-7M16 17a2 2 0 11-4 0" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Checkout Securely',
    description: 'Pay safely using multiple payment options.',
    icon: (
      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect width="18" height="14" x="3" y="5" rx="2" ry="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11v2M8 11v2M12 15v2" />
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Fast Delivery',
    description: 'Get your order delivered quickly at your doorstep.',
    icon: (
      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M5 6h14l1 7H4l1-7zM7 16a2 2 0 11-4 0 2 2 0 014 0zm14 0a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

const Steps = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {steps.map(({ id, title, description, icon }) => (
          <div key={id} className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Steps;
