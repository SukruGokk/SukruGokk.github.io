import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-analytics.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';
import { getFirestore, getDocs, getDoc, setDoc, collection, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { submit } from '/resources/js/submitForm.js';
import { addMatches } from '/resources/js/addMatches.js';
import { teamsLineGraph } from '/resources/js/teamsLineGraph.js';
import { teamsBarGraph } from '/resources/js/teamsBarGraph.js';
import { performanceGraph, coralAutoGraph, coralTeopGraph, algaeGraph, climbGraph } from '/resources/js/individuals.js';
import { deleteTeam, deleteMatch } from '/resources/js/delete.js';
import { createCustomizable } from '/resources/js/createCustomizable.js';
import { uploadMatch } from '/resources/js/uploadMatch.js';
import { checkTeamNumber } from '/resources/js/checkTeamNumber.js';
import { sortTeams } from '/resources/js/sortTeams.js';
import { newAlbum, checkAlbumNumber, loadAlbums, uploadImage } from '/resources/js/gallery.js';

const firebaseConfig = {
    apiKey: "AIzaSyBQTCaBeYWyg5ZjCu2vT8UCfyh2-53PbSY",
    authDomain: "frc-scouting-8e46a.firebaseapp.com",
    projectId: "frc-scouting-8e46a",
    storageBucket: "frc-scouting-8e46a.firebasestorage.app",
    messagingSenderId: "737349249572",
    appId: "1:737349249572:web:0f2f47d9ad7669db72c6b1",
    measurementId: "G-KKQZG0C38L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);

localStorage.setItem('numbers', "null");
localStorage.setItem('teams', "null");

let synced = true;

async function sync(){
    synced=false;
    const teams_collection_ref = await collection(db, 'teams');
    await getDocs(teams_collection_ref)
        .then(async (snapshot) => {
            let teams = {};
            for (const doc of snapshot.docs) {
                const matches_collection_ref = collection(doc.ref, 'matches');
                
                try {
                    const subSnapshot = await getDocs(matches_collection_ref);
                    if (!subSnapshot.size) continue;
                    
                    teams[parseInt(doc.id)] = {
                        'teamName': doc.get('teamName'),
                        'matches': subSnapshot.size
                    };
                } catch (error) {
                    console.error("Error fetching subcollection documents:", error);
                }
            }
            let numbers = Array.from(Object.keys(teams));
            numbers.forEach((val)=>{
                numbers[numbers.indexOf(val)] = parseInt(val);
            })
            numbers.sort(function(a, b){return a - b});
            localStorage.setItem('numbers', JSON.stringify(numbers));
            localStorage.setItem('teams', JSON.stringify(teams));
            
        }).catch((error) => {
            console.error("Error fetching documents:", error);
        });

    synced=true;
    console.log('synced');
}

sync();


function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

// Form Page
$(document)
    .on('change', '#teamNumber', async function(event){
        let teamName;
        await checkTeamNumber(event.target.value)
            .then((data) => {
                console.log(data);
                teamName = data;
            });
        if (teamName){
            $('#teamName').val(teamName);
            $('#teamName').attr('valid', 'true');
            $('#teamName').removeClass('text-danger').removeClass('border-danger');
        }else{
            $('#teamName').val('Invalid Team Number!');
            $('#teamName').attr('valid', 'false');
            $('#teamName').addClass('text-danger').addClass('border-danger');
        }
});

$(document)
    .on('change', '#albumNumber', checkAlbumNumber);

$(document)
    .on('click', '.value-button', function(event){
        this.classList.add('clicked');

        setTimeout(() => {
            this.classList.remove('clicked');
        }, 100);

        let elements = document.getElementsByClassName('number');
        let allZero = true;
        for (let i = 0; i<elements.length; i++){
            if(elements[i].getAttribute('id').includes('auto') && !(elements[i].innerHTML == '0')){
                allZero = false;
            }
        }
        if(allZero){document.getElementById('moved-group').style.display='block';}
        else{document.getElementById('moved-group').style.display='none';}
});

// Submit data
$(document).on('click', '#submit', submit);

// Teams Page
export async function teamsPage(){
    let numbers = localStorage.getItem('numbers');
    let teams = localStorage.getItem('teams');

    console.log(numbers);
    console.log(teams);

    const checkReady = setInterval(async () => {
        if (synced) {
            clearInterval(checkReady);
            numbers=await JSON.parse(localStorage.getItem('numbers'));
            teams=await JSON.parse(localStorage.getItem('teams'));

            console.log(numbers);
            console.log(teams);

            for(let i = 0; i<numbers.length; i++){
                const listElement = `
                <li class="list-unstyled d-flex">
                    <input class="form-check-input justify-content-end team-check me-2" type="checkbox" 
                           style="margin-left:10px; display:none;margin:auto" val='${numbers[i]}'>
                    
                    <div class='list-group-item d-flex justify-content-between align-items-start team-element' 
                         style="width:100%" val='${numbers[i]}'>
                        
                        <div class="d-flex flex-grow-1">
                            <div style='width:30%;'><span>${numbers[i]}</span></div>
                            <span>${teams[numbers[i]].teamName}</span>
                        </div>

                        <span class="badge bg-primary rounded-pill">${teams[numbers[i]].matches}</span>
                        
                    </div>
                </li>     
                `
                $('#teamsList').append(listElement);
                    
            }

            document.getElementById('loading').style.setProperty('display', 'none', 'important');
        }
    }, 500);
}

// Back buttons
$(document).on('click', '#graph', teamsPage);
$(document).on('click', '#matchesGraph', teamsPage);
$(document).on('click', '.team-element', function(){
    addMatches($(this).attr('val'));
});

$(document)
    .on('click', '#compareTeams', function(){
        // Show checkboxes
        let elements = document.getElementsByClassName('team-check');
        for (let i = 0; i < elements.length; i++){
            elements[i].style.display = 'block';
        }
        $('#compareTeams').html('Bar');
        $('#compareTeams').attr('id', 'createTeamsBarGraph');
        document.getElementById('createTeamsLineGraph').style.display = 'block';
});

$(document)
    .on('click', '#deleteTeamSelect', function(){
        // Show checkboxes
        let elements = document.getElementsByClassName('team-check');
        for (let i = 0; i < elements.length; i++){
            elements[i].style.display = 'block';
        }
        $('#deleteTeamSelect').removeClass('btn-outline-danger').addClass('btn-danger').addClass('text-white');
        $('#deleteTeamSelect').attr('id', 'deleteTeam');
});

$(document).on('click', '#deleteTeam', deleteTeam);
$(document).on('click', '#createTeamsLineGraph', teamsLineGraph);
$(document).on('click', '#createTeamsBarGraph', teamsBarGraph);
$(document).on('click', '.delete-match', deleteMatch);

$(document)
    .on('click', '#createGraph', async function(){
        if (document.getElementById('chartType').value == 'performance'){
            performanceGraph($(this));
        }else if(document.getElementById('chartType').value == 'coral-auto'){
            coralAutoGraph($(this));
        }else if(document.getElementById('chartType').value == 'coral-teop'){
            coralTeopGraph($(this));
        }else if(document.getElementById('chartType').value == 'algae'){
            algaeGraph($(this));
        }else if(document.getElementById('chartType').value == 'climb'){
            climbGraph($(this));
        }
});

$(document).on('click', '#createCustomizable', createCustomizable);
$(document).on('change', '#sortingStat', sortTeams);
$(document).on('change', '#uploadMatch', uploadMatch);
$(document).on('click', '#newAlbum', newAlbum);
$(document).on('click', '#gallery', loadAlbums);
$(document).on('change', '#uploadPhotoInput', uploadImage);
