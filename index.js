// The app starts here. The phone's small database is installed as localStorage first, before any
// screen or setting is read (the texts, the theme, the wird... read it as soon as they load), then
// Expo Router opens the screens (src/app/) - in the browser preview, once Skia's engine has loaded.
import 'expo-sqlite/localStorage/install';

import { skiaReady } from './src/skia-load';

if (skiaReady) skiaReady.then(() => require('expo-router/entry'));
else require('expo-router/entry');
