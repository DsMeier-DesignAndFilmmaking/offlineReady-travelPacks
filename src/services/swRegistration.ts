let registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

const resolveServiceWorkerUrl = (): string =>
  import.meta.env.DEV ? '/dev-sw.js?dev-sw' : '/sw.js';

const waitForWindowLoad = async (): Promise<void> => {
  if (document.readyState === 'complete') {
    return;
  }

  await new Promise<void>((resolve) => {
    window.addEventListener(
      'load',
      () => {
        resolve();
      },
      { once: true },
    );
  });
};

const looksLikeJavaScriptMime = (contentType: string | null): boolean => {
  if (!contentType) {
    return false;
  }

  return (
    contentType.includes('javascript') ||
    contentType.includes('ecmascript') ||
    contentType.includes('application/x-javascript') ||
    contentType.includes('text/javascript')
  );
};

const canRegisterDevServiceWorker = async (): Promise<boolean> => {
  const scriptUrl = resolveServiceWorkerUrl();

  try {
    const response = await fetch(scriptUrl, {
      cache: 'no-store',
      headers: {
        Accept: 'text/javascript,*/*;q=0.1',
      },
    });

    if (!response.ok) {
      return false;
    }

    return looksLikeJavaScriptMime(response.headers.get('content-type'));
  } catch {
    return false;
  }
};

export const registerServiceWorker = (): Promise<ServiceWorkerRegistration | null> => {
  if (registrationPromise) {
    return registrationPromise;
  }

  if (!('serviceWorker' in navigator)) {
    registrationPromise = Promise.resolve(null);
    return registrationPromise;
  }

  registrationPromise = (import.meta.env.DEV ? waitForWindowLoad() : Promise.resolve())
    .then(async () => {
      if (import.meta.env.DEV) {
        const readyForDevRegister = await canRegisterDevServiceWorker();
        if (!readyForDevRegister) {
          return null;
        }
      }

      return navigator.serviceWorker.register(resolveServiceWorkerUrl(), {
        scope: '/',
        type: import.meta.env.DEV ? 'module' : undefined,
      });
    })
    .catch((error: unknown) => {
      console.error('Service worker registration failed', error);
      return null;
    });

  return registrationPromise;
};

const waitForActiveWorker = async (timeoutMs = 5000): Promise<ServiceWorker | null> => {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  const readyRegistration = await Promise.race<ServiceWorkerRegistration | null>([
    navigator.serviceWorker.ready.then((registration) => registration),
    new Promise<ServiceWorkerRegistration | null>((resolve) => {
      window.setTimeout(() => {
        resolve(null);
      }, timeoutMs);
    }),
  ]);

  return readyRegistration?.active ?? null;
};

export const getActiveServiceWorker = async (): Promise<ServiceWorker | null> => {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  await registerServiceWorker();

  const currentRegistration = await navigator.serviceWorker.getRegistration('/');
  if (currentRegistration?.active) {
    return currentRegistration.active;
  }

  return waitForActiveWorker();
};
