"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { testModeManager } from "../data/testData"

// 카카오맵 관련 타입 정의
declare global {
    interface Window {
        kakao: {
            maps: {
                services: {
                    Geocoder: new () => {
                        coord2Address: (lng: number, lat: number, callback: (result: any, status: any) => void) => void
                    }
                    Status: {
                        OK: string
                        ZERO_RESULT: string
                        ERROR: string
                    }
                }
                load: (callback: () => void) => void
            }
        }
    }
}

interface Coordinates {
    lat: number
    lng: number
}

interface LocationAuthResult {
    isLocationEnabled: boolean
    currentLocation: Coordinates | null
    locationError: string | null
    isWithinRange: boolean
    distance: number | null
    isLoading: boolean

    getCurrentLocation: () => void
    watchLocation: () => (() => void) | undefined
}

interface UseLocationAuthProps {
    targetLocation: Coordinates
    allowedRadius?: number // 미터 단위, 기본값 300m
}

const useLocationAuth = ({ targetLocation, allowedRadius = 300 }: UseLocationAuthProps): LocationAuthResult => {
    const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null)
    const [locationError, setLocationError] = useState<string | null>(null)
    const [isLocationEnabled, setIsLocationEnabled] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isKakaoLoaded, setIsKakaoLoaded] = useState(false)

    // 카카오맵 API 로드
    const loadKakaoMaps = useCallback(() => {
        if (window.kakao && window.kakao.maps) {
            setIsKakaoLoaded(true)
            return Promise.resolve()
        }

        return new Promise<void>((resolve, reject) => {
            const script = document.createElement('script')
            script.async = true
            script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAOMAP_API_KEY}&libraries=services`

            script.onload = () => {
                if (window.kakao && window.kakao.maps) {
                    window.kakao.maps.load(() => {
                        setIsKakaoLoaded(true)
                        resolve()
                    })
                } else {
                    reject(new Error('카카오맵 API 로드 실패'))
                }
            }

            script.onerror = () => {
                reject(new Error('카카오맵 스크립트 로드 실패'))
            }

            document.head.appendChild(script)
        })
    }, [])

    // 두 좌표 사이의 거리 계산 (Haversine formula)
    const calculateDistance = useCallback((coord1: Coordinates, coord2: Coordinates): number => {
        const R = 6371e3 // 지구 반지름 (미터)
        const φ1 = (coord1.lat * Math.PI) / 180
        const φ2 = (coord2.lat * Math.PI) / 180
        const Δφ = ((coord2.lat - coord1.lat) * Math.PI) / 180
        const Δλ = ((coord2.lng - coord1.lng) * Math.PI) / 180

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        return R * c // 거리 (미터)
    }, [])

    // 카카오맵을 이용한 위치 정보 가져오기
    const getCurrentLocationWithKakao = useCallback(async (): Promise<Coordinates> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("이 브라우저는 위치 서비스를 지원하지 않습니다."))
                return
            }

            const options = {
                enableHighAccuracy: true,
                timeout: 15000, // 15초 타임아웃
                maximumAge: 60000, // 1분간 캐시된 위치 정보 사용
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const coords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    }

                    // 카카오맵 API로 주소 검증 (옵션)
                    if (isKakaoLoaded && window.kakao?.maps?.services) {
                        try {
                            const geocoder = new window.kakao.maps.services.Geocoder()
                            geocoder.coord2Address(coords.lng, coords.lat, (result: any, status: any) => {
                                if (status === window.kakao.maps.services.Status.OK) {
                                    console.log("카카오맵 위치 검증 성공:", result)
                                    console.log("현재 위치:", coords)
                                    console.log("위치 정확도:", position.coords.accuracy, "m")
                                }
                            })
                        } catch (err) {
                            console.warn("카카오맵 주소 검증 실패:", err)
                        }
                    }

                    resolve(coords)
                },
                (error) => {
                    let errorMessage = ""
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = "위치 정보 접근이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요."
                            break
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = "위치 정보를 사용할 수 없습니다. GPS가 켜져있는지 확인해주세요."
                            break
                        case error.TIMEOUT:
                            errorMessage = "위치 정보 요청 시간이 초과되었습니다."
                            break
                        default:
                            errorMessage = "위치 정보를 가져오는 중 오류가 발생했습니다."
                            break
                    }
                    reject(new Error(errorMessage))
                },
                options,
            )
        })
    }, [isKakaoLoaded])

    // 위치 정보 가져오기
    const getCurrentLocation = useCallback(async () => {
        if (testModeManager.isBypassLocationCheck()) {
            console.log("[v0] 테스트 모드: 위치 검증 우회됨")
            setCurrentLocation({ lat: 35.5384, lng: 129.3114 }) // 울산 임시 좌표
            setIsLocationEnabled(true)
            return
        }

        setIsLoading(true)
        setLocationError(null)

        try {
            // 카카오맵 API가 로드되지 않았다면 로드
            if (!isKakaoLoaded) {
                await loadKakaoMaps()
            }

            const coords = await getCurrentLocationWithKakao()
            setCurrentLocation(coords)
            setIsLocationEnabled(true)
            setLocationError(null)
        } catch (error) {
            console.error("위치 정보 가져오기 실패:", error)
            setLocationError(error instanceof Error ? error.message : "위치 정보를 가져오는데 실패했습니다.")
            setIsLocationEnabled(false)
        } finally {
            setIsLoading(false)
        }
    }, [isKakaoLoaded, loadKakaoMaps, getCurrentLocationWithKakao])

    // 실시간 위치 추적 (옵션)
    const watchLocation = useCallback(() => {
        if (!navigator.geolocation) return

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 30000,
        }

        const watchId = navigator.geolocation.watchPosition(
            async (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                }

                // 카카오맵으로 추가 검증 (옵션)
                if (isKakaoLoaded && window.kakao?.maps?.services) {
                    try {
                        const geocoder = new window.kakao.maps.services.Geocoder()
                        geocoder.coord2Address(coords.lng, coords.lat, (result: any, status: any) => {
                            if (status === window.kakao.maps.services.Status.OK) {
                                console.log("위치 추적 업데이트:", coords)
                            }
                        })
                    } catch (err) {
                        console.warn("카카오맵 주소 검증 실패:", err)
                    }
                }

                setCurrentLocation(coords)
            },
            (error) => {
                console.error("위치 추적 오류:", error)
            },
            options,
        )

        return () => {
            navigator.geolocation.clearWatch(watchId)
        }
    }, [isKakaoLoaded])

    // 컴포넌트 마운트 시 카카오맵 로드 및 위치 정보 요청
    useEffect(() => {
        const initializeLocation = async () => {
            try {
                await loadKakaoMaps()
                // 카카오맵 로드 후 위치 정보 가져오기
                setTimeout(getCurrentLocation, 100)
            } catch (error) {
                console.error("카카오맵 초기화 실패:", error)
                // 카카오맵 로드 실패 시에도 기본 위치 서비스 사용
                getCurrentLocation()
            }
        }

        initializeLocation()
    }, [])

    // 거리 계산 및 범위 내 확인
    const distance = currentLocation ? calculateDistance(currentLocation, targetLocation) : null
    const isWithinRange = useMemo(() => {
        if (testModeManager.isBypassLocationCheck()) {
            console.log("[v0] 테스트 모드: 위치 검증 우회됨")
            return true
        }
        return distance !== null && distance <= allowedRadius
    }, [distance, allowedRadius])

    return {
        isLocationEnabled,
        currentLocation,
        locationError,
        isWithinRange,
        distance,
        isLoading,
        getCurrentLocation,
        watchLocation,
    }
}

export default useLocationAuth