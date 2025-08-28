import {createClient} from "@supabase/supabase-js"

// Supabase 클라이언트 설정
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 타입 정의
export interface CheckInData {
    spotId: string
    photo: File
    location: {
        lat: number
        lng: number
    }
    timestamp: string
    spotName: string
}

export interface CheckInResult {
    success: boolean
    message: string
    data?: {
        checkInId: string
        photoUrl: string
        coinsEarned: number
    }
    error?: string
}

export interface UserProfile {
    id: string
    email: string
    username: string
    full_name?: string
    avatar_url?: string
    total_coins: number
    total_checkins: number
    level: number
    created_at: string
    updated_at: string
}

export interface CheckInHistory {
    id: string
    spot_id: string
    spot_name: string
    photo_url: string
    location_lat: number
    location_lng: number
    coins_earned: number
    verification_status: "pending" | "approved" | "rejected"
    created_at: string
}

// 체크인 서비스 클래스
export class CheckInService {
    static async submitCheckIn(data: CheckInData): Promise<CheckInResult> {
        try {
            const token = JSON.parse(localStorage.getItem("sb-qnxtbdixdmuhvdjtecpv-auth-token")!).access_token
            if (!token) {
                return { success: false, message: "사용자 인증 토큰이 없습니다." }
            }

            // FormData 객체 생성
            const formData = new FormData()
            formData.append("spotId", data.spotId)
            formData.append("photo", data.photo) // File 객체를 직접 추가
            formData.append("location", JSON.stringify(data.location)) // 객체는 문자열로 변환하여 전송
            formData.append("timestamp", data.timestamp)
            formData.append("spotName", data.spotName)

            const response = await fetch("https://ulsan-proto-next.vercel.app/api/checkin", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`, // 헤더에 토큰 추가
                },
                body: formData, // FormData 객체 전송
            })

            return await response.json()
        } catch (error) {
            console.error("체크인 요청 실패:", error)
            return {
                success: false,
                message: error instanceof Error ? error.message : "체크인 처리 중 오류가 발생했습니다.",
            }
        }
    }


    // 그냥 db에 tour api를 저장하는게 나을거 같아서 생략
    // static async getAvailableSpots(userId: string) {
    //     try {
    //         const { data, error } = await supabase
    //             .from("tourist_spots")
    //             .select(`*`)
    //             .eq("is_active", true)
    //             .or(`checkins.user_id.neq.${userId},checkins.user_id.is.null`)
    //
    //         if (error) {
    //             console.error("체크인 가능한 관광지 조회 오류:", error)
    //             return []
    //         }
    //
    //         // 체크인하지 않은 관광지만 필터링
    //         return data?.filter((spot) => !spot.checkins || spot.checkins.length === 0) || []
    //     } catch (error) {
    //         console.error("체크인 가능한 관광지 조회 오류:", error)
    //         return []
    //     }
    // }
}


export default CheckInService