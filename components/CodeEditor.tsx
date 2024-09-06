import React, { useEffect, useRef, useState } from 'react';
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
  isComplete: boolean; // 增加一個表示是否執行完成的狀態
}

const addHighlight = StateEffect.define<{ line: number }>({});
const addExecutedHighlight = StateEffect.define<{ line: number }>({});
const clearHighlights = StateEffect.define<null>({});

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
      if (e.is(addExecutedHighlight)) {
        const line = tr.state.doc.line(e.value.line);
        highlights = highlights.update({
          filter: (from) => from !== line.from,
          add: [executedDecoration.range(line.from, line.from)]
        });
      }
      if (e.is(clearHighlights)) {
        highlights = Decoration.none;
      }
    }
    return highlights;
  },
  provide: (f) => EditorView.decorations.from(f),
});

const highlightDecoration = Decoration.line({
  attributes: { style: "background-color: rgba(255, 255, 0);" }
});

const executedDecoration = Decoration.line({
  attributes: { style: "background-color: rgba(100, 100, 100, 0.3);" }
});

const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode, currentLine, isComplete }) => {
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

      // 調整行號基準
      const adjustedLine = currentLine - 4;
      if (adjustedLine > 0 && adjustedLine <= docLineCount) {
        // 把已執行的行數背景變暗
        for (let line = 1; line < adjustedLine; line++) {
          view.dispatch({
            effects: addExecutedHighlight.of({ line })
          });
        }

        // 高亮目前行數
        view.dispatch({
          effects: addHighlight.of({ line: adjustedLine })
        });
      }
    }

    // 如果 isComplete 為 true，清除所有高亮
    if (isComplete && editorRef.current) {

      setTimeout(() => {
        editorRef.current?.dispatch({
          effects: clearHighlights.of(null)
        });
      }, 1000);

    }
  }, [currentLine, isComplete]);

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
          className="h-full bg-slate-800"
          
        />
      </CardContent>
    </Card>
  );
};

export default CodeEditor;
