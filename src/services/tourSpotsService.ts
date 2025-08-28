export interface TourSpot {
    id: string // contentId
    latitude: number
    longitude: number
    created_at: string
    updated_at: string
}

export class TourSpotsService {

    static async getTourSpotLocation(contentId: string): Promise<TourSpot | null> {
        try {
            const response = await fetch(`https://ulsan-proto-next.vercel.app/tourSpots?contentId=${contentId}`)
            console.log(response)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()
            return result.data
        } catch (error) {
            console.error("관광지 위치 정보 조회 오류:", error)
            return null
        }
    }

    static async getAllTourSpots(): Promise<TourSpot[]> {
        try {
            const response = await fetch("/api/tour-spots")

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            return data.spots || []
        } catch (error) {
            console.error("전체 관광지 조회 오류:", error)
            return []
        }
    }

}
