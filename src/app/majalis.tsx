// «majalis al-Bararah» - to be built (circles and group recitation).
import { Coming } from '@/components/Coming';
import { HOME } from '@/i18n/home';

export default function Majalis() {
  return <Coming title={HOME.majalis()} />;
}
