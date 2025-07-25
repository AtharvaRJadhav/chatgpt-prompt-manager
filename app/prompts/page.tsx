'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getPrompts, deletePrompt as deletePromptLocal, type Prompt } from '@/lib/localStorage'

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')

  // Load prompts from localStorage
  useEffect(() => {
    const loadedPrompts = getPrompts()
    setPrompts(loadedPrompts)
    setIsLoading(false)
  }, [])

  // Delete a prompt
  const deletePrompt = (id: number) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return

    try {
      deletePromptLocal(id)
      setPrompts(prompts.filter(prompt => prompt.id !== id))
    } catch (error) {
      console.error('Error deleting prompt:', error)
      alert('Error deleting prompt. Please try again.')
    }
  }

  // Copy prompt to clipboard
  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      alert('Prompt copied to clipboard!')
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      alert('Error copying prompt. Please try again.')
    }
  }

  // Get all unique tags
  const allTags = Array.from(
    new Set(prompts.flatMap(prompt => prompt.tags || []))
  ).sort()

  // Filter prompts based on search and tag
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = !selectedTag || (prompt.tags && prompt.tags.includes(selectedTag))
    return matchesSearch && matchesTag
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading prompts...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
          <strong>Note:</strong> Currently using local storage. Your prompts are saved in your browser only.
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Prompts</h1>
          <Link 
            href="/add-prompt"
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add New Prompt
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Prompts Grid */}
        {filteredPrompts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              {prompts.length === 0 ? 'No prompts yet' : 'No prompts match your search'}
            </h2>
            <p className="text-gray-600 mb-6">
              {prompts.length === 0 
                ? 'Start building your prompt library by adding your first prompt!' 
                : 'Try adjusting your search terms or filters.'}
            </p>
            {prompts.length === 0 && (
              <Link 
                href="/add-prompt"
                className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Your First Prompt
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPrompts.map((prompt) => (
              <div key={prompt.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{prompt.title}</h3>
                  <div className="flex space-x-2">
                    <Link 
                      href={`/prompts/edit/${prompt.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deletePrompt(prompt.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 line-clamp-3">
                  {prompt.content.length > 150 
                    ? `${prompt.content.substring(0, 150)}...` 
                    : prompt.content}
                </p>

                {/* Tags */}
                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {prompt.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {new Date(prompt.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => copyToClipboard(prompt.content)}
                    className="bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    Copy Prompt
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}