import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

// Test component to verify TypeScript support and IntelliSense
export default function TestComponent() {
  const [isEnabled, setIsEnabled] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>TypeScript Test Component</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-input">Test Input</Label>
          <Input
            id="test-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type something..."
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="test-switch"
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
          <Label htmlFor="test-switch">Enable feature</Label>
        </div>
        
        <Button 
          onClick={() => alert(`Input: ${inputValue}, Switch: ${isEnabled}`)}
          className="w-full"
        >
          Test Button
        </Button>
      </CardContent>
    </Card>
  );
}