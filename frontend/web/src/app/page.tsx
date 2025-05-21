'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* <Image
            src="/gym-hero.jpg"
            alt="Gym background"
            fill
            className="object-cover opacity-50"
            priority
          /> */}
        </div>
        <div className="relative z-10 text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Transform Your Fitness Journey
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 text-slate-300"
          >
            Join a community of motivated individuals and achieve your fitness goals together
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link 
              href="/signup" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-colors duration-300"
            >
              Start Your Journey
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-slate-700 p-8 rounded-xl"
            >
              <div className="text-blue-400 text-4xl mb-4">💪</div>
              <h3 className="text-2xl font-semibold mb-4">Track Your Progress</h3>
              <p className="text-slate-300">Monitor your workouts, set goals, and celebrate your achievements with detailed progress tracking.</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-slate-700 p-8 rounded-xl"
            >
              <div className="text-blue-400 text-4xl mb-4">👥</div>
              <h3 className="text-2xl font-semibold mb-4">Join the Community</h3>
              <p className="text-slate-300">Connect with like-minded individuals, share experiences, and stay motivated together.</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-slate-700 p-8 rounded-xl"
            >
              <div className="text-blue-400 text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-semibold mb-4">Personalized Plans</h3>
              <p className="text-slate-300">Get customized workout plans tailored to your goals and fitness level.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-800 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-slate-400">Lost 30 lbs in 6 months</p>
                </div>
              </div>
              <p className="text-slate-300">&quot;This app completely transformed my fitness journey. The community support is incredible!&quot;</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Mike Chen</h4>
                  <p className="text-slate-400">Gained 15 lbs muscle</p>
                </div>
              </div>
              <p className="text-slate-300">&quot;The personalized workout plans helped me achieve my muscle gain goals faster than ever.&quot;</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Emma Davis</h4>
                  <p className="text-slate-400">Completed first marathon</p>
                </div>
              </div>
              <p className="text-slate-300">&quot;The training plans and community support helped me cross the finish line of my first marathon!&quot;</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">Ready to Start Your Fitness Journey?</h2>
          <p className="text-xl mb-8 text-blue-100">Join thousands of motivated individuals today</p>
          <Link 
            href="/signup" 
            className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-4 rounded-full text-lg font-semibold transition-colors duration-300"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Fitness Network</h3>
              <p className="text-slate-400">Your journey to a healthier lifestyle starts here.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/features">Features</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/contact">Contact Us</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
                <li><Link href="/privacy">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-white">Twitter</a>
                <a href="#" className="text-slate-400 hover:text-white">Instagram</a>
                <a href="#" className="text-slate-400 hover:text-white">Facebook</a>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Fitness Network. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}