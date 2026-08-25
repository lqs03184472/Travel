export declare class AiPlanDto {
    departure: string;
    destinations: string[];
    days: number;
    people: string;
    budget: string;
    preferences: string[];
}
declare class AdoptItemDto {
    time?: string;
    type: string;
    title: string;
    cost?: number;
    detail?: string;
}
declare class AdoptDayDto {
    day: number;
    title?: string;
    items: AdoptItemDto[];
}
export declare class AdoptPlanDto {
    title: string;
    destination: string;
    days: number;
    budget?: number;
    planName?: string;
    plan: {
        daily: AdoptDayDto[];
        budget?: Record<string, number>;
    };
}
export {};
