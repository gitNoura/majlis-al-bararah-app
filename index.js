// The app starts here. The phone's small database is installed as localStorage first, before any
// screen or setting is read (the texts, the theme, the wird... read it as soon as they load), then
// Expo Router opens the screens (src/app/).
import 'expo-sqlite/localStorage/install';
import 'expo-router/entry';
