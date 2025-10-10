import React from 'react';
import { Button } from '../src/components/ui/button';
import { Card } from '../src/components/ui/card';
import { Input } from '../src/components/ui/input';

// Test that components have proper TypeScript types
const TestComponent: React.FC = () => {
  return (
    <Card>
      <Input placeholder="Test" />
      <Button onClick={() => console.log('clicked')}>
        Click me
      </Button>
    </Card>
  );
};

export default TestComponent;
