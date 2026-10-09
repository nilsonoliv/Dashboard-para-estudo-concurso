"use strict";

import { QUESTOES_PADRAO } from './modules/questions.js?v=2.1';

/* ==========================================================================
   BLOCO 2: MÓDULO DE DADOS (MODEL)
   ========================================================================== */
/* ==========================================================================
   BLOCO 2: MÓDULO DE DADOS (MODEL)
   ========================================================================== */
class BancoDeDados {
    constructor() {
        this.questoes = [];
        this.historico = [];
        this.carregarDadosLocais();
    }

    carregarDadosLocais() {
        const bdGuardado = localStorage.getItem('creci_2026_data');
        const histGuardado = localStorage.getItem('creci_2026_history');
        
        this.historico = histGuardado ? JSON.parse(histGuardado) : [];
        const progressoSalvo = bdGuardado ? JSON.parse(bdGuardado) : [];

        // Em tempo de execução, mescla o banco estático com o progresso do aluno.
        // Se o aluno nunca respondeu a questão, assume 0.
        this.questoes = QUESTOES_PADRAO.map(qPadrao => {
            const progresso = progressoSalvo.find(p => p.id === qPadrao.id);
            return {
                ...qPadrao,
                status: progresso ? progresso.status : 0,
                historico: progresso ? progresso.historico : 0
            };
        });
    }

    guardar() {
        // Mapeia e salva APENAS as questões que o aluno interagiu (status ou historico diferentes de 0).
        // Remove enunciados, alternativas e explicações do LocalStorage.
        const progressoEnxuto = this.questoes
            .filter(q => q.status !== 0 || q.historico !== 0)
            .map(q => ({
                id: q.id,
                status: q.status,
                historico: q.historico
            }));

        localStorage.setItem('creci_2026_data', JSON.stringify(progressoEnxuto));
        localStorage.setItem('creci_2026_history', JSON.stringify(this.historico));
    }

    reporDeFabrica() {
        if (confirm("Isso apagará todo seu histórico de acertos e erros. Continuar?")) {
            // Zera os atributos dinâmicos sem perder a estrutura da sessão atual
            this.questoes = QUESTOES_PADRAO.map(q => ({ ...q, status: 0, historico: 0 }));
            this.historico = [];
            this.guardar();
            location.reload(); 
        }
    }

    importarDeFicheiro(textoJSON) {
        try {
            const ficheiro = JSON.parse(textoJSON);
            if (!ficheiro || typeof ficheiro !== 'object') return false;
            
            // O arquivo importado agora traz apenas a estrutura enxuta
            const progressoImportado = ficheiro.bank || [];
            this.historico = ficheiro.history || [];
            
            // Reconstrói o banco de questões da sessão atual baseando-se no arquivo importado
            this.questoes = QUESTOES_PADRAO.map(qPadrao => {
                const progresso = progressoImportado.find(p => p.id === qPadrao.id);
                return {
                    ...qPadrao,
                    status: progresso ? progresso.status : 0,
                    historico: progresso ? progresso.historico : 0
                };
            });

            this.guardar();
            return true;
        } catch (e) {
            console.error("Erro ao importar o JSON de backup:", e);
            return false;
        }
    }

    exportarParaFicheiro() {
        // Exporta exatamente a mesma estrutura enxuta utilizada no LocalStorage
        const progressoEnxuto = this.questoes
            .filter(q => q.status !== 0 || q.historico !== 0)
            .map(q => ({
                id: q.id,
                status: q.status,
                historico: q.historico
            }));

        return JSON.stringify({ bank: progressoEnxuto, history: this.historico }, null, 2);
    }

    gerarEstatisticasGlobais() {
        let pendentes = 0;
        let totalAcertosHistorico = 0, totalRespondidasHistorico = 0, totalTempo = 0;
        let analisePorMateria = {};
        let analisePorAssunto = {};

        this.questoes.forEach(q => {
            if (q.status === 0) pendentes++;
        });

        this.historico.forEach(simulado => {
            totalAcertosHistorico += simulado.acertos || 0;
            totalRespondidasHistorico += simulado.totalRespondidas || 0;
            totalTempo += simulado.tempoGasto || 0;

            if (simulado.desempenhoSessao) {
                for (let materia in simulado.desempenhoSessao) {
                    if (!analisePorMateria[materia]) analisePorMateria[materia] = { c: 0, e: 0 };
                    analisePorMateria[materia].c += simulado.desempenhoSessao[materia].certas;
                    analisePorMateria[materia].e += simulado.desempenhoSessao[materia].erradas;
                }
            }
            if (simulado.desempenhoAssunto) {
                for (let assunto in simulado.desempenhoAssunto) {
                    if (!analisePorAssunto[assunto]) analisePorAssunto[assunto] = { c: 0, e: 0 };
                    analisePorAssunto[assunto].c += simulado.desempenhoAssunto[assunto].certas;
                    analisePorAssunto[assunto].e += simulado.desempenhoAssunto[assunto].erradas;
                };
            }
        });

        const certas = totalAcertosHistorico;
        const erradas = totalRespondidasHistorico - totalAcertosHistorico;
        const precisaoPerc = totalRespondidasHistorico > 0 ? Math.round((totalAcertosHistorico / totalRespondidasHistorico) * 100) : 0;
        const tempoMedioSegundos = totalRespondidasHistorico > 0 ? Math.round(totalTempo / totalRespondidasHistorico) : 0;

        return { certas, erradas, pendentes, precisaoPerc, tempoMedioSegundos, analisePorMateria, analisePorAssunto };
    }
}

/* BLOCOS 3, 4 e 5 permanecem iguais ao padrão anterior... */
/* Para brevidade, assumimos que InterfaceGrafica, MotorSimulado e AppGestor 
   estão carregados conforme o arquivo original. */

class InterfaceGrafica {
    navegarPara(idEcra) {
        document.querySelectorAll('.view').forEach(ecra => ecra.classList.add('hidden-view'));
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(idEcra).classList.remove('hidden-view');
        const botaoMenu = document.querySelector(`[data-target="${idEcra}"]`);
        if (botaoMenu) botaoMenu.classList.add('active');
    }
    // Exibe um modal customizado para avisos e confirmações, retornando uma Promise que resolve com a resposta do usuário.
    async mostrarAviso(mensagem, titulo = "Aviso", tipo = "alert", explicacao = null) {
        return new Promise((resolver) => {
            document.getElementById('modal-title').innerText = titulo;
            document.getElementById('modal-msg').innerText = mensagem;
            const caixaExplicacao = document.getElementById('modal-exp');
            if (explicacao) {
                caixaExplicacao.innerHTML = `<strong>Explicação:</strong> ${explicacao}`;
                caixaExplicacao.classList.remove('hidden-view');
            } else {
                caixaExplicacao.classList.add('hidden-view');
            }
            const modal = document.getElementById('custom-modal');
            const btnCancelar = document.getElementById('modal-btn-cancel');
            const btnOk = document.getElementById('modal-btn-ok');
            modal.classList.remove('hidden-view');
            if (tipo === "confirm") {
                btnCancelar.classList.remove('hidden-view');
                btnOk.className = "btn btn-danger";
            } else {
                btnCancelar.classList.add('hidden-view');
                btnOk.className = "btn btn-primary";
            }
            const fecharModal = (resultado) => {
                modal.classList.add('hidden-view');
                btnOk.onclick = null;
                btnCancelar.onclick = null;
                resolver(resultado);
            };
            btnOk.onclick = () => fecharModal(true);
            btnCancelar.onclick = () => fecharModal(false);
        });
    }

    desenharPainelEstatisticas(metricas) {
        document.getElementById('stat-certas').innerText = metricas.certas;
        document.getElementById('stat-erradas').innerText = metricas.erradas;
        document.getElementById('stat-pendentes').innerText = metricas.pendentes;
        document.getElementById('stat-tempo').innerText = `${metricas.tempoMedioSegundos}s`;
        document.getElementById('stat-perc').innerText = `${metricas.precisaoPerc}%`;
        document.getElementById('main-donut').style.setProperty('--perc', `${metricas.precisaoPerc}%`);
        this.desenharAnaliseSWOT(metricas.analisePorMateria);
        this.desenharGraficoBarras(metricas.analisePorMateria);
        this.desenharGraficoBarrasAssunto(metricas.analisePorAssunto);
        this.desenharAnaliseSWOTAssunto(metricas.analisePorAssunto);
    }
    
    desenharGraficoBarras(analisePorMateria) {
        const container = document.getElementById('materia-bar-chart');
        if (!container) return;
        container.innerHTML = '';
        for (let materia in analisePorMateria) {
            let dados = analisePorMateria[materia];
            let respondidas = dados.c + dados.e;
            let percentagem = respondidas > 0 ? Math.round((dados.c / respondidas) * 100) : 0;
            const row = document.createElement('div');
            row.className = 'bar-chart-row';
            row.innerHTML = `
            <div class="bar-label"><span>${materia}</span><span>${percentagem}%</span></div>
            <div class="bar-container"><div class="bar-fill" style="width: ${percentagem}%"></div></div>
            `;
            container.appendChild(row);
        }
    }
    //*******************************************************
    desenharGraficoBarrasAssunto(analisePorAssunto) {
        const container = document.getElementById('assunto-bar-chart');
        if (!container) return;
        container.innerHTML = '';
        for (let assunto in analisePorAssunto) {
            let dados = analisePorAssunto[assunto];
            let respondidas = dados.c + dados.e;
            let percentagem = respondidas > 0 ? Math.round((dados.c / respondidas) * 100) : 0;
            const row = document.createElement('div');
            row.className = 'bar-chart-row';
            row.innerHTML = `
                <div class="bar-label"><span>${assunto}</span><span>${percentagem}%</span></div>
                <div class="bar-container"><div class="bar-fill" style="width: ${percentagem}%"></div></div>
            `;
            container.appendChild(row);
        }
    }

    desenharAnaliseSWOT(analisePorMateria) {
        let fortesHTML = '', atencaoHTML = '';
        for (let materia in analisePorMateria) {
            let dados = analisePorMateria[materia];
            let respondidas = dados.c + dados.e;
            if (respondidas > 0) {
                let percentagem = Math.round((dados.c / respondidas) * 100);
                let itemHtml = `<li class="swot-item"><span>${materia}</span> <span class="perc">${percentagem}%</span></li>`;
                if (percentagem >= 80) fortesHTML += itemHtml;
                else if (percentagem < 60) atencaoHTML += itemHtml;
            }
        }
        document.getElementById('swot-fortes').innerHTML = fortesHTML || '<li class="empty-state">Sem métricas suficientes.</li>';
        document.getElementById('swot-atencao').innerHTML = atencaoHTML || '<li class="empty-state">Sem alertas no momento.</li>';
    }
    //***********************************************************
        desenharAnaliseSWOTAssunto(analisePorAssunto) {
        let fortesHTML = '', atencaoHTML = '';
        for (let assunto in analisePorAssunto) {
            let dados = analisePorAssunto[assunto];
            let respondidas = dados.c + dados.e;
            if (respondidas > 0) {
                let percentagem = Math.round((dados.c / respondidas) * 100);
                let itemHtml = `<li class="swot-item"><span>${assunto}</span> <span class="perc">${percentagem}%</span></li>`;
                
                if (percentagem >= 80) fortesHTML += itemHtml;
                else if (percentagem < 60) atencaoHTML += itemHtml;
            }
        }
        document.getElementById('swot-fortes-assunto').innerHTML = fortesHTML || '<li class="empty-state">Sem métricas suficientes.</li>';
        document.getElementById('swot-atencao-assunto').innerHTML = atencaoHTML || '<li class="empty-state">Sem alertas no momento.</li>';
    }

    desenharHistorico(historicoArray) {
        const caixa = document.getElementById('historico-list');
        caixa.innerHTML = '';
        if (historicoArray.length === 0) {
            caixa.innerHTML = '<div class="empty-state">Nenhum simulado realizado ainda.</div>';
            return;
        }
        [...historicoArray].reverse().forEach(simulado => {
            const dataObj = new Date(simulado.data);
            const formatoData = `${dataObj.getDate().toString().padStart(2, '0')}/${(dataObj.getMonth()+1).toString().padStart(2, '0')}/${dataObj.getFullYear()} ${dataObj.getHours().toString().padStart(2, '0')}:${dataObj.getMinutes().toString().padStart(2, '0')}`;
            const item = document.createElement('div');
            item.className = 'history-card';
            item.innerHTML = `
                <div>
                    <div class="h-title">Simulado ${simulado.modo}</div>
                    <div class="h-meta">${formatoData} • Duração: ${Math.round(simulado.tempoGasto / 60)}m ${simulado.tempoGasto % 60}s</div>
                </div>
                <div class="h-score">${simulado.acertos}/${simulado.totalRespondidas}</div>
            `;
            caixa.appendChild(item);
        });
    }

    // Preenche o dropdown de matérias com base nas questões disponíveis, garantindo que apenas matérias relevantes sejam listadas.
    preencherFiltros(listaQuestoes) {
        const materiasUnicas = [...new Set(listaQuestoes.map(q => q.materia))];
        const selectMateria = document.getElementById('sel-materia');
        selectMateria.innerHTML = '<option value="todas">Todas as Matérias</option>';
        materiasUnicas.forEach(m => selectMateria.innerHTML += `<option value="${m}">${m}</option>`);
    }

// Atualiza o dropdown de assuntos com base na matéria selecionada, garantindo que apenas assuntos relevantes sejam listados.
    atualizarAssuntos(listaQuestoes, materiaSelecionada) {
        let assuntosValidos = [];
        if (materiaSelecionada === 'todas') {
            assuntosValidos = [...new Set(listaQuestoes.map(q => q.assunto))];
        } else {
            assuntosValidos = [...new Set(listaQuestoes.filter(q => q.materia === materiaSelecionada).map(q => q.assunto))];
        };

        
        //Pega a nova div que foi adicionada para adicionar checkboxes e selecionar mais de um assunto 
        const containerAssuntos = document.getElementById('caixa-assuntos');    
        if (!containerAssuntos) return;
        
        //Adiciona a opção de selecionar todos os assuntos
        containerAssuntos.innerHTML = `<label style="display: block; font-weight: bold; margin-bottom: 8px; cursor: pointer;">
        <input type="checkbox" id="chk-todos-assuntos" value="todos" checked>
        Selecionar Todos
        </label>
        <hr style="margin-bottom: 8px;">`;
        //Adiciona os assuntos individuais
        assuntosValidos.forEach(a => {
        containerAssuntos.innerHTML += `
        <label style="display: block; margin-bottom: 5px; margin-left: 10px; cursor: pointer;">
                    <input type="checkbox" class="chk-assunto" value="${a}" checked>
                    ${a}
                </label>
        `;
    });
    // --- UX Sênior: Comportamento do Dropdown e Checkboxes ---
    const chkTodos = document.getElementById('chk-todos-assuntos');
    const chksIndividuais = document.querySelectorAll('.chk-assunto');
        const dropdownTitle = document.getElementById('dropdown-title');
        const dropdownHeader = document.getElementById('dropdown-header');
        const caixaAssuntos = document.getElementById('caixa-assuntos');

        // 1. Função para atualizar o texto do falso select
        const atualizarTitulo = () => {
            if (chkTodos.checked) {
                dropdownTitle.innerText = "Todos os assuntos";
            } else {
                const marcados = document.querySelectorAll('.chk-assunto:checked').length;
                if (marcados === 0) dropdownTitle.innerText = "Nenhum selecionado";
                else if (marcados === 1) dropdownTitle.innerText = "1 assunto selecionado";
                else dropdownTitle.innerText = `${marcados} assuntos selecionados`;
            }
        };

        // 2. Lógica de marcar/desmarcar checkboxes
        chkTodos.addEventListener('change', (e) => {
            chksIndividuais.forEach(chk => chk.checked = e.target.checked);
            atualizarTitulo();
        });

        chksIndividuais.forEach(chk => {
            chk.addEventListener('change', () => {
                if (!chk.checked) chkTodos.checked = false;
                const todosMarcados = Array.from(chksIndividuais).every(c => c.checked);
                if (todosMarcados) chkTodos.checked = true;
                atualizarTitulo();
            });
        });

        atualizarTitulo(); // Configura o texto inicial

        // 3. Lógica de abrir e fechar a caixa suspensa (Dropdown)
        dropdownHeader.onclick = (e) => {
            e.stopPropagation(); // Impede que o clique seja detetado pelo fecho global abaixo
            if(caixaAssuntos.style.display === 'none' || caixaAssuntos.style.display === '') {
                caixaAssuntos.style.display = 'block';
            } else {
                caixaAssuntos.style.display = 'none';
            }
        };

        // 4. Fechar o dropdown automaticamente ao clicar noutro lugar do ecrã
        if (!window.dropdownListenerAdicionado) {
            window.addEventListener('click', (e) => {
                const caixa = document.getElementById('caixa-assuntos');
                const header = document.getElementById('dropdown-header');
                if (caixa && header && !header.contains(e.target) && !caixa.contains(e.target)) {
                    caixa.style.display = 'none';
                }
            });
            window.dropdownListenerAdicionado = true; // Garante que não adicionamos o listener duplicado
        }
    }
  
    
    // Exibe a questão atual no formato de enunciado, alternativas e informações adicionais, preparando os botões para interação.
       exibirQuestaoAtual(questao, indiceAtual, totalQuestoes, aoSelecionarOpcao, aoConfirmar) {
        document.getElementById('q-header-info').innerText = `#${questao.id} | ${questao.materia} > ${questao.assunto} (${questao.banca})`;
        document.getElementById('q-counter').innerText = `Questão ${indiceAtual + 1} de ${totalQuestoes}`;
        document.getElementById('q-enunciado').innerText = questao.enunciado;
        const imgCont = document.getElementById('q-imagem-container');
        
        if (questao.imagem) { 
            // Substitua "/assets/img/" pelo caminho real onde você guardou as imagens das questões
            document.getElementById('q-imagem').src = "/assets/img/" + questao.imagem; 
            imgCont.classList.remove('hidden-view'); 
        }
        else { imgCont.classList.add('hidden-view'); }
        document.getElementById('q-feedback').classList.add('hidden-view');
        const btnResp = document.getElementById('btn-responder');
    
    
    /*exibirQuestaoAtual(questao, indiceAtual, totalQuestoes, aoSelecionarOpcao, aoConfirmar) {
        document.getElementById('q-header-info').innerText = `#${questao.id} | ${questao.materia} > ${questao.assunto} (${questao.banca})`;
        document.getElementById('q-counter').innerText = `Questão ${indiceAtual + 1} de ${totalQuestoes}`;
        document.getElementById('q-enunciado').innerText = questao.enunciado;
        const imgCont = document.getElementById('q-imagem-container');
        if (questao.imagem) { document.getElementById('q-imagem').src = questao.imagem; imgCont.classList.remove('hidden-view'); }
        else { imgCont.classList.add('hidden-view'); }
        document.getElementById('q-feedback').classList.add('hidden-view');
        const btnResp = document.getElementById('btn-responder');*/
        btnResp.innerText = "Responder";
        btnResp.disabled = true;
        btnResp.onclick = aoConfirmar;
        const caixaAlternativas = document.getElementById('q-alternativas');
        caixaAlternativas.innerHTML = ''; 
        questao.alternativas.forEach((texto, idx) => {
            const btn = document.createElement('button');
            btn.className = "option-btn";
            btn.innerHTML = `<span class="option-letter">${String.fromCharCode(65 + idx)}.</span> ${texto}`;
            btn.addEventListener('click', () => { if (btnResp.innerText === "Responder") aoSelecionarOpcao(idx); });
            caixaAlternativas.appendChild(btn);
        });
    }
// Marca a opção selecionada visualmente, garantindo que apenas uma opção esteja destacada e habilitando o botão de resposta.
    marcarOpcaoVisualmente(idx) {
        const botoes = document.getElementById('q-alternativas').children;
        Array.from(botoes).forEach(btn => btn.classList.remove('selected'));
        botoes[idx].classList.add('selected');
        document.getElementById('btn-responder').disabled = false;
    }

    mostrarCorrecaoLocal(acertou, explicacao, correta, selecionada, aoClicarProxima) {
        const botoes = document.getElementById('q-alternativas').children;
        const quadro = document.getElementById('q-feedback');
        const btnResp = document.getElementById('btn-responder');
        Array.from(botoes).forEach((btn, idx) => {
            btn.classList.remove('selected'); btn.disabled = true; 
            if (idx === correta) btn.classList.add('correct');
            else if (idx === selecionada && !acertou) btn.classList.add('incorrect');
        });
        quadro.className = `feedback-box ${acertou ? 'success' : 'danger'}`;
        quadro.innerHTML = `<strong>${acertou ? 'Correta!' : 'Incorreta.'}</strong> Gabarito: ${String.fromCharCode(65 + correta)}.<br><br><strong>Explicação:</strong> ${explicacao}`;
        btnResp.innerText = "Próxima Questão";
        btnResp.onclick = aoClicarProxima;
    }
    
    atualizarStatusCloud(usuario) {
        const divOut = document.getElementById('cloud-logged-out');
        const divIn = document.getElementById('cloud-logged-in');
        if (usuario) {
            divOut.classList.add('hidden-view');
            divIn.classList.remove('hidden-view');
            document.getElementById('user-name').innerText = usuario.displayName || usuario.email;
        } else {
            divOut.classList.remove('hidden-view');
            divIn.classList.add('hidden-view');
        }
    }
}
// O MotorSimulado é responsável por toda a lógica de execução do simulado, desde a criação da fila de questões até o controle do tempo e registro de resultados.
class MotorSimulado {
    constructor(baseDados, interfaceGrafica) {
        this.bd = baseDados;
        this.ui = interfaceGrafica;
        this.modo = 'livre';
        this.fila = [];
        this.indiceAtual = 0;
        this.opcaoAguardando = null;
        this.acertosSessao = 0;
        this.momentoInicio = 0;
        this.intervaloRelogio = null;
        this.segundosRestantes = 0;
        this.desempenhoSessao = {}; // NOVO: Registo fragmentado por matéria
        this.desempenhoAssunto = {}; // NOVO: Registo fragmentado por assunto
    }
    // Inicia o simulado com as configurações escolhidas, preparando a fila de questões e o timer conforme o modo selecionado.
    async iniciarConfigurado(modo, tempo, qtd, materia, assunto) {
        this.modo = modo; this.acertosSessao = 0; this.momentoInicio = Math.floor(Date.now() / 1000); 
        this.desempenhoSessao = {}; // NOVO: Zera o registo no início de cada simulado
        this.desempenhoAssunto = {}; // NOVO: Zera o registo no início de cada simulado
        if (this.modo === 'prova') {
            this.segundosRestantes = 150 * 60; document.getElementById('q-timer').classList.remove('hidden-view');
            this.iniciarRelogio(); await this.criarFilaProvaOficial();
        } else {
            if (tempo > 0 && this.modo === 'cronometrado') {
                this.segundosRestantes = tempo * 60; document.getElementById('q-timer').classList.remove('hidden-view');
                this.iniciarRelogio();
            } else { document.getElementById('q-timer').classList.add('hidden-view'); }
            await this.criarFilaCustomizada(qtd, materia, assunto);
        }
        if (this.fila.length === 0) return;
        document.getElementById('simulado-setup').classList.add('hidden-view');
        document.getElementById('simulado-runner').classList.remove('hidden-view');
        this.prepararQuestaoAtual();
    }

    async criarFilaCustomizada(qtd, materia, assunto) {
        let cand = this.bd.questoes.filter(q => q.status !== 1);
        if (materia !== 'todas') cand = cand.filter(q => q.materia === materia);
        // Aplica o filtro tanto para modo livre quanto cronometrado
        if ((this.modo === 'livre' || this.modo === 'cronometrado') && !assunto.includes('todos')) {
            // Retorna a questão APENAS se o assunto dela existir dentro da lista (Array) de escolhidos
            cand = cand.filter(q => assunto.includes(q.assunto));
        }

        if (cand.length === 0) {
            const res = await this.ui.mostrarAviso("Esgotou as questões. Reiniciar banco?", "Banco Esgotado", "confirm");
            if (res) { this.bd.questoes.forEach(q => q.status = 0); this.bd.guardar(); return this.criarFilaCustomizada(qtd, materia, assunto); }
            this.fila = []; return;
        }
        cand.sort(() => Math.random() - 0.5); //cand.sort((a, b) => b.status - a.status); Essa parte coloca as questões com tatus 2 no início 
        this.fila = cand.slice(0, qtd); this.indiceAtual = 0;
    }
    // Para o modo "prova oficial", a fila é gerada seguindo a estrutura tradicional de 30 questões, respeitando as categorias e garantindo uma seleção aleatória dentro de cada categoria.
    async criarFilaProvaOficial() {
        let cand = this.bd.questoes.filter(q => q.status !== 1);
        if (cand.length === 0) {
            const res = await this.ui.mostrarAviso("Esgotou as questões. Repor para a prova?", "Banco Esgotado", "confirm");
            if (res) { this.bd.questoes.forEach(q => q.status = 0); this.bd.guardar(); return this.criarFilaProvaOficial(); }
            this.fila = []; return;
        }
        cand.sort(() => Math.random() - 0.5);// cand.sort((a, b) => b.status - a.status); Essa parte coloca as questões com tatus 2 no início 
        let pt = cand.filter(q => q.materia === "Língua Portuguesa").slice(0, 10);
        let inf = cand.filter(q => q.materia === "Informática").slice(0, 5);
        let mt = cand.filter(q => q.materia === "Matemática").slice(0, 2);
        let rlm = cand.filter(q => q.materia === "Raciocínio Lógico").slice(0, 3);
        let cg = cand.filter(q => q.categoria === "Conhecimentos Gerais").slice(0, 10);
        this.fila = [...pt, ...inf, ...mt, ...rlm, ...cg];
        if (this.fila.length === 0) { await this.ui.mostrarAviso("Erro na geração da prova."); return; }
        this.fila.sort(() => Math.random() - 0.5); this.indiceAtual = 0;
    }

    iniciarRelogio() {
        if(this.intervaloRelogio) clearInterval(this.intervaloRelogio);
        this.atualizarVisorTimer();
        this.intervaloRelogio = setInterval(async () => {
            this.segundosRestantes--; this.atualizarVisorTimer();
            if (this.segundosRestantes <= 0) { clearInterval(this.intervaloRelogio); await this.ui.mostrarAviso("Tempo esgotado!"); this.encerrarSessao(); }
        }, 1000);
    }

    atualizarVisorTimer() {
        const h = Math.floor(this.segundosRestantes / 3600), m = Math.floor((this.segundosRestantes % 3600) / 60), s = this.segundosRestantes % 60;
        document.getElementById('timer-text').innerText = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }

    prepararQuestaoAtual() {
        const q = this.fila[this.indiceAtual]; this.opcaoAguardando = null; 
        this.ui.exibirQuestaoAtual(q, this.indiceAtual, this.fila.length, 
            (idx) => { this.opcaoAguardando = idx; this.ui.marcarOpcaoVisualmente(idx); },
            () => this.submeterResposta()
        );
    }

submeterResposta() {
        if (this.opcaoAguardando === null) return; 
        
        const qFila = this.fila[this.indiceAtual];
        const qOrig = this.bd.questoes.find(q => q.id === qFila.id);
        const ok = (this.opcaoAguardando === qOrig.resposta_correta);
        
        if (ok) this.acertosSessao++;

        // --- ARQUITETURA NOVA: Alimenta o relatório da sessão atual ---
        if (!this.desempenhoSessao[qOrig.materia]) {
            this.desempenhoSessao[qOrig.materia] = { certas: 0, erradas: 0 };
        }
        if (ok) this.desempenhoSessao[qOrig.materia].certas++;
        else this.desempenhoSessao[qOrig.materia].erradas++;
        ////********************************************************
        if (!this.desempenhoAssunto[qOrig.assunto]) {
            this.desempenhoAssunto[qOrig.assunto] = { certas: 0, erradas: 0 };
        }
        if (ok) this.desempenhoAssunto[qOrig.assunto].certas++;
        else this.desempenhoAssunto[qOrig.assunto].erradas++;
        // --------------------------------------------------------------

        qOrig.status = ok ? 1 : 2; 
        qOrig.historico = ok ? 1 : 2; 
        this.bd.guardar();
        
        this.ui.mostrarCorrecaoLocal(ok, qOrig.explicacao, qOrig.resposta_correta, this.opcaoAguardando, () => this.avancarSessao());
    }

    avancarSessao() {
        this.indiceAtual++;
        if (this.indiceAtual < this.fila.length) this.prepararQuestaoAtual();
        else this.encerrarSessao();
    }

cancelarSessao() {
        // 1. Para o cronômetro
        if(this.intervaloRelogio) clearInterval(this.intervaloRelogio);
        
        // 2. Calcula o tempo gasto (variável 'dur' que estava a faltar)
        const dur = Math.floor(Date.now() / 1000) - this.momentoInicio;
        
        // 3. Salva no histórico (com a nova arquitetura)
        if (this.indiceAtual > 0) {
            this.bd.historico.push({ 
                data: new Date().toISOString(), 
                modo: this.modo + ' (Canc.)', 
                acertos: this.acertosSessao, 
                totalRespondidas: this.indiceAtual, 
                tempoGasto: dur,
                desempenhoSessao: this.desempenhoSessao, // Injetado com sucesso!
                desempenhoAssunto: this.desempenhoAssunto // Injetado com sucesso!
            });
            this.bd.guardar();
        }
        
        // 4. Muda a interface gráfica de volta para o Setup
        document.getElementById('simulado-runner').classList.add('hidden-view');
        document.getElementById('simulado-setup').classList.remove('hidden-view');
    }

    encerrarSessao() {
        // 1. Para o cronômetro
        if(this.intervaloRelogio) clearInterval(this.intervaloRelogio);
        
        // 2. Calcula o tempo gasto (variável 'dur' que estava a faltar)
        const dur = Math.floor(Date.now() / 1000) - this.momentoInicio;
        
        // 3. Salva no histórico (com a nova arquitetura)
        this.bd.historico.push({ 
            data: new Date().toISOString(), 
            modo: this.modo, 
            acertos: this.acertosSessao, 
            totalRespondidas: this.indiceAtual, 
            tempoGasto: dur,
            desempenhoSessao: this.desempenhoSessao, // Injetado com sucesso!
            desempenhoAssunto: this.desempenhoAssunto // Injetado com sucesso!
        });
        this.bd.guardar();
        
        // 4. Atualiza a pontuação na tela final e mostra a visão de conclusão
        document.getElementById('simulado-runner').classList.add('hidden-view');
        document.getElementById('fim-score').innerText = `${this.acertosSessao}/${this.indiceAtual}`;
        document.getElementById('simulado-fim').classList.remove('hidden-view');
    }
}

class AppGestor {
    constructor() {
        this.bd = new BancoDeDados();
        this.ui = new InterfaceGrafica();
        this.simulador = new MotorSimulado(this.bd, this.ui);
        this.auth = null; this.db = null; this.user = null;
        this.appId = typeof __app_id !== 'undefined' ? __app_id : 'simulador-creci-2026';
    }

    async iniciarSistema() {
        await this.inicializarFirebase();
        this.configurarOuvintes();
        this.mudarEcra('view-dashboard');
    }

    async inicializarFirebase() {
        try {
            const { initializeApp, getAuth, onAuthStateChanged, getFirestore, signInWithCustomToken, signInAnonymously } = window.FirebaseSDK;
            const config = JSON.parse(__firebase_config);
            const app = initializeApp(config);
            this.auth = getAuth(app);
            this.db = getFirestore(app);
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                await signInWithCustomToken(this.auth, __initial_auth_token);
            } else {
                await signInAnonymously(this.auth);
            }
            onAuthStateChanged(this.auth, (user) => {
                this.user = user;
                this.ui.atualizarStatusCloud(user && !user.isAnonymous ? user : null);
            });
        } catch (e) { console.error("Firebase Init Error:", e); }
    }

    configurarOuvintes() { // Configura os ouvintes de eventos para os botões e interações da interface
        document.querySelectorAll('.nav-btn').forEach(b => b.addEventListener('click', (e) => this.mudarEcra(e.target.dataset.target)));// Navegação entre telas
        document.querySelectorAll('.setup-card').forEach(c => c.addEventListener('click', (e) => {
            document.querySelectorAll('.setup-card').forEach(x => x.classList.remove('active'));
            e.currentTarget.classList.add('active');
            const m = e.currentTarget.dataset.mode;
            ['field-materia', 'field-assunto', 'field-tempo', 'field-qtd'].forEach(f => document.getElementById(f).classList.add('hidden-view'));
            if (m === 'livre') ['field-materia', 'field-assunto', 'field-tempo', 'field-qtd'].forEach(f => document.getElementById(f).classList.remove('hidden-view'));
            else if (m === 'cronometrado') ['field-materia', 'field-assunto','field-tempo', 'field-qtd'].forEach(f => document.getElementById(f).classList.remove('hidden-view'));
        }));
        document.getElementById('sel-materia').addEventListener('change', (e) => this.ui.atualizarAssuntos(this.bd.questoes, e.target.value));
        document.getElementById('btn-iniciar').addEventListener('click', () => {
            const active = document.querySelector('.setup-card.active');
            const m = active ? active.dataset.mode : 'livre';
            
            // Lógica para pegar múltiplos assuntos
            const chkTodos = document.getElementById('chk-todos-assuntos');
            let assuntosParaEnviar = [];
            
            if (chkTodos && chkTodos.checked) {
                assuntosParaEnviar = ['todos'];
            } else {
                const checkboxesMarcados = document.querySelectorAll('.chk-assunto:checked');
                // Transforma a lista HTML em um Array de textos (Ex: ["Matemática", "Português"])
                assuntosParaEnviar = Array.from(checkboxesMarcados).map(chk => chk.value);
            }
            
            // Trava de segurança: Se o cara não marcou NENHUM assunto, não deixa iniciar
            if (assuntosParaEnviar.length === 0) {
                this.ui.mostrarAviso("Selecione pelo menos um assunto para gerar o simulado.");
                return;
            }

            this.simulador.iniciarConfigurado(
                m, 
                parseInt(document.getElementById('num-tempo').value), 
                parseInt(document.getElementById('num-qtd').value), 
                document.getElementById('sel-materia').value, 
                assuntosParaEnviar // Agora estamos enviando um Array para o Motor, e não mais uma String!
            );
        });
        document.getElementById('btn-cancelar').addEventListener('click', async () => {
            if (await this.ui.mostrarAviso("Cancelar simulado atual?", "Confirmar", "confirm")) this.simulador.cancelarSessao();
        });
        document.getElementById('btn-voltar-painel').addEventListener('click', () => this.mudarEcra('view-dashboard'));
        document.getElementById('btn-login-google').addEventListener('click', async () => {
            const { signInWithPopup, GoogleAuthProvider } = window.FirebaseSDK;
            try { await signInWithPopup(this.auth, new GoogleAuthProvider()); } catch (err) { await this.ui.mostrarAviso("Falha no Login Google."); }
        });
        document.getElementById('btn-logout').addEventListener('click', async () => {
            await window.FirebaseSDK.signOut(this.auth); this.user = null; this.ui.atualizarStatusCloud(null);
        });
        document.getElementById('btn-cloud-upload').addEventListener('click', async () => {
            if (!this.user || this.user.isAnonymous) return;
            try {
                const ref = window.FirebaseSDK.doc(this.db, 'artifacts', this.appId, 'users', this.user.uid, 'settings', 'simulationData');
                // NOVO: Pega a versão perfeitamente enxuta e limpa que criamos no exportarParaFicheiro()
                const backupEnxuto = JSON.parse(this.bd.exportarParaFicheiro());

                await window.FirebaseSDK.setDoc(ref, { bank: backupEnxuto.bank, history: backupEnxuto.history, updatedAt: new Date().toISOString() });
                await this.ui.mostrarAviso("Dados salvos na nuvem!");
            } catch (e) { await this.ui.mostrarAviso("Erro ao subir dados."); }
        });
        document.getElementById('btn-cloud-download').addEventListener('click', async () => {
            if (!this.user || this.user.isAnonymous) return;
            try {
                const ref = window.FirebaseSDK.doc(this.db, 'artifacts', this.appId, 'users', this.user.uid, 'settings', 'simulationData');
                const snap = await window.FirebaseSDK.getDoc(ref);
                if (snap.exists()) {
                    const d = snap.data(); //this.bd.questoes = d.bank; this.bd.historico = d.history; this.bd.guardar();
                    // NOVO: Empacota os dados da nuvem numa string e envia para o importarDeFicheiro().
                    // Isso garante que os dados enxutos se fundam com o QUESTOES_PADRAO e remontem os textos.
                    const mockJSON = JSON.stringify({ bank: d.bank, history: d.history });
                    this.bd.importarDeFicheiro(mockJSON);
                    
                    await this.ui.mostrarAviso("Dados restaurados!"); this.mudarEcra('view-dashboard');
                } else { await this.ui.mostrarAviso("Sem dados na nuvem."); }
            } catch (e) { await this.ui.mostrarAviso("Erro ao baixar dados."); }
        });
        document.getElementById('btn-exportar').addEventListener('click', async () => {
            const jsonContent = this.bd.exportarParaFicheiro();
            const defaultFileName = 'simulado2.json';
            try {
                if (window.showSaveFilePicker) {
                    const handle = await window.showSaveFilePicker({ suggestedName: defaultFileName, types: [{ description: 'JSON Backup', accept: { 'application/json': ['.json'] } }] });
                    const writable = await handle.createWritable();
                    await writable.write(jsonContent);
                    await writable.close();
                    await this.ui.mostrarAviso("Backup exportado!");
                } else {
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(new Blob([jsonContent], { type: "application/json" }));
                    a.download = defaultFileName;
                    a.click();
                }
            } catch (err) { if (err.name !== 'AbortError') await this.ui.mostrarAviso("Erro na exportação."); }
        });
        document.getElementById('btn-importar').addEventListener('change', (ev) => {
            const f = ev.target.files[0]; if (!f) return;
            const r = new FileReader(); r.onload = (e) => { if(this.bd.importarDeFicheiro(e.target.result)) this.mudarEcra('view-dashboard'); };
            r.readAsText(f);
        });
        document.getElementById('btn-resetar').addEventListener('click', async () => {
            this.bd.reporDeFabrica();
        });
    }

    mudarEcra(dest) {
        this.ui.navegarPara(dest);
        if (dest === 'view-dashboard') {
            const est = this.bd.gerarEstatisticasGlobais();
            this.ui.desenharPainelEstatisticas(est); this.ui.desenharHistorico(this.bd.historico);
        } else if (dest === 'view-simulado') {
            ['simulado-setup', 'simulado-runner', 'simulado-fim'].forEach(f => document.getElementById(f).classList.add('hidden-view'));
            document.getElementById('simulado-setup').classList.remove('hidden-view');
            this.ui.preencherFiltros(this.bd.questoes); this.ui.atualizarAssuntos(this.bd.questoes, 'todas');
        }

    
    }
}

document.addEventListener('DOMContentLoaded', () => { (new AppGestor()).iniciarSistema(); });