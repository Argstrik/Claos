// src/calculator.js
const EXERCISE_DB = {
    "pushups": { diff: 1.0, category: "strength" },
    "pullups": { diff: 2.0, category: "strength" },
    "squats": { diff: 0.8, category: "endurance" },
    "plank": { type: "time", diff: 0.5, category: "core" },
    "muscleups": { diff: 7.2, category: "speed" },
    "handstand_pushups": { diff: 8.5, category: "strength" },
    "one_arm_pushups": { diff: 12.2, category: "strength" },
    "dragon_flags": { diff: 9.8, category: "core" },
    "explosive_squats": { diff: 6.0, category: "speed" },
    "burpees": { diff: 1.2, category: "endurance" }
};

export function calculateScores(performance) {
    const scores = { strength: 0, core: 0, speed: 0, endurance: 0 };
    
    Object.entries(performance).forEach(([exercise, value]) => {
        if (EXERCISE_DB[exercise]) {
            const { category, diff } = EXERCISE_DB[exercise];
            scores[category] += value * diff;
        }
    });
    
    // Normalize scores 0-100
    Object.keys(scores).forEach(cat => {
        scores[cat] = Math.min(100, Math.round(scores[cat]));
    });
    
    return scores;
}

export function calculateRank(scores) {
    const total = (scores.strength * 0.35) + 
                 (scores.core * 0.20) + 
                 (scores.speed * 0.25) + 
                 (scores.endurance * 0.20);
    
    const thresholds = [20, 40, 55, 70, 85, 95, 110];
    const ranks = ["F", "E", "D", "C", "B", "A", "S", "SS"];
    
    for (let i = 0; i < thresholds.length; i++) {
        if (total < thresholds[i]) return ranks[i];
    }
    return ranks[ranks.length - 1];
}

export function getDominantType(scores) {
    const max = Math.max(...Object.values(scores));
    for (const [type, score] of Object.entries(scores)) {
        if (score === max) return type;
    }
    return "balanced";
}

export function assignConstellation(rank, dominant) {
    const CONSTELLATIONS = {
        common: {
            strength: { name: "Rock Lee", quote: "Hard work beats natural talent" },
            speed: { name: "Sero Hanta", quote: "Tape me up for speed!" },
            core: { name: "Tanjiro Kamado", quote: "Total concentration breathing!" },
            endurance: { name: "Yuji Itadori", quote: "I'll keep going no matter what" },
            balanced: { name: "Mash Burnedead", quote: "Muscles solve everything" }
        },
        rare: {
            strength: { name: "Guts", quote: "Struggle on through the pain" },
            speed: { name: "Killua Zoldyck", quote: "Speed is my assassin's pride" },
            core: { name: "Roronoa Zoro", quote: "Three swords, unbreakable spirit" },
            endurance: { name: "Izuku Midoriya", quote: "Never give up, even when broken" },
            balanced: { name: "Ken Kaneki", quote: "Human and ghoul in balance" }
        },
        epic: {
            strength: { name: "Alex Louis Armstrong", quote: "Armstrong strength passed through generations!" },
            speed: { name: "Ichigo Kurosaki", quote: "Bankai! Speed beyond sight" },
            core: { name: "Monkey D. Luffy", quote: "Rubber body, iron will" },
            endurance: { name: "Eren Yeager", quote: "I'll destroy the world for freedom" },
            balanced: { name: "Mirio Togata", quote: "Permeation mastery requires balance" }
        },
        legendary: {
            strength: { name: "Son Goku", quote: "Kamehameha! Power beyond limits" },
            speed: { name: "Minato Namikaze", quote: "Flying Thunder God technique" },
            core: { name: "Vegeta", quote: "Saiyan prince's pride" },
            endurance: { name: "All Might", quote: "I am here! with endless endurance" },
            balanced: { name: "Yoruichi Shihouin", quote: "Flash goddess of balance" }
        },
        mythical: {
            strength: { name: "Saitama", quote: "One punch is all it takes" },
            speed: { name: "Kizaru", quote: "Light speed is my pace" },
            core: { name: "Kaido", quote: "Strongest creature in the world" },
            endurance: { name: "Son Goku (Ultra Instinct)", quote: "Body moves before thought" },
            balanced: { name: "Broly", quote: "Legendary Super Saiyan power" }
        }
    };
    
    const rarity = getRarity(rank);
    return CONSTELLATIONS[rarity][dominant] || CONSTELLATIONS[rarity].balanced;
}

export function assignTitle(rank, dominant) {
    const TITLES = {
        common: {
            strength: "The Unsung Extra",
            speed: "Early Bird Cameo",
            core: "Background Resilience",
            endurance: "The Persistent Minor Character",
            balanced: "The Unexpected Sidekick"
        },
        rare: {
            strength: "The Foreshadowed Blow",
            speed: "The Glancing Afterimage",
            core: "The Gritty Comeback",
            endurance: "The Arc Survivor",
            balanced: "The Rising Star of the Guild"
        },
        epic: {
            strength: "The Catalyst of Destruction",
            speed: "The Warp in Perception",
            core: "The Unbreakable Narrative Thread",
            endurance: "The Endless Escalation",
            balanced: "The Monarch's Successor"
        },
        legendary: {
            strength: "The World-Ending Page Break",
            speed: "The Plot Twist Sprint",
            core: "The Protagonist's Privilege",
            endurance: "The Endless Side Quest",
            balanced: "The Architect of Destiny"
        },
        mythical: {
            strength: "The Editor's Strike",
            speed: "The Fast-Forward Button",
            core: "The Reroll Immunity",
            endurance: "The Ever-Loading Chapter",
            balanced: "The Plot Device Incarnate"
        }
    };
    
    const rarity = getRarity(rank);
    return TITLES[rarity][dominant] || TITLES[rarity].balanced;
}

function getRarity(rank) {
    if (["F", "E"].includes(rank)) return "common";
    if (["D", "C"].includes(rank)) return "rare";
    if (["B", "A"].includes(rank)) return "epic";
    if (["S", "SS"].includes(rank)) return "legendary";
    return "mythical";
                        }
