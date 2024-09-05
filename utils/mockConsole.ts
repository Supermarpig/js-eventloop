import { Step } from '../types/eventLoop';

export const mockConsoleLog = (setSteps: React.Dispatch<React.SetStateAction<Step[]>>) => (...args: any[]): void => {
    const message = args.join(' ');
    setSteps(prev => [
        ...prev,
        { type: 'stack', data: `console.log("${message}")` },
        { type: 'log', data: message },
        { type: 'removeFromStack', data: `console.log("${message}")` }
    ]);
};