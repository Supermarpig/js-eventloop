import { Step } from '../types/eventLoop';

export const mockSetTimeout = (setSteps: React.Dispatch<React.SetStateAction<Step[]>>) => (
    callback: () => void, delay: number
) => {
    const error = new Error();
    const stackLine = error.stack?.split('\n')[2]; // 取得行號
    const match = stackLine?.match(/:(\d+):\d+/);
    const lineNumber = match ? parseInt(match[1], 10) : 0; // 確保行號

    const timeoutId = `setTimeout(${delay}ms)`;

    setSteps(prev => [
        ...prev,
        { type: 'webApi', data: timeoutId, lineNumber }, // 設置步驟並記錄行號
        { type: 'removeFromWebApi', data: timeoutId, lineNumber },
        { type: 'queue', data: 'setTimeout callback', lineNumber },
        { type: 'spin', lineNumber },
        { type: 'removeFromQueue', data: 'setTimeout callback', lineNumber }
    ]);

    setTimeout(() => {
        callback();
    }, delay);
};
