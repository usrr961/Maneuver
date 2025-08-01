import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { haptics } from '@/lib/haptics';

export function HapticsTest() {
  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Haptics Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={() => haptics.light()} 
            variant="outline" 
            size="sm"
          >
            Light
          </Button>
          <Button 
            onClick={() => haptics.medium()} 
            variant="outline" 
            size="sm"
          >
            Medium
          </Button>
          <Button 
            onClick={() => haptics.strong()} 
            variant="outline" 
            size="sm"
          >
            Strong
          </Button>
          <Button 
            onClick={() => haptics.success()} 
            variant="outline" 
            size="sm"
          >
            Success
          </Button>
        </div>
        
        <Button 
          onClick={() => haptics.showDebugInfo()} 
          className="w-full mt-4"
          variant="secondary"
        >
          Show Debug Info
        </Button>
        
        <div className="text-xs text-muted-foreground mt-2">
          Supported: {haptics.isSupported() ? '✅ Yes' : '❌ No'}
        </div>
      </CardContent>
    </Card>
  );
}
