export interface Prompt {
    id: number
    title: string
    content: string
    tags: string[]
    created_at: string
    updated_at: string
  }
  
  // Get all prompts from localStorage
  export const getPrompts = (): Prompt[] => {
    if (typeof window === 'undefined') return []
    
    try {
      const prompts = localStorage.getItem('prompts')
      return prompts ? JSON.parse(prompts) : []
    } catch (error) {
      console.error('Error reading prompts:', error)
      return []
    }
  }
  
  // Save prompts to localStorage
  export const savePrompts = (prompts: Prompt[]): void => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem('prompts', JSON.stringify(prompts))
    } catch (error) {
      console.error('Error saving prompts:', error)
    }
  }
  
  // Add a new prompt
  export const addPrompt = (title: string, content: string, tags: string[]): Prompt => {
    const newPrompt: Prompt = {
      id: Date.now(), // Simple ID generation
      title,
      content,
      tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const existingPrompts = getPrompts()
    const updatedPrompts = [newPrompt, ...existingPrompts]
    savePrompts(updatedPrompts)
    
    return newPrompt
  }
  
  // Update an existing prompt
  export const updatePrompt = (id: number, title: string, content: string, tags: string[]): void => {
    const prompts = getPrompts()
    const index = prompts.findIndex(p => p.id === id)
    
    if (index !== -1) {
      prompts[index] = {
        ...prompts[index],
        title,
        content,
        tags,
        updated_at: new Date().toISOString()
      }
      savePrompts(prompts)
    }
  }
  
  // Delete a prompt
  export const deletePrompt = (id: number): void => {
    const prompts = getPrompts()
    const filteredPrompts = prompts.filter(p => p.id !== id)
    savePrompts(filteredPrompts)
  }
  
  // Get a single prompt by ID
  export const getPromptById = (id: number): Prompt | null => {
    const prompts = getPrompts()
    return prompts.find(p => p.id === id) || null
  }