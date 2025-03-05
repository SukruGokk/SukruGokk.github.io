import { getFirestore, getDocs, getDoc, setDoc, addDoc, collection, doc, deleteDoc, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { db } from '/resources/js/index.js';
import { checkTeamNumber } from '/resources/js/checkTeamNumber.js';

export async function checkAlbumNumber(){
    const state = await checkTeamNumber($('#albumNumber').val());
    if (!state){
        $('#newAlbum').addClass('btn-outline-danger');
        $('#newAlbum').text('Invalid Number');
    }else{
        $('#newAlbum').removeClass('btn-outline-danger');
        $('#newAlbum').text('New Album');
    }

    if ($('#albumNumber').val() == ''){
        $('#newAlbum').removeClass('btn-outline-danger');
        $('#newAlbum').text('New Album');
    }
}

export async function loadAlbums(){
    const albums_collection_ref = await collection(db, "albums");
    await getDocs(albums_collection_ref)
        .then((snapshot) => {
            snapshot.forEach(async (doc) => {
                const imagesRef = collection(db, "albums", doc.id, "images");
                let base64 = '';
                await getDocs(imagesRef)
                    .then((docSnapshot) => {
                        docSnapshot.forEach(async (imgDoc) => {
                            base64 = "data:image/png;base64, " + imgDoc.data().base64;
                            return;
                        })
                    });

                if(base64==''){
                    base64='resources/images/nothing.png'
                }

                $('#card-container').append(`
                    <div class="col-12 mb-3">
                      <div class="card mx-auto teamCard" style="width: 90%;">
                        <img src="${base64}"card-img-top" alt="Image"/>
                        <div class="card-body">
                          <h5 class="card-title">#${doc.id}</h5>
                        </div>
                      </div>
                    </div>
                `);

                $('#photoTeamSelection').append(`
                    <option id="${doc.id}">${doc.id}</option>
                `);
            });
        });
}

export async function newAlbum(){
    const team = $('#albumNumber').val();
    const albums_collection_ref = await collection(db, 'albums');
    const album_doc_ref = await doc(albums_collection_ref, team);
    
    await getDoc(album_doc_ref).then(async (docSnapshot) => {
        if (docSnapshot.exists()) {
            Swal.fire({
                title: "Error!",
                text: "Album already exists",
                icon: "error",
            });
            return;
        }else{
            await setDoc(album_doc_ref, {'number':parseInt(team)}).then(() => {
                Swal.fire({
                  title: "Successful!",
                  text: "Album created",
                  icon: "success",
                });
                $('#albumNumber').val('');
                $('#card-container').append(`
                    <div class="col-12 mb-3">
                      <div class="card mx-auto" style="width: 90%;">
                        <img src="resources/images/nothing.png" card-img-top" alt="Image"/>
                        <div class="card-body">
                          <h5 class="card-title">#${team}</h5>
                        </div>
                      </div>
                    </div>
                `);

                $('#photoTeamSelection').append(`
                    <option id="${doc.id}">${doc.id}</option>
                `)

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
}

export async function uploadImage(event){
    const team = $('#photoTeamSelection').val();
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            let base64String = e.target.result;
            base64String = base64String.split(",")[1]
            console.log(base64String);
            const byteSize = (base64String.length * (3 / 4)) - ((base64String.endsWith("==")) ? 2 : (base64String.endsWith("=") ? 1 : 0)); 

            if (byteSize > 1048576) {
                Swal.fire({
                  title: "Unsuccessful!",
                  text: "Image is too big",
                  icon: "error",
                });
                return;
            }
            const imagesRef = collection(db, "albums", team, "images");
            await addDoc(imagesRef, { base64: base64String });
            Swal.fire({
                  title: "Successful",
                  text: "Image uploaded",
                  icon: "success",
                });
        };
        reader.readAsDataURL(file); // Base64 formatına çevir
    }
}
