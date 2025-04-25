
import React, { useEffect } from 'react';
import { openRouterService } from '@/services/openRouterService';

interface ApiKeySetupProps {
  onApiKeySet: () => void;
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onApiKeySet }) => {
  useEffect(() => {
    const initializeApiKey = async () => {
      const defaultApiKey = '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';
      
      try {
        // Set the API key
        openRouterService.setApiKey(defaultApiKey);
        
        // Test the API key with a simple request
        await openRouterService.chat([{ role: 'user', content: 'Hello' }]);
        
        // If successful, trigger the callback
        onApiKeySet();
      } catch (err) {
        console.error('API key validation error:', err);
      }
    };

    initializeApiKey();
  }, [onApiKeySet]);

  // Return null since we don't need to show any UI
  return null;
};

export default ApiKeySetup;

