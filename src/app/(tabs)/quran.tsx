// QURAN tab (stub until phase c: the one-page Read / Listen / Recite screen).
import { TabStub } from '@/components/TabStub';
import { HOME } from '@/i18n/home';
import { NAV } from '@/i18n/nav';

export default function QuranTab() {
  return <TabStub title={HOME.tabQuran()} links={[{ title: NAV.previous(), sub: NAV.previousSub(), href: '/reader-old' }]} />;
}
