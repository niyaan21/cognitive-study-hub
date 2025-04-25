import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, User, Mail, Lock } from 'lucide-react';
import { Scene3D } from '@/components/3d/Scene3D';
import { GoogleSignIn } from '@/components/auth/GoogleSignIn';
import { ThemeToggle } from '@/components/ThemeToggle';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(2, 'First name is required').optional(),
  lastName: z.string().min(2, 'Last name is required').optional(),
});

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUp(
          values.email,
          values.password,
          values.firstName || '',
          values.lastName || ''
        );
        toast.success('Account created! Please check your email for verification instructions.');
      } else {
        await signIn(values.email, values.password);
        navigate('/');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(error.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleView = () => {
    form.reset();
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <Scene3D />
      
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 pointer-events-none" />
      
      <motion.div 
        className="w-full max-w-md z-10 p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-0 shadow-2xl">
          <CardHeader className="space-y-1 text-center relative">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <CardTitle className="text-3xl font-bold bg-gradient-to-br from-primary to-indigo-500 bg-clip-text text-transparent">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                {isSignUp
                  ? 'Start your learning journey today'
                  : 'Sign in to continue learning'}
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <GoogleSignIn />
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Form {...form}>
                <motion.form 
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1,
                      }
                    }
                  }}
                >
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 }
                    }}
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="h-4 w-4" /> Email
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="you@example.com" 
                              className="bg-background/50" 
                              autoComplete="email"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                  
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 }
                    }}
                  >
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Lock className="h-4 w-4" /> Password
                          </FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="bg-background/50 pr-10"
                                autoComplete={isSignUp ? "new-password" : "current-password"}
                                {...field}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              <span className="sr-only">
                                {showPassword ? "Hide password" : "Show password"}
                              </span>
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                  
                  {isSignUp && (
                    <>
                      <motion.div
                        variants={{
                          hidden: { opacity: 0, y: 10 },
                          visible: { opacity: 1, y: 0 }
                        }}
                      >
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <User className="h-4 w-4" /> First Name
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="John" 
                                  className="bg-background/50" 
                                  autoComplete="given-name"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                      
                      <motion.div
                        variants={{
                          hidden: { opacity: 0, y: 10 },
                          visible: { opacity: 1, y: 0 }
                        }}
                      >
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <User className="h-4 w-4" /> Last Name
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Doe" 
                                  className="bg-background/50" 
                                  autoComplete="family-name"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    </>
                  )}
                  
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 }
                    }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full font-medium tracking-wide relative overflow-hidden group"
                      disabled={loading}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isSignUp ? 'Create Account' : 'Sign In'}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-primary to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </motion.div>
                </motion.form>
              </Form>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground hover:text-primary transition-colors"
              onClick={toggleView}
            >
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
