const input = document.querySelector('#file-input');
const message = document.querySelector('#message');
const fileCard = document.querySelector('#file-card');
const fileName = document.querySelector('#file-name');
const fileStatus = document.querySelector('#file-status');
const metadata = document.querySelector('#metadata');
const projectMetadata = document.querySelector('#project-metadata');
const tableStatus = document.querySelector('#table-status');

function projectName(fileName) {
  return fileName.replace(/\.dwg$/i, '');
}

function renderProjectMetadata(file, result) {
  const rows = [
    ['Projeto', projectName(file.name)],
    ['Versão do AutoCAD', result.versionLabel],
    ['Formato', result.format],
    ['Tamanho', result.sizeLabel],
    ['Assinatura', result.signature],
    ['Status', 'Cabeçalho validado']
  ];

  projectMetadata.innerHTML = rows
    .map(([label, value]) => `<tr><th>${label}</th><td>${value}</td></tr>`)
    .join('');
}

input.addEventListener('change', async () => {
  const [file] = input.files;
  if (!file) return;

  fileName.textContent = file.name;
  fileStatus.textContent = 'Lendo cabeçalho...';
  fileCard.classList.remove('empty');
  message.textContent = '';

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/dwg/read', { method: 'POST', body: formData });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);

    fileStatus.textContent = 'Arquivo reconhecido';
    tableStatus.textContent = 'LEITURA CONCLUÍDA';
    metadata.innerHTML = [
      ['Formato', result.format],
      ['Versão', result.versionLabel],
      ['Tamanho', result.sizeLabel],
      ['Assinatura', result.signature]
    ].map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('');
    renderProjectMetadata(file, result);
    message.textContent = result.message;
  } catch (error) {
    fileStatus.textContent = 'Falha na leitura';
    tableStatus.textContent = 'ERRO NA LEITURA';
    message.textContent = error.message;
  }
});

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((item) => {
      item.classList.toggle('active', item === tab);
      item.setAttribute('aria-selected', item === tab ? 'true' : 'false');
    });
    document.querySelector('#drawing-placeholder').classList.toggle('hidden', tab.dataset.view !== 'drawing');
    document.querySelector('#info-view').classList.toggle('hidden', tab.dataset.view !== 'info');
  });
});