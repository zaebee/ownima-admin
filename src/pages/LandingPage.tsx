import React from 'react';
import { Link } from 'react-router-dom';
import {
  SparklesIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UsersIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

// Hero Section Component
const HeroSection: React.FC = () => (
  <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-cyan-50 pt-20 pb-24">
    {/* Background decorations */}
    <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-br from-indigo-100/40 to-purple-100/40 -skew-y-1 transform origin-top-left"></div>
    <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl"></div>
    <div className="absolute bottom-10 left-10 w-48 h-48 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl"></div>
    
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full border border-indigo-200/50 mb-8">
          <SparklesIcon className="w-4 h-4 text-indigo-600 mr-2" />
          <span className="text-sm font-semibold text-indigo-700">Introducing Ownima Platform</span>
        </div>

        {/* Main headline */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
            Manage Your Platform
          </span>
          <br />
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            With Confidence
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
          Streamline your operations with powerful admin tools, real-time analytics, 
          and intelligent automation that scales with your business.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/login"
            className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-3"
          >
            <span>Get Started</span>
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
          <button className="px-8 py-4 bg-white/80 backdrop-blur-sm text-indigo-700 font-semibold rounded-xl border-2 border-indigo-200 hover:bg-white hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md">
            Watch Demo
          </button>
        </div>
      </div>

      {/* Hero Image/Dashboard Preview */}
      <div className="mt-20 relative">
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-2 shadow-2xl border border-white/20">
          <div className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-2xl p-8 text-white">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-4 rounded-lg border border-indigo-400/20">
                  <div className="text-2xl font-bold">2.5K</div>
                  <div className="text-sm opacity-75">Users</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-4 rounded-lg border border-emerald-400/20">
                  <div className="text-2xl font-bold">95%</div>
                  <div className="text-sm opacity-75">Uptime</div>
                </div>
                <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 p-4 rounded-lg border border-amber-400/20">
                  <div className="text-2xl font-bold">45</div>
                  <div className="text-sm opacity-75">Pending</div>
                </div>
                <div className="bg-gradient-to-br from-rose-500/20 to-pink-500/20 p-4 rounded-lg border border-rose-400/20">
                  <div className="text-2xl font-bold">12K</div>
                  <div className="text-sm opacity-75">Revenue</div>
                </div>
              </div>
              <div className="h-32 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg border border-indigo-400/20 flex items-center justify-center">
                <ChartBarIcon className="w-16 h-16 text-indigo-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Features Section Component
const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Enterprise Security',
      description: 'Bank-grade security with end-to-end encryption, multi-factor authentication, and compliance with industry standards.',
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
    },
    {
      icon: ChartBarIcon,
      title: 'Real-time Analytics',
      description: 'Comprehensive dashboards with live data, customizable reports, and actionable insights to drive your business forward.',
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
    },
    {
      icon: UsersIcon,
      title: 'User Management',
      description: 'Streamlined user administration with role-based access control, bulk operations, and automated workflows.',
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Mobile Responsive',
      description: 'Fully responsive design that works seamlessly across all devices, ensuring productivity anywhere, anytime.',
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50',
    },
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to manage, monitor, and scale your platform effectively
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-3xl p-8 shadow-sm border border-gray-100/50 hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-50 rounded-3xl transition-opacity duration-500`}></div>
              
              <div className="relative">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl shadow-lg mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Stats Section Component
const StatsSection: React.FC = () => {
  const stats = [
    { number: '10K+', label: 'Active Users', icon: UsersIcon },
    { number: '99.9%', label: 'Uptime', icon: ShieldCheckIcon },
    { number: '50+', label: 'Countries', icon: GlobeAltIcon },
    { number: '24/7', label: 'Support', icon: SparklesIcon },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent)] "></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.3),transparent)]"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-indigo-200 max-w-3xl mx-auto">
            Join the growing community of businesses that rely on our platform for their success
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 group-hover:bg-white/20 transition-all duration-300">
                <stat.icon className="w-10 h-10 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-indigo-200 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Testimonials Section Component
const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CTO at TechFlow',
      image: '👩‍💼',
      content: 'Ownima has transformed how we manage our platform. The analytics are incredibly detailed and the user management tools are intuitive.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Operations Director at ScaleUp',
      image: '👨‍💻',
      content: 'The real-time monitoring and automated workflows have saved us countless hours. Best investment we\'ve made for our operations.',
      rating: 5,
    },
    {
      name: 'Emma Rodriguez',
      role: 'Product Manager at InnovateCorp',
      image: '👩‍🔬',
      content: 'Exceptional platform with outstanding support. The beta testing features helped us launch our product with confidence.',
      rating: 5,
    },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent">
              What Our Clients Say
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it - hear from the teams that use Ownima every day
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center space-x-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-gray-700 mb-8 leading-relaxed italic">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{testimonial.image}</div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section Component
const CTASection: React.FC = () => (
  <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
    {/* Background decorations */}
    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-48 -translate-x-48"></div>
    
    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
        Ready to Get Started?
      </h2>
      <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto leading-relaxed">
        Join thousands of teams already using Ownima to streamline their operations 
        and accelerate their growth.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Link
          to="/login"
          className="group px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-3"
        >
          <span>Start Free Trial</span>
          <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
        <button className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/30 transition-all duration-300">
          Schedule Demo
        </button>
      </div>
      
      <div className="mt-12 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-indigo-200">
        <div className="flex items-center space-x-2">
          <CheckCircleIcon className="w-5 h-5" />
          <span>Free 14-day trial</span>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircleIcon className="w-5 h-5" />
          <span>No credit card required</span>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircleIcon className="w-5 h-5" />
          <span>Cancel anytime</span>
        </div>
      </div>
    </div>
  </section>
);

// Header Component
const Header: React.FC = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200/50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Ownima
          </span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Features</a>
          <a href="#pricing" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Pricing</a>
          <a href="#about" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">About</a>
          <a href="#contact" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Contact</a>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  </header>
);

// Footer Component
const Footer: React.FC = () => (
  <footer className="bg-gray-900 text-white py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">Ownima</span>
          </div>
          <p className="text-gray-400 mb-6 max-w-md">
            Empowering businesses with intelligent platform management tools 
            that scale with your growth and streamline your operations.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-6">Product</h4>
          <ul className="space-y-3">
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Security</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Updates</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-6">Support</h4>
          <ul className="space-y-3">
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Status</a></li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
        <p>&copy; 2024 Ownima. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

// Main Landing Page Component
export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};