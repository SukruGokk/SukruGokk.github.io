import { getFirestore, getDocs, getDoc, setDoc, collection, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { db, teamsPage } from '/resources/js/index.js';

export async function sortTeams(event){
    let stat = $('#sortingStat').val();
    if (stat=='default'){
        return;
    }
    let teams = [];
    let score;

    const teamsCollection = collection(db, "teams");
    const teamsSnapshot = await getDocs(teamsCollection);

    for await (const teamDoc of teamsSnapshot.docs) {
        console.log(teamDoc.id)
        score=0;
        const matchesCollection = collection(db, `teams/${teamDoc.id}/matches`);
        const matchesSnapshot = await getDocs(matchesCollection);

        for await (const doc of matchesSnapshot.docs) {
            if (stat == 'cage'){
                if(doc.get('cage')=='deep'){
                    score += 12;
                }else if(doc.get('cage')=='shallow'){
                    score += 6;
                }else if(doc.get('cage')=='parked'){
                    score += 2;
                }
            }else if(stat=='auto'){
                score += doc.get('autol1')*3 + doc.get('autol2')*4 + doc.get('autol3')*6 + doc.get('autol4')*7 + doc.get('auto_net')*4 + doc.get('auto_processor')*6;
                if(doc.get('moved')){
                    score += 3;
                }
            }else if(stat=='teop'){
                score += doc.get('teopl1')*2 + doc.get('teopl2')*3 + doc.get('teopl3')*4 + doc.get('teopl4')*5 + doc.get('teop_net')*4 + doc.get('teop_processor')*6;
            }else if(stat=='coral'){
                score += doc.get('autol1')*3 + doc.get('autol2')*4 + doc.get('autol3')*6 + doc.get('autol4')*7 + doc.get('teopl1')*2 + doc.get('teopl2')*3 + doc.get('teopl3')*4 + doc.get('teopl4')*5;
            }else if(stat=='algae'){
                score += doc.get('auto_net')*4 + doc.get('auto_processor')*6 + doc.get('teop_net')*4 + doc.get('teop_processor')*6;
            }
            else{
                score += parseInt(doc.get(stat));
            }
        }
        let ratio = score/matchesSnapshot.size;
        if (ratio<1){
            ratio = Math.round(ratio*10)/10;
        }else{
            ratio = Math.round(ratio);
        }
        teams.push({'score':ratio, 'teamNumber':teamDoc.id, 'teamName':teamDoc.get('teamName')});
    }
    let scores = [];
    teams.forEach((val)=>{
        scores.push(val.score);
    })
    scores.sort(function (a, b) {  return b-a;  });
    let removed = []
    $('#teams-list').empty();
        for (let i = 0; i<scores.length; i++){
            for (const team of teams){
                if (removed.includes(team)){
                    continue
                }
                if (team.score==scores[i]){
                    console.log('score ',scores[i]);
                    console.log('name ', team.teamName);
                    const item = `
                        <div class='list-group-item d-flex justify-content-between align-items-start'
                             style="width:100%">

                            <div class="d-flex flex-grow-1">
                                <div style='width:20%'><span>${team.score}</span></div>                            
                                <div style='flex-grow:1'><span>${team.teamName}</span></div>
                                <div style='float:right'><span>${team.teamNumber}</span></div>
                            </div>
                        </div>

                    `           
                    $('#teams-list').append(item);
                    removed.push(team);
                }
            }
            console.log('aaaaaa');
        }

}
