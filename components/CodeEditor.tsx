import React, { useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditorView } from '@codemirror/view';
import { Decoration, DecorationSet } from '@codemirror/view';
import { StateField, StateEffect } from '@codemirror/state';

interface CodeEditorProps {
  code: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  currentLine: number;
}

const addHighlight = StateEffect.define<{ line: number }>({});

const highlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(highlights, tr) {
    highlights = highlights.map(tr.changes);
    for (const e of tr.effects) {
      if (e.is(addHighlight)) {
        const line = tr.state.doc.line(e.value.line);
        highlights = highlights.update({
          filter: (from) => from !== line.from,
          add: [highlightDecoration.range(line.from, line.from)]
        });
      }
    }
    return highlights;
  },
  provide: (f) => EditorView.decorations.from(f),
});

const highlightDecoration = Decoration.line({
  attributes: { style: "background-color: rgba(255, 255, 0);" }
});

const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode, currentLine }) => {
  const editorRef = useRef<EditorView | null>(null);

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
  }, [setCode]);

  useEffect(() => {
    if (editorRef.current && currentLine > 0) {
      const view = editorRef.current;
      const docLineCount = view.state.doc.lines;

      // console.log(currentLine,"=========currentLine😍😍😍")
      // 調整行號基準
      const adjustedLine = currentLine - 4;
      if (adjustedLine <= docLineCount) {
        view.dispatch({
          effects: addHighlight.of({ line: adjustedLine })
        });
      }
    }
  }, [currentLine]);


  return (
    <Card className="h-1/2 max-h-1/2 relative overflow-hidden flex flex-col">
      <CardHeader>
        <CardTitle>Code Editor</CardTitle>
      </CardHeader>
      <CardContent className='p-0 flex-grow overflow-y-scroll'>
        <CodeMirror
          value={code}
          onChange={(value) => setCode(value)}
          theme="dark"
          extensions={[
            javascript({ jsx: true }),
            highlightField,
            EditorView.updateListener.of((update) => {
              if (update.view) {
                editorRef.current = update.view;
              }
            }),
          ]}
          className="h-full max-h-64"
        />
      </CardContent>
    </Card>
  );
};

export default CodeEditor;