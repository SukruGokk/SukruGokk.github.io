import { getFirestore, getDocs, getDoc, setDoc, collection, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { db, sync } from '/resources/js/index.js';
import { checkTeamNumber } from '/resources/js/checkTeamNumber.js'

export async function uploadMatch(event){
    Array.from(event.target.files).forEach(async (file) => {
        if (file) {

                let values = [];

                const qr = new Html5Qrcode('reader');
                await qr.scanFile(file, true).then((decoded_text, decoded_result) => {
                    values = decoded_text.split(',');
                    console.log(values)
                }).catch((err) => {
                    console.log(err);
                });

                let keys = ['matchNumber', 'autol1', 'autol2', 'autol3', 'autol4', 'auto_net', 'auto_processor', 'teopl1', 'teopl2', 'teopl3', 'teopl4', 'teop_net', 'teop_processor', 'cage', 'score', 'team_number']
                let match_data = {};
                keys.forEach((key, index) => {
                    match_data[key] = values[index];
                });

                console.log(match_data)
                const team_name = await checkTeamNumber(parseInt(match_data.team_number))
                console.log(team_name)

                // Create team document if doesnt exist
                const teams_collection_ref = await collection(db, 'teams');
                const team_doc_ref = await doc(teams_collection_ref, match_data.team_number);
                await getDoc(team_doc_ref).then(async (docSnapshot) => {
                  if (!docSnapshot.exists()) {
                    await setDoc(team_doc_ref, {
                        'teamNumber':match_data.team_number,
                        'teamName':team_name
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
                            sync();
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
