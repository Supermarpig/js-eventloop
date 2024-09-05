import { Step } from '../types/eventLoop';

export const mockSetTimeout = (setSteps: React.Dispatch<React.SetStateAction<Step[]>>) => (callback: () => void, delay: number): void => {
    const timeoutId = `setTimeout(${delay}ms)`;
    setSteps(prev => [
        ...prev,
        { type: 'webApi', data: timeoutId },
        { type: 'removeFromWebApi', data: timeoutId },
        { type: 'queue', data: 'setTimeout callback' },
        { type: 'spin' },
        { type: 'removeFromQueue', data: 'setTimeout callback' }
    ]);
    setTimeout(() => {
        callback();
    }, delay);
};