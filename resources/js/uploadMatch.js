import { getFirestore, getDocs, getDoc, setDoc, collection, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { db } from '/resources/js/index.js';

export async function uploadMatch(event){
    Array.from(event.target.files).forEach(async (file) => {
        if (file) {

                let values = [];

                const qr = new Html5Qrcode('reader');
                await qr.scanFile(file, true).then((decoded_text, decoded_result) => {
                    values = decoded_text.split(',');
                    const convert_if_number = (item) => /^\d+$/.test(item) ? parseInt(item, 10) : item;
                    values = values.map(convert_if_number);
                }).catch((err) => {
                    console.log(err);
                });

                let keys = ['matchNumber', 'autol1', 'autol2', 'autol3', 'autol4', 'auto_net', 'auto_processor', 'teopl1', 'teopl2', 'teopl3', 'teopl4', 'teop_net', 'teop_processor', 'cage', 'score', 'teamName']
                let match_data = {};
                keys.forEach((key, index) => {
                    match_data[key] = values[index];
                });

                // Create team document if doesnt exist
                const teams_collection_ref = await collection(db, 'teams');
                const team_doc_ref = await doc(teams_collection_ref, match_data.teamName);
                await getDoc(team_doc_ref).then(async (docSnapshot) => {
                  if (!docSnapshot.exists()) {
                    await setDoc(team_doc_ref, {
                        'name':match_data.teamName
                    }).catch((error) => {
                        console.log('An error occured:',error);
                    });
                  }
                }).catch((error) => {
                  console.log("An error occured:", error);
                });

                const matches_collection_ref = await collection(team_doc_ref, 'matches');
                const match_doc_ref = await doc(matches_collection_ref, match_data.matchNumber.toString());
                await getDoc(match_doc_ref).then(async (docSnapshot) => {
                    if (docSnapshot.exists()) {
                        Swal.fire({
                            title: "Error!",
                            text: "Match already saved",
                            icon: "error",
                        });
                        return;
                    }else{

                        await setDoc(match_doc_ref, match_data).then(() => {
                            console.log("Match data saved");
                            Swal.fire({
                              title: "Successful!",
                              text: "Match data saved",
                              icon: "success",
                            });
                        }).catch((error) => {
                            console.error("An error occured:", error);
                            Swal.fire({
                              title: "Unsuccessful!",
                              text: "An error occured",
                              icon: "error",
                            });
                        });
                                   
                    }
                });
          } else {
            console.log("File not selected");
          }
    });
}