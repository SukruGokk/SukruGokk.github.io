import { getFirestore, getDocs, getDoc, setDoc, collection, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { db } from '/resources/js/index.js';

let options =     
            {
                plugins: {
                    legend: {
                        labels: { color: 'white'}
                    }
                },
                scales: {
                    x: { ticks: { color: "white" }},
                    y: { ticks: { color: "white" }}
                },
                maintainAspectRatio: false,
            }

export async function createCustomizable(event){
        let x_axis = $('#xaxis').val();
        let y_axis = $('#yaxis').val();
        let x=0;
        let y=0;
        let datasets = [];
        let match_size = 0;
        let chart;
        let single_axis = false;
        let single_axis_datasets = [];
        const teams_collection_ref = await collection(db, 'teams');
        await getDocs(teams_collection_ref)
            .then(async (snapshot) => {
                console.log(x_axis);
                for (const docSnap of snapshot.docs) {
                    const team_doc_ref = doc(db, 'teams', docSnap.id);
                    const matches_collection_ref = collection(team_doc_ref, "matches");
                    
                    const snapshot = await getDocs(matches_collection_ref);
                    match_size = snapshot.size;

                    for (const doc of snapshot.docs) {
                        if (x_axis == 'algae_net') {
                            x += doc.get('auto_net');
                            x += doc.get('teop_net');
                        } else if (x_axis == 'algae_processor') {
                            x += doc.get('auto_processor');
                            x += doc.get('teop_processor');
                        } else if (x_axis == 'cage') {
                            if (doc.get(x_axis) == 'deep') {
                                x += 12;
                            } else if (doc.get(x_axis) == 'shallow') {
                                x += 6;
                            } else if (doc.get(x_axis) == 'parked') {
                                x += 2;
                            }
                        } else if (x_axis == 'novalue') {
                            single_axis = true;
                        } else {
                            x += doc.get(x_axis);
                        }

                        if (y_axis == 'algae_net') {
                            y += doc.get('auto_net');
                            y += doc.get('teop_net');
                        } else if (y_axis == 'algae_processor') {
                            y += doc.get('auto_processor');
                            y += doc.get('teop_processor');
                        } else if (y_axis == 'cage') {
                            if (doc.get(y_axis) == 'deep') {
                                y += 12;
                            } else if (doc.get(y_axis) == 'shallow') {
                                y += 6;
                            } else if (doc.get(y_axis) == 'parked') {
                                y += 2;
                            }
                        } else {
                            y += doc.get(y_axis);
                        }
                    }

                    if (!single_axis) {
                        datasets.push({ data: [{ x: x / match_size, y: y / match_size, r: 7 }], label: docSnap.id, borderWidth: 2 });
                    } else if (single_axis) {
                        console.log(docSnap.id)
                        single_axis_datasets.push({label:docSnap.id, data:[y]});
                    }

                    x = 0;
                    y = 0;
                }
            });

            if (window.chart) {
                window.chart.destroy(); // Önceki grafiği temizle
                delete window.chart;
            }

            if(!single_axis){
                console.log('Bubble chart!!!');
                options.scales.x.title = {display: true, text: x_axis, color: 'white'};
                options.scales.y.title = {display: true, text: y_axis, color:'white'};
                window.chart = new Chart('chartCanvas', {
                    type: 'bubble',
                    data: {
                        datasets: datasets
                    },
                    options: options,
                });
                setTimeout(function() {
                  window.chart.update();
                }, 500);
            }else{
                console.log('Single axis!!!');
                delete options.scales.x.title;
                delete options.scales.y.title;
                window.chart = new Chart('chartCanvas', {
                    type: 'bar',
                    data: {
                        labels: [y_axis],
                        datasets: single_axis_datasets
                    },
                    options: options
                });
                setTimeout(function() {
                  window.chart.update();
                }, 1000);
            }
   
}
