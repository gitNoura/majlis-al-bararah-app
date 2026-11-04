// In the browser preview, Skia (the pages' drawing, src/components/PageCurl.tsx) needs its engine
// loaded before any screen opens: public/canvaskit.wasm, copied from node_modules.
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

export const skiaReady = LoadSkiaWeb({ locateFile: (file) => `/${file}` });
