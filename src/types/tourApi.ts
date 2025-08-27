export interface TourApiItem {
    addr1: string;
    addr2: string;
    areacode: string;
    cat1: string;
    cat2: string;
    cat3: string;
    contentid: string;
    contenttypeid: string;
    createdtime: string;
    firstimage: string;
    firstimage2: string;
    cpyrhtDivCd: string;
    mapx: string;
    mapy: string;
    mlevel: string;
    modifiedtime: string;
    sigungucode: string;
    tel: string;
    title: string;
    zipcode: string;
    lDongRegnCd: string;
    lDongSignguCd: string;
    lclsSystm1: string;
    lclsSystm2: string;
    lclsSystm3: string;
}

export interface TourApiDetailItem {
    contentid: string;
    contenttypeid: string;
    title: string;
    createdtime: string;
    modifiedtime: string;
    tel: string;
    telname: string;
    homepage: string;
    firstimage: string;
    firstimage2: string;
    cpyrhtDivCd: string;
    areacode: string;
    sigungucode: string;
    lDongRegnCd: string;
    lDongSignguCd: string;
    lclsSystm1: string;
    lclsSystm2: string;
    lclsSystm3: string;
    cat1: string;
    cat2: string;
    cat3: string;
    addr1: string;
    addr2: string;
    zipcode: string;
    mapx: string;
    mapy: string;
    mlevel: string;
    overview: string;
}

export interface TourApiIntroItem {
    contentid?: string;
    contenttypeid?: string;
    scale?: string;
    usefee?: string;
    discountinfo?: string;
    spendtime?: string;
    parkingfee?: string;
    infocenterculture?: string;
    accomcountculture?: string;
    usetimeculture?: string;
    restdateculture?: string;
    parkingculture?: string;
    chkbabycarriageculture?: string;
    chkpetculture?: string;
    chkcreditcardculture?: string;
    infocenter?: string;
    opendate?: string;
    restdate?: string;
    expguide?: string;
    expagerange?: string;
    accomcount?: string;
    useseason?: string;
    usetime?: string;
    parking?: string;
    chkbabycarriage?: string;
    chkpet?: string;
    chkcreditcard?: string;
    sponsor1?: string;
    sponsor1tel?: string;
    sponsor2?: string;
    sponsor2tel?: string;
    eventenddate?: string;
    playtime?: string;
    eventplace?: string;
    eventhomepage?: string;
    agelimit?: string;
    bookingplace?: string;
    placeinfo?: string;
    subevent?: string;
    program?: string;
    eventstartdate?: string;
    usetimefestival?: string;
    discountinfofestival?: string;
    spendtimefestival?: string;
    festivalgrade?: string;
    infocenterleports?: string;
    openperiod?: string;
    reservation?: string;
    restdateleports?: string;
    scaleleports?: string;
    usefeeleports?: string;
    usetimeleports?: string;
    parkingleports?: string;
    chkbabycarriageleports?: string;
    chkpetleports?: string;
    chkcreditcardleports?: string;
    benikia?: string;
    goodstay?: string;
    hanok?: string;
    infocenterlodging?: string;
    parkinglodging?: string;
    pickup?: string;
    roomcount?: string;
    reservationlodging?: string;
    reservationurl?: string;
    roomtype?: string;
    scalelodging?: string;
    subfacility?: string;
    barbecue?: string;
    beauty?: string;
    beverage?: string;
    bicycle?: string;
    campfire?: string;
    fitness?: string;
    karaoke?: string;
    publicbath?: string;
    publicpc?: string;
    sauna?: string;
    seminar?: string;
    sports?: string;
    refundregulation?: string;
    checkintime?: string;
    checkouttime?: string;
    chkcooking?: string;
    chkbabycarriageshopping?: string;
    chkcreditcardshopping?: string;
    chkpetshopping?: string;
    culturecenter?: string;
    fairday?: string;
    infocentershopping?: string;
    opendateshopping?: string;
    opentime?: string;
    parkingshopping?: string;
    restdateshopping?: string;
    restroom?: string;
    saleitem?: string;
    saleitemcost?: string;
    scaleshopping?: string;
    shopguide?: string;
    chkcreditcardfood?: string;
    discountinfofood?: string;
    firstmenu?: string;
    infocenterfood?: string;
    kidsfacility?: string;
    opendatefood?: string;
    opentimefood?: string;
    packing?: string;
    parkingfood?: string;
    reservationfood?: string;
    restdatefood?: string;
    scalefood?: string;
    seat?: string;
    smoking?: string;
    treatmenu?: string;
    lcnsno?: string;
}

export interface TourApiIntroItem {
    contentid?: string
    contenttypeid?: string
    description: string
    // 나머지 필드
}

export interface TourApiResponse {
    response: {
        header: {
            resultCode: string;
            resultMsg: string;
        };
        body: {
            items: {
                item: TourApiItem[];
            };
            numOfRows: number;
            pageNo: number;
            totalCount: number;
        };
    };
}

export interface TourApiDetailResponse {
    response: {
        header: {
            resultCode: string;
            resultMsg: string;
        };
        body: {
            items: {
                item: TourApiDetailItem[];
            };
            numOfRows: number;
            pageNo: number;
            totalCount: number;
        };
    };
}

// 소개정보 API 응답 구조
export interface TourApiIntroResponse {
    response: {
        header: {
            resultCode: string;
            resultMsg: string;
        };
        body: {
            items: {
                item: TourApiIntroItem[];
            };
            numOfRows: number;
            pageNo: number;
            totalCount: number;
        };
    };
}

export const SIGUNGU_CODES = {
    jung: '110', // 중구
    nam: '140',  // 남구
    dong: '170', // 동구
    buk: '200',  // 북구
    ulju: '710'  // 울주군
} as const;

export const CATEGORY_MAPPING = {
    'EX': '체험관광',
    'FD': '음식',
    'HS': '역사관광',
    'LS': '레저스포츠',
    'NA': '자연관광',
    'SH': '쇼핑',
    'VE': '문화관광'
} as const;

export const CATEGORY_INFO = {
    '숙박': { name: '숙박', color: '#F59E0B', coins: 60 },
    '추천코스': { name: '추천코스', color: '#8B5CF6', coins: 150 },
    '축제/공연/행사': { name: '축제/공연/행사', color: '#EF4444', coins: 120 },
    '체험관광': { name: '체험관광', color: '#EC4899', coins: 90 },
    '음식': { name: '음식', color: '#F97316', coins: 50 },
    '역사관광': { name: '역사관광', color: '#8B5CF6', coins: 120 },
    '레저스포츠': { name: '레저스포츠', color: '#EF4444', coins: 110 },
    '자연관광': { name: '자연관광', color: '#10B981', coins: 100 },
    '쇼핑': { name: '쇼핑', color: '#10B981', coins: 70 },
    '문화관광': { name: '문화관광', color: '#3B82F6', coins: 100 }
} as const;

export const CONTENT_TYPE_CODES = {
    TOURIST_SPOT: '12',      // 관광지
    CULTURAL_FACILITY: '14', // 문화시설
    FESTIVAL: '15',          // 축제공연행사
    TRAVEL_COURSE: '25',     // 여행코스
    LEISURE_SPORTS: '28',    // 레포츠
    ACCOMMODATION: '32',     // 숙박
    SHOPPING: '38',          // 쇼핑
    RESTAURANT: '39'         // 음식점
} as const;