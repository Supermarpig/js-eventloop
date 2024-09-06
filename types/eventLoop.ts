export type StepType = 'stack' | 'removeFromStack' | 'queue' | 'removeFromQueue' | 'microTaskQueue' | 'removeFromMicroTaskQueue' | 'webApi' | 'removeFromWebApi' | 'log' | 'spin';

export interface Step {
    type: StepType;
    data?: string;
    lineNumber?: number; // 新增 lineNumber 屬性
}