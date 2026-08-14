const formulario = document.querySelector('#form-clima');
const cidadeInput = document.querySelector('#cidade');
const mensagem = document.querySelector('#mensagem');
const resultado = document.querySelector('#resultado');
const botao = formulario.querySelector('button');

const climaPorCodigo = {
  0: ['Céu limpo', '☀️'],
  1: ['Predominantemente limpo', '🌤️'],
  2: ['Parcialmente nublado', '⛅'],
  3: ['Nublado', '☁️'],
  45: ['Nevoeiro', '🌫️'],
  48: ['Nevoeiro', '🌫️'],
  51: ['Garoa leve', '🌦️'],
  53: ['Garoa', '🌦️'],
  55: ['Garoa intensa', '🌧️'],
  61: ['Chuva leve', '🌧️'],
  63: ['Chuva moderada', '🌧️'],
  65: ['Chuva forte', '🌧️'],
  71: ['Neve leve', '🌨️'],
  73: ['Neve', '🌨️'],
  75: ['Neve forte', '❄️'],
  80: ['Pancadas de chuva', '🌦️'],
  81: ['Pancadas de chuva', '🌧️'],
  82: ['Chuva intensa', '⛈️'],
  95: ['Trovoadas', '⛈️']
};

function mostrarClima(dados) {
  const clima = climaPorCodigo[dados.codigo] || ['Condição não informada', '🌡️'];
  const localCompleto = [dados.cidade, dados.estado, dados.pais].filter(Boolean).join(', ');

  document.querySelector('#local').textContent = localCompleto;
  document.querySelector('#temperatura').textContent = `${Math.round(dados.temperatura)}°C`;
  document.querySelector('#descricao').textContent = clima[0];
  document.querySelector('#icone').textContent = clima[1];
  document.querySelector('#sensacao').textContent = `${Math.round(dados.sensacao)}°C`;
  document.querySelector('#umidade').textContent = `${dados.umidade}%`;
  document.querySelector('#vento').textContent = `${Math.round(dados.vento)} km/h`;

  resultado.classList.remove('escondido');
}

formulario.addEventListener('submit', async (event) => {
  event.preventDefault();

  const cidade = cidadeInput.value.trim();

  if (!cidade) {
    mensagem.textContent = 'Digite o nome de uma cidade.';
    resultado.classList.add('escondido');
    return;
  }

  mensagem.textContent = 'Buscando clima...';
  botao.disabled = true;
  resultado.classList.add('escondido');

  try {
    const resposta = await fetch(`/api/clima?cidade=${encodeURIComponent(cidade)}`);
    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro);
    }

    mensagem.textContent = '';
    mostrarClima(dados);
  } catch (erro) {
    mensagem.textContent = erro.message || 'Não foi possível buscar o clima.';
  } finally {
    botao.disabled = false;
  }
});
