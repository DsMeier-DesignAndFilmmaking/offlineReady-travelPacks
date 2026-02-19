import { useCallback, useEffect, useState } from 'react';

interface InstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

interface UseInstallPromptState {
  canInstall: boolean;
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
}

export const useInstallPrompt = (): UseInstallPromptState => {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstall = (event: Event): void => {
      const installEvent = event as InstallPromptEvent;
      installEvent.preventDefault();
      setPromptEvent(installEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!promptEvent) {
      return 'unavailable';
    }

    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;

    if (choice.outcome === 'accepted') {
      setPromptEvent(null);
      return 'accepted';
    }

    return 'dismissed';
  }, [promptEvent]);

  return {
    canInstall: Boolean(promptEvent),
    promptInstall,
  };
};
