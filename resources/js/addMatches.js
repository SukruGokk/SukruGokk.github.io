import { getFirestore, getDocs, getDoc, setDoc, collection, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { db } from '/resources/js/index.js';

export async function addMatches(team){
        loadPage('matches.html');
        const team_doc_ref = await doc(db, 'teams', team);
        const matches_collection_ref = await collection(team_doc_ref, "matches");
        await getDocs(matches_collection_ref)
            .then((snapshot) => {
                snapshot.forEach((doc) => {
                    $('#matchesList').append(`
                        <div class="list-group-item mb-3 border-top shadow-sm">
                            <div class='d-flex justify-content-between w-100'>
                                <h5 class="mb-1">Match Number: ${doc.id}</h5>
                            </div>
                            <div class='d-flex justify-content-between w-100'>
                                <p class="mb-1">Cage: ${doc.get("cage")}</p>
                            </div>
                            <div class='d-flex justify-content-between w-100'>
                                <p class='mb-1'>Score: ${doc.get('score')}</p>
                            </div>
                            <hr class="mb-3">
                            <div class='d-flex justify-content-between w-100'>
                                <h5>Autonomous</h5>
                            </div>
                            <div class='d-flex justify-content-between w-100'>
                                <p class="mb-1">L1 Scored: ${doc.get("autol1")}</p>
                            </div>
                            <div class='d-flex justify-content-between w-100'>
                                <p class="mb-1">L2 Scored: ${doc.get("autol2")}</p>
                            </div>
                            <div class='d-flex justify-content-between w-100'>
                                <p class="mb-1">L3 Scored: ${doc.get("autol3")}</p>
                            </div>
                            <div class='d-flex justify-content-between w-100'>
                                <p class="mb-1">L4 Scored: ${doc.get("autol4")}</p>
                            </div>
                            <div class='d-flex justify-content-between w-100'>
                                <p class="mb-1">Algae - Net: ${doc.get("auto_net")}</p>
                            </div>
                            <div class='d-flex justify-content-between w-100'>
                                <p class="mb-1">Algae - Processor: ${doc.get("auto_processor")}</p>
                            </div>
                            <div class='d-flex justify-content-between w-100'>
                                <p class="mb-1">Moved: ${doc.get("moved")}</p>
                            </div>
                            <hr class="mb-3">
                            <div class='d-flex justify-content-between w-100'>
                                <h5>TeleOp</h5>
                            </div>
                            <div class='d-flex justify-content-between w-100'>
                                <p class="mb-1">L1 Scored: ${doc.get("teopl1")}</p>
                            </div>
                            <div class='d-flex justify-content-between w-100'>
                                <p class="mb-1">L2 Scored: ${doc.get("teopl2")}</p>
                            </div>
                            <div class='d-flex justify-content-between w-100'>
                                <p class="mb-1">L3 Scored: ${doc.get("teopl3")}</p>
                            </div>
                            <div class='d-flex justify-content-between w-100'>
                                <p class="mb-1">L4 Scored: ${doc.get("teopl4")}</p>
                            </div>
                            <div class='d-flex justify-content-between w-100'>
                                <p class="mb-1">Algae - Net: ${doc.get("teop_net")}</p>
                            </div>
                            <div class='d-flex justify-content-between w-100'>
                                <p class="mb-1">Algae - Processor: ${doc.get("teop_processor")}</p>
                            </div>
                            <button type="button" class="btn btn-outline-danger mt-3 delete-match" match="${doc.id}" team="${team}">Delete log</button>

                        </div>`);
                    $('#createGraph').attr('team', team);
                });
                // If doesnt loaded correctly, callback onclick function again
                if($('#matchesList').children().length==0){
                    console.log('happened');
                    addMatches(team);
                }

            });
    }
