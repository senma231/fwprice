import LoginForm from '@/components/auth/LoginForm';
import { getDictionary, type Locale } from '@/lib/dictionaries';

export default async function LoginPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);
  return (
    <div className="flex min-h-[calc(100vh-15rem)] flex-col items-center justify-center py-12">
      <LoginForm lang={lang} dict={dict.loginPage} commonDict={dict.common}/>
    </div>
  );
}
