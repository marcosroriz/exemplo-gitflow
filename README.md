# DWG Studio

Aplicativo Node.js para upload e leitura do cabeçalho de arquivos DWG, com uma interface web para inspeção.

## Executar

```bash
npm install
npm start
```

Abra `http://localhost:3000` no navegador.

O leitor valida a assinatura `AC10xx`, identifica a versão conhecida e mostra tamanho e metadados. A renderização integral da geometria DWG exige uma etapa adicional com uma biblioteca/conversor compatível com a versão do AutoCAD (por exemplo, conversão DWG para DXF/SVG no servidor).