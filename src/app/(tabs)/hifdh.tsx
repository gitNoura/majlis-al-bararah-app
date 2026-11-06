// HIFDH tab (stub until phase d: Today / Plan / Progress).
import { TabStub } from '@/components/TabStub';
import { HOME } from '@/i18n/home';
import { NAV } from '@/i18n/nav';

export default function HifdhTab() {
  return <TabStub title={HOME.tabMemorize()} links={[{ title: NAV.previous(), sub: NAV.previousSub(), href: '/hifdh-old' }]} />;
}
