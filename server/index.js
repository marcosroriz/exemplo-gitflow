import express from 'express';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }
});

const versionNames = {
  AC1009: 'R12',
  AC1012: 'R13',
  AC1014: 'R14',
  AC1015: 'AutoCAD 2000',
  AC1018: 'AutoCAD 2004',
  AC1021: 'AutoCAD 2007',
  AC1024: 'AutoCAD 2010',
  AC1027: 'AutoCAD 2013',
  AC1032: 'AutoCAD 2018+'
};

function readDwgHeader(buffer) {
  const signature = buffer.subarray(0, 6).toString('ascii');
  const version = buffer.subarray(0, 6).toString('ascii');

  if (signature !== 'AC1009' && !signature.startsWith('AC10')) {
    const error = new Error('O arquivo não possui uma assinatura DWG reconhecida.');
    error.status = 400;
    throw error;
  }

  return {
    format: 'DWG',
    version,
    versionLabel: versionNames[version] || 'Versão não catalogada',
    sizeBytes: buffer.byteLength,
    sizeLabel: formatBytes(buffer.byteLength),
    signature,
    hasPreview: false
  };
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

app.use(express.static(path.join(__dirname, '..', 'public')));

app.post('/api/dwg/read', upload.single('file'), (request, response, next) => {
  try {
    if (!request.file) {
      return response.status(400).json({ error: 'Selecione um arquivo DWG.' });
    }

    const metadata = readDwgHeader(request.file.buffer);
    return response.json({
      fileName: request.file.originalname,
      ...metadata,
      message: 'Cabeçalho DWG lido com sucesso. A geometria poderá ser renderizada após conversão para um formato aberto.'
    });
  } catch (error) {
    return next(error);
  }
});

app.use((error, request, response, next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return response.status(413).json({ error: 'O arquivo excede o limite de 100 MB.' });
  }

  return response.status(error.status || 500).json({
    error: error.message || 'Não foi possível ler o arquivo.'
  });
});

app.listen(port, () => {
  console.log(`DWG Studio disponível em http://localhost:${port}`);
});