'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '../lib/auth';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setIsLoggedIn(true);
      // Auto-redirect logged in users to dashboard
      router.push('/dashboard');
    } else {
      setIsLoggedIn(false);
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <nav className="flex items-center justify-between h-16">
          <div className="text-2xl font-bold text-gray-900">
            Prompt Manager
          </div>
          <div className="space-x-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="py-20 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
            Save & Organize Your
            <span className="text-blue-600"> ChatGPT Prompts</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Never lose a great prompt again! Store, tag, and reuse your favorite 
            ChatGPT prompts with our simple, powerful prompt manager.
          </p>
          
          <div className="space-x-4">
            <Link
              href="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 inline-block"
            >
              Start Free
            </Link>
            <Link
              href="/login"
              className="bg-gray-100 text-gray-800 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-200 inline-block"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything you need to manage prompts
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💾</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Save & Store</h3>
              <p className="text-gray-600">
                Securely save all your ChatGPT prompts in one organized place. 
                Never lose a great prompt again.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏷️</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Tag & Filter</h3>
              <p className="text-gray-600">
                Organize with tags and find exactly what you need with 
                powerful search and filtering.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Copy & Reuse</h3>
              <p className="text-gray-600">
                One-click copying makes it instant to reuse your favorite 
                prompts in ChatGPT.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Preview */}
        <div className="py-16 bg-gray-50 rounded-2xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Simple, Fair Pricing
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4">Free</h3>
              <p className="text-4xl font-bold text-gray-900 mb-6">
                $0<span className="text-lg text-gray-600">/month</span>
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  Up to 5 prompts
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  Search & filter
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  One-click copying
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full bg-gray-600 text-white text-center py-3 rounded-lg hover:bg-gray-700"
              >
                Get Started Free
              </Link>
            </div>
            
            <div className="bg-blue-600 text-white p-8 rounded-lg shadow-md relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Pro</h3>
              <p className="text-4xl font-bold mb-6">
                $9<span className="text-lg opacity-75">/month</span>
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  Unlimited prompts
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  Advanced search
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  Priority support
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  Export your data
                </li>
              </ul>
              <button className="block w-full bg-white text-blue-600 text-center py-3 rounded-lg hover:bg-gray-100 font-semibold">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to organize your prompts?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of users who never lose a great prompt again. 
            Start free today!
          </p>
          <Link
            href="/register"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-blue-700 inline-block"
          >
            Get Started Free →
          </Link>
        </div>
      </div>
    </div>
  );
}