document.addEventListener('DOMContentLoaded', () => {
    // Game State Variables
    let gameState = 'menu';
    let selectedScenarioId = null;
    let isRunning = false;
    let currentTime = 0;
    let gameSpeed = 1;
    let soundEnabled = true;
    let playerLevel = 1;
    let playerXP = 70;
    let scenariosCompleted = 2;
    let achievements = ['Master Pharmacologist', 'First Success'];
    let completedScenarioTracker = {};
    let selectedDrug = null;
    let currentDose = 40;
    let budget = 600;
    let score = 0;
    let therapeuticTime = 0;
    let drugConcentration = 0;
    let injectionHistory = [];
    let patientStatus = 'subtherapeutic';
    let patientMood = '😣';
    let vitalSigns = { hr: 88, bp: '135/85' };
    let showAchievementMessage = null;
    let gameLoopRef = null;

    // Canvas and DOM elements
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const canvasContainerEl = canvas ? canvas.parentElement : null;

    const screens = {
        menu: document.getElementById('menu-screen'),
        briefing: document.getElementById('briefing-screen'),
        playing: document.getElementById('playing-screen'),
        completed: document.getElementById('completed-screen'),
    };

    // Get all DOM elements
    const playerLevelStatEl = document.getElementById('player-level-stat');
    const scenariosCompletedStatEl = document.getElementById('scenarios-completed-stat');
    const playerXpStatEl = document.getElementById('player-xp-stat');
    const soundToggleBtn = document.getElementById('sound-toggle-btn');
    const scenariosListEl = document.getElementById('scenarios-list');
    const achievementsDisplayEl = document.getElementById('achievements-display');
    const achievementsSectionEl = document.getElementById('achievements-section');
    const briefingScenarioTitleEl = document.getElementById('briefing-scenario-title');
    const briefingPatientEmojiEl = document.getElementById('briefing-patient-emoji');
    const patientInfoContentEl = document.getElementById('patient-info-content');
    const objectivesContentEl = document.getElementById('objectives-content');
    const briefingTipsSectionEl = document.getElementById('briefing-tips-section');
    const briefingTipsListEl = document.getElementById('briefing-tips-list');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const beginMissionBtn = document.getElementById('begin-mission-btn');
    const patientSidebarEl = document.getElementById('patient-sidebar');
    const drugSidebarEl = document.getElementById('drug-sidebar');
    const togglePatientSidebarBtn = document.getElementById('toggle-patient-sidebar-btn');
    const toggleDrugSidebarBtn = document.getElementById('toggle-drug-sidebar-btn');
    const selectedDrugNameDisplayEl = document.getElementById('selected-drug-name-display');
    const selectedDrugIconDisplayEl = document.getElementById('selected-drug-icon-display');
    const playingScenarioTitleEl = document.getElementById('playing-scenario-title');
    const playingScenarioObjectiveEl = document.getElementById('playing-scenario-objective');
    const playingPlayerLevelEl = document.getElementById('playing-player-level');
    const playingBudgetEl = document.getElementById('playing-budget');
    const playingTimeRemainingEl = document.getElementById('playing-time-remaining');
    const patientMoodDisplayEl = document.getElementById('patient-mood-display');
    const patientNameDisplayEl = document.getElementById('patient-name-display');
    const patientStatusMessageEl = document.getElementById('patient-status-message');
    const patientVitalsEl = document.getElementById('patient-vitals');
    const scoreDisplayEl = document.getElementById('score-display');
    const scoreProgressEl = document.getElementById('score-progress');
    const therapeuticTimeDisplayEl = document.getElementById('therapeutic-time-display');
    const therapeuticTimeProgressEl = document.getElementById('therapeutic-time-progress');
    const drugConcentrationDisplayEl = document.getElementById('drug-concentration-display');
    const patientStatusIndicatorEl = document.getElementById('patient-status-indicator');
    const patientStatusTextEl = document.getElementById('patient-status-text');
    const drugTypesListEl = document.getElementById('drug-types-list');
    const graphSubtitleEl = document.getElementById('graph-subtitle');
    const currentDoseValueEl = document.getElementById('current-dose-value');
    const doseSliderEl = document.getElementById('dose-slider');
    const presetDosesButtonsEl = document.getElementById('preset-doses-buttons');
    const injectDrugBtn = document.getElementById('inject-drug-btn');
    const nextDoseSuggestionEl = document.getElementById('next-dose-suggestion');
    const currentDrugRiskEl = document.getElementById('current-drug-risk');
    const toggleSimulationBtn = document.getElementById('toggle-simulation-btn');
    const achievementNotificationEl = document.getElementById('achievement-notification');
    const pausedNotificationEl = document.getElementById('paused-notification');
    const graphPatientMoodIndicatorEl = document.getElementById('graph-patient-mood-indicator');
    const graphScoreValueEl = document.getElementById('graph-score-value');
    const graphTargetScoreValueEl = document.getElementById('graph-target-score-value');
    const graphScoreProgressEl = document.getElementById('graph-score-progress');
    const completionEmojiEl = document.getElementById('completion-emoji');
    const completionTitleEl = document.getElementById('completion-title');
    const completionScenarioTitleEl = document.getElementById('completion-scenario-title');
    const finalScoreEl = document.getElementById('final-score');
    const targetScoreInfoEl = document.getElementById('target-score-info');
    const finalTherapeuticTimeEl = document.getElementById('final-therapeutic-time');
    const totalTimeInfoEl = document.getElementById('total-time-info');
    const finalInjectionsEl = document.getElementById('final-injections');
    const finalBudgetEl = document.getElementById('final-budget');
    const initialBudgetInfoEl = document.getElementById('initial-budget-info');
    const completionAchievementsEl = document.getElementById('completion-achievements');
    const unlockedAchievementsListEl = document.getElementById('unlocked-achievements-list');
    const retryMissionBtn = document.getElementById('retry-mission-btn');
    const backToMenuCompletedBtn = document.getElementById('back-to-menu-completed-btn');

    // SCENARIO DATA
    const scenarios = [
        {
            id: 'tutorial',
            title: 'Medical Training: First Patient',
            description: 'Learn the basics with a stable patient.',
            difficulty: 'Tutorial',
            difficultyColor: '#48bb78',
            patient: { name: 'Sam Wilson', age: 30, condition: 'Minor pain management', emoji: '😊' },
            objectives: { primary: 'Maintain therapeutic levels for 6 hours', secondary: 'Complete without going toxic' },
            timeLimit: 6,
            targetScore: 120,
            budget: 600,
            gameSpeed: 0.5,
            unlocked: true,
            tips: [
                'Start Slow: Begin with the Conventional Drug.',
                'Watch the Patient: Their face shows how they feel!',
                'Stay in the Green: Keep drug levels in the "Therapeutic Window" (20-90 mg/L).',
                'Extra Help: Extra budget & slower game speed in this tutorial.',
                'Quick Dosing: Use preset dose buttons for quick selection.',
                'Start Simulation: Click "Start Simulation" before injecting!'
            ]
        },
        {
            id: 'emergency',
            title: 'Emergency Room Crisis',
            description: 'Patient needs immediate stabilization.',
            difficulty: 'Medium',
            difficultyColor: '#ed8936',
            patient: { name: 'Alex Johnson', age: 45, condition: 'Acute pain crisis', emoji: '😰' },
            objectives: { primary: 'Stabilize patient within 2 hours', secondary: 'Maintain therapeutic levels for 8 hours' },
            timeLimit: 8,
            targetScore: 250,
            budget: 500,
            gameSpeed: 1,
            unlocked: true
        },
        {
            id: 'chronic',
            title: 'Chronic Care Management',
            description: 'Long-term patient requires sustained treatment.',
            difficulty: 'Hard',
            difficultyColor: '#f56565',
            patient: { name: 'Maria Santos', age: 68, condition: 'Chronic pain management', emoji: '😔' },
            objectives: { primary: 'Maintain stable levels for 12 hours', secondary: 'Use minimal interventions' },
            timeLimit: 12,
            targetScore: 400,
            budget: 400,
            gameSpeed: 1.5,
            unlocked: true
        }
    ];

    // DRUG DATA
    const drugTypes = {
        conventional: {
            name: 'Conventional Drug',
            description: 'Immediate release formulation with rapid absorption.',
            icon: '💉',
            cost: 15,
            risk: 'High Risk',
            color: '#f59e0b',
            releaseProfile: 'burst',
            profileCue: "Burst Release: Rapid peak, quick decline",
            unlocked: true
        },
        hydrogel: {
            name: 'Hydrogel Encapsulated',
            description: 'Controlled release system for sustained drug delivery.',
            icon: '🔗',
            cost: 30,
            risk: 'Medium Risk',
            color: '#8b5cf6',
            releaseProfile: 'sustained',
            profileCue: "Sustained Release: Extended therapeutic levels",
            unlocked: true
        },
        nanodrug: {
            name: 'Nanodrug Delivery',
            description: 'Zero-order release nanotechnology system.',
            icon: '⚛️',
            cost: 50,
            risk: 'Low Risk',
            color: '#10b981',
            releaseProfile: 'zero-order',
            unlocked: false,
            profileCue: "Zero-Order Release: Constant rate independent of concentration"
        }
    };

    // Update unlockables
    const updateUnlockables = () => {
        const actualScenariosCompletedCount = Object.keys(completedScenarioTracker).length;
        scenarios.forEach(s => {
            s.unlocked = true;
        });
        drugTypes.nanodrug.unlocked = actualScenariosCompletedCount >= 1;
    };

    // PK Models - Pharmacokinetic calculations
    const calculateDrugConcentration = (time, activeInjections) => {
        let concentration = 0;
        activeInjections.forEach(injection => {
            const injectionDrugTypeInfo = drugTypes[injection.drug];
            if (!injectionDrugTypeInfo) return;
            const timeSinceInjection = time - injection.time;
            if (timeSinceInjection >= 0) {
                const dose = injection.dose;
                let drugLevel = 0;
                
                switch (injectionDrugTypeInfo.releaseProfile) {
                    case 'burst':
                        const PT_CONV = 0.75;
                        const CMAX_F_CONV = 1.8;
                        const DECAY_CONV = 2.5;
                        if (timeSinceInjection <= PT_CONV)
                            drugLevel = (dose * CMAX_F_CONV) * (timeSinceInjection / PT_CONV);
                        else
                            drugLevel = (dose * CMAX_F_CONV) * Math.exp(-DECAY_CONV * (timeSinceInjection - PT_CONV));
                        break;
                    case 'sustained':
                        const CMAX_F_HYDRO = 1.0;
                        const ABS_R_HYDRO = 0.6;
                        const ELIM_R_HYDRO = 0.20;
                        drugLevel = (dose * CMAX_F_HYDRO) * (1 - Math.exp(-ABS_R_HYDRO * timeSinceInjection)) * Math.exp(-ELIM_R_HYDRO * timeSinceInjection);
                        break;
                    case 'zero-order':
                        const EFF_DOSE_NANO = dose * 0.95;
                        const REL_DUR_NANO = 7;
                        const PLAT_TARGET_NANO = (EFF_DOSE_NANO / REL_DUR_NANO) * 4.5;
                        const DECAY_R_NANO = 0.12;
                        if (timeSinceInjection <= REL_DUR_NANO)
                            drugLevel = PLAT_TARGET_NANO * Math.min(1, timeSinceInjection / (REL_DUR_NANO * 0.33));
                        else
                            drugLevel = PLAT_TARGET_NANO * Math.exp(-DECAY_R_NANO * (timeSinceInjection - REL_DUR_NANO));
                        break;
                }
                concentration += Math.max(0, drugLevel);
            }
        });
        return concentration;
    };

    const calculatePatientStatus = (conc) => {
        if (conc >= 90) return 'toxic';
        if (conc >= 20 && conc < 90) return 'therapeutic';
        return 'subtherapeutic';
    };

    const getPatientMood = (status, time) => {
        const moods = {
            toxic: ['🤢', '😵', '🤒', '🤮'],
            therapeutic: ['😌', '😊', '🙂', '👍'],
            subtherapeutic: ['😣', '😰', '😔', '😫']
        };
        return moods[status][Math.floor(time / 2) % moods[status].length];
    };

    // Game Logic Update
    const updateGameLogic = () => {
        const conc = calculateDrugConcentration(currentTime, injectionHistory);
        drugConcentration = conc;
        const status = calculatePatientStatus(conc);
        patientStatus = status;
        patientMood = getPatientMood(status, currentTime);

        if (isRunning) {
            if (status === 'therapeutic') {
                therapeuticTime += (0.1 * gameSpeed);
                score += 3.0 * gameSpeed;
            } else if (status === 'toxic') {
                score = Math.max(0, score - (1.5 * gameSpeed));
            } else {
                if (conc < 10) {
                    score = Math.max(0, score - (0.3 * gameSpeed));
                }
            }
        }

        vitalSigns = {
            hr: Math.round(status === 'toxic' ? 100 + Math.random() * 30 :
                          status === 'therapeutic' ? 70 + Math.random() * 15 :
                          80 + Math.random() * 20),
            bp: status === 'toxic' ? `${140 + Math.floor(Math.random()*20)}/${90 + Math.floor(Math.random()*10)}` :
                status === 'therapeutic' ? `${115 + Math.floor(Math.random()*10)}/${75 + Math.floor(Math.random()*10)}` :
                `${130 + Math.floor(Math.random()*15)}/${80 + Math.floor(Math.random()*10)}`
        };

        if (gameState === 'playing') {
            updatePlayingUI();
            if (ctx) drawGraph();
        }
    };

    // Toggle Simulation - ONLY STARTS WITH DRUG SELECTED
    const toggleSimulation = () => {
        if (!selectedDrug && !isRunning) {
            alert("⚠️ Please select a drug from the Arsenal before starting the simulation!");
            return;
        }

        isRunning = !isRunning;
        if (isRunning) {
            if (!gameLoopRef) gameLoopRef = setInterval(gameLoop, 100);
            if (pausedNotificationEl) pausedNotificationEl.style.display = 'none';
            
            // Hide the overlay start button when simulation starts
            const overlayStartBtn = document.getElementById('graph-overlay-start-btn');
            if (overlayStartBtn) overlayStartBtn.style.display = 'none';
            
            toggleSimulationBtn.textContent = '⏸️ Pause Simulation';
            toggleSimulationBtn.classList.remove('start');
            toggleSimulationBtn.classList.add('pause');
        } else {
            clearInterval(gameLoopRef);
            gameLoopRef = null;
            if (pausedNotificationEl) pausedNotificationEl.style.display = 'block';
            toggleSimulationBtn.textContent = '▶️ Start Simulation';
            toggleSimulationBtn.classList.remove('pause');
            toggleSimulationBtn.classList.add('start');
        }
        updatePlayingUI();
    };

    // Update Menu UI
    const updateMenuUI = () => {
        updateUnlockables();
        if (playerLevelStatEl) playerLevelStatEl.innerHTML = `👨‍⚕️ Level ${playerLevel} Pharmacologist`;
        if (scenariosCompletedStatEl) scenariosCompletedStatEl.innerHTML = `🏆 ${Object.keys(completedScenarioTracker).length} Unique Scenarios Completed`;
        if (playerXpStatEl) playerXpStatEl.innerHTML = `<span>${playerXP}/150 XP to Level Up</span>`;
        if (soundToggleBtn) soundToggleBtn.textContent = `🔊 Sound ${soundEnabled ? 'On' : 'Off'}`;
        
        if (scenariosListEl) {
            scenariosListEl.innerHTML = '';
            scenarios.forEach(scenario => {
                const card = document.createElement('div');
                card.className = `scenario-card card ${scenario.unlocked !== false ? '' : 'locked'}`;
                card.innerHTML = `
                    <div class="scenario-card-header">
                        <h3>${scenario.title}</h3>
                        <span class="scenario-difficulty difficulty-${scenario.difficulty}" style="background-color: ${scenario.difficultyColor}">${scenario.difficulty}</span>
                    </div>
                    <p>${scenario.description}</p>
                    <div class="scenario-patient-info">
                        <span class="emoji">${scenario.patient.emoji}</span>
                        <div class="details">
                            <div>${scenario.patient.name}, ${scenario.patient.age}y</div>
                            <div>${scenario.patient.condition}</div>
                        </div>
                    </div>
                    ${scenario.id === 'tutorial' ? `<div class="scenario-recommendation">⭐ Recommended for new players!</div>` : ''}
                    <div class="scenario-meta">
                        <span>⏱️ ${scenario.timeLimit}h limit</span>
                        <span>🎯 ${scenario.targetScore} points</span>
                        <span>🚀 Speed: ${scenario.gameSpeed}x</span>
                    </div>
                    ${scenario.unlocked === false ? `<div class="scenario-locked-message">🔒 Complete previous scenarios to unlock</div>` : ''}
                `;
                if (scenario.unlocked !== false) {
                    card.addEventListener('click', () => startScenario(scenario.id));
                }
                scenariosListEl.appendChild(card);
            });
        }

        if (achievementsDisplayEl && achievementsSectionEl) {
            achievementsDisplayEl.innerHTML = '';
            if (achievements.length > 0) {
                achievementsSectionEl.style.display = 'block';
                achievements.slice(-3).reverse().forEach(ach => {
                    const span = document.createElement('span');
                    span.className = 'achievement-item';
                    span.textContent = ach;
                    achievementsDisplayEl.appendChild(span);
                });
            } else {
                achievementsSectionEl.style.display = 'none';
            }
        }
    };

    // Update mobile UI elements
    const updateMobileUI = () => {
        const scenario = scenarios.find(s => s.id === selectedScenarioId);
        if (!scenario) return;
        
        // Update mobile patient panel
        const mobileElements = {
            mood: document.getElementById('mobile-patient-mood'),
            name: document.getElementById('mobile-patient-name'),
            status: document.getElementById('mobile-patient-status'),
            score: document.getElementById('mobile-score'),
            budget: document.getElementById('mobile-budget'),
            time: document.getElementById('mobile-time'),
            conc: document.getElementById('mobile-conc'),
            panel: document.getElementById('mobile-patient-panel')
        };
        
        // Update values
        const values = {
            mood: patientMood,
            name: scenario.patient.name,
            status: patientStatus === 'toxic' ? 'Critical!' : patientStatus === 'therapeutic' ? 'Stable' : 'In Pain',
            score: Math.round(score),
            budget: `$${budget}`,
            time: `${(scenario.timeLimit - currentTime).toFixed(1)}h`,
            conc: drugConcentration.toFixed(1)
        };
        
        // Update mobile elements
        Object.keys(mobileElements).forEach(key => {
            if (mobileElements[key] && values[key]) {
                mobileElements[key].textContent = values[key];
            }
        });
        
        // Show/hide mobile panel
        if (mobileElements.panel && window.innerWidth <= 767 && gameState === 'playing') {
            mobileElements.panel.classList.add('visible');
        } else if (mobileElements.panel) {
            mobileElements.panel.classList.remove('visible');
        }
    };

    // New function to update desktop patient info
    const updateDesktopPatientInfo = () => {
        const scenario = scenarios.find(s => s.id === selectedScenarioId);
        if (!scenario || window.innerWidth < 768) return;
        
        // Update desktop patient panel
        const desktopElements = {
            mood: document.getElementById('desktop-patient-mood'),
            name: document.getElementById('desktop-patient-name'),
            status: document.getElementById('desktop-patient-status'),
            vitals: document.getElementById('desktop-patient-vitals'),
            score: document.getElementById('desktop-score'),
            budget: document.getElementById('desktop-budget'),
            time: document.getElementById('desktop-time'),
            conc: document.getElementById('desktop-conc')
        };
        
        // Update values
        const values = {
            mood: patientMood,
            name: scenario.patient.name,
            status: patientStatus === 'toxic' ? 'Critical!' : patientStatus === 'therapeutic' ? 'Stable' : 'In Pain',
            vitals: `HR: ${vitalSigns.hr} bpm | BP: ${vitalSigns.bp}`,
            score: Math.round(score),
            budget: `$${budget}`,
            time: `${(scenario.timeLimit - currentTime).toFixed(1)}h`,
            conc: drugConcentration.toFixed(1)
        };
        
        // Update desktop elements
        Object.keys(desktopElements).forEach(key => {
            if (desktopElements[key] && values[key]) {
                desktopElements[key].textContent = values[key];
            }
        });
    };

    // Game Functions
    const gameLoop = () => {
        currentTime += (0.1 * gameSpeed);
        const scenario = scenarios.find(s => s.id === selectedScenarioId);
        if (currentTime >= scenario.timeLimit) {
            currentTime = scenario.timeLimit;
            isRunning = false;
            clearInterval(gameLoopRef);
            gameLoopRef = null;
            setGameState('completed');
            return;
        }
        updateGameLogic();
    };

    const injectDrug = () => {
        const drugToInject = drugTypes[selectedDrug];
        if (!isRunning || !selectedDrug || !drugToInject || budget < drugToInject.cost || !drugToInject.unlocked) {
            return;
        }

        const newInjection = {
            time: currentTime,
            dose: currentDose,
            drug: selectedDrug,
            cost: drugToInject.cost
        };

        injectionHistory.push(newInjection);
        budget -= drugToInject.cost;

        if (injectionHistory.length === 1 && !achievements.includes('First Injection!')) {
            triggerAchievement('First Injection!');
        }

        updateGameLogic();
    };

    const startScenario = (scenarioId) => {
        const scenario = scenarios.find(s => s.id === scenarioId);
        if (!scenario || scenario.unlocked === false) return;

        selectedScenarioId = scenarioId;
        budget = scenario.budget;
        gameSpeed = scenario.gameSpeed || 1;
        currentTime = 0;
        score = 0;
        therapeuticTime = 0;
        drugConcentration = 0;
        injectionHistory = [];
        patientStatus = 'subtherapeutic';
        selectedDrug = null;
        currentDose = 40;
        patientMood = getPatientMood('subtherapeutic', 0);
        isRunning = false;
        
        setGameState('briefing');
    };

    const triggerAchievement = (message) => {
        if (achievements.includes(message)) return;
        achievements.push(message);
        showAchievementMessage = message;
        if (achievementNotificationEl) {
            achievementNotificationEl.textContent = `🏆 ${message}`;
            achievementNotificationEl.style.display = 'block';
            achievementNotificationEl.className = 'achievement-toast';
            void achievementNotificationEl.offsetWidth;
            setTimeout(() => {
                achievementNotificationEl.style.display = 'none';
                showAchievementMessage = null;
            }, 3000);
        }
    };

    // FIXED: Update Playing UI - Proper button management and drug selection
    const updatePlayingUI = () => {
        const scenario = scenarios.find(s => s.id === selectedScenarioId);
        if (!scenario) return;

        updateUnlockables();

        // Patient Info & Stats
        if (patientMoodDisplayEl) patientMoodDisplayEl.textContent = patientMood;
        if (patientNameDisplayEl) patientNameDisplayEl.textContent = scenario.patient.name;
        if (patientStatusMessageEl) {
            patientStatusMessageEl.textContent = patientStatus === 'toxic' ? 'Critical - Toxic Reaction!' :
                patientStatus === 'therapeutic' ? 'Stable - Feeling Better' : 'In Pain - Needs Medication';
            patientStatusMessageEl.className = `patient-status-${patientStatus}`;
        }
        if (patientVitalsEl) patientVitalsEl.innerHTML = `HR: ${vitalSigns.hr} bpm <br> BP: ${vitalSigns.bp}`;
        if (scoreDisplayEl) scoreDisplayEl.textContent = Math.round(score);
        if (scoreProgressEl) scoreProgressEl.style.width = `${Math.min(100, (score / scenario.targetScore) * 100)}%`;
        if (therapeuticTimeDisplayEl) therapeuticTimeDisplayEl.textContent = `${therapeuticTime.toFixed(1)}h`;
        if (therapeuticTimeProgressEl) therapeuticTimeProgressEl.style.width = `${Math.min(100, (therapeuticTime / scenario.timeLimit) * 100)}%`;
        if (drugConcentrationDisplayEl) drugConcentrationDisplayEl.textContent = drugConcentration.toFixed(1);
        if (patientStatusTextEl) patientStatusTextEl.textContent = patientStatus.charAt(0).toUpperCase() + patientStatus.slice(1);
        if (patientStatusIndicatorEl) patientStatusIndicatorEl.className = `stat-item card patient-status-indicator-${patientStatus}`;

        // Drug Arsenal
        if (drugTypesListEl) {
            drugTypesListEl.innerHTML = '';
            Object.entries(drugTypes).forEach(([key, drug]) => {
                const isLocked = !drug.unlocked;
                const drugDiv = document.createElement('div');
                drugDiv.dataset.drugKey = key;
                drugDiv.className = `drug-item ${selectedDrug === key ? 'selected' : ''} ${isLocked ? 'locked' : ''}`;
                drugDiv.innerHTML = `
                    <div class="drug-item-header">
                        <div class="drug-main-info">
                            <span class="drug-icon">${drug.icon}</span>
                            <div class="drug-info">
                                <div>${drug.name}</div>
                                <div>${drug.description}</div>
                                ${drug.profileCue ? `<div class="drug-profile-cue"><em>${drug.profileCue}</em></div>` : ''}
                            </div>
                        </div>
                        <div class="drug-details">
                            <div class="drug-risk risk-${drug.risk.replace(/\s+/g, '')}">${drug.risk}</div>
                            <div class="drug-cost">$${drug.cost}</div>
                        </div>
                    </div>
                    ${isLocked ? `<div class="drug-locked-message">🔒 Complete 1 scenario to unlock</div>` : ''}
                `;
                if (!isLocked) {
                    drugDiv.addEventListener('click', handleDrugSelection);
                } else {
                    drugDiv.style.cursor = 'not-allowed';
                }
                drugTypesListEl.appendChild(drugDiv);
            });
        }

        // Main Game Content Header
        if (playingScenarioTitleEl) playingScenarioTitleEl.textContent = scenario.title;
        if (playingScenarioObjectiveEl) playingScenarioObjectiveEl.textContent = scenario.objectives.primary;
        if (playingPlayerLevelEl) playingPlayerLevelEl.textContent = `Lv ${playerLevel}`;
        if (playingBudgetEl) playingBudgetEl.textContent = `💰 $${budget}`;
        if (playingTimeRemainingEl) playingTimeRemainingEl.textContent = `⏳ ${(scenario.timeLimit - currentTime).toFixed(1)}h`;

        // Graph Area
        if (graphSubtitleEl) graphSubtitleEl.textContent = `Concentration in ${scenario.patient.name}'s plasma (Time: ${currentTime.toFixed(1)}h / ${scenario.timeLimit}h)`;
        if (graphScoreValueEl) graphScoreValueEl.textContent = Math.round(score);
        if (graphTargetScoreValueEl) graphTargetScoreValueEl.textContent = scenario.targetScore;
        if (graphScoreProgressEl) graphScoreProgressEl.style.width = `${Math.min(100, (score / scenario.targetScore) * 100)}%`;

        // Graph Controls Panel
        if (currentDoseValueEl) currentDoseValueEl.textContent = currentDose;
        if (doseSliderEl) doseSliderEl.value = currentDose;
        
        const currentSelectedDrugInfo = drugTypes[selectedDrug];
        if (selectedDrug && currentSelectedDrugInfo) {
            if (selectedDrugNameDisplayEl) selectedDrugNameDisplayEl.textContent = currentSelectedDrugInfo.name;
            if (selectedDrugIconDisplayEl) selectedDrugIconDisplayEl.textContent = currentSelectedDrugInfo.icon;
            if (nextDoseSuggestionEl) nextDoseSuggestionEl.textContent = `💡 Suggestion: ${currentSelectedDrugInfo.name} around ${(currentTime + (currentSelectedDrugInfo.releaseProfile === 'burst' ? 1.5 : currentSelectedDrugInfo.releaseProfile === 'sustained' ? 3.0 : 5.0)).toFixed(1)}h`;
            if (currentDrugRiskEl) currentDrugRiskEl.textContent = `⚠️ Risk: ${currentSelectedDrugInfo.risk}`;
        } else {
            if (selectedDrugNameDisplayEl) selectedDrugNameDisplayEl.innerHTML = `<em>None - Click 💉 to select drug</em>`;
            if (selectedDrugIconDisplayEl) selectedDrugIconDisplayEl.textContent = "";
            if (nextDoseSuggestionEl) nextDoseSuggestionEl.textContent = "Select a drug to see suggestions.";
            if (currentDrugRiskEl) currentDrugRiskEl.textContent = "";
        }

        // CRITICAL FIX: Manage overlay button and inject button properly
        let overlayStartBtn = document.getElementById('graph-overlay-start-btn');
        
        // Create overlay button if it doesn't exist
        if (!overlayStartBtn) {
            overlayStartBtn = document.createElement('button');
            overlayStartBtn.id = 'graph-overlay-start-btn';
            overlayStartBtn.className = 'graph-overlay-start-btn';
            overlayStartBtn.addEventListener('click', toggleSimulation);
            
            const canvasContainer = document.querySelector('.canvas-container');
            if (canvasContainer) {
                canvasContainer.appendChild(overlayStartBtn);
            }
        }
        
        // Handle simulation state classes
        const playingScreen = document.getElementById('playing-screen');
        if (isRunning) {
            playingScreen?.classList.add('simulation-running');
        } else {
            playingScreen?.classList.remove('simulation-running');
        }
        
        // Handle button states
        if (!selectedDrug) {
            // No drug selected
            if (overlayStartBtn) {
                overlayStartBtn.style.display = 'block';
                overlayStartBtn.textContent = '💉 Select Drug First';
                overlayStartBtn.disabled = true;
            }
            if (injectDrugBtn) {
                injectDrugBtn.textContent = "💉 Select Drug First";
                injectDrugBtn.disabled = true;
            }
        } else if (!isRunning) {
            // Drug selected but simulation not started
            if (overlayStartBtn) {
                overlayStartBtn.style.display = 'block';
                overlayStartBtn.textContent = '▶️ Start Simulation';
                overlayStartBtn.disabled = false;
            }
            if (injectDrugBtn) {
                injectDrugBtn.textContent = "▶️ Start Simulation First";
                injectDrugBtn.disabled = true;
            }
        } else {
            // Simulation running - hide overlay and show inject button
            if (overlayStartBtn) {
                overlayStartBtn.style.display = 'none';
            }
            if (injectDrugBtn) {
                const drugInfo = drugTypes[selectedDrug];
                if (budget >= drugInfo.cost) {
                    injectDrugBtn.textContent = `💉 Inject ${currentDose}mg (${drugInfo.name})`;
                    injectDrugBtn.disabled = false;
                    injectDrugBtn.style.background = '#10b981';
                    injectDrugBtn.style.borderColor = '#10b981';
                    injectDrugBtn.style.color = 'white';
                } else {
                    injectDrugBtn.textContent = "💰 Insufficient Budget";
                    injectDrugBtn.disabled = true;
                }
            }
        }

        // Hide bottom simulation button on desktop
        if (window.innerWidth >= 768 && toggleSimulationBtn) {
            toggleSimulationBtn.style.display = 'none';
        }

        // Update mobile/desktop UI
        updateMobileUI();
        updateDesktopPatientInfo();
    };

    function handleDrugSelection() {
        const drugKey = this.dataset.drugKey;
        if (selectedDrug !== drugKey) {
            selectedDrug = drugKey;
            updatePlayingUI();
            toggleSidebar(drugSidebarEl, toggleDrugSidebarBtn, true);
            
            if (achievementNotificationEl) {
                achievementNotificationEl.textContent = `✅ ${drugTypes[drugKey].name} Selected!`;
                achievementNotificationEl.style.display = 'block';
                setTimeout(() => {
                    achievementNotificationEl.style.display = 'none';
                }, 2000);
            }
        }
    }

    // Enhanced sidebar management
    const toggleSidebar = (sidebarElement, buttonElement, forceClose = false) => {
        if (!sidebarElement) return;
        
        const wasVisible = !sidebarElement.classList.contains('collapsed');
        
        if (forceClose || wasVisible) {
            sidebarElement.classList.add('collapsed');
        } else {
            sidebarElement.classList.remove('collapsed');
            
            // Close other sidebar on mobile
            if (window.innerWidth <= 767) {
                if (sidebarElement === patientSidebarEl && drugSidebarEl) {
                    drugSidebarEl.classList.add('collapsed');
                } else if (sidebarElement === drugSidebarEl && patientSidebarEl) {
                    patientSidebarEl.classList.add('collapsed');
                }
            }
        }
        
        handleResize();
    };

    // Update Briefing UI
    const updateBriefingUI = () => {
        const scenario = scenarios.find(s => s.id === selectedScenarioId);
        if (!scenario) return;
        
        if (briefingScenarioTitleEl) briefingScenarioTitleEl.textContent = scenario.title;
        if (briefingPatientEmojiEl) briefingPatientEmojiEl.textContent = scenario.patient.emoji;
        
        if (patientInfoContentEl) {
            patientInfoContentEl.innerHTML = `
                <p><strong>Name:</strong> ${scenario.patient.name}</p>
                <p><strong>Age:</strong> ${scenario.patient.age} years</p>
                <p><strong>Weight:</strong> 70 kg (assumed)</p>
                <p><strong>Condition:</strong> ${scenario.patient.condition}</p>
                <div style="margin-top: var(--spacing-sm); padding: var(--spacing-xs) var(--spacing-sm); background-color: oklch(var(--color-blue)/0.1); border-radius: var(--radius-sm);">
                    <p><strong>Metabolism:</strong> Normal</p>
                    <p><strong>Drug Sensitivity:</strong> Normal</p>
                </div>
            `;
        }
        
        if (objectivesContentEl) {
            objectivesContentEl.innerHTML = `
                <p><strong>Primary:</strong> ${scenario.objectives.primary}</p>
                <p><strong>Secondary:</strong> ${scenario.objectives.secondary || 'Complete the mission successfully'}</p>
                <p><strong>Time Limit:</strong> ${scenario.timeLimit} hours</p>
                <p><strong>Target Score:</strong> ${scenario.targetScore} points</p>
                <div style="margin-top: var(--spacing-sm); padding: var(--spacing-xs) var(--spacing-sm); background-color: oklch(var(--color-green)/0.1); border-radius: var(--radius-sm);">
                    <p><strong>Starting Budget:</strong> $${scenario.budget}</p>
                    <p><strong>Game Speed:</strong> ${scenario.gameSpeed === 0.5 ? 'Slower (Tutorial)' : scenario.gameSpeed === 1 ? 'Normal' : 'Faster'}</p>
                </div>
            `;
        }

        if (scenario.tips && scenario.tips.length > 0) {
            if (briefingTipsSectionEl) briefingTipsSectionEl.style.display = 'block';
            if (briefingTipsListEl) {
                briefingTipsListEl.innerHTML = '';
                scenario.tips.forEach(tip => {
                    const li = document.createElement('li');
                    const [strongPart, restPart] = tip.split(/:(.*)/s);
                    li.innerHTML = `<strong>${strongPart}:</strong> ${restPart || ''}`;
                    briefingTipsListEl.appendChild(li);
                });
            }
        } else {
            if (briefingTipsSectionEl) briefingTipsSectionEl.style.display = 'none';
        }
    };

    const updateCompletionUI = () => {
        const scenario = scenarios.find(s => s.id === selectedScenarioId);
        if (!scenario) return;
        
        const success = score >= scenario.targetScore;

        if (success && !completedScenarioTracker[selectedScenarioId]) {
            completedScenarioTracker[selectedScenarioId] = true;
            playerXP += 50;
            if (!achievements.includes(`Scenario: ${scenario.title.substring(0,10)}.. Cleared!`)) {
                triggerAchievement(`Scenario: ${scenario.title.substring(0,10)}.. Cleared!`);
            }
            if (playerXP >= 150) {
                playerLevel += 1;
                playerXP -= 150;
                triggerAchievement(`Leveled Up to Pharmacologist Lv. ${playerLevel}!`);
            }
        }

        updateUnlockables();

        if (completionEmojiEl) completionEmojiEl.textContent = success ? '🎉' : '😔';
        if (completionTitleEl) completionTitleEl.textContent = success ? 'Mission Accomplished!' : 'Mission Failed';
        if (completionScenarioTitleEl) completionScenarioTitleEl.textContent = scenario.title;
        if (finalScoreEl) finalScoreEl.textContent = Math.round(score);
        if (targetScoreInfoEl) targetScoreInfoEl.textContent = `Target: ${scenario.targetScore}`;
        if (finalTherapeuticTimeEl) finalTherapeuticTimeEl.textContent = `${therapeuticTime.toFixed(1)}h`;
        if (totalTimeInfoEl) totalTimeInfoEl.textContent = `Out of ${scenario.timeLimit}h`;
        if (finalInjectionsEl) finalInjectionsEl.textContent = injectionHistory.length;
        if (finalBudgetEl) finalBudgetEl.textContent = `$${budget}`;
        if (initialBudgetInfoEl) initialBudgetInfoEl.textContent = `Started with $${scenario.budget}`;

        if (unlockedAchievementsListEl) {
            unlockedAchievementsListEl.innerHTML = '';
            if (success) {
                if (completionAchievementsEl) completionAchievementsEl.style.display = 'block';
                const successAchievements = ['Scenario Complete!'];
                if (score >= scenario.targetScore * 1.5 && therapeuticTime >= scenario.timeLimit * 0.9) {
                    successAchievements.push('Clinical Excellence Bonus!');
                }
                if (budget > scenario.budget * 0.8) {
                    successAchievements.push('Budget Master!');
                }
                successAchievements.forEach(achText => {
                    const span = document.createElement('span');
                    span.className = 'achievement-item';
                    span.textContent = achText;
                    unlockedAchievementsListEl.appendChild(span);
                    if (!achievements.includes(achText)) {
                        achievements.push(achText);
                    }
                });
            } else {
                if (completionAchievementsEl) completionAchievementsEl.style.display = 'none';
            }
        }
    };

    // Draw Graph
    const drawGraph = () => {
        if (!ctx) return;
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        const MAX_C = 120;
        const thTopY = h - (90/MAX_C) * h;
        const thBotY = h - (20/MAX_C) * h;

        // Draw zones
        ctx.fillStyle = 'rgba(239,68,68,0.2)';
        ctx.fillRect(0, 0, w, thTopY);
        
        const pI = 0.2 + 0.08 * Math.sin(currentTime * Math.PI * 1.5);
        ctx.fillStyle = `rgba(34,197,94,${pI})`;
        ctx.fillRect(0, thTopY, w, thBotY - thTopY);
        
        ctx.fillStyle = 'rgba(251,146,60,0.2)';
        ctx.fillRect(0, thBotY, w, h - thBotY);

        // Draw grid
        ctx.strokeStyle = 'rgba(156,163,175,0.15)';
        ctx.lineWidth = 0.5;
        for(let i = 0; i <= 10; i++) {
            const y = (i/10) * h;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        const sc = scenarios.find(s => s.id === selectedScenarioId);
        const tl = sc ? sc.timeLimit : 12;
        for(let i = 0; i <= tl; i++) {
            const x = (i/tl) * w;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }

        // Draw concentration curve
        if(injectionHistory.length > 0) {
            ctx.strokeStyle = '#7dd3fc';
            ctx.lineWidth = 3;
            ctx.beginPath();
            let fp = true;
            for(let t = 0; t <= currentTime + 0.1; t += 0.05) {
                const conc = calculateDrugConcentration(t, injectionHistory);
                const x = (t/tl) * w;
                const y = h - (Math.min(conc, MAX_C)/MAX_C) * h;
                if(fp) {
                    ctx.moveTo(x, Math.max(0, Math.min(h, y)));
                    fp = false;
                } else {
                    ctx.lineTo(x, Math.max(0, Math.min(h, y)));
                }
            }
            ctx.stroke();
        }

        // Draw injection points
        injectionHistory.forEach((inj, idx) => {
            const x = (inj.time/tl) * w;
            const cInj = calculateDrugConcentration(inj.time, injectionHistory.slice(0, idx + 1));
            const y = h - (Math.min(cInj, MAX_C)/MAX_C) * h;
            ctx.fillStyle = drugTypes[inj.drug].color;
            ctx.beginPath();
            ctx.arc(x, Math.max(0, Math.min(h, y)), 7, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.7)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });

        // Draw current time line
        const curX = (currentTime/tl) * w;
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(curX, 0);
        ctx.lineTo(curX, h);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw zone labels
        ctx.font = 'bold 12px Inter,sans-serif';
        const lP = 5;
        ctx.fillStyle = 'rgba(239,68,68,0.9)';
        ctx.textAlign = 'left';
        ctx.fillText('Toxic (90+)', lP, 15);
        
        ctx.fillStyle = 'rgba(34,197,94,0.9)';
        ctx.fillText('Therapeutic (20-89)', lP, thTopY + 15);
        
        ctx.fillStyle = 'rgba(251,146,60,0.9)';
        ctx.fillText('Subtherapeutic (<20)', lP, h - lP);

        // Draw current concentration indicator
        const curConcG = calculateDrugConcentration(currentTime, injectionHistory);
        const curYG = Math.max(0, Math.min(h, h - (Math.min(curConcG, MAX_C)/MAX_C) * h));
        ctx.fillStyle = '#7dd3fc';
        ctx.beginPath();
        ctx.arc(curX, curYG, 6, 0, 2 * Math.PI);
        ctx.fill();

        const ct = curConcG.toFixed(1);
        const tm = ctx.measureText(ct);
        const tx = curX > w - tm.width - 20 ? curX - tm.width - 10 : curX + 10;
        const ty = curYG + 5;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(tx - 3, ty - 12, tm.width + 6, 16);
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.fillText(ct, tx, ty);
    };

    // Resize handler
    let resizeTimeoutCanvas;
    const handleResize = () => {
        clearTimeout(resizeTimeoutCanvas);
        resizeTimeoutCanvas = setTimeout(() => {
            if (gameState === 'playing' && canvasContainerEl && canvasContainerEl.clientWidth > 0 && ctx) {
                let cw = canvasContainerEl.clientWidth;
                let ch = canvasContainerEl.clientHeight;
                if (cw <= 0 || ch <= 0) {
                    canvas.width = 300;
                    canvas.height = 169;
                    drawGraph();
                    return;
                }
                let nw, nh;
                const ar = 16 / 9;
                const minH = 180;
                nw = cw;
                nh = nw / ar;
                if (nh > ch) {
                    nh = ch;
                    nw = nh * ar;
                }
                nh = Math.max(minH, nh);
                nw = Math.min(cw, nh * ar);
                canvas.width = Math.round(nw);
                canvas.height = Math.round(nh);
                drawGraph();
            }
            if (gameState === 'playing') {
                updatePlayingUI();
                updateMobileUI();
            }
        }, 150);
    };

    // Set Game State
    const setGameState = (newState) => {
        const oldState = gameState;
        gameState = newState;

        if (gameLoopRef && oldState === 'playing' && newState !== 'playing') {
            clearInterval(gameLoopRef);
            gameLoopRef = null;
            isRunning = false;
        }

        renderApp();

        if (newState === 'playing') {
            if (patientSidebarEl) patientSidebarEl.classList.add('collapsed');
            if (drugSidebarEl) drugSidebarEl.classList.add('collapsed');
        }
    };

    // Render App
    const renderApp = () => {
        Object.values(screens).forEach(screen => {
            if (screen) screen.style.display = 'none';
        });
        if (screens[gameState]) {
            screens[gameState].style.display = 'flex';
        }

        if (gameState === 'menu') {
            updateMenuUI();
        } else if (gameState === 'briefing') {
            updateBriefingUI();
        } else if (gameState === 'playing') {
            updatePlayingUI();
            if (ctx) handleResize();
        } else if (gameState === 'completed') {
            updateCompletionUI();
        }
    };

    // Event Listeners
    if (soundToggleBtn) {
        soundToggleBtn.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            updateMenuUI();
        });
    }

    if (backToMenuBtn) backToMenuBtn.addEventListener('click', () => setGameState('menu'));
    if (beginMissionBtn) beginMissionBtn.addEventListener('click', () => setGameState('playing'));

    if (doseSliderEl) {
        doseSliderEl.addEventListener('input', (e) => {
            currentDose = parseInt(e.target.value);
            updatePlayingUI();
        });
    }

    // Preset dose buttons
    [25, 40, 50, 75].forEach(dose => {
        const btn = document.createElement('button');
        btn.textContent = `${dose}mg`;
        btn.className = 'preset-dose-btn';
        btn.addEventListener('click', () => {
            currentDose = dose;
            updatePlayingUI();
        });
        if (presetDosesButtonsEl) presetDosesButtonsEl.appendChild(btn);
    });

    if (injectDrugBtn) injectDrugBtn.addEventListener('click', injectDrug);
    if (toggleSimulationBtn) toggleSimulationBtn.addEventListener('click', toggleSimulation);

    if (retryMissionBtn) {
        retryMissionBtn.addEventListener('click', () => {
            if (selectedScenarioId) {
                startScenario(selectedScenarioId);
            } else {
                setGameState('menu');
            }
        });
    }

    if (backToMenuCompletedBtn) {
        backToMenuCompletedBtn.addEventListener('click', () => setGameState('menu'));
    }

    if (togglePatientSidebarBtn && patientSidebarEl) {
        togglePatientSidebarBtn.addEventListener('click', () => toggleSidebar(patientSidebarEl, togglePatientSidebarBtn));
    }
    if (toggleDrugSidebarBtn && drugSidebarEl) {
        toggleDrugSidebarBtn.addEventListener('click', () => toggleSidebar(drugSidebarEl, toggleDrugSidebarBtn));
    }

    document.querySelectorAll('.close-sidebar-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const sidebarToClose = document.getElementById(this.dataset.sidebar);
            if (sidebarToClose) {
                sidebarToClose.classList.add('collapsed');
                handleResize();
            }
        });
    });

    window.addEventListener('resize', () => {
        handleResize();
        updateMobileUI();
    });

    // Initialize
    updateUnlockables();
    setGameState('menu');
});
