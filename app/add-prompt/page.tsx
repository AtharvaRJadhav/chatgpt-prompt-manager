'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { promptService } from '../../lib/prompts';
import { authService } from '../../lib/auth';

export default function AddPromptPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      await promptService.addPrompt(title, content, tags);
      setMessage('Prompt saved successfully! ✅');
      setTitle('');
      setContent('');
      setTags('');
    } catch (error: any) {
      setMessage(`Error: ${error.message} ❌`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Check if user is at limit
  const userPrompts = promptService.getPrompts();
  const isAtLimit = user.plan === 'free' && userPrompts.length >= 5;

  if (isAtLimit) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow mb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                  Prompt Manager
                </Link>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/prompts" className="text-gray-600 hover:text-gray-900">
                  My Prompts
                </Link>
              </div>
              <div className="flex items-center">
                <span className="text-gray-700 mr-4">Hello, {user.name}</span>
                <button
                  onClick={() => {
                    authService.logout();
                    router.push('/');
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-yellow-800 mb-4">Prompt Limit Reached!</h1>
            <p className="text-yellow-700 mb-6">
              You've reached your limit of 5 prompts on the free plan. 
              Upgrade to Pro for unlimited prompts!
            </p>
            <div className="space-x-4">
              <Link
                href="/prompts"
                className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
              >
                View My Prompts
              </Link>
              <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow mb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                Prompt Manager
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/prompts" className="text-gray-600 hover:text-gray-900">
                My Prompts
              </Link>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">Hello, {user.name}</span>
              <button
                onClick={() => {
                  authService.logout();
                  router.push('/');
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Prompt</h1>
        
        {/* Show remaining prompts for free users */}
        {user.plan === 'free' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800">
              Free Plan: Using {userPrompts.length} of 5 prompts 
              ({5 - userPrompts.length} remaining)
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Prompt Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Email Marketing Template"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Prompt Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Write a compelling email for..."
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="email, marketing, business"
            />
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/prompts"
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back to Prompts
            </Link>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Prompt'}
            </button>
          </div>
        </form>

        {message && (
          <div className={`mt-4 p-4 rounded-md ${
            message.includes('Error') 
              ? 'bg-red-100 border border-red-400 text-red-700'
              : 'bg-green-100 border border-green-400 text-green-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}