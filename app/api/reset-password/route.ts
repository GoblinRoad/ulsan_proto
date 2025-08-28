import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const allowedOrigins = [
  "https://ulsan-proto-next.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

function getCorsHeaders(origin: string | null) {
  if (origin && allowedOrigins.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
  }
  return {
    "Access-Control-Allow-Origin": allowedOrigins[0],
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");
  return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "이메일이 필요합니다." },
        { status: 400, headers: getCorsHeaders(origin) }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "올바른 이메일 형식이 아닙니다." },
        { status: 400, headers: getCorsHeaders(origin) }
      );
    }

    // 서비스 역할 키로 사용자 목록 조회
    const {
      data: { users },
      error: listError,
    } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error("사용자 목록 조회 오류:", listError);
      return NextResponse.json(
        { success: false, message: "서버 오류가 발생했습니다." },
        { status: 500, headers: getCorsHeaders(origin) }
      );
    }

    // 해당 이메일로 가입된 사용자 찾기
    const user = users.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "가입되지 않은 이메일 주소입니다." },
        { status: 404, headers: getCorsHeaders(origin) }
      );
    }

    // 카카오 로그인 사용자인지 확인
    const isKakaoUser =
      user.app_metadata?.providers?.includes("kakao") ||
      user.identities?.some((identity) => identity.provider === "kakao");

    if (isKakaoUser) {
      return NextResponse.json(
        {
          success: false,
          message: "카카오 로그인 사용자는 비밀번호 재설정이 불가능합니다.",
        },
        { status: 400, headers: getCorsHeaders(origin) }
      );
    }

    return NextResponse.json(
      { success: true, message: "이메일 검증 완료", canSendEmail: true },
      { status: 200, headers: getCorsHeaders(origin) }
    );
  } catch (error) {
    console.error("비밀번호 재설정 API 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500, headers: getCorsHeaders(origin) }
    );
  }
}
