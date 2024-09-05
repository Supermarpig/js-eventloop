export type StepType = 'stack' | 'removeFromStack' | 'queue' | 'removeFromQueue' | 'microTaskQueue' | 'removeFromMicroTaskQueue' | 'webApi' | 'removeFromWebApi' | 'log' | 'spin';

export interface Step {
    type: StepType;
    data?: string;
}