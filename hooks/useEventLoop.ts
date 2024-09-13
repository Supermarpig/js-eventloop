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
    const [isComplete, setIsComplete] = useState<boolean>(false);
    const [heap, setHeap] = useState<{ address: string; name: string[]; value: string }[]>([]);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const stepsRef = useRef<Step[]>([]);
    const currentStepRef = useRef<number>(0);
    const objectMapRef = useRef(new WeakMap<object, string>()); 

    useEffect(() => {
        if (typeof window !== 'undefined') {
            stepsRef.current = steps;
        }
    }, [steps]);

    const createStep = (type: Step['type'], data?: string, lineNumber?: number, heapData?: { address: string; value: string; name: string[] }): Step => {
        console.log(`Step created: type=${type}, lineNumber=${lineNumber}`);
        return { type, data, lineNumber, heapData };
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

    const addToHeap = useCallback((obj: any, varName: string) => {
        let address = objectMapRef.current.get(obj);

        if (!address) {
            // 生成新的地址並映射對象
            address = `0x${Math.floor(Math.random() * 1000).toString(16).padStart(3, '0')}`;
            objectMapRef.current.set(obj, address);
        }

        setHeap(prevHeap => {
            const existingEntry = prevHeap.find(entry => entry.address === address);
            let updatedEntry: { address: string; name: string[]; value: string };

            if (existingEntry) {
                if (!existingEntry.name.includes(varName)) {
                    updatedEntry = {
                        ...existingEntry,
                        name: [...existingEntry.name, varName],
                        value: JSON.stringify(obj, null, 2)
                    };
                } else {
                    updatedEntry = {
                        ...existingEntry,
                        value: JSON.stringify(obj, null, 2)
                    };
                }
                // 更新步驟
                setSteps(prevSteps => [...prevSteps, createStep('heap', undefined, undefined, updatedEntry)]);
                return prevHeap.map(entry => entry.address === address ? updatedEntry : entry);
            } else {
                updatedEntry = {
                    address,
                    name: [varName],
                    value: JSON.stringify(obj, null, 2)
                };
                // 更新步驟
                setSteps(prevSteps => [...prevSteps, createStep('heap', undefined, undefined, updatedEntry)]);
                return [...prevHeap, updatedEntry];
            }
        });
    }, [createStep]);

    const updateHeapValue = useCallback((obj: any) => {
        const address = objectMapRef.current.get(obj);
        if (address) {
            setHeap(prevHeap => {
                const updatedHeap = prevHeap.map(entry => {
                    if (entry.address === address) {
                        const updatedEntry = { ...entry, value: JSON.stringify(obj, null, 2) };
                        // 更新步驟
                        setSteps(prevSteps => [...prevSteps, createStep('heap', undefined, undefined, updatedEntry)]);
                        return updatedEntry;
                    } else {
                        return entry;
                    }
                });
                return updatedHeap;
            });
        }
    }, [createStep]);

    const createSandbox = () => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        const sandboxWindow = iframe.contentWindow;
        if (!sandboxWindow) {
            throw new Error('Failed to create sandbox');
        }

        const sandboxContext = Object.create(null);
        sandboxContext.setTimeout = mockSetTimeout(setSteps);
        sandboxContext.console = { log: mockConsoleLog(setSteps) };
        sandboxContext.Promise = MockPromise;

        // 代理 Object 構造函數
        sandboxContext.Object = new Proxy(Object, {
            construct(target, args, newTarget) {
                const obj = Reflect.construct(target, args, newTarget);

                return new Proxy(obj, {
                    set(target, prop, value, receiver) {
                        const result = Reflect.set(target, prop, value, receiver);
                        updateHeapValue(target); 
                        return result;
                    }
                });
            }
        });

        // 代理全局變數賦值
        return new Proxy(sandboxContext, {
            set(target, prop, value) {
                if (typeof value === 'object' && value !== null) {
                    addToHeap(value, prop.toString());
                }
                return Reflect.set(target, prop, value);
            }
        });
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
        setHeap([]);
        setIsComplete(false);
        objectMapRef.current = new WeakMap();

        stepsRef.current = [];
        currentStepRef.current = 0;

        const sandbox = createSandbox();

        try {
            // **預處理代碼，替換 'var' 宣告為 'sandbox.<variable> ='**
            const processedCode = code.replace(/\bvar\s+([a-zA-Z_$][0-9a-zA-Z_$]*)/g, (match, p1) => {
                return `sandbox.${p1}`;
            });

            const wrappedCode = `
        async function runCode() {
            ${processedCode}
        }
        runCode();
    `;
            const runInSandbox = new Function('sandbox', `with (sandbox) { ${wrappedCode} }`);
            runInSandbox(sandbox);

            startInterval();
        } catch (error) {
            setLog(prev => [...prev, `Error: ${(error as Error).message}`]);
        }
    }, [code, stopInterval, startInterval]);


    const applyStep = useCallback((step: Step) => {
        if (step.lineNumber !== undefined && step.lineNumber !== null) {
            setCurrentLine(step.lineNumber);
        }

        switch (step.type) {
            case 'stack':
                setStack(prev => [...prev, step.data!]);
                setCurrentLine(step.lineNumber!);
                break;
            case 'removeFromStack':
                setStack(prev => prev.filter(item => item !== step.data));
                break;
            case 'queue':
                setQueue(prev => [...prev, step.data!]);
                setCurrentLine(step.lineNumber!);
                break;
            case 'removeFromQueue':
                setQueue(prev => prev.filter(item => item !== step.data));
                break;
            case 'microTaskQueue':
                setMicroTaskQueue(prev => [...prev, step.data!]);
                setCurrentLine(step.lineNumber!);
                break;
            case 'removeFromMicroTaskQueue':
                setMicroTaskQueue(prev => prev.filter(item => item !== step.data));
                break;
            case 'webApi':
                setWebApis(prev => [...prev, step.data!]);
                setCurrentLine(step.lineNumber!);
                break;
            case 'removeFromWebApi':
                setWebApis(prev => prev.filter(item => item !== step.data));
                break;
            case 'log':
                setLog(prev => [...prev, step.data!]);
                setCurrentLine(step.lineNumber!);
                break;
            case 'spin':
                setIsSpinning(true);
                setTimeout(() => setIsSpinning(false), 500);
                break;
            case 'heap':
                if (step.heapData) {
                    setHeap(prev => {
                        const existingEntryIndex = prev.findIndex(item => item.address === step.heapData!.address);
                        if (existingEntryIndex !== -1) {
                            const updatedHeap = [...prev];
                            updatedHeap[existingEntryIndex] = step.heapData!;
                            return updatedHeap;
                        } else {
                            return [...prev, step.heapData!];
                        }
                    });
                }
                break;
            case 'removeFromHeap':
                if (step.heapData) {
                    setHeap(prev => prev.filter(item => item.address !== step.heapData?.address));
                }
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
            setIsComplete(true); // 設定完成狀態
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
            setHeap([]);

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
        heap,
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
