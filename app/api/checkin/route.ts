import {NextRequest, NextResponse} from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const allowedOrigins = [
    "https://ulsan-proto-next.vercel.app",
    "http://localhost:5173",
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
        "Access-Control-Allow-Origin": allowedOrigins[0], // 기본값
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
}

// -------------------------------
// 🔹 OPTIONS (preflight)
// -------------------------------
export async function OPTIONS(req: Request) {
    const origin = req.headers.get("origin");
    return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}
// 1️⃣ 사용자 인증
async function getAuthUserId() {
    const supabase = createServerComponentClient({ cookies });

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        throw new Error("유저 인증 실패");
    }

    return user.id;
}

// 2️⃣ 이미 체크인 확인
async function checkExistingCheckIn(userId: string, spotId: string) {
    const { data, error } = await supabase
        .from("checkins")
        .select("id")
        .eq("user_id", userId)
        .eq("spot_id", spotId)
        .maybeSingle();
    if (error) throw error;
    return data != null;
}

// 3️⃣ 파일 업로드
async function uploadPhoto(file: File, spotId: string) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const cleanMimeType = file.type.split(";")[0];
    if (!allowedTypes.includes(cleanMimeType)) {
        throw new Error("지원하지 않는 파일 형식입니다. JPEG, PNG, WebP만 가능");
    }

    const fileExt = cleanMimeType.split("/")[1];
    const fileName = `checkin_${spotId}_${Date.now()}.${fileExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { data, error } = await supabase.storage
        .from("checkin-photos")
        .upload(fileName, buffer, { contentType: cleanMimeType, upsert: false });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
        .from("checkin-photos")
        .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
}

// 4️⃣ 체크인 DB 삽입
async function insertCheckIn(userId: string, spotId: string, spotName: string, photoUrl: string, location: { lat: number, lng: number }, timestamp: string) {
    const { data, error } = await supabase
        .from("checkins")
        .insert({
            user_id: userId,
            spot_id: spotId,
            spot_name: spotName,
            photo_url: photoUrl,
            location_lat: location.lat,
            location_lng: location.lng,
            coins_earned: 10,
            verification_status: "pending",
            created_at: timestamp,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

// 5️⃣ POST 핸들러
export async function POST(request: Request) {
    const origin = request.headers.get("origin");
    try {
        const formData = await request.formData();

        const spotId = formData.get("spotId") as string;
        const photoFile = formData.get("photo") as File;
        const locationStr = formData.get("location") as string;
        const timestamp = formData.get("timestamp") as string;
        const spotName = formData.get("spotName") as string;

        if (!spotId || !photoFile || !locationStr || !timestamp || !spotName) {
            return NextResponse.json({ success: false, message: "필수 필드 누락" }, { status: 400 });
        }

        const location = JSON.parse(locationStr);
        const authUserId = await getAuthUserId();

        if (!authUserId) return NextResponse.json({ success: false, message: "유저 인증 실패" }, { status: 401 });


        const alreadyCheckedIn = await checkExistingCheckIn(authUserId, spotId);
        if (alreadyCheckedIn) {
            return NextResponse.json({ success: false, message: "이미 등록된 체크인입니다." }, { status: 403 });
        }

        // 먼저 DB에 임시 삽입 후 업로드 실패 시 삭제 처리
        let checkInRecord: any;
        try {
            checkInRecord = await insertCheckIn(authUserId, spotId, spotName, "", location, timestamp);

            const photoUrl = await uploadPhoto(photoFile, spotId);

            // 업로드 성공 후 DB에 사진 URL 업데이트
            const { error } = await supabase
                .from("checkins")
                .update({ photo_url: photoUrl })
                .eq("id", checkInRecord.id);
            if (error) throw error;

            return NextResponse.json({
                success: true,
                message: "체크인이 완료되었습니다!",
                data: { checkInId: checkInRecord.id, photoUrl, coinsEarned: 10 },
            },
                { headers: getCorsHeaders(origin) });

        } catch (uploadOrDbError) {
            // 업로드 실패 시 임시 DB 삭제
            if (checkInRecord?.id) {
                await supabase.from("checkins").delete().eq("id", checkInRecord.id);
            }
            throw uploadOrDbError;
        }

    } catch (err) {
        console.error("체크인 처리 예외:", err);
        return NextResponse.json({ success: false, message: err instanceof Error ? err.message : "체크인 처리 중 오류" }, { status: 500, headers: getCorsHeaders(origin) });
    }
}

