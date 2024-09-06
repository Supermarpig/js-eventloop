import { useState, useCallback, useRef, useEffect } from 'react';
import { Step } from '../types/eventLoop';
import { mockConsoleLog } from '../utils/mockConsole';
import { mockSetTimeout } from '../utils/mockSetTimeout';
import { MockPromise } from '../utils/MockPromise';

export const useEventLoop = () => {
    const [code, setCode] = useState<string>('');
    const [currentLine, setCurrentLine] = useState<number>(0);
    const [stack, setStack] = useState<string[]>([]);
    const [queue, setQueue] = useState<string[]>([]);
    const [microTaskQueue, setMicroTaskQueue] = useState<string[]>([]);
    const [log, setLog] = useState<string[]>([]);
    const [webApis, setWebApis] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [isSpinning, setIsSpinning] = useState<boolean>(false);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [steps, setSteps] = useState<Step[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const stepsRef = useRef<Step[]>([]);
    const currentStepRef = useRef<number>(0);

    useEffect(() => {
        stepsRef.current = steps;
    }, [steps]);

    const createStep = (type: Step['type'], data?: string, lineNumber?: number): Step => {
        console.log(`Step created: type=${type}, lineNumber=${lineNumber}`);
        return { type, data, lineNumber };
    };

    const startInterval = () => {
        if (!intervalRef.current) {
            intervalRef.current = setInterval(() => {
                nextStep();
            }, 500);
        }
    };

    const stopInterval = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const togglePause = () => {
        if (intervalRef.current) {
            stopInterval();
            setIsPaused(true);
        } else {
            startInterval();
            setIsPaused(false);
        }
    };

    const executeCode = useCallback(() => {
        setIsRunning(true);
        setSteps([]);
        setCurrentStep(0);
        setStack([]);
        setQueue([]);
        setMicroTaskQueue([]);
        setLog([]);
        setWebApis([]);

        const sandbox = {
            setTimeout: mockSetTimeout(setSteps),
            console: { log: mockConsoleLog(setSteps) },
            Promise: MockPromise,
        };

        try {
            const wrappedCode = `
                async function runCode() {
                    ${code}
                }
                runCode();
            `;

            const runInSandbox = new Function(...Object.keys(sandbox), wrappedCode);
            runInSandbox(...Object.values(sandbox));
            startInterval();
        } catch (error) {
            setLog(prev => [...prev, `Error: ${(error as Error).message}`]);
        }
    }, [code]);

    const applyStep = useCallback((step: Step) => {
        // console.log(`Applying step: ${step.type}, line: ${step.lineNumber}`);
        // 確認步驟是同步或需要更新行號
        if (step.lineNumber !== undefined && step.lineNumber !== null) {
            setCurrentLine(step.lineNumber); // 更新行號
        }
        
        switch (step.type) {
            case 'stack':
                setStack(prev => [...prev, step.data!]);
                setCurrentLine(step.lineNumber!); // 使用 lineNumber
                break;
            case 'removeFromStack':
                setStack(prev => prev.filter(item => item !== step.data));
                break;
            case 'queue':
                setQueue(prev => [...prev, step.data!]);
                setCurrentLine(step.lineNumber!); // 使用 lineNumber
                break;
            case 'removeFromQueue':
                setQueue(prev => prev.filter(item => item !== step.data));
                break;
            case 'microTaskQueue':
                setMicroTaskQueue(prev => [...prev, step.data!]);
                setCurrentLine(step.lineNumber!); // 使用 lineNumber
                break;
            case 'removeFromMicroTaskQueue':
                setMicroTaskQueue(prev => prev.filter(item => item !== step.data));
                break;
            case 'webApi':
                setWebApis(prev => [...prev, step.data!]);
                setCurrentLine(step.lineNumber!); // 使用 lineNumber
                break;
            case 'removeFromWebApi':
                setWebApis(prev => prev.filter(item => item !== step.data));
                break;
            case 'log':
                setLog(prev => [...prev, step.data!]);
                setCurrentLine(step.lineNumber!); // 使用 lineNumber
                break;
            case 'spin':
                setIsSpinning(true);
                setTimeout(() => setIsSpinning(false), 500);
                break;
        }
    }, []);

    const nextStep = useCallback(() => {
        if (currentStepRef.current < stepsRef.current.length) {
            applyStep(stepsRef.current[currentStepRef.current]);
            setCurrentStep(prev => {
                const newStep = prev + 1;
                return newStep;
            });
            currentStepRef.current += 1;
        }

        if (currentStepRef.current === stepsRef.current.length) {
            setIsRunning(false);
            stopInterval();
        }
    }, [applyStep, stopInterval]);

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);

            // 重置所有狀態
            setStack([]);
            setQueue([]);
            setMicroTaskQueue([]);
            setLog([]);
            setWebApis([]);

            // 應用之前的步驟，直到 currentStep - 1
            for (let i = 0; i < currentStep - 1; i++) {
                applyStep(steps[i]);
            }
        }
    };

    return {
        code,
        setCode,
        currentLine,
        stack,
        queue,
        microTaskQueue,
        log,
        webApis,
        isRunning,
        isPaused,
        isSpinning,
        currentStep,
        steps,
        executeCode,
        nextStep,
        prevStep,
        togglePause
    };
};