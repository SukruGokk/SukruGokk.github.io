import { getFirestore, getDocs, getDoc, setDoc, collection, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { db, teamsPage } from '/resources/js/index.js';

export async function checkTeamNumber(teamNumber){
    let team_name = false;

    const response = await fetch('/resources/teams.json');
    const json = await response.json();
    let teams = json.teams;
    console.log(teams);
    
    for (const team of teams) {
        if (team.team_number == teamNumber) {
            team_name = team.nickname;
            break;
        }
    }
    return team_name;
}

