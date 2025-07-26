'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { promptService } from '../../lib/prompts';
import { authService } from '../../lib/auth';

interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Authentication and data loading
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    setUser(currentUser);
    loadUserPrompts();
  }, [router]);

  const loadUserPrompts = () => {
    try {
      const userPrompts = promptService.getPrompts();
      setPrompts(userPrompts);
    } catch (error) {
      console.error('Error loading prompts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a prompt
  const deletePrompt = (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;

    try {
      promptService.deletePrompt(id);
      setPrompts(prompts.filter(prompt => prompt.id !== id));
    } catch (error: any) {
      console.error('Error deleting prompt:', error);
      alert(`Error deleting prompt: ${error.message}`);
    }
  };

  // Copy prompt to clipboard
  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      alert('Prompt copied to clipboard! 📋');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Error copying prompt. Please try again.');
    }
  };

  // Handle logout
  const handleLogout = () => {
    authService.logout();
    router.push('/');
  };

  // Get all unique tags from user's prompts
  const allTags = Array.from(
    new Set(
      prompts
        .map(prompt => prompt.tags)
        .filter(Boolean)
        .flatMap(tagString => tagString.split(',').map(tag => tag.trim()))
        .filter(Boolean)
    )
  ).sort();

  // Filter prompts based on search and tag
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const promptTags = prompt.tags ? prompt.tags.split(',').map(tag => tag.trim()) : [];
    const matchesTag = !selectedTag || promptTags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading your prompts...</div>
      </div>
    );
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                Prompt Manager
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <span className="text-blue-600 font-semibold">My Prompts</span>
              <Link href="/add-prompt" className="text-gray-600 hover:text-gray-900">
                Add Prompt
              </Link>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">Hello, {user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <strong className="text-blue-800">Your Prompt Library</strong>
              <p className="text-blue-700 text-sm">
                You have {prompts.length} prompt{prompts.length !== 1 ? 's' : ''} saved
                {user.plan === 'free' && (
                  <span className="ml-2">
                    ({prompts.length}/5 used on Free plan)
                  </span>
                )}
              </p>
            </div>
            {user.plan === 'free' && prompts.length >= 4 && (
              <div className="text-right">
                <p className="text-blue-800 text-sm font-semibold">
                  {prompts.length >= 5 ? 'Limit reached!' : 'Almost at limit!'}
                </p>
                <button className="text-blue-600 hover:text-blue-800 text-sm underline">
                  Upgrade to Pro
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Prompts</h1>
          {user.plan === 'free' && prompts.length >= 5 ? (
            <div className="text-center">
              <button
                disabled
                className="bg-gray-300 text-gray-500 py-2 px-4 rounded-md cursor-not-allowed"
              >
                Limit Reached (5/5)
              </button>
              <p className="text-sm text-gray-600 mt-1">
                <button className="text-blue-600 hover:text-blue-800 underline">
                  Upgrade to Pro
                </button> for unlimited prompts
              </p>
            </div>
          ) : (
            <Link 
              href="/add-prompt"
              className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add New Prompt
            </Link>
          )}
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Prompts
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by title or content..."
              />
            </div>
            <div>
              <label htmlFor="tag-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Tag
              </label>
              <select
                id="tag-filter"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Tags ({allTags.length} available)</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Search results info */}
          {(searchTerm || selectedTag) && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredPrompts.length} of {prompts.length} prompts
              {searchTerm && <span> matching "{searchTerm}"</span>}
              {selectedTag && <span> tagged with "{selectedTag}"</span>}
              {(searchTerm || selectedTag) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedTag('');
                  }}
                  className="ml-2 text-blue-600 hover:text-blue-800 underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Prompts Grid */}
        {filteredPrompts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                {prompts.length === 0 ? 'No prompts yet' : 'No prompts match your search'}
              </h2>
              <p className="text-gray-600 mb-6">
                {prompts.length === 0 
                  ? 'Start building your prompt library by adding your first prompt!' 
                  : 'Try adjusting your search terms or filters to find what you\'re looking for.'}
              </p>
              {prompts.length === 0 && user.plan !== 'free' || prompts.length < 5 ? (
                <Link 
                  href="/add-prompt"
                  className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                >
                  Add Your First Prompt
                </Link>
              ) : (
                <button className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                  Upgrade to Pro for More Prompts
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((prompt) => (
              <div key={prompt.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                    {prompt.title}
                  </h3>
                  <div className="flex space-x-2 ml-2">
                    <Link 
                      href={`/prompts/edit/${prompt.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deletePrompt(prompt.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 line-clamp-4">
                  {prompt.content.length > 200 
                    ? `${prompt.content.substring(0, 200)}...` 
                    : prompt.content}
                </p>

                {/* Tags */}
                {prompt.tags && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {prompt.tags.split(',').map((tag, index) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {new Date(prompt.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <button
                    onClick={() => copyToClipboard(prompt.content)}
                    className="bg-green-600 text-white py-2 px-4 rounded text-sm hover:bg-green-700 transition-colors font-medium"
                  >
                    Copy Prompt
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}