// Test file to verify fullscreen layout works
import { FullscreenMapLayout } from '@/components/layout/fullscreen-map-layout';

export default function TestFullscreen() {
  return (
    <FullscreenMapLayout>
      <div className="h-full w-full bg-blue-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Fullscreen Map Layout Test</h1>
          <p className="text-gray-600 mt-2">This should be fullscreen without sidebar</p>
          <p className="text-sm text-gray-500 mt-4">Press Escape or click Back button to return to dashboard</p>
        </div>
      </div>
    </FullscreenMapLayout>
  );
}