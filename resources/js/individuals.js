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
                maintainAspectRatio: false,
                scales: {
                   x: {
                        ticks:{
                            display: false,
                        }
                   },
                   y: {
                        ticks:{
                            display: false,
                        }
                   },
                },
            }

const colors = ['#2C3E50','#39FF14','#9B59B6','#E74C3C', '#F1C40F' ]

function standardDeviation(arr) {
    if (arr.length === 0) return 0;

    let mean = arr.reduce((sum, val) => sum + val, 0) / arr.length;
    let variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;

    return Math.sqrt(variance);
}

export async function performanceGraph(elem){
    let scores = [];
    let teops = [];
    let autos = [];
    let climbs = [];
    const teamDocRef = await doc(db, 'teams', elem.attr('team'));
    const matchesCollectionRef = await collection(teamDocRef, "matches");
    let matches = {};
    let matchNumbers = [];
    let climb = 0; 

    await getDocs(matchesCollectionRef)
        .then(async (snapshot) => {
            snapshot.forEach((doc) => {
                scores.push(doc.get('score'));
                let totalTeop = doc.get('teopl1')*2 + doc.get('teopl2')*3 + doc.get('teopl3')*4 + doc.get('teopl4')*5;
                let totalAuto = doc.get('autol1')*3 + doc.get('autol2')*4 + doc.get('autol3')*6 + doc.get('autol4')*7;

                if (doc.get('cage') == 'shallow'){
                    climb = 6;
                }else if(doc.get('cage') == 'deep'){
                    climb = 12;
                }else if(doc.get('cage') == 'parked'){
                    climb = 2;
                }else{
                    climb = 0;
                }

                matches[doc.get('matchNumber')] = {'teop': totalTeop, 'auto': totalAuto, 'climb':climb}

                matchNumbers.push(doc.get('matchNumber'));
            });
            matchNumbers.sort((a, b) => a - b);
            for (let i = 0; i < matchNumbers.length; i++){
                teops.push(matches[matchNumbers[i]].teop);
                autos.push(matches[matchNumbers[i]].auto);
                climbs.push(matches[matchNumbers[i]].climb);
            }
            
            let chart;

            options.plugins.title.text = `${elem.attr('team')} Performance`;
            options.scales =
                            {
                                x: { ticks: { color: "white" } }, // X ekseni yazıları beyaz
                                y: { ticks: { color: "white" } }  // Y ekseni yazıları beyaz
                            },

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
                            labels: matchNumbers,
                            datasets: [
                            { 
                              label: `Auto Score (SD:${standardDeviation(autos).toFixed(1)})` ,
                              data: autos,
                              fill: false
                            }, { 
                              label: `Te-Op Score (SD:${standardDeviation(teops).toFixed(1)})`,
                              data: teops,
                              fill: false
                            }, {
                              label: `Climb Score (SD:${standardDeviation(climbs).toFixed(1)})`,
                              data: climbs,
                              fill: false
                            }]
                        },
                        options: options
                    });
                }
            }).then((result) => {
                if(result.isConfirmed){
                    // Download
                    let a = document.createElement('a');
                    a.href = chart.toBase64Image();
                    a.download = 'FrcScouterChart-Mostra.png';
                    a.click();
                }
            });        
    });
}

export async function coralAutoGraph(elem){
    let autol1 = 0;
    let autol2 = 0;
    let autol3 = 0;
    let autol4 = 0;

    const teamDocRef = await doc(db, 'teams', elem.attr('team'));
    const matchesCollectionRef = await collection(teamDocRef, "matches");

    await getDocs(matchesCollectionRef)
        .then(async (snapshot) => {
            snapshot.forEach((doc) => {
                autol1 += doc.get('autol1');
                autol2 += doc.get('autol2');
                autol3 += doc.get('autol3');
                autol4 += doc.get('autol4');            
            });
        });

    let chart;

    options.plugins.title.text = `${elem.attr('team')} Autonomous Coral Distribution`;
    options.scales =
                {
                   x: {
                        ticks:{
                            display: false,
                        }
                   },
                   y: {
                        ticks:{
                            display: false,
                        }
                   },
                }

    Swal.fire({
                html: '<canvas id="chartCanvas" style="min-height:40vh"></canvas>',
                showCloseButton: true,
                showCancelButton: true,
                confirmButtonText: 'Download',
                focusConfirm: false, 
                didOpen: () => {
                    chart = new Chart('chartCanvas', {
                    type:'doughnut',
                    data: {
                        datasets: [{
                            data: [autol1, autol2, autol3, autol4],
                            backgroundColor: colors
                        }],

                        // These labels appear in the legend and in the tooltips when hovering different arcs
                        labels: [
                            'Level 1',
                            'Level 2',
                            'Level 3',
                            'Level 4',
                            ]
                    },
                    options: options

                });
            }
            }).then((result) => {
                if(result.isConfirmed){
                    // Download
                    let a = document.createElement('a');
                    a.href = chart.toBase64Image();
                    a.download = 'FrcScouterChart-Mostra.png';
                    a.click();
                }
            });

}


export async function coralTeopGraph(elem){
    let teopl1 = 0;
    let teopl2 = 0;
    let teopl3 = 0;
    let teopl4 = 0;

    const teamDocRef = await doc(db, 'teams', elem.attr('team'));
    const matchesCollectionRef = await collection(teamDocRef, "matches");

    await getDocs(matchesCollectionRef)
        .then(async (snapshot) => {
            snapshot.forEach((doc) => {
                teopl1 += doc.get('teopl1');
                teopl2 += doc.get('teopl2');
                teopl3 += doc.get('teopl3');
                teopl4 += doc.get('teopl4');             
            });
        });

    let chart;

    options.plugins.title.text = `${elem.attr('team')} Te-Op Coral Distribution`;
    options.scales =
                {
                   x: {
                        ticks:{
                            display: false,
                        }
                   },
                   y: {
                        ticks:{
                            display: false,
                        }
                   },
                }

    Swal.fire({
                html: '<canvas id="chartCanvas" style="min-height:40vh"></canvas>',
                showCloseButton: true,
                showCancelButton: true,
                confirmButtonText: 'Download',
                focusConfirm: false, 
                didOpen: () => {
                    chart = new Chart('chartCanvas', {
                type:'doughnut',
                data: {
                    datasets: [{
                        data: [teopl1, teopl2, teopl3, teopl4],
                        backgroundColor: colors
                    }],

                    // These labels appear in the legend and in the tooltips when hovering different arcs
                    labels: [
                        'Level 1',
                        'Level 2',
                        'Level 3',
                        'Level 4'
                        ]
                },

                options: options
                });
            }
            }).then((result) => {
                if(result.isConfirmed){
                    // Download
                    let a = document.createElement('a');
                    a.href = chart.toBase64Image();
                    a.download = 'FrcScouterChart-Mostra.png';
                    a.click();
                }
            });

}

export async function algaeGraph(elem){
    let auto_net = 0;
    let auto_processor = 0;
    let teop_net = 0;
    let teop_processor = 0;

    const teamDocRef = await doc(db, 'teams', elem.attr('team'));
    const matchesCollectionRef = await collection(teamDocRef, "matches");

    await getDocs(matchesCollectionRef)
        .then(async (snapshot) => {
            snapshot.forEach((doc) => {
                auto_net += doc.get('auto_net');
                auto_processor += doc.get('auto_processor');
                teop_net += doc.get('teop_net');
                teop_processor += doc.get('teop_processor');             
            });
        });

    let chart;

    options.plugins.title.text = `${elem.attr('team')} Algae Distribution`;
    options.scales =
                {
                   x: {
                        ticks:{
                            display: false,
                        }
                   },
                   y: {
                        ticks:{
                            display: false,
                        }
                   },
                }

    Swal.fire({
                html: '<canvas id="chartCanvas" style="min-height:40vh"></canvas>',
                showCloseButton: true,
                showCancelButton: true,
                confirmButtonText: 'Download',
                focusConfirm: false, 
                didOpen: () => {
                    chart = new Chart('chartCanvas', {
                type:'doughnut',
                data: {
                    datasets: [{
                        data: [auto_net, auto_processor, teop_net, teop_processor],
                        backgroundColor: colors
                    }],

                    // These labels appear in the legend and in the tooltips when hovering different arcs
                    labels: [
                        'Auto - Net',
                        'Auto - Processor',
                        'Te-Op - Net',
                        'Te-Op - Processor'
                        ]
                },

                options: options
                });
            }
            }).then((result) => {
                if(result.isConfirmed){
                    // Download
                    let a = document.createElement('a');
                    a.href = chart.toBase64Image();
                    a.download = 'FrcScouterChart-Mostra.png';
                    a.click();
                }
            });

}

export async function climbGraph(elem){
    let shallow = 0;
    let deep = 0;
    let parked = 0;
    let not_parked = 0;
    let failed = 0;

    const teamDocRef = await doc(db, 'teams', elem.attr('team'));
    const matchesCollectionRef = await collection(teamDocRef, "matches");

    await getDocs(matchesCollectionRef)
        .then(async (snapshot) => {
            snapshot.forEach((doc) => {
                if (doc.get('cage') == 'shallow'){
                    shallow++;
                }else if(doc.get('cage') == 'deep'){
                    deep++;
                }else if(doc.get('cage') == 'parked'){
                    parked++;
                }else if(doc.get('cage') == 'not_parked'){
                    not_parked++;
                }else if(doc.get('cage') == 'failed'){
                    failed++;
                }           
            });
        });

    let chart;

    options.plugins.title.text = `${elem.attr('team')} Climb Distribution`;
    options.scales =
                {
                   x: {
                        ticks:{
                            display: false,
                        }
                   },
                   y: {
                        ticks:{
                            display: false,
                        }
                   },
                }

    Swal.fire({
                html: '<canvas id="chartCanvas" style="min-height:40vh"></canvas>',
                showCloseButton: true,
                showCancelButton: true,
                confirmButtonText: 'Download',
                focusConfirm: false, 
                didOpen: () => {
                    chart = new Chart('chartCanvas', {
                type:'doughnut',
                data: {
                    datasets: [{
                        data: [shallow, deep, parked, not_parked, failed],
                        backgroundColor: colors
                    }],

                    // These labels appear in the legend and in the tooltips when hovering different arcs
                    labels: [
                        'Shallow Cage',
                        'Deep Cage',
                        'Parked',
                        'Not Parked',
                        'Failed Climb'
                        ]
                },

                options: options
                });
            }
            }).then((result) => {
                if(result.isConfirmed){
                    // Download
                    let a = document.createElement('a');
                    a.href = chart.toBase64Image();
                    a.download = 'FrcScouterChart-Mostra.png';
                    a.click();
                }
            });

}