# NotifyZen Every Where

A universal TypeScript notification library for React, Next.js, React Native, Vue, and vanilla JavaScript.

## Features
- 🚀 Universal: Works across all JS environments.
- ⚡️ React Hook: Simple `useNotifyZen` hook for React-based frameworks.
- 🔥 Firebase Integrated: Built-in FCM support.
- 🔌 Dummy APIs: Pre-configured dummy endpoints for registration and history.

## Installation
```bash
npm install notifyzen-every-where
```

## Usage

const credentials = { ... };

function App() {
  const { notifications, currentToken, isInitializing } = useNotifyZen(credentials, {
    secretKey: "your_super_secret_key_123",
    // platformMode: Auto-detected (web, ios, or android)
    // uniqueDeviceId: Auto-generated 
    topics: ["news", "updates"],
    debug: true,
  });

  return (
    <div>
      <h1>Token: {currentToken}</h1>
      <ul>
        {notifications.map((n, i) => (
          <li key={i}>{n.title}: {n.body}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Vanilla JS / Vue / Solid
```ts
import { notifyZen } from 'notifyzen-every-where';

const credentials = { ... };

await notifyZen.initialize({
  credentials,
  debug: true,
  onNotification: (n) => {
    console.log('Got notification', n);
  }
});

// Add more listeners later
const unsubscribe = notifyZen.addListener((n) => {
  // Update your state manually
});
```

### React Native (iOS/Android)
Since Firebase Cloud Messaging requires native platform-specific code (APNs/FCM) for standard React Native apps, use `@react-native-firebase/messaging` with our `createNativeProvider`.

```tsx
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
import { useNotifyZen, createNativeProvider } from 'notifyzen-every-where';

const nativeProvider = createNativeProvider(messaging());
const deviceId = DeviceInfo.getUniqueId(); // Get unique ID from native module

function RNApp() {
  const { notifications, currentToken } = useNotifyZen(credentials, {
    secretKey: "your_secret_api_key",
    platformMode: "ios", 
    uniqueDeviceId: deviceId, // Pass it here for mobile
    provider: nativeProvider,
    debug: true,
  });

  return (
    <View>
      <Text>FCM Token: {currentToken}</Text>
    </View>
  );
}
```

## Development
- `npm run build`: Build the library for production (CJS, ESM).
- `npm run dev`: Build and watch for changes.
- `npm run lint`: Run TypeScript type checking.
