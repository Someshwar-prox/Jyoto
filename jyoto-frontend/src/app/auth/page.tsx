"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Apple,
  AtSign,
  ChevronLeft,
  Grid2x2Plus,
  User,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let generated = "";
    for (let i = 0; i < 16; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
    setConfirmPassword(generated);
  };

  const handleContinue = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    // Supabase strictly requires an email. We generate a hidden one based on the username.
    const syntheticEmail = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@jyoto.app`;
    
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({
        email: syntheticEmail,
        password,
      });
      if (error) {
        // Rewrite Supabase's email error message to make sense for usernames
        setError(error.message.replace("Invalid login credentials", "Invalid username or password"));
      } else {
        router.push("/");
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email: syntheticEmail,
        password,
        options: {
          data: { username }
        }
      });
      if (error) {
        setError(error.message);
      } else {
        router.push("/");
      }
    }
  };

  const inputClasses = "w-full bg-white/5 border border-white/10 text-white rounded-xl px-10 py-3 focus:outline-none focus:border-cyan-500/50 transition-colors";
  const buttonClasses = "w-full bg-white text-black hover:bg-white/90 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2";
  const ghostButtonClasses = "w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2";

  return (
    <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2 bg-[#030305] text-white">
      {/* Left Panel */}
      <div className="relative hidden h-full flex-col border-r border-white/10 p-10 lg:flex bg-[#030305]/60 z-0">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#030305] to-transparent pointer-events-none" />
        <div className="z-10 flex items-center gap-2 text-white">
          <Grid2x2Plus className="size-6" />
          <p className="text-xl font-bold tracking-widest uppercase">JYOTO</p>
        </div>
        <div className="z-10 mt-auto">
          <blockquote className="space-y-4">
            <p className="text-2xl font-light leading-relaxed">
              &ldquo;Bridging the gap between limitation and liberation through zero-barrier intelligence.&rdquo;
            </p>
            <footer className="font-mono text-sm font-semibold text-white/60">
              ~ JYOTO System Core
            </footer>
          </blockquote>
        </div>
        <div className="absolute inset-0 -z-10">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>

      {/* Right Panel */}
      <div className="relative flex min-h-screen flex-col justify-center p-8 lg:p-16 z-10">
        <div
          aria-hidden
          className="absolute inset-0 isolate contain-strict -z-10 opacity-60 pointer-events-none"
        >
          <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(6,182,212,0.1)_0,hsla(0,0%,55%,0.02)_50%,transparent_80%)] absolute top-0 right-0 h-[800px] w-[560px] -translate-y-1/2 rounded-full" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,rgba(6,182,212,0.05)_0,transparent_100%)] absolute top-0 right-0 h-[800px] w-[240px] translate-x-[5%] -translate-y-1/2 rounded-full" />
        </div>
        
        <Link href="/" className="absolute top-7 left-5 text-white/70 hover:text-white flex items-center text-sm font-medium transition-colors">
          <ChevronLeft className="size-4 me-2" />
          Home
        </Link>

        <button 
          onClick={() => {
            localStorage.setItem('dev_bypass', 'true');
            router.push('/');
          }}
          className="absolute top-7 right-5 text-white/40 hover:text-cyan-400 flex items-center text-xs font-mono uppercase tracking-widest transition-colors z-[100]"
        >
          [ Skip Dev Auth ]
        </button>

        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="flex items-center gap-2 lg:hidden mb-8">
            <Grid2x2Plus className="size-8" />
            <p className="text-2xl font-bold tracking-widest uppercase">JYOTO</p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <h1 className="font-heading text-3xl font-bold tracking-wide">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-white/60 text-base">
              {mode === 'login' ? 'Login to access your JYOTO dashboard.' : 'Register to unlock zero-barrier intelligence.'}
            </p>
          </div>

          {/* Auth State Toggle */}
          <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl w-full">
            <button 
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${mode === 'login' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
            >
              Sign In
            </button>
            <button 
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${mode === 'register' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
            >
              Join Now
            </button>
          </div>

          <div className="space-y-3">
            <button type="button" className={ghostButtonClasses}>
              <GoogleIcon className="size-5" />
              Continue with Google
            </button>
            <button type="button" className={ghostButtonClasses}>
              <Apple className="size-5" />
              Continue with Apple
            </button>
            <button type="button" className={ghostButtonClasses}>
              <GithubIcon className="size-5" />
              Continue with GitHub
            </button>
          </div>

          <AuthSeparator />

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center">
              {error}
            </motion.div>
          )}

          <motion.form layout className="space-y-4">
            <motion.div layout className="space-y-4">
              {/* Username Field */}
              <motion.div layout className="relative">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputClasses}
                />
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-4 text-white/50">
                  <User className="size-4" aria-hidden="true" />
                </div>
              </motion.div>



              {/* Password Field */}
              <motion.div layout className="relative">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClasses}
                />
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-4 text-white/50">
                  <Lock className="size-4" aria-hidden="true" />
                </div>
              </motion.div>

              {/* Confirm Password & Suggest Button - Hidden in Login Mode */}
              <AnimatePresence>
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={inputClasses}
                      />
                      <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-4 text-white/50">
                        <Lock className="size-4" aria-hidden="true" />
                      </div>
                    </div>

                    {/* Suggest Anonymous Strong Password Button */}
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 font-bold text-xs tracking-widest uppercase py-3 rounded-xl transition-all duration-300 backdrop-blur-md"
                    >
                      [ SUGGEST ANONYMOUS STRONG PASSWORD ]
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.button layout type="button" onClick={handleContinue} className={`${buttonClasses} mt-6`}>
              <span>{mode === 'login' ? 'Sign In to JYOTO' : 'Create Anonymous Account'}</span>
            </motion.button>
          </motion.form>

          <p className="text-white/50 text-center text-sm">
            By clicking continue, you agree to our{" "}
            <a href="#" className="text-white hover:text-cyan-400 underline underline-offset-4 transition-colors">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-white hover:text-cyan-400 underline underline-offset-4 transition-colors">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(255,255,255,${0.03 + i * 0.01})`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className="h-full w-full text-white/20"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.05 + path.id * 0.01}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.1, 0.3, 0.1],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.abs(Math.sin(path.id)) * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

const GoogleIcon = (props: React.ComponentProps<"svg">) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <g>
      <path d="M12.479,14.265v-3.279h11.049c0.108,0.571,0.164,1.247,0.164,1.979c0,2.46-0.672,5.502-2.84,7.669 C18.744,22.829,16.051,24,12.483,24C5.869,24,0.308,18.613,0.308,12S5.869,0,12.483,0c3.659,0,6.265,1.436,8.223,3.307L18.392,5.62 c-1.404-1.317-3.307-2.341-5.913-2.341C7.65,3.279,3.873,7.171,3.873,12s3.777,8.721,8.606,8.721c3.132,0,4.916-1.258,6.059-2.401 c0.927-0.927,1.537-2.251,1.777-4.059L12.479,14.265z" />
    </g>
  </svg>
);

const GithubIcon = (props: React.ComponentProps<"svg">) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 0C5.37 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

const AuthSeparator = () => {
  return (
    <div className="flex w-full items-center justify-center my-6">
      <div className="bg-white/10 h-px w-full" />
      <span className="text-white/40 px-4 text-xs font-medium uppercase tracking-widest">OR</span>
      <div className="bg-white/10 h-px w-full" />
    </div>
  );
};
