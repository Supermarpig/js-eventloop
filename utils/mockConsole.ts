import { Step } from '../types/eventLoop';

export const mockConsoleLog = (setSteps: React.Dispatch<React.SetStateAction<Step[]>>) => (...args: any[]): void => {
    const message = args.join(' ');
    const error = new Error();
    const stackLine = error.stack?.split('\n')[2]; // 取得呼叫 console.log 的行數
    const match = stackLine?.match(/:(\d+):\d+/); // 匹配行數
    const lineNumber = match ? parseInt(match[1], 10) : 0; // 解析行數

    setSteps(prev => [
        ...prev,
        { type: 'stack', data: `console.log("${message}")`, lineNumber }, // 將 console.log 放入 stack
        { type: 'log', data: message, lineNumber }, // 記錄 log 的輸出
        { type: 'removeFromStack', data: `console.log("${message}")`, lineNumber } // 移除 stack
    ]);

    console.log(...args); // 實際執行 console.log
};
