// lib/prompts.js - Updated for user-specific prompts
import { authService } from './auth';

const PROMPTS_KEY = 'prompts';

export const promptService = {
  // Get all prompts for current user only
  getPrompts: () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return [];
    
    const allPrompts = JSON.parse(localStorage.getItem(PROMPTS_KEY) || '[]');
    return allPrompts.filter(prompt => prompt.userId === currentUser.id);
  },

  // Add new prompt for current user
  addPrompt: (title, content, tags = '') => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Must be logged in to add prompts');
    
    // Check prompt limit for free users
    const userPrompts = promptService.getPrompts();
    if (currentUser.plan === 'free' && userPrompts.length >= 5) {
      throw new Error('Free users are limited to 5 prompts. Upgrade to Pro for unlimited prompts!');
    }
    
    const allPrompts = JSON.parse(localStorage.getItem(PROMPTS_KEY) || '[]');
    const newPrompt = {
      id: Date.now().toString(),
      title,
      content,
      tags,
      userId: currentUser.id, // Associate with current user
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    allPrompts.push(newPrompt);
    localStorage.setItem(PROMPTS_KEY, JSON.stringify(allPrompts));
    return newPrompt;
  },

  // Update prompt (only if user owns it)
  updatePrompt: (id, title, content, tags = '') => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Must be logged in to update prompts');
    
    const allPrompts = JSON.parse(localStorage.getItem(PROMPTS_KEY) || '[]');
    const promptIndex = allPrompts.findIndex(p => p.id === id && p.userId === currentUser.id);
    
    if (promptIndex === -1) {
      throw new Error('Prompt not found or you do not have permission to edit it');
    }
    
    allPrompts[promptIndex] = {
      ...allPrompts[promptIndex],
      title,
      content,
      tags,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(PROMPTS_KEY, JSON.stringify(allPrompts));
    return allPrompts[promptIndex];
  },

  // Delete prompt (only if user owns it)
  deletePrompt: (id) => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Must be logged in to delete prompts');
    
    const allPrompts = JSON.parse(localStorage.getItem(PROMPTS_KEY) || '[]');
    const promptIndex = allPrompts.findIndex(p => p.id === id && p.userId === currentUser.id);
    
    if (promptIndex === -1) {
      throw new Error('Prompt not found or you do not have permission to delete it');
    }
    
    allPrompts.splice(promptIndex, 1);
    localStorage.setItem(PROMPTS_KEY, JSON.stringify(allPrompts));
  },

  // Get single prompt (only if user owns it)
  getPrompt: (id) => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return null;
    
    const allPrompts = JSON.parse(localStorage.getItem(PROMPTS_KEY) || '[]');
    return allPrompts.find(p => p.id === id && p.userId === currentUser.id) || null;
  }
};