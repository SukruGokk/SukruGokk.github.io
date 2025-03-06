import { getFirestore, getDocs, getDoc, setDoc, collection, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { db } from '/resources/js/index.js';

let options =     
            {
                plugins: {
                    title: {
                      display: true,
                      fontSize: 20,
                      text: 'FRC Scout Chart',
                      color: 'white'
                    },
                    legend: {
                        labels: { color: 'white'}
                    }
                },
                scales: {
                    x: { ticks: { color: "white" } },
                    y: { ticks: { color: "white" } }
                },
                maintainAspectRatio: false,
            }



export async function teamsBarGraph(event){
        let teams = []
        let elements = document.getElementsByClassName('team-check')
        for (let i = 0; i < elements.length; i++){
            if(elements[i].checked){
            
                let coral = 0;
                let algae = 0;
                let climb = 0;
                let autonomous = 0;
                let score = 0;
                let totalMatches = 0;

                const teamDocRef = await doc(db, 'teams', elements[i].getAttribute('val'));
                const matchesCollectionRef = await collection(teamDocRef, "matches");
                
                await getDocs(matchesCollectionRef)
                    .then((snapshot) => {
                        snapshot.forEach((doc) => {
                            totalMatches++;
                            let auto_coral = doc.get('autol1')*3 + doc.get('autol2')*4 + doc.get('autol3')*6 + doc.get('autol4')*7;
                            let auto_algae = doc.get('auto_net')*4 + doc.get('auto_processor')*6; 
                            let teop_coral = doc.get('teopl1')*2 + doc.get('teopl2')*3 + doc.get('teopl3')*4 + doc.get('teopl4')*5;
                            let teop_algae = doc.get('teop_net')*4 + doc.get('teop_processor')*6;
                            autonomous +=  + auto_coral + auto_algae;
                            if (autonomous == 0){
                                if (doc.get('moved')){
                                    autonomous += 3;
                                }
                            }
                            let climbPoint;
                            if (doc.get('cage') == 'shallow'){climbPoint = 6;}
                            else if (doc.get('cage') == 'deep'){climbPoint = 12;}
                            else if (doc.get('cage') == 'parked'){climbPoint = 2;}
                            else{climbPoint=0;}

                            coral += auto_coral + teop_coral;
                            algae += auto_algae + teop_algae;
                            climb += climbPoint;
                            score += doc.get('score');
                        });
                    })

                let teamData = {
                    'label': elements[i].getAttribute('val'),
                    'data': [coral/totalMatches, algae/totalMatches, autonomous/totalMatches, climb/totalMatches, score/totalMatches]
                };
            
                teams.push(teamData);
            }
        }


        let data = {
            labels: ['Coral', 'Algae', 'Auto', 'Climb', 'Score'],
            datasets: teams
        }

        let chart;

        options.plugins.title.text = 'Overall';
        
        Swal.fire({
            html: '<canvas id="chartCanvas" style="min-height:70vh"></canvas>',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Download',
            focusConfirm: false, 
            didOpen: () => {
                chart = new Chart('chartCanvas', {
                    type:'bar',
                    data: data,
                    options: options
                });
            }
        }).then((result) => {
            if(result.isConfirmed){
                let a = document.createElement('a');
                a.href = chart.toBase64Image();
                a.download = 'FrcScouterGraph-Mostra.png';
                a.click();
            }
        });        
}
