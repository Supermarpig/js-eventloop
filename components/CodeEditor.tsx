import React, { useEffect } from 'react';
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

const addHighlight = StateEffect.define<{ from: number; to: number }>({
  map: ({ from, to }, change) => ({ from: change.mapPos(from), to: change.mapPos(to) }),
});

const highlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(highlights, tr) {
    highlights = highlights.map(tr.changes);
    for (const e of tr.effects) {
      if (e.is(addHighlight)) {
        highlights = highlights.update({
          add: [highlightDecoration.range(e.value.from, e.value.to)],
        });
      }
    }
    return highlights;
  },
  provide: (f) => EditorView.decorations.from(f),
});

const highlightDecoration = Decoration.line({
  attributes: { class: "bg-blue-500 bg-opacity-30" }
});

const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode, currentLine }) => {
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

  const highlightCurrentLine = (view: EditorView) => {
    const line = view.state.doc.line(currentLine);
    view.dispatch({
      effects: addHighlight.of({ from: line.from, to: line.to }),
    });
  };

  return (
    <Card className="h-1/2 max-h-1/2 relative overflow-hidden flex flex-col pb-4">
      <CardHeader>
        <CardTitle>Code Editor</CardTitle>
      </CardHeader>
      <CardContent className='p-0 flex-grow  overflow-y-scroll '>
        <CodeMirror
          value={code}
          onChange={(value) => setCode(value)}
          // height="100%"
          theme="dark"
          extensions={[
            javascript({ jsx: true }),
            highlightField,
            EditorView.updateListener.of((update) => {
              if (update.docChanged || update.viewportChanged) {
                highlightCurrentLine(update.view);
              }
            }),
          ]}
          className="h-full max-h-64"
        />
      </CardContent>
    </Card>
  );
}

export default CodeEditor;