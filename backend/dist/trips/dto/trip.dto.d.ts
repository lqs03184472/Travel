export declare class StepDto {
    type: string;
    title: string;
    day?: number;
    order?: number;
    startTime?: string;
    endTime?: string;
    durationMin?: number;
    cost?: number;
    details?: Record<string, any>;
}
export declare class CreateTripDto {
    title: string;
    destination: string;
    startDate?: string;
    endDate?: string;
    days?: number;
    budget?: number;
    isPublic?: boolean;
    source?: string;
    steps?: StepDto[];
}
export declare class UpdateTripDto {
    title?: string;
    destination?: string;
    startDate?: string;
    endDate?: string;
    days?: number;
    budget?: number;
    isPublic?: boolean;
}
export declare class SaveStepsDto {
    steps: StepDto[];
}
