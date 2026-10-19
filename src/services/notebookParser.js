// Jupyter Notebook (.ipynb) parser for in-browser extraction and execution

export function parseNotebookContent(rawContent, filename = 'notebook.ipynb') {
  let notebookData;
  try {
    notebookData = typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent;
  } catch (err) {
    throw new Error(`Failed to parse notebook JSON: ${err.message}`);
  }

  const nbformat = notebookData.nbformat || 4;
  const rawCells = notebookData.cells || (notebookData.worksheets && notebookData.worksheets[0]?.cells) || [];
  
  // Extract title if present in metadata or first Markdown H1
  let title = filename.replace(/\.ipynb$/i, '');
  if (notebookData.metadata?.colab?.name) {
    title = notebookData.metadata.colab.name;
  }

  const cells = [];
  let foundFirstH1 = false;

  for (let i = 0; i < rawCells.length; i++) {
    const rawCell = rawCells[i];
    const cellType = rawCell.cell_type || 'code';
    
    // Join source array or keep string
    const source = Array.isArray(rawCell.source)
      ? rawCell.source.join('')
      : (rawCell.source || '');

    if (!foundFirstH1 && cellType === 'markdown') {
      const match = source.match(/^#\s+(.+)$/m);
      if (match && match[1]) {
        title = match[1].trim();
        foundFirstH1 = true;
      }
    }

    // Parse outputs for code cells
    let outputsText = '';
    const outputs = [];

    if (Array.isArray(rawCell.outputs)) {
      for (const out of rawCell.outputs) {
        if (out.text) {
          const textContent = Array.isArray(out.text) ? out.text.join('') : out.text;
          outputsText += textContent;
          outputs.push({ type: 'stream', text: textContent });
        } else if (out.data && out.data['text/plain']) {
          const plainText = Array.isArray(out.data['text/plain'])
            ? out.data['text/plain'].join('')
            : out.data['text/plain'];
          outputsText += plainText + '\n';
          outputs.push({ type: 'execute_result', text: plainText });
        } else if (out.traceback) {
          const tb = Array.isArray(out.traceback) ? out.traceback.join('\n') : out.traceback;
          // Clean ANSI color codes
          const cleanTb = tb.replace(/\u001b\[[0-9;]*m/g, '');
          outputsText += cleanTb + '\n';
          outputs.push({ type: 'error', text: cleanTb });
        }
      }
    }

    cells.push({
      id: `cell_${i}_${Math.random().toString(36).slice(2, 6)}`,
      cellType,
      source,
      executionCount: rawCell.execution_count ?? null,
      outputs,
      outputsText: outputsText.trim(),
    });
  }

  const codeCells = cells.filter((c) => c.cellType === 'code');
  const markdownCells = cells.filter((c) => c.cellType === 'markdown');

  return {
    filename,
    title,
    nbformat,
    kernelSpec: notebookData.metadata?.kernelspec?.display_name || 'Python 3',
    totalCells: cells.length,
    codeCellCount: codeCells.length,
    markdownCellCount: markdownCells.length,
    cells,
    combinedCode: codeCells.map((c) => c.source).join('\n\n# --- Next Cell ---\n\n'),
    combinedSampleOutput: codeCells
      .filter((c) => c.outputsText)
      .map((c) => c.outputsText)
      .join('\n---\n'),
  };
}

export function exportNotebookToJson(notebookObj) {
  const nb = {
    nbformat: 4,
    nbformat_minor: 2,
    metadata: {
      language_info: { name: 'python' },
      kernelspec: { display_name: 'Python 3 (Pyodide Web)', name: 'python3' },
    },
    cells: (notebookObj.cells || []).map((c) => ({
      cell_type: c.cellType,
      metadata: {},
      execution_count: c.executionCount || null,
      source: c.source.split('\n').map((l, i, arr) => (i < arr.length - 1 ? l + '\n' : l)),
      outputs: c.outputs || [],
    })),
  };
  return JSON.stringify(nb, null, 2);
}

