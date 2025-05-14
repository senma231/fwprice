'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast'; // Import useToast
import type { User } from '@/types/auth';


const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }), // Message will be overridden by dict if needed
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  lang: string;
  dict: any; // From loginPage namespace
  commonDict: any; // From common namespace
}

const LoginForm = ({ lang, dict, commonDict }: LoginFormProps) => {
  const { login, isLoading } = useAuth();
  const { toast } = useToast(); // Get toast function

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    // Login function now returns user or null, or throws error
    const loggedInUser: User | null = await login(data.email, data.password); 
    
    if (loggedInUser) {
      toast({
        title: dict.loginSuccessTitle,
        description: dict.loginSuccessDesc.replace('{name}', loggedInUser.name || loggedInUser.email),
      });
      // Router push is handled by AuthContext
    } else {
      // This case implies login function returned null, meaning invalid creds but no other error
      toast({
        title: dict.loginFailedTitle,
        description: dict.loginFailedDesc,
        variant: "destructive"
      });
    }
    // Errors from login (e.g. network) are caught in AuthContext and shown as generic error toasts.
    // If specific error messages from login need to be shown here, login should throw typed errors.
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <LogIn className="h-6 w-6 text-primary" /> {dict.title}
        </CardTitle>
        <CardDescription>{dict.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.emailLabel}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder={dict.emailPlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.passwordLabel}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder={dict.passwordPlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? dict.loggingIn : dict.buttonText}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
