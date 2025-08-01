interface GAEvent {
  name: string;
  parameters: Record<string, any>;
  timestamp: number;
}

class OfflineGA4 {
  private measurementId = 'G-QC65PEFPDJ';
  private storageKey = 'ga4-offline-queue';
  private sessionId: string;
  private clientId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.clientId = this.getOrCreateClientId();
    this.initializeGA4();
  }

  private initializeGA4() {
    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', this.measurementId, {
      send_page_view: false, // We'll handle page views manually
      client_id: this.clientId,
      session_id: this.sessionId,
    });

    // Listen for online events to flush queue
    window.addEventListener('online', () => this.flushQueue());
  }

  private generateSessionId(): string {
    return Date.now().toString();
  }

  private getOrCreateClientId(): string {
    let clientId = localStorage.getItem('ga4-client-id');
    if (!clientId) {
      clientId = 'client-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('ga4-client-id', clientId);
    }
    return clientId;
  }

  // Track page view
  trackPageView(pagePath: string = window.location.pathname) {
    this.trackEvent('page_view', {
      page_path: pagePath,
      page_title: document.title,
      app_version: '2025.1.0',
    });
  }

  // Track custom events
  trackEvent(eventName: string, parameters: Record<string, any> = {}) {
    const event: GAEvent = {
      name: eventName,
      parameters: {
        ...parameters,
        client_id: this.clientId,
        session_id: this.sessionId,
        timestamp_micros: Date.now() * 1000,
      },
      timestamp: Date.now(),
    };

    if (navigator.onLine && window.gtag) {
      // Send immediately if online
      window.gtag('event', eventName, parameters);
    } else {
      // Queue for later if offline
      this.addToQueue(event);
    }
  }

  private addToQueue(event: GAEvent) {
    const queue = this.getQueue();
    queue.push(event);
    localStorage.setItem(this.storageKey, JSON.stringify(queue));
  }

  private getQueue(): GAEvent[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async flushQueue() {
    const queue = this.getQueue();
    if (queue.length === 0 || !window.gtag) return;

    console.log(`Flushing ${queue.length} queued analytics events`);
    
    // Send all queued events
    queue.forEach(event => {
      window.gtag('event', event.name, event.parameters);
    });

    // Clear the queue
    localStorage.removeItem(this.storageKey);
  }

  // Specific tracking methods for your app
  trackDemoDataLoad() {
    this.trackEvent('demo_data_load', {
      event_category: 'engagement',
      event_label: 'demo_data',
      value: 1,
    });
  }

  trackDemoDataClear() {
    this.trackEvent('demo_data_clear', {
      event_category: 'engagement',
      event_label: 'demo_data',
      value: 0,
    });
  }

  trackPWAUpdate() {
    this.trackEvent('pwa_update', {
      event_category: 'app',
      event_label: 'update',
      app_version: '2025.1.0',
    });
  }

  trackPWAInstall() {
    this.trackEvent('pwa_install', {
      event_category: 'app',
      event_label: 'install',
      app_version: '2025.1.0',
    });
  }
}

export const analytics = new OfflineGA4();

// Type declarations for gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}