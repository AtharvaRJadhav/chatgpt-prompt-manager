'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '../../lib/auth';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [promptCount, setPromptCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    setUser(currentUser);
    
    // Count user's prompts
    const allPrompts = JSON.parse(localStorage.getItem('prompts') || '[]');
    const userPrompts = allPrompts.filter((p: any) => p.userId === currentUser.id);
    setPromptCount(userPrompts.length);
  }, [router]);

  const handleLogout = () => {
    authService.logout();
    router.push('/');
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const isAtLimit = user.plan === 'free' && promptCount >= 5;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                Prompt Manager
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Hello, {user.name}</span>
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

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Stats Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">P</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Your Prompts
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {promptCount} {user.plan === 'free' ? '/ 5' : ''}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      user.plan === 'pro' ? 'bg-green-500' : 'bg-gray-400'
                    }`}>
                      <span className="text-white font-bold">
                        {user.plan === 'pro' ? '★' : 'F'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Current Plan
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 capitalize">
                        {user.plan}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {!isAtLimit ? (
                    <Link
                      href="/add-prompt"
                      className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700"
                    >
                      Add New Prompt
                    </Link>
                  ) : (
                    <div>
                      <button
                        disabled
                        className="block w-full bg-gray-300 text-gray-500 text-center py-2 px-4 rounded cursor-not-allowed"
                      >
                        Limit Reached (5/5)
                      </button>
                      <p className="text-sm text-gray-600 mt-2">
                        Upgrade to Pro for unlimited prompts!
                      </p>
                    </div>
                  )}
                  
                  <Link
                    href="/prompts"
                    className="block w-full bg-gray-600 text-white text-center py-2 px-4 rounded hover:bg-gray-700"
                  >
                    View All Prompts
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Warning for Free Users */}
          {user.plan === 'free' && promptCount >= 4 && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    {promptCount >= 5 ? 'Prompt Limit Reached!' : 'Almost at your limit!'}
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      You're using {promptCount} of your 5 free prompts. 
                      {promptCount >= 5 
                        ? ' Upgrade to Pro for unlimited prompts!' 
                        : ' Upgrade to Pro before you hit the limit!'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}