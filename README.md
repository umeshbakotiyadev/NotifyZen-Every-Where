# 🚀 NotifyZen Every Where - The Universal Notification Engine

**NotifyZen Every Where** is a zero-config, framework-agnostic TypeScript engine for Firebase Cloud Messaging (FCM). It is designed to work seamlessly across **React, Next.js, Vue, Svelte, and React Native** with a single unified API.

---

## 🌟 Key Features
-   **Zero-Config Identification**: Automatic hardware fingerprinting on Web (`FingerprintJS`) and Native (`DeviceInfo`).
-   **Smart Platform Detection**: Automatically identifies `ios`, `android`, or `web`.
-   **Hands-Free Interaction Tracking**: Taps and clicks are auto-reported to your backend.
-   **Pure Logic-Driven**: Stateless hook allows you to use any state manager you want.
-   **Smart Guidance System**: Real-time console advice for developers (silenced in production).

---

## 🛠️ Installation

```bash
npm install notifyzen-every-where @fingerprintjs/fingerprintjs
```
*For React Native:*
```bash
npm install @react-native-firebase/messaging react-native-device-info
```

---

## 📚 Complete Usage Examples

### ⚛️ React Hooks Example (Web)
```tsx
import { useNotifyZen } from 'notifyzen-every-where';

function App() {
  const [messages, setMessages] = useState([]);

  // 1. Initialize with your secret and topics
  const { 
    onNotification, 
    onNotificationClick, 
    isInitializing 
  } = useNotifyZen(FIREBASE_CONFIG, {
    secretKey: "your_api_secrate",
    topics: ["news", "offers"],
    debug: true
  });

  // 2. Set up your custom listeners
  useEffect(() => {
    // Arrival Listener
    const unsubMsg = onNotification((n) => setMessages(prev => [n, ...prev]));

    // Interaction (Click) Listener
    const unsubClick = onNotificationClick((n) => alert("You clicked: " + n.title));

    return () => { unsubMsg(); unsubClick(); };
  }, [onNotification, onNotificationClick]);

  if (isInitializing) return <p>Loading...</p>;
  return <div>My Dashboard</div>;
}
```

### 📱 React Native Example (Mobile)
```tsx
import messaging from '@react-native-firebase/messaging';
import { useNotifyZen, createNativeProvider } from 'notifyzen-every-where';

// 1. Create the native provider bridge
const nativeProvider = createNativeProvider(messaging());

function App() {
  // 2. Use the hook with the native bridge
  const { onNotificationClick } = useNotifyZen(FIREBASE_CONFIG, {
    secretKey: "your_api_secrate",
    provider: nativeProvider, // Bridge to native FCM
    debug: true
  });

  useEffect(() => {
      // 3. Handles background & quit-state clicks automatically
      const unsub = onNotificationClick((n) => {
          navigate(n.data.screen);
      });
      return unsub;
  }, [onNotificationClick]);
  
  return <HomeScreen />;
}
```

### 💚 Vue 3 Example (Web)
```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { notifyZen } from 'notifyzen-every-where';

const messages = ref([]);
let unsubMsg = null;

onMounted(async () => {
  // 1. Initialize Singleton
  await notifyZen.initialize({
    credentials: FIREBASE_CONFIG,
    secretKey: 'your_api_secrate',
    topics: ['vue_global'],
    debug: true
  });

  // 2. Set up event listener
  unsubMsg = notifyZen.addListener('onMessage', (n) => {
    messages.value.unshift(n);
  });
});

onUnmounted(() => { if (unsubMsg) unsubMsg(); });
</script>
```

### 🍦 Vanilla JS Example (Web)
```html
<script type="module">
  import { notifyZen } from './dist/index.mjs';

  async function bootstrap() {
    // 1. Initialize the singleton
    await notifyZen.initialize({
      credentials: FIREBASE_CONFIG,
      secretKey: 'your_api_secrate',
      topics: ['vanilla_global'],
      debug: true
    });

    // 2. Add Arrival Listener
    notifyZen.addListener('onMessage', (n) => {
      const item = document.createElement('li');
      item.innerText = n.title;
      document.getElementById('list').prepend(item);
    });

    // 3. Add Interaction (Click) Listener
    notifyZen.addListener('onClick', (n) => {
      alert('You clicked: ' + n.title);
    });
  }
  
  bootstrap();
</script>
```

---

## 🔍 Smart Logs System
When `debug: true` is set, the library communicates with you:

| Level | Message | Rationale |
| :--- | :--- | :--- |
| **Debug** | `[NotifyZen] Detected platform mode: web` | Confirms auto-detection is working. |
| **Debug** | `[NotifyZen] Auto-detected Web ID: xyz...` | Confirms uniqueness generator worked. |
| **Warn** | `[NotifyZen] DeviceInfo not found.` | Guidance on missing native dependencies for RN. |
| **Error** | `[NotifyZen] Failed to load Web Messaging.` | Guidance on missing `firebase/messaging` for Web. |

---

## 🛠️ Troubleshooting (Eresolve Problems)

### 1. Web Background Notifications
**Problem**: Notifications only show when the tab is open.  
**Fix**: You MUST put a `firebase-messaging-sw.js` in your `/public` folder.

### 2. Native ID Fallback
**Problem**: The log says `Mobile Device ID fallback generated`.  
**Fix**: Ensure `react-native-device-info` is linked correctly using `npx pod-install`.

---

## 📚 API Reference (Internal Configuration)

Any value in **Bold** is automatically managed by the engine.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `credentials` | Object | Required | Your Firebase config. |
| `secretKey` | String | Required | Your unique API token for backend. |
| **`platformMode`** | String | `'auto'` | Detected: `web`, `ios`, `android`. |
| **`uniqueDeviceId`** | String | `'auto'` | Generated using Fingerprint/Native ID. |
| `topics` | string[] | `[]` | Array of interests to sync. |
| `debug` | boolean | `false` | Toggles the Guidance System. |

---

## ⚖️ License
Licensed under **Private MIT**. Contact **umeshbakotiyadev** for access.
