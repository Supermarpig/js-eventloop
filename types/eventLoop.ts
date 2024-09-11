export type StepType = 'stack' | 'removeFromStack' | 'queue' | 'removeFromQueue' | 'microTaskQueue' | 'removeFromMicroTaskQueue' | 'webApi' | 'removeFromWebApi' | 'log' | 'spin' | 'heap' | 'removeFromHeap';

export interface Step {
    type: StepType;
    data?: string;
    lineNumber?: number;
    heapData?: { address: string; value: string };
}