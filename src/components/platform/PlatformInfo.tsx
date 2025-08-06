'use client';

import { useEffect, useState } from 'react';
import { getPlatform, getCapabilities, isNative } from '@/lib/platform';
import type { Platform, PlatformCapabilities } from '@/lib/platform';

export default function PlatformInfo() {
  const [platform, setPlatform] = useState<Platform>('web');
  const [capabilities, setCapabilities] = useState<PlatformCapabilities | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPlatform(getPlatform());
    setCapabilities(getCapabilities());
  }, []);

  if (!mounted) {
    return <div>Loading platform info...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Platform Information</h2>
      
      <div className="space-y-3">
        <div>
          <span className="font-semibold">Platform: </span>
          <span className={`px-2 py-1 rounded text-sm ${
            platform === 'android' ? 'bg-green-100 text-green-800' :
            platform === 'ios' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {platform.toUpperCase()}
          </span>
        </div>
        
        <div>
          <span className="font-semibold">Environment: </span>
          <span className={`px-2 py-1 rounded text-sm ${
            isNative() ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
          }`}>
            {isNative() ? 'NATIVE' : 'WEB'}
          </span>
        </div>

        {capabilities && (
          <div>
            <h3 className="font-semibold mb-2">Available Capabilities:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(capabilities).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <span className={`w-3 h-3 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="capitalize">{key.replace('has', '').toLowerCase()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">
            {isNative() 
              ? `🎉 Running natively on ${platform}! You can access device features.`
              : '🌐 Running in web browser. Some native features may not be available.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}