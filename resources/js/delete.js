import { getFirestore, getDocs, getDoc, setDoc, collection, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { db, teamsPage, sync } from '/resources/js/index.js';

export async function deleteMatch(){
        let team_deleted = false;
        swal.fire({
            title: "Are you sure?",
            text: "Deleting match log",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                const matchDocRef = await doc(db, "teams", $(this).attr('team'), "matches", $(this).attr('match'));
                $(this).parent().remove();
                await deleteDoc(matchDocRef)
                    .then(() => {
                        sync();
                        Swal.fire({
                            title: "Deleted!",
                            text: "Match log has been deleted.",
                            icon: "success"
                        }).then(()=>{
                            if (team_deleted){
                                loadPage('graph.html');
                                teamsPage();
                            }
                        });

                })
                .catch((error) => {
                    console.error("An error occured:", error);
                });

                if ($('button.delete-match').length === 0){
                    const team_doc_ref = doc(db, 'teams', $(this).attr('team'));
                    const matches_collection_ref = await collection(team_doc_ref, "matches");
                    await deleteDoc(team_doc_ref).catch((error) => {
                        console.error('An error occured:', error)});
                    loadPage('graph.html');
                    teamsPage();
                }
            }
        });        
}

export async function deleteTeam(){
        Swal.fire({
            title: "Are you sure?",
            text: "Deleting teams",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
            }).then(async (result) => {
                if (result.isConfirmed) {
                    document.querySelectorAll('input.team-check:checked').forEach(async input => {
                    input.parentElement.remove();

                    const team_doc_ref = await doc(db, "teams", input.getAttribute('val'));
                    const query_snapshot = await getDocs(collection(team_doc_ref, "matches"));

                    query_snapshot.forEach(async (docSnapshot) => {
                      // Iterate and delete all match documents
                      await deleteDoc(doc(team_doc_ref, "matches", docSnapshot.id));
                      console.log(`Document with ID: ${docSnapshot.id} has been deleted.`);
                    });

                    await deleteDoc(team_doc_ref)
                        .then(() => {
                            Swal.fire({
                                title: "Deleted!",
                                text: "Teams have been deleted.",
                                icon: "success"
                            });
                        });
                    });
                    sync();
                    loadPage("graph.html")
                    teamsPage();

                }
            })
            .catch((error) => {
                console.error("An error occured:", error);
            });

}
