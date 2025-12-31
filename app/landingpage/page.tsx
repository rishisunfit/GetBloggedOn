'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#1a1f4e"/>
              <path d="M2 17l10 5 10-5" stroke="#1a1f4e" strokeWidth="2"/>
              <path d="M2 12l10 5 10-5" stroke="#1a1f4e" strokeWidth="2"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-[#1a1f4e] tracking-tight">ainbox</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="#" className="text-sm text-gray-600 hover:text-[#1a1f4e] transition-colors">Why Ainbox?</Link>
          <Link href="#" className="text-sm text-gray-600 hover:text-[#1a1f4e] transition-colors">Product</Link>
          <Link href="#" className="text-sm text-gray-600 hover:text-[#1a1f4e] transition-colors">Pricing</Link>
          <Link href="#" className="text-sm text-gray-600 hover:text-[#1a1f4e] transition-colors">Success Stories</Link>
          <Link href="#" className="text-sm text-gray-600 hover:text-[#1a1f4e] transition-colors">Blog</Link>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm border border-[#1a1f4e] text-[#1a1f4e] rounded-full hover:bg-[#1a1f4e] hover:text-white transition-colors">
            Contact
          </button>
          <button className="px-4 py-2 text-sm bg-[#1a1f4e] text-white rounded-full hover:bg-[#2a2f5e] transition-colors">
            Buy Template
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-[#faf5f8] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center gap-12">
          {/* Illustration */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative w-72 h-64">
              {/* Person at desk illustration - simplified SVG representation */}
              <svg viewBox="0 0 300 250" className="w-full h-full">
                {/* Desk */}
                <rect x="40" y="160" width="220" height="8" fill="#1a1f4e" rx="2"/>
                <rect x="60" y="168" width="8" height="50" fill="#1a1f4e"/>
                <rect x="232" y="168" width="8" height="50" fill="#1a1f4e"/>
                
                {/* Computer monitor */}
                <rect x="120" y="90" width="80" height="60" fill="#1a1f4e" rx="4"/>
                <rect x="125" y="95" width="70" height="50" fill="#e8e0e5"/>
                <rect x="155" y="150" width="10" height="10" fill="#1a1f4e"/>
                <rect x="145" y="155" width="30" height="5" fill="#1a1f4e" rx="1"/>
                
                {/* Coffee mug */}
                <ellipse cx="220" cy="150" rx="15" ry="10" fill="#1a1f4e"/>
                <rect x="205" y="140" width="30" height="20" fill="#1a1f4e" rx="2"/>
                <path d="M235 145 Q245 150 235 155" stroke="#1a1f4e" strokeWidth="3" fill="none"/>
                
                {/* Steam from coffee */}
                <path d="M215 130 Q218 120 215 110" stroke="#1a1f4e" strokeWidth="2" fill="none" opacity="0.5"/>
                <path d="M225 130 Q228 120 225 110" stroke="#1a1f4e" strokeWidth="2" fill="none" opacity="0.5"/>
                
                {/* Person */}
                {/* Head */}
                <circle cx="90" cy="80" r="25" fill="#1a1f4e"/>
                {/* Hair detail */}
                <path d="M70 70 Q75 50 100 55 Q115 60 115 75" fill="#1a1f4e"/>
                
                {/* Body */}
                <path d="M65 105 Q90 130 115 105" fill="#1a1f4e"/>
                <rect x="70" y="100" width="40" height="60" fill="#1a1f4e" rx="5"/>
                
                {/* Arm reaching to keyboard */}
                <path d="M110 120 Q130 130 145 140" stroke="#1a1f4e" strokeWidth="10" fill="none" strokeLinecap="round"/>
                
                {/* Decorative plant */}
                <rect x="50" y="140" width="12" height="20" fill="#1a1f4e"/>
                <circle cx="56" cy="130" r="15" fill="none" stroke="#1a1f4e" strokeWidth="2"/>
                <path d="M50 130 Q56 115 62 130" stroke="#1a1f4e" strokeWidth="2" fill="none"/>
                <path d="M48 135 Q56 125 64 135" stroke="#1a1f4e" strokeWidth="2" fill="none"/>
              </svg>
            </div>
          </div>
          
          {/* Hero Content */}
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1a1f4e] leading-tight mb-4">
              It's like a blog<br />but...better
            </h1>
            <p className="text-gray-600 mb-8 max-w-md">
              Bloggish turns your best content into a quiet conversion engine. Start for free.
            </p>
            <button className="px-6 py-3 bg-[#1a1f4e] text-white rounded-full hover:bg-[#2a2f5e] transition-colors font-medium">
              Buy Template
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a1f4e] text-center mb-16">
            Turn content into a sales system
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <svg viewBox="0 0 64 64" className="w-16 h-16">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#1a1f4e" strokeWidth="2"/>
                  <circle cx="32" cy="32" r="20" fill="none" stroke="#1a1f4e" strokeWidth="1.5"/>
                  <circle cx="32" cy="32" r="12" fill="none" stroke="#1a1f4e" strokeWidth="1"/>
                  <circle cx="32" cy="32" r="4" fill="#1a1f4e"/>
                  <line x1="32" y1="4" x2="32" y2="12" stroke="#1a1f4e" strokeWidth="2"/>
                  <line x1="32" y1="52" x2="32" y2="60" stroke="#1a1f4e" strokeWidth="2"/>
                  <line x1="4" y1="32" x2="12" y2="32" stroke="#1a1f4e" strokeWidth="2"/>
                  <line x1="52" y1="32" x2="60" y2="32" stroke="#1a1f4e" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#1a1f4e] mb-3">Conversion Signals</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Identify what holds attention and what converts, then refine with clarity.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <svg viewBox="0 0 64 64" className="w-16 h-16">
                  <path d="M32 8 L36 20 L48 20 L38 28 L42 40 L32 32 L22 40 L26 28 L16 20 L28 20 Z" fill="none" stroke="#1a1f4e" strokeWidth="2"/>
                  <circle cx="20" cy="50" r="4" fill="#1a1f4e"/>
                  <circle cx="44" cy="50" r="4" fill="#1a1f4e"/>
                  <circle cx="32" cy="56" r="3" fill="#1a1f4e"/>
                  <path d="M18 14 L14 10" stroke="#1a1f4e" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M46 14 L50 10" stroke="#1a1f4e" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#1a1f4e] mb-3">Evergreen Funnels</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Publish once and refine over time. Your best content keeps working long after it's live.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <svg viewBox="0 0 64 64" className="w-16 h-16">
                  <circle cx="32" cy="24" r="16" fill="none" stroke="#1a1f4e" strokeWidth="2"/>
                  <circle cx="26" cy="22" r="3" fill="#1a1f4e"/>
                  <circle cx="38" cy="22" r="3" fill="#1a1f4e"/>
                  <rect x="22" y="20" width="8" height="6" fill="none" stroke="#1a1f4e" strokeWidth="1.5" rx="1"/>
                  <rect x="34" y="20" width="8" height="6" fill="none" stroke="#1a1f4e" strokeWidth="1.5" rx="1"/>
                  <path d="M24 32 Q32 38 40 32" fill="none" stroke="#1a1f4e" strokeWidth="2"/>
                  <path d="M20 40 L20 56 L44 56 L44 40" fill="none" stroke="#1a1f4e" strokeWidth="2"/>
                  <line x1="32" y1="40" x2="32" y2="56" stroke="#1a1f4e" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#1a1f4e] mb-3">Behavioral Metrics</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                See how readers move, pause, and drop off with heatmaps and scroll metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bingeworthy Section */}
      <section className="bg-[#faf5f8] py-20">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1a1f4e] mb-6">
              Bingeworthy By Design
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Our platform provides you with pre-built templates, pre-defined segments, and one-click automations, ensuring a quick and seamless setup. With our user-friendly design tools, crafting stunning campaigns that showcase your brand is effortless, placing it front and center in the hearts of your audience.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-8">
              From start to finish, we're here to support your marketing journey and help you achieve extraordinary results. Let's collaborate and elevate your brand to new heights!
            </p>
            <button className="px-6 py-3 border-2 border-[#1a1f4e] text-[#1a1f4e] rounded-full hover:bg-[#1a1f4e] hover:text-white transition-colors font-medium">
              Buy Template
            </button>
          </div>
          
          {/* Mockup Card */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-72 border border-gray-100">
              <div className="w-full h-40 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                <div className="w-24 h-24 rounded-full bg-amber-800 opacity-80"></div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                <div className="h-3 bg-gray-200 rounded w-3/5"></div>
              </div>
              <button className="w-full py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a1f4e] mb-12">
            You are in good company
          </h2>
          
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-70">
            <span className="text-xl font-bold text-gray-800 tracking-wide">GOOD</span>
            <span className="text-xl font-bold text-gray-800 tracking-wide">CLEANY</span>
            <span className="text-xl font-bold text-gray-800 tracking-tight leading-none">
              <span className="block text-sm">WESTERN</span>
              <span className="block">JEWEL</span>
            </span>
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-gray-800 rounded-full"></div>
              <span className="text-gray-400 tracking-widest">••••••</span>
            </div>
            <span className="text-xl font-bold text-gray-800 tracking-wide">NICE THING</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#1a1f4e] py-20">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            It's simple to get started
          </h2>
          <p className="text-gray-300 mb-8">
            You'll be ready to go in no time at all.
          </p>
          <button className="px-8 py-3 border-2 border-white text-white rounded-full hover:bg-white hover:text-[#1a1f4e] transition-colors font-medium">
            Buy Template
          </button>
        </div>
      </section>

      {/* Links Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a1f4e] mb-10">
            Discover your path to success
          </h2>
          
          <div className="space-y-6">
            <Link href="#" className="flex items-center gap-4 group">
              <span className="text-[#1a1f4e] group-hover:translate-x-1 transition-transform">→</span>
              <span className="font-semibold text-[#1a1f4e] group-hover:underline">Read Client Success Stories</span>
            </Link>
            <hr className="border-gray-200" />
            
            <Link href="#" className="flex items-center gap-4 group">
              <span className="text-[#1a1f4e] group-hover:translate-x-1 transition-transform">→</span>
              <span className="font-semibold text-[#1a1f4e] group-hover:underline">View Pricing Options</span>
            </Link>
            <hr className="border-gray-200" />
            
            <Link href="#" className="flex items-center gap-4 group">
              <span className="text-[#1a1f4e] group-hover:translate-x-1 transition-transform">→</span>
              <span className="font-semibold text-[#1a1f4e] group-hover:underline">Schedule a Live Demo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-8 text-center text-gray-500 text-sm">
          © 2024 Ainbox. All rights reserved.
        </div>
      </footer>
    </div>
  );
}



