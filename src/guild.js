// src/guild.js
import { db, currentUser } from './firebase.js';
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

export async function createGuild(guildName) {
    if (!currentUser) return;
    
    const guildData = {
        name: guildName,
        owner: currentUser.uid,
        members: [currentUser.uid],
        createdAt: new Date(),
        level: 1,
        xp: 0
    };
    
    try {
        const guildRef = doc(db, "guilds", guildName.toLowerCase());
        await setDoc(guildRef, guildData);
        return guildName;
    } catch (error) {
        console.error("Guild creation failed:", error);
        return null;
    }
}

export async function joinGuild(guildName) {
    if (!currentUser) return false;
    
    try {
        const guildRef = doc(db, "guilds", guildName.toLowerCase());
        await updateDoc(guildRef, {
            members: arrayUnion(currentUser.uid)
        });
        return true;
    } catch (error) {
        console.error("Join guild failed:", error);
        return false;
    }
}

export async function getGuildMembers(guildName) {
    try {
        const guildRef = doc(db, "guilds", guildName.toLowerCase());
        const guildSnap = await getDoc(guildRef);
        
        if (guildSnap.exists()) {
            const guildData = guildSnap.data();
            const members = [];
            
            for (const memberId of guildData.members) {
                const userRef = doc(db, "users", memberId);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    members.push(userSnap.data());
                }
            }
            
            return members;
        }
        return [];
    } catch (error) {
        console.error("Get members failed:", error);
        return [];
    }
                }
