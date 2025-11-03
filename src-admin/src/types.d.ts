export interface Text2CommandAdapterConfig {
    rules: any[];
    sayitInstance: string;
    language: ioBroker.Languages;
    processorId: string;
    processorTimeout: number | string;
    writeEveryAnswer: boolean;
    noNegativeMessage: boolean;
}
