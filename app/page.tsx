import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ChatGPT Prompt Manager
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Save, organize, and reuse your favorite ChatGPT prompts
          </p>
          
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
            <p className="text-gray-600 mb-6">
              Start building your prompt library today!
            </p>
            
            <div className="space-y-3">
              <Link 
                href="/prompts"
                className="block w-full bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
              >
                View My Prompts
              </Link>
              
              <Link 
                href="/add-prompt"
                className="block w-full bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition-colors"
              >
                Add New Prompt
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}