import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/animate-ui/radix/checkbox';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface ApiKeyFormProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  rememberForSession: boolean;
  setRememberForSession: (remember: boolean) => void;
}

export const ApiKeyForm: React.FC<ApiKeyFormProps> = ({
  apiKey,
  setApiKey,
  rememberForSession,
  setRememberForSession
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const apiInputRef = useRef<HTMLInputElement | null>(null);

  // Load API key from sessionStorage on component mount
  useEffect(() => {
    const sessionApiKey = sessionStorage.getItem("tbaApiKey");
    if (sessionApiKey) {
      setApiKey(sessionApiKey);
      setRememberForSession(true);
    }
  }, [setApiKey, setRememberForSession]);

  // Save/remove API key from sessionStorage when remember preference changes
  useEffect(() => {
    if (rememberForSession && apiKey) {
      sessionStorage.setItem("tbaApiKey", apiKey);
    } else if (rememberForSession && !apiKey) {
      toast.error("API key cannot be empty if you want to remember it for this session.");
    } else {
      sessionStorage.removeItem("tbaApiKey");
    }
  }, [rememberForSession, apiKey]);

  useEffect(() => {
    // Check for autofilled value after a short delay
    const timeout = setTimeout(() => {
      if (apiInputRef.current) {
        const val = apiInputRef.current.value;
        if (val && val !== apiKey) {
          setApiKey(val);
        }
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [apiKey, setApiKey]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>API Configuration</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter your TBA API key for match data access
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey">TBA API Key</Label>
          <div className="relative pb-1">
            <Input
              ref={apiInputRef}
              id="apiKey"
              name="tba-api-key"
              type={showApiKey ? "text" : "password"}
              placeholder="Enter your Blue Alliance API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label={showApiKey ? "Hide API key" : "Show API key"}
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          
          {/* Session storage option */}
          <div className="flex items-center space-x-3 mt-2 pb-2 p-3 -ml-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Checkbox
              id="rememberSession"
              checked={rememberForSession}
              onCheckedChange={(checked) => setRememberForSession(checked === true)}
              className="shrink-0"
            />
            <label htmlFor="rememberSession" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
              Remember for this session only
            </label>
          </div>
          
          {/* Security notice */}
          <div className="flex items-start space-x-2 mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
            <Shield className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800">
              API keys are never stored permanently for security. Use your browser's password manager for convenient access.
            </p>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Get your API key from <a href="https://www.thebluealliance.com/account" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">The Blue Alliance</a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
