'use client'
import React, { useState, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

const EventLoopVisualizer: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [stack, setStack] = useState<string[]>([]);
  const [heap, setHeap] = useState<string[]>([]);
  const [queue, setQueue] = useState<string[]>([]);
  const [microTaskQueue, setMicroTaskQueue] = useState<string[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [webApis, setWebApis] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const executeCode = useCallback(async () => {
    setIsRunning(true);
    // Reset states
    setStack([]);
    setHeap([]);
    setQueue([]);
    setMicroTaskQueue([]);
    setLog([]);
    setWebApis([]);

    const updateUI = async () => {
      await sleep(100);
    };

    try {
      const mockConsoleLog = async (...args: any[]) => {
        const message = args.join(' ');
        setStack(prev => [...prev, `console.log("${message}")`]);
        await updateUI();
        setLog(prev => [...prev, message]);
        setStack(prev => prev.filter(item => !item.startsWith('console.log')));
        await updateUI();
      };

      const mockSetTimeout = (callback: Function, delay: number) => {
        setWebApis(prev => [...prev, `setTimeout(${delay}ms)`]);
        setTimeout(async () => {
          setWebApis(prev => prev.filter(item => item !== `setTimeout(${delay}ms)`));
          setQueue(prev => [...prev, 'setTimeout callback']);
          await updateUI();
          callback();  // 在此處明確執行回調
          setQueue(prev => prev.filter(item => item !== 'setTimeout callback'));
          await updateUI();
        }, delay);
      };

      // 使用原生的 Promise
      const sandbox = {
        setTimeout: mockSetTimeout,
        console: { log: mockConsoleLog },
        Promise: Promise,  // 使用原生 Promise
      };

      setStack(prev => [...prev, 'main()']);
      await updateUI();

      // Execute the code in the sandbox
      const wrappedCode = `
        async function runCode() {
          ${code}
        }
        runCode();
      `;

      // Use new Function to create a function with the sandbox as its context
      const runInSandbox = new Function(...Object.keys(sandbox), wrappedCode);
      await runInSandbox(...Object.values(sandbox));

      setStack(prev => prev.filter(item => item !== 'main()'));
      await updateUI();

      // Simulate processing of micro-task queue
      while (microTaskQueue.length > 0) {
        const microTask = microTaskQueue.shift();
        setStack(prev => [...prev, microTask || '']);
        await updateUI();
        setStack(prev => prev.filter(item => item !== microTask));
        await updateUI();
      }

      // Simulate processing of macro-task queue
      while (queue.length > 0) {
        const macroTask = queue.shift();
        setStack(prev => [...prev, macroTask || '']);
        await updateUI();
        setStack(prev => prev.filter(item => item !== macroTask));
        await updateUI();

        // 在每個宏任務後處理微任務
        while (microTaskQueue.length > 0) {
          const microTask = microTaskQueue.shift();
          setStack(prev => [...prev, microTask || '']);
          await updateUI();
          setStack(prev => prev.filter(item => item !== microTask));
          await updateUI();
        }
      }

    } catch (error) {
      setLog(prev => [...prev, `Error: ${(error as Error).message}`]);
    }
    setIsRunning(false);
  }, [code]);
  // console.log(log,"===========log😍😍😍")

  return (
    <div className="flex h-screen text-white">
      <div className="w-1/3 p-4 border-r border-gray-700 h-full flex flex-col justify-between gap-4">
        <CodeMirror
          value={code}
          height="calc(70vh - 8rem)"
          extensions={[javascript()]}
          onChange={(value) => setCode(value)}
          theme="dark"
        />
        <button
          onClick={executeCode}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-500"
          disabled={isRunning}
        >
          {isRunning ? 'Running...' : 'Run Code'}
        </button>
        <div className="p-4 border border-gray-700 col-span-2 overflow-y-auto">
          <h3 className="text-center text-green-500">Console Log</h3>
          <div className="mt-2 space-y-1">
            {log.length === 0 ? <div className="text-center text-gray-400">Empty</div> :
              log.map((entry, index) => <div key={index} className="text-center bg-gray-800 p-1 rounded">{entry}</div>)}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-rows-3 grid-cols-2 gap-4 p-4">
        <div className="p-4 border border-gray-700 row-span-2">
          <h3 className="text-center text-orange-500">Call Stack</h3>
          <div className="mt-2 space-y-1">
            {stack.length === 0 ? <div className="text-center text-gray-400">Empty</div> :
              stack.map((item, index) => <div key={index} className="text-center bg-gray-800 p-1 rounded">{item}</div>)}
          </div>
        </div>
        <div className="p-4 border border-gray-700 row-span-2">
          <h3 className="text-center text-purple-500">Web APIs</h3>
          <div className="mt-2 space-y-1">
            {webApis.length === 0 ? <div className="text-center text-gray-400">Empty</div> :
              webApis.map((item, index) => <div key={index} className="text-center bg-gray-800 p-1 rounded">{item}</div>)}
          </div>
        </div>
        <div className="p-4 border border-gray-700">
          <h3 className="text-center text-red-500">Callback Queue (Macrotasks)</h3>
          <div className="mt-2 space-y-1">
            {queue.length === 0 ? <div className="text-center text-gray-400">Empty</div> :
              queue.map((item, index) => <div key={index} className="text-center bg-gray-800 p-1 rounded">{item}</div>)}
          </div>
        </div>
        <div className="p-4 border border-gray-700">
          <h3 className="text-center text-green-500">Microtask Queue</h3>
          <div className="mt-2 space-y-1">
            {microTaskQueue.length === 0 ? <div className="text-center text-gray-400">Empty</div> :
              microTaskQueue.map((item, index) => <div key={index} className="text-center bg-gray-800 p-1 rounded">{item}</div>)}
          </div>
        </div>
        <div className="p-4 border border-gray-700 col-span-2">
          <h3 className="text-center text-blue-500">Event Loop</h3>
          <div className='flex items-center justify-center'>
            <span className="text-center text-blue-500 text-4xl animate-spin">↻</span>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default EventLoopVisualizer;
