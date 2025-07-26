'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface Prompt {
  id: string;
  user_id: string;
  tags: string | string[] | null;
  updated_at: string;
  [key: string]: any;
}

interface TagStats {
  name: string;
  count: number;
  lastUsed: string;
}

export default function TagsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [tagStats, setTagStats] = useState<TagStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  // Helper function to normalize tags
  const normalizeTags = useCallback((tags: string | string[] | null): string[] => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags.filter(tag => tag.trim().length > 0);
    return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  }, []);

  useEffect(() => {
    const getUserAndPrompts = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error getting user:', userError);
          router.push('/login');
          return;
        }

        if (!user) {
          router.push('/login');
          return;
        }
        
        setUser(user);

        // Fetch prompts for this user
        const { data, error } = await supabase
          .from('prompts')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error loading prompts:', error);
          alert('Error loading prompts: ' + error.message);
          setIsLoading(false);
          return;
        }
        
        setPrompts(data || []);
      } catch (error) {
        console.error('Unexpected error:', error);
        alert('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    getUserAndPrompts();
  }, [router]);

  useEffect(() => {
    // Calculate tag stats from prompts
    const tagMap = new Map<string, { count: number; lastUsed: Date }>();
    
    prompts.forEach(prompt => {
      const tags = normalizeTags(prompt.tags);
      tags.forEach((tag: string) => {
        if (tag.length === 0) return; // Skip empty tags
        
        const existing = tagMap.get(tag) || { count: 0, lastUsed: new Date(0) };
        const promptDate = new Date(prompt.updated_at);
        
        tagMap.set(tag, {
          count: existing.count + 1,
          lastUsed: new Date(Math.max(existing.lastUsed.getTime(), promptDate.getTime()))
        });
      });
    });
    
    const stats = Array.from(tagMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        lastUsed: data.lastUsed.toISOString()
      }))
      .sort((a, b) => b.count - a.count);
    
    setTagStats(stats);
  }, [prompts, normalizeTags]);

  const renameTag = async (oldName: string, newName: string) => {
    const trimmedNewName = newName.trim();
    
    if (!trimmedNewName || oldName === trimmedNewName) {
      setEditingTag(null);
      setNewTagName('');
      return;
    }

    if (!user) {
      alert('User not authenticated');
      return;
    }

    setIsUpdating(true);

    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        throw new Error(`Error fetching prompts: ${error.message}`);
      }

      const promptsToUpdate = data.filter(prompt => {
        const tags = normalizeTags(prompt.tags);
        return tags.includes(oldName);
      });

      if (promptsToUpdate.length === 0) {
        alert('No prompts found with this tag');
        setEditingTag(null);
        setNewTagName('');
        return;
      }

      let updatedCount = 0;
      const updatePromises = promptsToUpdate.map(async (prompt) => {
        const tags = normalizeTags(prompt.tags);
        const updatedTags = tags.map(tag => tag === oldName ? trimmedNewName : tag);
        
        const { error: updateError } = await supabase
          .from('prompts')
          .update({ tags: updatedTags.join(', ') })
          .eq('id', prompt.id);

        if (updateError) {
          console.error('Error updating prompt:', updateError);
          throw new Error(`Error updating prompt ${prompt.id}: ${updateError.message}`);
        }
        
        updatedCount++;
        return { ...prompt, tags: updatedTags.join(', ') };
      });

      const updatedPrompts = await Promise.all(updatePromises);
      
      // Update local state
      setPrompts(prev => {
        const newPrompts = [...prev];
        updatedPrompts.forEach(updatedPrompt => {
          const index = newPrompts.findIndex(p => p.id === updatedPrompt.id);
          if (index !== -1) {
            newPrompts[index] = updatedPrompt;
          }
        });
        return newPrompts;
      });

      setEditingTag(null);
      setNewTagName('');
      alert(`✅ Renamed "${oldName}" to "${trimmedNewName}" in ${updatedCount} prompts`);
      
    } catch (error: any) {
      console.error('Error renaming tag:', error);
      alert(`Error renaming tag: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteTag = async (tagName: string) => {
    if (!confirm(`Are you sure you want to remove the tag "${tagName}" from all prompts?`)) {
      return;
    }

    if (!user) {
      alert('User not authenticated');
      return;
    }

    setIsUpdating(true);

    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        throw new Error(`Error fetching prompts: ${error.message}`);
      }

      const promptsToUpdate = data.filter(prompt => {
        const tags = normalizeTags(prompt.tags);
        return tags.includes(tagName);
      });

      if (promptsToUpdate.length === 0) {
        alert('No prompts found with this tag');
        return;
      }

      let updatedCount = 0;
      const updatePromises = promptsToUpdate.map(async (prompt) => {
        const tags = normalizeTags(prompt.tags);
        const updatedTags = tags.filter(tag => tag !== tagName);
        
        const { error: updateError } = await supabase
          .from('prompts')
          .update({ tags: updatedTags.join(', ') })
          .eq('id', prompt.id);

        if (updateError) {
          console.error('Error updating prompt:', updateError);
          throw new Error(`Error updating prompt ${prompt.id}: ${updateError.message}`);
        }
        
        updatedCount++;
        return { ...prompt, tags: updatedTags.join(', ') };
      });

      const updatedPrompts = await Promise.all(updatePromises);
      
      // Update local state
      setPrompts(prev => {
        const newPrompts = [...prev];
        updatedPrompts.forEach(updatedPrompt => {
          const index = newPrompts.findIndex(p => p.id === updatedPrompt.id);
          if (index !== -1) {
            newPrompts[index] = updatedPrompt;
          }
        });
        return newPrompts;
      });

      alert(`✅ Removed "${tagName}" from ${updatedCount} prompts`);
      
    } catch (error: any) {
      console.error('Error deleting tag:', error);
      alert(`Error deleting tag: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    } else if (e.key === 'Escape') {
      setEditingTag(null);
      setNewTagName('');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
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
              <Link href="/prompts" className="text-gray-600 hover:text-gray-900">
                My Prompts
              </Link>
              <span className="text-blue-600 font-semibold">Tag Manager</span>
              <Link href="/settings" className="text-gray-600 hover:text-gray-900">
                Settings
              </Link>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">
                Hello, {user.user_metadata?.name || user.email}
              </span>
              <button 
                onClick={handleLogout} 
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                disabled={isUpdating}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tag Manager</h1>
          <p className="text-gray-600 mt-2">
            Organize and manage your prompt tags. You have {tagStats.length} unique tags.
          </p>
        </div>

        {tagStats.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">🏷️</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">No tags yet</h2>
            <p className="text-gray-600 mb-6">
              Tags will appear here when you add them to your prompts. Tags help you organize and find prompts quickly!
            </p>
            <Link
              href="/add-prompt"
              className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Add Your First Prompt
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Your Tags</h3>
              <p className="text-sm text-gray-600">
                Click to rename or delete tags across all your prompts
              </p>
            </div>
            
            {isUpdating && (
              <div className="px-6 py-2 bg-blue-50 border-b border-blue-200">
                <p className="text-sm text-blue-600">Updating tags...</p>
              </div>
            )}
            
            <div className="divide-y divide-gray-200">
              {tagStats.map((tag) => (
                <div key={tag.name} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {editingTag === tag.name ? (
                        <div className="flex items-center space-x-3">
                          <input
                            type="text"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            onKeyDown={(e) => handleKeyPress(e, () => renameTag(tag.name, newTagName))}
                            className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="New tag name"
                            autoFocus
                            disabled={isUpdating}
                          />
                          <button
                            onClick={() => renameTag(tag.name, newTagName)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                            disabled={isUpdating}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingTag(null);
                              setNewTagName('');
                            }}
                            className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 disabled:opacity-50"
                            disabled={isUpdating}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center space-x-3">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              {tag.name}
                            </span>
                            <span className="text-sm text-gray-600">
                              {tag.count} prompt{tag.count !== 1 ? 's' : ''}
                            </span>
                            <span className="text-sm text-gray-500">
                              Last used: {new Date(tag.lastUsed).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {editingTag !== tag.name && (
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/prompts?tag=${encodeURIComponent(tag.name)}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Prompts
                        </Link>
                        <button
                          onClick={() => {
                            setEditingTag(tag.name);
                            setNewTagName(tag.name);
                          }}
                          className="text-gray-600 hover:text-gray-800 text-sm font-medium disabled:opacity-50"
                          disabled={isUpdating}
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => deleteTag(tag.name)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                          disabled={isUpdating}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}