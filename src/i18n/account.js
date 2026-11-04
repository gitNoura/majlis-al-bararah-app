// The account screens' own words (logging in, creating an account, the profile). The ones shared with
// the website's texts (email, password, Google, errors...) are its t('ac…') texts in i18n.js / i18n-fr.js.
import { L } from './i18n.js';

export const ACCOUNT = {
  welcomeBack: () => L('أهلاً بعودتك', 'Welcome back', 'Bon retour'),
  loginSub: () => L('سجّل الدخول لتجد وِردك ومجالسك', 'Log in to find your wird and your majalis', 'Connectez-vous pour retrouver votre wird et vos majalis'),
  join: () => L('انضم إلى مجلس البررة', 'Join Majlis al-Bararah', 'Rejoignez Majlis al-Bararah'),
  joinSub: () => L('لتحفظ وِردك وتنضم إلى المجالس', 'To keep your wird and join the majalis', 'Pour garder votre wird et rejoindre les majalis'),
  signUpEmail: () => L('إنشاء حساب بالبريد', 'Create with email', 'Créer avec un e-mail'),
  logInEmail: () => L('الدخول بالبريد', 'Log in with email', 'Connexion par e-mail'),
  checkInbox: () => L('افتح بريدك', 'Check your inbox', 'Vérifiez votre boîte mail'),
  backToLogin: () => L('العودة إلى تسجيل الدخول', 'Back to log in', 'Retour à la connexion'),
  failed: () => L('تعذّر ذلك. تحقّق من اتصالك وحاول مجدداً.', 'That did not work. Check your connection and try again.', 'Cela n’a pas marché. Vérifiez votre connexion et réessayez.'),
  // the profile, created after the first sign-in
  completeTitle: () => L('أكمل ملفك', 'Complete your profile', 'Complétez votre profil'),
  completeSub: () => L('خطوة أخيرة قبل أن تبدأ', 'One last step before you begin', 'Une dernière étape avant de commencer'),
  namePlaceholder: () => L('اسمك', 'Your name', 'Votre nom'),
  nameShort: () => L('الاسم من حرفين إلى 30 حرفاً.', 'The name is 2 to 30 letters.', 'Le nom fait de 2 à 30 lettres.'),
  begin: () => L('ابدأ', 'Begin', 'Commencer'),
  // the profile page
  title: () => L('ملفي', 'My profile', 'Mon profil'),
  daysInRow: () => L('أيام متتالية', 'Days in a row', 'Jours de suite'),
  daysRead: () => L('أيام القراءة', 'Days read', 'Jours de lecture'),
  myJourney: () => L('رحلتي', 'My journey', 'Mon parcours'),
  account: () => L('الحساب', 'Account', 'Compte'),
  settings: () => L('الإعدادات', 'Settings', 'Paramètres'),
  rename: () => L('تغيير الاسم', 'Change the name', 'Changer le nom'),
};
