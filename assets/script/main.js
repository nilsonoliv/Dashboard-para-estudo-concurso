 /**
         * Lógica Principal do Aplicativo
         * Usamos um padrão chamado "Module Pattern" (IIFE) para manter nosso código
         * isolado e seguro, evitando misturar com outros scripts da página.
         */

import { state } from './modules/checklistData.js';
import { initCountdownAracas, initCountdownFormosa, initCountdownIBGE, initCountdownAllDays } from './modules/ui.js';

        const DashboardApp = (function() {
            'use strict';


            // 2. REFERÊNCIAS DA TELA (DOM)
            // Aqui "pegamos" os elementos do HTML para poder mexer neles pelo JavaScript.
            const DOM = {
                tabButtons: document.querySelectorAll('.tab-btn'),
                tabContents: document.querySelectorAll('.tab-content'),
                checklistContainer: document.getElementById('checklist-container'),
                btnResetChecklist: document.getElementById('btn-reset-checklist'),
                btnExport: document.getElementById('btn-export'),
                btnImportTrigger: document.getElementById('btn-import-trigger'),
                fileImport: document.getElementById('file-import'),
                countdownDays: document.getElementById('countdown-days'),

                countdownDaysAracas: document.getElementById('countdown-days-aracas'),
                countdownDaysAracasValue: document.getElementById('countdown-days-aracas-value'),
                countdownDaysFormosa: document.getElementById('countdown-days-formosa'),
                countdownDaysFormosaValue: document.getElementById('countdown-days-formosa-value'),
                countdownDaysIBGE: document.getElementById('countdown-days-ibge'),
                countdownDaysIBGEValue: document.getElementById('countdown-days-ibge-value'),
                countdownDaysAll: document.getElementById('countdown-days-all'),

                btnStudyToday: document.getElementById('btn-study-today'),
                currentStreakDisplay: document.getElementById('current-streak'),
                bestStreakDisplay: document.getElementById('best-streak'),
                phaseCheckboxes: document.querySelectorAll('.phase-checkbox')
            };

//dddddddddddddddd
/*if(DOM.countdownDaysAracas) DOM.countdownDaysAracas.innerText = diffDays > 0 ? `${diffDays} dias` : "Chegou o dia!";
if(DOM.countdownDaysFormosa) DOM.countdownDaysFormosa.innerText = diffDays > 0 ? `${diffDays} dias` : "Chegou o dia!";
if(DOM.countdownDaysIBGE) DOM.countdownDaysIBGE.innerText = diffDays > 0 ? `${diffDays} dias` : "Chegou o dia!";*/

//if(DOM.countdownDaysAracas) DOM.countdownDaysAracas.innerText =  `${state.checklistData[9].category} dias`;
if(DOM.countdownDaysAracas) DOM.countdownDaysAracas.innerText = initCountdownAracas().valueDays > 0 ? `${initCountdownAracas().valueDays} dias` : "Chegou o dia!";
if(DOM.countdownDaysAracasValue) DOM.countdownDaysAracasValue.innerText = initCountdownAracas().valuePrice > 0 ? `R$${initCountdownAracas().valuePrice.toFixed(1)} por dia` : "Chegou o dia!";
if(DOM.countdownDaysFormosa) DOM.countdownDaysFormosa.innerText = initCountdownFormosa().valueDays > 0 ? `${initCountdownFormosa().valueDays} dias` : "Chegou o dia!";
if(DOM.countdownDaysFormosaValue) DOM.countdownDaysFormosaValue.innerText = initCountdownFormosa().valuePrice > 0 ? `R$${initCountdownFormosa().valuePrice.toFixed(1)} por dia` : "Chegou o dia!";
if(DOM.countdownDaysIBGE) DOM.countdownDaysIBGE.innerText = initCountdownIBGE().valueDays > 0 ? `${initCountdownIBGE().valueDays} dias` : "Chegou o dia!";
if(DOM.countdownDaysIBGEValue) DOM.countdownDaysIBGEValue.innerText = initCountdownIBGE().valuePrice > 0 ? `R$${initCountdownIBGE().valuePrice.toFixed(1)} por dia` : "Chegou o dia!";
if(DOM.countdownDaysAll) DOM.countdownDaysAll.innerText = initCountdownAllDays(initCountdownAracas().valuePrice, initCountdownFormosa().valuePrice, initCountdownIBGE().valuePrice) > 0 ? `R$${initCountdownAllDays(initCountdownAracas().valuePrice, initCountdownFormosa().valuePrice, initCountdownIBGE().valuePrice).toFixed(1)} por dia` : "Chegou o dia!";


//************************************************************************
// ////////////////////////////////////////
// ////////////////////////////////////////////////////////// */

            // 3. FUNÇÕES DA APLICAÇÃO

            /**
             * Função para trocar as abas (Fases, Evolução, Checklist, Backup)
             */
            const switchTab = (targetId) => {
                state.activeTab = targetId;
                
                // Liga a cor no botão clicado e desliga nos outros
                DOM.tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.target === targetId));
                
                // Mostra o conteúdo da aba clicada e esconde os outros
                DOM.tabContents.forEach(content => content.classList.toggle('active', content.id === `content-${targetId}`));
            };

            /**
             * Organiza os itens do checklist agrupando-os por categoria/matéria
             */
            const groupChecklistByCategory = () => {
                return state.checklistData.reduce((acc, curr) => {
                    // Se a categoria ainda não existe na lista, cria uma lista vazia e depois adiciona o item
                    (acc[curr.category] = acc[curr.category] || []).push(curr);
                    return acc;
                }, {});
            };

            /**
             * Função executada quando o usuário clica para marcar/desmarcar um item do checklist
             */
            const handleCheckToggle = (e) => {
                // Confere se o que foi clicado foi realmente a caixinha de seleção (checkbox)
                if(e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
                    const { id, checked } = e.target;
                    
                    // Salva a ação (marcado ou não) no "banco de dados" do navegador (localStorage)
                    localStorage.setItem(id, checked);
                    
                    // Redesenha a lista para que a reordenação (itens marcados descem) aconteça
                    renderChecklist();
                }
            };

            /**
             * Desenha (renderiza) o checklist na tela, respeitando os itens concluídos e a ordem
             */
            const renderChecklist = () => {
                // Limpa o que estava na tela antes
                DOM.checklistContainer.innerHTML = '';
                
                // Pega os itens agrupados por categoria
                const groupedData = groupChecklistByCategory();
                
                // Para cada categoria, cria o HTML na tela
                for (const category in groupedData) {
                    let html = `<div class="checklist-category"><h3 class="checklist-category-title">${category}</h3><div class="space-y-1">`;
                    
                    // LÓGICA DE REORDENAÇÃO:
                    // Vamos ordenar os itens dessa categoria: os que não estão marcados ficam em cima.
                    const sortedItems = groupedData[category].sort((a, b) => {
                        const aMarcado = localStorage.getItem(a.id) === 'true';
                        const bMarcado = localStorage.getItem(b.id) === 'true';
                        
                        // Se o status for o mesmo (ambos marcados ou ambos desmarcados), mantém a ordem original (pelo originalIndex)
                        if (aMarcado === bMarcado) {
                            return a.originalIndex - b.originalIndex;
                        }
                        
                        // Se 'a' estiver marcado, ele vai para o final da lista (retorna 1)
                        // Se não estiver, ele sobe (retorna -1)
                        return aMarcado ? 1 : -1;
                    });

                    // Agora criamos o HTML de cada item já ordenado
                    sortedItems.forEach(item => {
                        // Verifica no navegador se ele foi salvo como concluído antes
                        const isChecked = localStorage.getItem(item.id) === 'true';
                        
                        html += `
                            <label class="check-container ${isChecked ? 'checked-text' : ''}" id="label-${item.id}">
                                ${item.text}
                                <input type="checkbox" id="${item.id}" ${isChecked ? 'checked' : ''}>
                                <span class="checkmark"></span>
                            </label>`;
                    });
                    
                    html += `</div></div>`;
                    
                    // Adiciona o bloco pronto na tela
                    DOM.checklistContainer.innerHTML += html;
                }
            };

            /**
             * Limpa o progresso do checklist e volta tudo ao normal
             */
            const resetChecklist = () => {
                if(confirm('Tem certeza que deseja limpar todo o progresso do checklist?')) {
                    // Remove apenas os itens do checklist do armazenamento do navegador
                    state.checklistData.forEach(item => localStorage.removeItem(item.id));
                    // Desenha a lista de novo na tela (agora vazia)
                    renderChecklist();
                }
            };

       

            // ==============================================================================
            // MÓDULO DE BACKUP E EXPORTAÇÃO
            // ==============================================================================

            /**
             * Coleta e formata os dados do LocalStorage para exportação.
             * Responsabilidade: Apenas preparar e empacotar os dados do usuário.
             * @returns {string} Dados formatados em string JSON.
             */
            const collectDataForExport = () => {
                const dataToExport = {};
                
                // Coleta o status de cada item do checklist
                state.checklistData.forEach(item => {
                    const val = localStorage.getItem(item.id);
                    if (val !== null) dataToExport[item.id] = val;
                });
                
                // Coleta dados das fases e do sistema de ofensivas (streaks)
                const extraKeys = ['lastStudyDate', 'currentStreak', 'bestStreak', 'phase-1-done', 'phase-2-done', 'phase-3-done', 'phase-4-done'];
                extraKeys.forEach(key => {
                    const val = localStorage.getItem(key);
                    if (val !== null) dataToExport[key] = val;
                });

                return JSON.stringify(dataToExport, null, 2);
            };

            /**
             * Salva o arquivo permitindo ao usuário escolher o diretório (File System Access API).
             * Responsabilidade: Interagir com o sistema de arquivos do sistema operacional.
             * @param {string} content - O conteúdo do arquivo JSON.
             * @param {string} fileName - O nome sugerido para o arquivo.
             */
            const saveFileWithPicker = async (content, fileName) => {
                try {
                    // Abre a janela nativa do SO para o usuário escolher onde salvar
                    const handle = await window.showSaveFilePicker({
                        suggestedName: fileName,
                        types: [{
                            description: 'Arquivo JSON de Backup',
                            accept: { 'application/json': ['.json'] },
                        }],
                    });
                    
                    // Cria um stream de escrita, salva o conteúdo e fecha o arquivo
                    const writable = await handle.createWritable();
                    await writable.write(content);
                    await writable.close();
                    
                    alert('Backup salvo com sucesso no local escolhido!');
                } catch (error) {
                    // Silencia o erro caso o usuário simplesmente clique em "Cancelar" na janela
                    if (error.name !== 'AbortError') {
                        console.error('Erro ao salvar o arquivo:', error);
                        alert('Não foi possível salvar o arquivo. Verifique as permissões do navegador.');
                    }
                }
            };

            /**
             * Fallback tradicional para navegadores que não suportam a API moderna.
             * Responsabilidade: Forçar o download caso window.showSaveFilePicker não exista.
             * @param {string} content - O conteúdo do arquivo JSON.
             * @param {string} fileName - O nome sugerido para o arquivo.
             */
            const saveFileFallback = (content, fileName) => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(content);
                const a = document.createElement('a');
                a.href = dataStr;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
            };

            /**
             * Orquestrador principal da exportação de dados.
             * Responsabilidade: Coordenar a coleta de dados e decidir qual método de salvamento utilizar.
             */
            const exportData = async () => {
                const jsonContent = collectDataForExport();
                const defaultFileName = 'dashboard2.json';

                // Verifica se o navegador possui suporte para perguntar o local de salvamento
                if (window.showSaveFilePicker) {
                    await saveFileWithPicker(jsonContent, defaultFileName);
                } else {
                    // Método clássico caso o navegador seja incompatível com a nova API
                    saveFileFallback(jsonContent, defaultFileName);
                }
            };




            /**
             * Lê o arquivo de backup e restaura o progresso
             */

            const handleImportFile = (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const importedData = JSON.parse(event.target.result);
                        const validKeys = [...state.checklistData.map(item => item.id), 'lastStudyDate', 'currentStreak', 'bestStreak', 'phase-1-done', 'phase-2-done', 'phase-3-done', 'phase-4-done'];
                        
                        // SOLUÇÃO: Varrer todas as chaves mapeadas pela aplicação
                        validKeys.forEach(key => {
                            if (importedData[key] !== undefined) {
                                // Se o dado existe no backup, restaura
                                localStorage.setItem(key, importedData[key]);
                            } else {
                                // Se não existe no backup, significa que a ação não havia sido feita na época.
                                // Limpamos do navegador para evitar acumulo de progresso irreal!
                                localStorage.removeItem(key);
                            }
                        });
                        
                        alert('Eba! Seu backup foi restaurado com sucesso!');
                        
                        // Atualiza todas as partes visuais garantindo sincronia total
                        renderChecklist();
                        initStreak();
                        initPhases();
                        initCountdown(); // Inserido para forçar o recálculo e renderização do Header
                        switchTab('check'); 
                        
                    } catch (err) {
                        alert('Ops! O arquivo parece inválido ou corrompido.');
                    }
                    DOM.fileImport.value = ''; // Limpa o campo
                };
                reader.readAsText(file);
            };


            // Funções de utilidade para lidar com as datas
            const getTodayStr = () => {
                const d = new Date();
                return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            };

            const getDaysDiff = (dateStr1, dateStr2) => {// Converte as strings de data para objetos Date e calcula a diferença em dias
                const d1 = new Date(dateStr1 + 'T00:00:00');
                const d2 = new Date(dateStr2 + 'T00:00:00');
                return Math.floor((d2 - d1) / 86400000);
            };

            /**
             * Calcula os dias restantes para a prova
             */
            const initCountdown = () => {
                // Substitua esta data pela data real da prova
                const targetDate = new Date('2026-10-25T00:00:00'); 
                const today = new Date();
                today.setHours(0,0,0,0);
                
                const diffDays = Math.ceil((targetDate - today) / 86400000);
                if(DOM.countdownDays) DOM.countdownDays.innerText = diffDays > 0 ? `${diffDays} dias` : "Chegou o dia!";
            };

//novos contadores para as provas específicas
/*const initCountdownAracas = () => {
    // Substitua esta data pela data real da prova
    const targetDate = new Date('2026-08-09T00:00:00'); 
    const today = new Date();
    today.setHours(0,0,0,0);// essa variavel é usada para calcular a diferença de dias entre a data atual e a data da prova
    const ticketPrice = 340; // Valor da passagem de ida e volta
    const diffDays = Math.ceil((targetDate - today) / 86400000); //a função Math.ceil arredonda para cima, garantindo que mesmo que falte menos de um dia, ainda seja contado como 1 dia restante
    var ticketPriceForDaysAracas = diffDays > 0 ? ticketPrice/diffDays : 0 ; // calcula quanto por dia é necessario juntar para a passagem, caso falte menos de um dia, o valor da passagem é 0
    if(DOM.countdownDaysAracas) DOM.countdownDaysAracas.innerText = diffDays > 0 ? `${diffDays} dias` : "Chegou o dia!";
    if(DOM.countdownDaysAracasValue) DOM.countdownDaysAracasValue.innerText = ticketPriceForDaysAracas > 0 ? `R$${ticketPriceForDaysAracas.toFixed(1)} por dia` : "Chegou o dia!";
    return ticketPriceForDaysAracas
    
};*/
/*const initCountdownFormosa = () => {
        // Substitua esta data pela data real da prova
        const targetDate = new Date('2026-08-16T00:00:00'); 
        const today = new Date();
        today.setHours(0,0,0,0);
        const ticketPrice = 850-69; // Valor da passagem de ida e volta
        const diffDays = Math.ceil((targetDate - today) / 86400000);
        var ticketPriceForDaysFormosa = diffDays > 0 ? ticketPrice/diffDays : 0 ; // calcula quanto por dia é necessario juntar para a passagem, caso falte menos de um dia, o valor da passagem é 0
        if(DOM.countdownDaysFormosa) DOM.countdownDaysFormosa.innerText = diffDays > 0 ? `${diffDays} dias` : "Chegou o dia!";
        if(DOM.countdownDaysFormosaValue) DOM.countdownDaysFormosaValue.innerText = ticketPriceForDaysFormosa > 0 ? `R$${ticketPriceForDaysFormosa.toFixed(1)} por dia` : "Chegou o dia!";
      return ticketPriceForDaysFormosa

    };*/

  /*  const initCountdownIBGE = () => {
        // Substitua esta data pela data real da prova
        const targetDate = new Date('2026-08-30T00:00:00'); 
        const today = new Date();
        today.setHours(0,0,0,0);
        const ticketPrice = 380; // Valor da passagem de ida e volta
        const diffDays = Math.ceil((targetDate - today) / 86400000);
        var ticketPriceForDaysIBGE = diffDays > 0 ? ticketPrice/diffDays : 0 ; // calcula quanto por dia é necessario juntar para a passagem, caso falte menos de um dia, o valor da passagem é 0
        if(DOM.countdownDaysIBGE) DOM.countdownDaysIBGE.innerText = diffDays > 0 ? `${diffDays} dias` : "Chegou o dia!";
        if(DOM.countdownDaysIBGEValue) DOM.countdownDaysIBGEValue.innerText = ticketPriceForDaysIBGE > 0 ? `R$${ticketPriceForDaysIBGE.toFixed(1)} por dia` : "Chegou o dia!";
       return ticketPriceForDaysIBGE
    };*/

   /* const initCountdownAllDays = (value1, value2, value3) => {
        value1 = parseFloat(value1) || 0;
        value2 = parseFloat(value2) || 0;
        value3 = parseFloat(value3) || 0;
        const totalPrice = value1 + value2 + value3;
        if(DOM.countdownDaysAll) DOM.countdownDaysAll.innerText = totalPrice > 0 ? `R$${totalPrice.toFixed(1)} por dia` : "Chegou o dia!";
        return totalPrice;
    };*/

//fimmmmmmmmmmmmmmmmmmmmmm



            /**
             * Verifica se o aluno perdeu a ofensiva (dias seguidos) e atualiza o visual
             */
            const initStreak = () => {
                const todayStr = getTodayStr();
                let lastStudy = localStorage.getItem('lastStudyDate');
                let currentStreak = parseInt(localStorage.getItem('currentStreak')) || 0;
                let bestStreak = parseInt(localStorage.getItem('bestStreak')) || 0;

                // Se o último dia que ele estudou faz mais de 1 dia (ontem), ele perde a sequência
                if (lastStudy && getDaysDiff(lastStudy, todayStr) > 1) {
                    currentStreak = 0;
                    localStorage.setItem('currentStreak', 0);
                }
                updateStreakUI(currentStreak, bestStreak, lastStudy === todayStr);
            };

            const updateStreakUI = (current, best, isDoneToday) => {
                if(DOM.currentStreakDisplay) DOM.currentStreakDisplay.innerText = current;
                if(DOM.bestStreakDisplay) DOM.bestStreakDisplay.innerText = best;
                
                // Atualiza o botão dependendo se já foi clicado hoje
                if(DOM.btnStudyToday) {
                    DOM.btnStudyToday.innerHTML = isDoneToday ? '<i class="fas fa-check-double"></i> Concluído!' : '<i class="fas fa-check-circle"></i> Estudei Hoje!';
                    DOM.btnStudyToday.className = isDoneToday ? 'btn-streak btn-streak-done' : 'btn-streak btn-streak-todo';
                    DOM.btnStudyToday.disabled = isDoneToday;
                }
            };

            /**
             * Botão "Estudei hoje": Conta um dia na sequência
             */
            const markStudyToday = () => {
                const todayStr = getTodayStr();
                let lastStudy = localStorage.getItem('lastStudyDate');
                let currentStreak = parseInt(localStorage.getItem('currentStreak')) || 0;
                let bestStreak = parseInt(localStorage.getItem('bestStreak')) || 0;

                if (!lastStudy) {
                    currentStreak = 1; // Primeiro dia de todos
                } else {
                    const diff = getDaysDiff(lastStudy, todayStr);
                    if (diff === 1) currentStreak += 1; // Estudou ontem, aumenta a sequência
                    else if (diff > 1) currentStreak = 1; // Furou dias, recomeça do 1
                }

                bestStreak = Math.max(bestStreak, currentStreak);
                localStorage.setItem('lastStudyDate', todayStr);
                localStorage.setItem('currentStreak', currentStreak);
                localStorage.setItem('bestStreak', bestStreak);
                updateStreakUI(currentStreak, bestStreak, true);
            };

            /**
             * Lida com o clique nos cartões de Fase (Fase 1: Base, Fase 2...)
             */
            const handlePhaseToggle = (e) => {
                const { id, checked } = e.target;
                const cardId = e.target.dataset.card;
                
                localStorage.setItem(id, checked);
                document.getElementById(cardId).classList.toggle('phase-completed', checked);
            };

            const initPhases = () => {
                DOM.phaseCheckboxes.forEach(chk => {
                    const isChecked = localStorage.getItem(chk.id) === 'true';
                    chk.checked = isChecked;
                    document.getElementById(chk.dataset.card).classList.toggle('phase-completed', isChecked);
                });
            };

            /**
             * "Ouvintes" de eventos: eles ficam esperando o usuário clicar nas coisas
             */
            const bindEvents = () => {
                // Cliques nas abas
                DOM.tabButtons.forEach(btn => btn.addEventListener('click', e => switchTab(e.currentTarget.dataset.target)));
                
                // Botões do Checklist
                DOM.btnResetChecklist.addEventListener('click', resetChecklist);
                DOM.checklistContainer.addEventListener('change', handleCheckToggle);
                
                // Fases
                DOM.phaseCheckboxes.forEach(chk => chk.addEventListener('change', handlePhaseToggle));
                
                // Backup
                if(DOM.btnExport) DOM.btnExport.addEventListener('click', exportData);
                if(DOM.btnImportTrigger) DOM.btnImportTrigger.addEventListener('click', () => DOM.fileImport.click());
                if(DOM.fileImport) DOM.fileImport.addEventListener('change', handleImportFile);
                
                // Estudei Hoje
                if(DOM.btnStudyToday) DOM.btnStudyToday.addEventListener('click', markStudyToday);
            };

            // 4. INICIALIZAÇÃO
            // Essa é a parte do código exposta para fora (public), que inicia tudo.
            return {
                init: () => {
                    // Salva a posição original de cada item do checklist para que eles saibam pra onde voltar se desmarcados
                    state.checklistData.forEach((item, index) => {
                        item.originalIndex = index;
                    });

                    // Inicia as funcionalidades
                    renderChecklist();
                    initCountdown();
//novos contadores para as provas específicas
initCountdownAracas();
initCountdownFormosa();
initCountdownIBGE();
initCountdownAllDays(initCountdownAracas(), initCountdownFormosa(), initCountdownIBGE());
//fimmmmmmmmmmmmmmmmmmmmmm


//fimmmmm


                    initStreak();
                    initPhases();
                    bindEvents(); // Liga os "botões" e escutadores
                }
            };

        })();

        

        // Quando a página terminar de carregar, inicie o Aplicativo
        document.addEventListener('DOMContentLoaded', DashboardApp.init);