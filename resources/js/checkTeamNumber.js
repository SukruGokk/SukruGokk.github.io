import { getFirestore, getDocs, getDoc, setDoc, collection, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { db, teamsPage } from '/resources/js/index.js';

export async function checkTeamNumber(teamNumber){
    let urls = ['https://bluealliance-proxy.onrender.com/proxy/event/2025tuis/teams/simple', 'https://bluealliance-proxy.onrender.com/proxy/event/2025tuhc/teams/simple']
    let team_name = false;

    for (const url of urls) {
        const response = await fetch(url, {
            headers: { 'X-TBA-Auth-Key': 'ruNe33FUWNuhNaxvC9yvh11uOepI4Q6RUwpHkuUWPRrWLWwWRHULmwtTyC7jpgAt' }
        });
        const json = await response.json();
        let teams = Object.values(json);
        
        for (const team of teams) {
            if (team.team_number == teamNumber) {
                team_name = team.nickname;
                break;
            }
        }

        if (team_name) break;
    }
    return team_name;
}

