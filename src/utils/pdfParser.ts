// Dynamic browser PDF text extraction using pdfjs-dist (lazy-loaded on demand)
export async function extractTextFromPdfFile(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  const workerUrl = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.default;

  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  const pagesText: string[] = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const strings = content.items
      .map((item: any) => (typeof item?.str === 'string' ? item.str : ''))
      .filter(Boolean);
    pagesText.push(strings.join('\n'));
  }

  return pagesText.join('\n\n').trim();
}
