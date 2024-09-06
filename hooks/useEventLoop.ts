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
    const [isComplete, setIsComplete] = useState<boolean>(false); // 新增狀態
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
        stopInterval();

        // 重置狀態
        setIsRunning(true);
        setSteps([]);
        setCurrentStep(0);
        setStack([]);
        setQueue([]);
        setMicroTaskQueue([]);
        setLog([]);
        setWebApis([]);
        setIsComplete(false); // 重置完成狀態

        stepsRef.current = [];
        currentStepRef.current = 0;

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
    }, [code, stopInterval, startInterval]);

    const applyStep = useCallback((step: Step) => {
        console.log("Applying step:", step);  // 調試語句，追蹤每次應用的步驟

        if (step.lineNumber !== undefined && step.lineNumber !== null) {
            setCurrentLine(step.lineNumber);
            console.log("Updated currentLine:", step.lineNumber);  // 調試語句，確認行號的更新
        }

        switch (step.type) {
            case 'stack':
                setStack(prev => [...prev, step.data!]);
                console.log("Updated stack:", step.data);  // 調試語句，追蹤堆疊變化
                setCurrentLine(step.lineNumber!);
                break;
            case 'removeFromStack':
                setStack(prev => prev.filter(item => item !== step.data));
                console.log("Removed from stack:", step.data);  // 調試語句，追蹤從堆疊移除的項目
                break;
            case 'queue':
                setQueue(prev => [...prev, step.data!]);
                console.log("Updated queue:", step.data);  // 調試語句，追蹤隊列變化
                setCurrentLine(step.lineNumber!);
                break;
            case 'removeFromQueue':
                setQueue(prev => prev.filter(item => item !== step.data));
                console.log("Removed from queue:", step.data);  // 調試語句，追蹤從隊列移除的項目
                break;
            case 'microTaskQueue':
                setMicroTaskQueue(prev => [...prev, step.data!]);
                console.log("Updated microTaskQueue:", step.data);  // 調試語句，追蹤微任務隊列變化
                setCurrentLine(step.lineNumber!);
                break;
            case 'removeFromMicroTaskQueue':
                setMicroTaskQueue(prev => prev.filter(item => item !== step.data));
                console.log("Removed from microTaskQueue:", step.data);  // 調試語句，追蹤從微任務隊列移除的項目
                break;
            case 'webApi':
                setWebApis(prev => [...prev, step.data!]);
                console.log("Updated webApis:", step.data);  // 調試語句，追蹤 Web APIs 變化
                setCurrentLine(step.lineNumber!);
                break;
            case 'removeFromWebApi':
                setWebApis(prev => prev.filter(item => item !== step.data));
                console.log("Removed from webApi:", step.data);  // 調試語句，追蹤從 Web API 移除的項目
                break;
            case 'log':
                setLog(prev => [...prev, step.data!]);
                console.log("Logged data:", step.data);  // 調試語句，追蹤 log 資料
                setCurrentLine(step.lineNumber!);
                break;
            case 'spin':
                setIsSpinning(true);
                console.log("Spinner started");  // 調試語句，追蹤 spinner 開始
                setTimeout(() => {
                    setIsSpinning(false);
                    console.log("Spinner stopped");  // 調試語句，追蹤 spinner 停止
                }, 500);
                break;
        }
    }, []);


    const nextStep = useCallback(() => {
        if (currentStepRef.current < stepsRef.current.length) {
            applyStep(stepsRef.current[currentStepRef.current]);
            setCurrentStep(prev => prev + 1);
            currentStepRef.current += 1;
        }

        // 判斷程式是否執行到最後一步
        if (currentStepRef.current === stepsRef.current.length) {
            setIsRunning(false);
            stopInterval();
            setIsComplete(true); // 設置完成狀態
        }
    }, [applyStep, stopInterval]);

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);

            setStack([]);
            setQueue([]);
            setMicroTaskQueue([]);
            setLog([]);
            setWebApis([]);

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
        isComplete,
        currentStep,
        steps,
        executeCode,
        nextStep,
        prevStep,
        togglePause
    };
};
