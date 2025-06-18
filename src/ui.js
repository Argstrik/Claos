// src/ui.js
import { auth, db, currentUser } from './firebase.js';
import { calculateScores, calculateRank, getDominantType, assignConstellation, assignTitle } from './calculator.js';
import { createGuild, joinGuild, getGuildMembers } from './guild.js';

export function renderMetricsScreen(userData = null) {
    document.getElementById('login-screen').classList.add('hidden');
    const screen = document.getElementById('metrics-screen');
    screen.classList.remove('hidden');
    
    screen.innerHTML = `
    <div class="terminal">
        <pre>⚙️ Initializing Synapse Link…
⚙️ Scanning kinetic signature…
⚙️ Core parameters? Confirm below.</pre>
        
        <form id="metrics-form">
            <input type="text" name="codename" placeholder="Codename" required 
                   value="${userData?.codename || ''}">
            <input type="number" name="age" placeholder="Age" min="12" max="100" required
                   value="${userData?.personal_metrics?.age || ''}">
            <select name="gender" required>
                <option value="">Select Gender</option>
                <option value="male" ${userData?.personal_metrics?.gender === 'male' ? 'selected' : ''}>Male</option>
                <option value="female" ${userData?.personal_metrics?.gender === 'female' ? 'selected' : ''}>Female</option>
                <option value="other" ${userData?.personal_metrics?.gender === 'other' ? 'selected' : ''}>Other</option>
            </select>
            <input type="number" name="height" placeholder="Height (cm)" min="100" max="250" required
                   value="${userData?.personal_metrics?.height || ''}">
            <input type="number" name="weight" placeholder="Weight (kg)" min="30" max="200" required
                   value="${userData?.personal_metrics?.weight || ''}">
            <input type="number" name="arm_span" placeholder="Arm Span (cm)" min="100" max="250" required
                   value="${userData?.personal_metrics?.arm_span || ''}">
            <button type="submit">Confirm Biomarkers</button>
        </form>
    </div>
    `;
    
    document.getElementById('metrics-form').addEventListener('submit', (e) => {
        e.preventDefault();
        renderPerformanceScreen();
    });
}

export function renderPerformanceScreen() {
    const screen = document.getElementById('metrics-screen');
    
    screen.innerHTML = `
    <div class="terminal">
        <pre>⚙️ Biomarkers confirmed...
⚙️ Initiating performance scan...</pre>
        
        <form id="performance-form">
            <div class="exercise-input">
                <label>Push-ups</label>
                <input type="number" name="pushups" min="0" max="1000" required>
            </div>
            <div class="exercise-input">
                <label>Pull-ups</label>
                <input type="number" name="pullups" min="0" max="100" required>
            </div>
            <div class="exercise-input">
                <label>Squats</label>
                <input type="number" name="squats" min="0" max="500" required>
            </div>
            <div class="exercise-input">
                <label>Muscle-ups</label>
                <input type="number" name="muscleups" min="0" max="50">
            </div>
            <div class="exercise-input">
                <label>Plank (seconds)</label>
                <input type="number" name="plank" min="0" max="3600">
            </div>
            <button type="submit">Finalize Scan</button>
        </form>
    </div>
    `;
    
    document.getElementById('performance-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const performance = Object.fromEntries(formData.entries());
        processPerformance(performance);
    });
}

async function processPerformance(performance) {
    // Convert to numbers
    Object.keys(performance).forEach(k => performance[k] = Number(performance[k]));
    
    // Calculate scores
    const scores = calculateScores(performance);
    const rank = calculateRank(scores);
    const dominantType = getDominantType(scores);
    const constellation = assignConstellation(rank, dominantType);
    const title = assignTitle(rank, dominantType);
    
    // Save to Firestore
    if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        await setDoc(userRef, {
            performance,
            stats: scores,
            rank,
            dominantType,
            constellation,
            title,
            lastUpdated: new Date()
        }, { merge: true });
    }
    
    // Render status screen
    renderStatusScreen({
        codename: document.querySelector('[name="codename"]')?.value || "Shadow",
        performance,
        stats: scores,
        rank,
        dominantType,
        constellation,
        title
    });
}

export function renderStatusScreen(userData) {
    document.getElementById('metrics-screen').classList.add('hidden');
    const screen = document.getElementById('status-screen');
    screen.classList.remove('hidden');
    
    // Get rarity for border color
    const rarity = getRarity(userData.rank);
    const rarityColors = {
        common: '#999999',
        rare: '#2ECC71',
        epic: '#3498DB',
        legendary: '#9B59B6',
        mythical: '#F1C40F'
    };
    
    screen.innerHTML = `
    <div class="status-window" style="border-color: ${rarityColors[rarity]}">
        <div class="constellation-panel">
            <h3>${userData.constellation.name}</h3>
            <p>"${userData.constellation.quote}"</p>
            <div class="rarity-badge">${rarity.toUpperCase()}</div>
        </div>
        
        <div class="profile-panel">
            <h2>${userData.codename}</h2>
            <h3>${userData.title}</h3>
            
            <div class="stats-grid">
                <div class="stat-badge">Stage: ${userData.stats[userData.dominantType] > 40 ? 'Awakened' : 'None'}</div>
                <div class="stat-badge">Rank: ${userData.rank}</div>
                <div class="stat-badge">Pillar: ${userData.dominantType}</div>
                <div class="stat-badge">Level: ${Math.floor(userData.stats.strength/10) + 1}</div>
            </div>
            
            <div class="attributes">
                ${renderAttributeBar('Strength', userData.stats.strength)}
                ${renderAttributeBar('Core', userData.stats.core)}
                ${renderAttributeBar('Speed', userData.stats.speed)}
                ${renderAttributeBar('Endurance', userData.stats.endurance)}
            </div>
            
            <div class="guild-section">
                <h4>Guild System</h4>
                <div id="guild-controls">
                    <input type="text" id="guild-name" placeholder="Enter guild name">
                    <button id="create-guild">Create Guild</button>
                    <button id="join-guild">Join Guild</button>
                </div>
                <div id="guild-members"></div>
            </div>
            
            <button id="workout-btn">Generate Daily Workout</button>
        </div>
    </div>
    `;
    
    // Guild system event handlers
    document.getElementById('create-guild').addEventListener('click', async () => {
        const guildName = document.getElementById('guild-name').value;
        if (guildName) {
            await createGuild(guildName);
            loadGuildMembers(guildName);
        }
    });
    
    document.getElementById('join-guild').addEventListener('click', async () => {
        const guildName = document.getElementById('guild-name').value;
        if (guildName) {
            await joinGuild(guildName);
            loadGuildMembers(guildName);
        }
    });
    
    // Workout generator
    document.getElementById('workout-btn').addEventListener('click', () => {
        generateWorkout(userData.stats);
    });
}

function renderAttributeBar(name, value) {
    return `
    <div class="attribute-bar">
        <div>${name} • ${value} [${getRankFromValue(value)}]</div>
        <div class="bar-container">
            <div class="bar-fill" style="width: ${value}%"></div>
        </div>
    </div>
    `;
}

function getRankFromValue(value) {
    if (value < 20) return 'F';
    if (value < 40) return 'E';
    if (value < 55) return 'D';
    if (value < 70) return 'C';
    if (value < 85) return 'B';
    if (value < 95) return 'A';
    if (value < 110) return 'S';
    if (value < 125) return 'SS';
    return 'SSS';
}

async function loadGuildMembers(guildName) {
    const members = await getGuildMembers(guildName);
    const membersContainer = document.getElementById('guild-members');
    
    if (members.length > 0) {
        membersContainer.innerHTML = `
        <h5>${guildName} Members</h5>
        <ul>
            ${members.map(m => `<li>${m.codename} - Rank ${m.rank}</li>`).join('')}
        </ul>
        `;
    } else {
        membersContainer.innerHTML = '<p>No members found. Be the first!</p>';
    }
}

function generateWorkout(stats) {
    // Simplified workout generation
    const focus = stats.strength > stats.endurance ? 'Strength' : 'Endurance';
    const workout = {
        title: `${focus} Focus Routine`,
        exercises: [
            { name: 'Dynamic Warm-up', duration: '5 minutes' },
            { name: 'Skill Work', sets: 3, reps: 5 },
            { name: focus === 'Strength' ? 'Weighted Pull-ups' : 'High-Rep Push-ups', sets: 4, reps: focus === 'Strength' ? 5 : 15 },
            { name: 'Core Circuit', exercises: ['Plank', 'L-Sit', 'Hanging Leg Raises'], sets: 3 }
        ]
    };
    
    alert(`Generated Workout:\n${workout.title}\n\nExercises:\n${
        workout.exercises.map(ex => 
            ex.name + (ex.reps ? `: ${ex.sets}x${ex.reps}` : '') + (ex.duration ? `: ${ex.duration}` : '')
        ).join('\n')
    }`);
}

function getRarity(rank) {
    // Same as in calculator.js
      }
