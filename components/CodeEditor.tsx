import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

interface CodeEditorProps {
    code: string;
    setCode: React.Dispatch<React.SetStateAction<string>>;
    isRunning: boolean;
    executeCode: () => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode, isRunning, executeCode }) => {
    return (
        <>
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
        </>
    );
};

export default CodeEditor;
