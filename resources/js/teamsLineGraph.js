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

export async function teamsLineGraph(event){
        let teams = {};
        let scores = {};
        let elements = document.getElementsByClassName('team-check');
        let matchNumbers = [];
        let datasets = [];
        let chart;
        let score = 0;
        let totalMatches = 0;

        for (let i = 0; i < elements.length; i++){
            if(elements[i].checked){
            
                score = 0;
                totalMatches = 0;

                const teamDocRef = await doc(db, 'teams', elements[i].getAttribute('val'));
                const matchesCollectionRef = await collection(teamDocRef, "matches");

                await getDocs(matchesCollectionRef)
                    .then((snapshot) => {
                        snapshot.forEach((doc) => {
                            totalMatches++;
                            scores[doc.get('matchNumber')] = (doc.get('score'));
                            matchNumbers.push(doc.get('matchNumber'));
                        });
                });

                teams[elements[i].getAttribute('val')] = scores;
                scores = {};
            }
        }

        matchNumbers = [...new Set(matchNumbers)];

        for (let i=0; i < matchNumbers.length; i++){
            for (let team in teams){
                if(!teams[team][matchNumbers[i]]){
                    teams[team][matchNumbers[i]] = null;
                }
                teams[team] = Object.fromEntries(Object.entries(teams[team]).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)));
                break;
            }
        }

        for (let i=0; i<Object.keys(teams).length; i++){
            datasets.push({
                label: Object.keys(teams)[i],
                data: Object.values(teams)[i],
                fill: false,
                spanGaps: true
            });
        }

        options.plugins.title.text = 'Total Score';

        Swal.fire({
            html: '<canvas id="chartCanvas" style="min-height:40vh"></canvas>',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Download',
            focusConfirm: false, 
            didOpen: () => {
                chart = new Chart('chartCanvas', {
                    type:'line',
                    data: {
                        datasets: datasets
                    },
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
