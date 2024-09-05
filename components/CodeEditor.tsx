import { useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CodeEditorProps {
    code: string;
    setCode: React.Dispatch<React.SetStateAction<string>>;
}


const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode }) => {

    useEffect(() => {
        setCode(`console.log("begins");

setTimeout(() => {
  console.log("setTimeout 1");
  Promise.resolve().then(() => {
    console.log("promise 1");
  });
}, 0);

new Promise(function (resolve, reject) {
  console.log("promise 2");
  setTimeout(function () {
    console.log("setTimeout 2");
    resolve("resolve 1");
  }, 0);
}).then((res) => {
  console.log("dot then 1");
  setTimeout(() => {
    console.log(res);
  }, 0);
});`);

    }, []);
    
    return (
        <Card className="h-1/2 relative overflow-hidden flex flex-col pb-4">
            <CardHeader>
                <CardTitle>Code Editor</CardTitle>
            </CardHeader>
            <CardContent className='p-0 flex-grow'>
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full bg-gray-800 text-white p-2 rounded resize-none"
                />
            </CardContent>
        </Card>
    );
}
export default CodeEditor;
