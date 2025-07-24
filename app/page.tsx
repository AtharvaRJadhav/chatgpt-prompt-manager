import React from "react";

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
            <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
            <p className="text-gray-600">
              We're building an amazing tool to help you manage your ChatGPT prompts!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}