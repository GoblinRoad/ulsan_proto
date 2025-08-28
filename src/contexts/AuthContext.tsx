import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import {
  setSessionCookies,
  clearSessionCookies,
  getSessionFromCookies,
} from "../utils/cookieUtils";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signOut: () => Promise<void>;
  signInWithKakao: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("AutProvider가 필요합니다");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 세션 확인 (쿠키에서 먼저 확인)
    const getSession = async () => {
      // 먼저 쿠키에서 세션 확인
      const cookieSession = getSessionFromCookies();

      if (cookieSession) {
        setSession(cookieSession);
        setUser(cookieSession?.user ?? null);
      }

      // Supabase에서 최신 세션 확인
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setSessionCookies(session);
        setSession(session);
        setUser(session?.user ?? null);
      } else if (!cookieSession) {
        // 세션이 없고 쿠키에도 없으면 정리
        clearSessionCookies();
        setSession(null);
        setUser(null);
      }

      setLoading(false);
    };

    getSession();

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setSessionCookies(session);
        setSession(session);
        setUser(session?.user ?? null);
      } else {
        clearSessionCookies();
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 이메일 로그인
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    sessionStorage.setItem("testMode", "false");
    sessionStorage.setItem("bypassLocationCheck", "false");
    return { data, error };
  };

  // 회원가입
  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  };

  // 카카오 로그인
  const signInWithKakao = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    sessionStorage.setItem("testMode", "false");
    sessionStorage.setItem("bypassLocationCheck", "false");
  };

  // 로그아웃
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    clearSessionCookies();
    sessionStorage.setItem("testMode", "false");
    sessionStorage.setItem("bypassLocationCheck", "false");
    if (error) throw error;
  };

  // 비밀번호 변경
  const changePassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { data, error };
  };

  // 비밀번호 재설정 (이메일 발송)
  const resetPassword = async (email: string) => {
    try {
      // 1단계: 서버에서 사용자 검증
      const response = await fetch(
        "https://ulsan-proto-next.vercel.app/api/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return { data: null, error: { message: result.message } };
      }

      // 2단계: 검증 통과시 클라이언트에서 이메일 발송
      if (result.canSendEmail) {
        const { data, error } = await supabase.auth.resetPasswordForEmail(
          email
        );

        if (error) {
          return {
            data: null,
            error: { message: "이메일 발송 중 오류가 발생했습니다." },
          };
        }

        return {
          data: { message: "비밀번호 재설정 이메일이 발송되었습니다." },
          error: null,
        };
      }

      return { data: result, error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: "네트워크 오류가 발생했습니다." },
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithKakao,
        changePassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
