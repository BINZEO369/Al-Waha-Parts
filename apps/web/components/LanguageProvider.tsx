'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Locale = 'en' | 'ar';

const STORAGE_KEY = 'al-waha-parts-locale-v1';

const translations: Record<string, string> = {
  'Your privacy choices': 'خيارات الخصوصية',
  'Cookies on Al Waha Parts': 'ملفات تعريف الارتباط في قطع غيار الواحة',
  'Your cart and language preference stay in local browser storage. We save your cookie choice on this device. Optional analytics and marketing cookies are off by default.': 'يُحفظ سلة التسوق واختيار اللغة في التخزين المحلي للمتصفح. نحفظ اختيار ملفات تعريف الارتباط على هذا الجهاز. وتكون ملفات التحليلات والتسويق الاختيارية معطلة افتراضياً.',
  'No analytics or advertising tools are currently active.': 'لا توجد حالياً أدوات نشطة للتحليلات أو الإعلانات.',
  'Not now': 'ليس الآن',
  'Necessary only': 'الضرورية فقط',
  'Customise': 'تخصيص',
  'Accept all': 'قبول الكل',
  'Control your choices': 'تحكم في اختياراتك',
  'Cookie preferences': 'تفضيلات ملفات تعريف الارتباط',
  'Choose which optional cookie categories you allow. Your choice is saved on this device for up to 180 days. Optional tools will only use their category when configured.': 'اختر فئات ملفات تعريف الارتباط الاختيارية التي تسمح بها. يُحفظ اختيارك على هذا الجهاز لمدة تصل إلى 180 يوماً. ولن تستخدم الأدوات الاختيارية فئتها إلا عند تهيئتها.',
  'Close cookie settings': 'إغلاق إعدادات ملفات تعريف الارتباط',
  'Necessary cookies': 'ملفات تعريف الارتباط الضرورية',
  'Always on. Used only to remember this cookie choice.': 'مفعلة دائماً. تُستخدم فقط لتذكر اختيار ملفات تعريف الارتباط هذا.',
  'Always on': 'مفعلة دائماً',
  'Preferences cookies': 'ملفات تعريف الارتباط للتفضيلات',
  'Store optional interface choices when preference services are configured.': 'تحفظ خيارات الواجهة الاختيارية عند تهيئة خدمات التفضيلات.',
  'Analytics cookies': 'ملفات تعريف الارتباط للتحليلات',
  'Help measure site usage when an analytics service is configured.': 'تساعد على قياس استخدام الموقع عند تهيئة خدمة للتحليلات.',
  'Marketing cookies': 'ملفات تعريف الارتباط للتسويق',
  'Support campaign measurement or tailored advertising when those tools are configured.': 'تدعم قياس الحملات أو الإعلانات المخصصة عند تهيئة تلك الأدوات.',
  'Save preferences': 'حفظ التفضيلات',
  'Cookie settings': 'إعدادات ملفات تعريف الارتباط',
  'Loading brands...': 'جارٍ تحميل العلامات التجارية...',
  'Loading brand vehicles...': 'جارٍ تحميل موديلات العلامة التجارية...',
  'Try again': 'حاول مرة أخرى',
  'The brands API returned an unexpected response.': 'أعادت واجهة العلامات التجارية استجابة غير متوقعة.',
  'The brand API returned an unexpected response.': 'أعادت واجهة العلامة التجارية استجابة غير متوقعة.',
  'Brand details are not available.': 'تفاصيل العلامة التجارية غير متاحة.',
  'Home': 'الرئيسية',
  'Categories': 'الأقسام',
  'Vehicle Finder': 'البحث عن سيارة',
  'Contact': 'تواصل معنا',
  'Search': 'بحث',
  'Menu': 'القائمة',
  'Search catalog': 'البحث في الكتالوج',
  'Find a part': 'ابحث عن قطعة',
  'Catalog search': 'بحث في الكتالوج',
  'Search parts or vehicles': 'ابحث عن قطع أو سيارات',
  'Search cars by make, model and year →': 'ابحث حسب الشركة والموديل والسنة ←',
  'Close search': 'إغلاق البحث',
  'Close navigation': 'إغلاق القائمة',
  'Wishlist': 'قائمة الرغبات',
  'Shopping cart': 'سلة الحجز',
  'Popular Cars': 'السيارات الشائعة',
  'Popular Categories': 'الأقسام الشائعة',
  'New Arrivals': 'وصل حديثاً',
  'View all categories': 'عرض كل الأقسام',
  'Open full catalog': 'فتح الكتالوج الكامل',
  'Browse parts': 'تصفح القطع',
  'View product details': 'عرض تفاصيل المنتج',
  'Database-first catalog': 'كتالوج مرتبط بقاعدة البيانات',
  'Only published records appear': 'تظهر السجلات المنشورة فقط',
  'Fitment support': 'دعم توافق القطع',
  'Use the vehicle finder': 'استخدم البحث عن سيارة',
  'Booking desk': 'مكتب الحجوزات',
  'Booking goes to the parts desk': 'يصل الحجز إلى فريق القطع',
  'Live availability': 'التوفر المباشر',
  'Stock comes from the catalog': 'المخزون من الكتالوج',
  'Model years': 'سنوات الموديل',
  'Vehicle type': 'نوع السيارة',
  'Explore': 'استكشف',
  'View parts': 'عرض القطع',
  'Information': 'معلومات',
  'About us': 'من نحن',
  'Contact us': 'تواصل معنا',
  'Delivery information': 'معلومات التوصيل',
  'Customer service': 'خدمة العملاء',
  'My account': 'حسابي',
  'Vehicle finder': 'البحث عن سيارة',
  'Right part. Right fit.': 'القطعة المناسبة. التوافق الصحيح.',
  'Al Waha Car Scrap, Al Jubail 35428, Saudi Arabia': 'سكراب الوحة للسيارات، الجبيل 35428، المملكة العربية السعودية',
  'Automatic product booking': 'حجز المنتج تلقائياً',
  'Your selected product is ready.': 'المنتج الذي اخترته جاهز.',
  'From the live database': 'من قاعدة البيانات المباشرة',
  'Selected products': 'المنتجات المختارة',
  'Clear selection': 'مسح الاختيار',
  'Total booking amount': 'إجمالي مبلغ الحجز',
  'Name for callback': 'الاسم للاتصال',
  'Phone for callback': 'رقم الهاتف للاتصال',
  'Email (optional)': 'البريد الإلكتروني (اختياري)',
  'Delivery method': 'طريقة التوصيل',
  'Pickup / confirm with parts desk': 'استلام / التأكيد مع فريق القطع',
  'Delivery in Saudi Arabia': 'توصيل داخل المملكة العربية السعودية',
  'City': 'المدينة',
  'Delivery address': 'عنوان التوصيل',
  'Note for the parts desk (optional)': 'ملاحظة لفريق القطع (اختياري)',
  'Confirm booking': 'تأكيد الحجز',
  'Saving booking…': 'جارٍ حفظ الحجز…',
  'No online payment. The team will call to confirm the SAR total, delivery method and handover.': 'لا يوجد دفع إلكتروني. سيتصل بك الفريق لتأكيد الإجمالي بالريال السعودي وطريقة التوصيل والتسليم.',
  'Live database request desk': 'مكتب طلبات قاعدة البيانات المباشرة',
  'Select a product once. Its live database details and total are attached automatically, then our parts desk will call you to confirm delivery and handover.': 'اختر المنتج مرة واحدة. ستتم إضافة تفاصيله وإجماليه من قاعدة البيانات تلقائياً، ثم سيتصل بك فريق القطع لتأكيد التوصيل والتسليم.',
  '01 · Select': '٠١ · اختر',
  '02 · Review': '٠٢ · راجع',
  '03 · Call': '٠٣ · اتصال',
  'Press Booking now on the product you want.': 'اضغط على احجز الآن للمنتج المطلوب.',
  'Product details, live stock and total are attached automatically.': 'تتم إضافة تفاصيل المنتج والمخزون والإجمالي تلقائياً.',
  'Our parts desk calls to confirm delivery and handover.': 'سيتصل بك فريق القطع لتأكيد التوصيل والتسليم.',
  'Name': 'الاسم',
  'Phone': 'الهاتف',
  'Email': 'البريد الإلكتروني',
  'Select manufacturer': 'اختر الشركة المصنعة',
  'Select model': 'اختر الموديل',
  'Select year': 'اختر السنة',
  'Show compatible parts': 'عرض القطع المتوافقة',
  'Start with the vehicle.': 'ابدأ باختيار السيارة.',
  'Vehicle fitment profile': 'ملف توافق السيارة',
  'Browse all compatible parts': 'تصفح جميع القطع المتوافقة',
  'Parts for this vehicle': 'قطع هذه السيارة',
  'Booking now': 'احجز الآن',
  'Out of stock': 'غير متوفر',
  'Verified fit': 'توافق مؤكد',
  'Tested': 'تم اختباره',
  'Available to order': 'متاح للطلب',
  'No vehicle image': 'لا توجد صورة للسيارة',
};

const entries = Object.entries(translations).sort((a, b) => b[0].length - a[0].length);
const originalText = new WeakMap<Text, string>();
let translating = false;

function translateText(value: string, locale: Locale) {
  if (locale === 'en') return value;
  let result = value;
  for (const [english, arabic] of entries) result = result.split(english).join(arabic);
  return result;
}

function translateDocument(locale: Locale) {
  if (typeof document === 'undefined' || translating) return;
  translating = true;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let current: Node | null;
  while ((current = walker.nextNode())) {
    const node = current as Text;
    if (node.parentElement?.closest('[data-no-translate], script, style')) continue;
    textNodes.push(node);
  }
  for (const node of textNodes) {
    const original = originalText.get(node) ?? node.nodeValue ?? '';
    originalText.set(node, original);
    node.nodeValue = translateText(original, locale);
  }
  document.querySelectorAll<HTMLElement>('[placeholder], [aria-label], [title]').forEach((element) => {
    for (const attribute of ['placeholder', 'aria-label', 'title']) {
      const value = element.getAttribute(attribute);
      if (!value) continue;
      const key = `data-original-${attribute}`;
      if (!element.hasAttribute(key)) element.setAttribute(key, value);
      element.setAttribute(attribute, translateText(element.getAttribute(key) || value, locale));
    }
  });
  translating = false;
}

const LanguageContext = createContext<{ locale: Locale; toggle: () => void }>({ locale: 'en', toggle: () => undefined });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'ar') setLocale('ar');
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === 'ar' ? 'ar-SA' : 'en';
    // Translate text only. The approved storefront composition, menu order and spacing stay LTR.
    document.documentElement.dir = 'ltr';
    window.localStorage.setItem(STORAGE_KEY, locale);
    translateDocument(locale);
    const observer = new MutationObserver(() => translateDocument(locale));
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [locale]);

  const value = useMemo(() => ({ locale, toggle: () => setLocale((current) => current === 'en' ? 'ar' : 'en') }), [locale]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
