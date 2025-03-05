import { getFirestore, getDocs, getDoc, setDoc, collection, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { db } from '/resources/js/index.js';
import { checkTeamNumber } from '/resources/js/checkTeamNumber.js';

export async function submit (event) {
    // Check input
    if (!$('#teamNumber').val() || !$('#match').val() || $('#teamName').attr('valid')=='false'){
        Swal.fire({
            title: "Invalid!",
            text: "Invalid or missing information.",
            icon: "warning",
        });
        return
    }

    let score = 0;
    score += parseInt($('#autol1').text())*3;
    score += parseInt($('#autol2').text())*4;
    score += parseInt($('#autol3').text())*6;
    score += parseInt($('#autol4').text())*7;
    score += parseInt($('#auto_net').text())*4;
    score += parseInt($('#auto_processor').text())*6;
    if (score==0){
        if ($('#moved').is(':checked')){
            score += 3;
        }
    }
    score += parseInt($('#teopl1').text())*2;
    score += parseInt($('#teopl2').text())*3;
    score += parseInt($('#teopl3').text())*4;
    score += parseInt($('#teopl4').text())*5;
    score += parseInt($('#teop_net').text())*4;
    score += parseInt($('#teop_processor').text())*6;

    if ($('#cage').text() == 'shallow'){
        score += 6;
    }else if($('#cage').text() == 'deep'){
        score += 12;
    }else if($('#cage').text() == 'parked'){
        score += 2;
    }

    let matchData = {
        matchNumber: parseInt($('#match').val()),
        autol1: parseInt($('#autol1').text()),
        autol2: parseInt($('#autol2').text()),
        autol3: parseInt($('#autol3').text()),
        autol4: parseInt($('#autol4').text()),
        auto_net: parseInt($('#auto_net').text()),
        auto_processor: parseInt($('#auto_processor').text()),
        teopl1: parseInt($('#teopl1').text()),
        teopl2: parseInt($('#teopl2').text()),
        teopl3: parseInt($('#teopl3').text()),
        teopl4: parseInt($('#teopl4').text()),
        teop_net: parseInt($('#teop_net').text()),
        teop_processor: parseInt($('#teop_processor').text()),
        cage: $('#cage').val(),
        score: score
    }
 
    if (window.navigator.onLine){
        // Create team document if doesnt exist
        const teamsCollectionRef = await collection(db, 'teams');
        const teamDocRef = await doc(teamsCollectionRef, $('#teamNumber').val());
        await getDoc(teamDocRef).then(async (docSnapshot) => {
          if (!docSnapshot.exists()) {
            await setDoc(teamDocRef, {
                'teamNumber':$('#teamNumber').val(),
                'teamName':$('#teamName').val()
            }).catch((error) => {
                console.log('An error occured:',error);
            });
          }
        }).catch((error) => {
          console.log("An error occured:", error);
        });

        // Save match
        const matchesCollectionRef = await collection(teamDocRef, 'matches');
        const matchDocRef = await doc(matchesCollectionRef, $('#match').val());
        await getDoc(matchDocRef).then(async (docSnapshot) => {
            if (docSnapshot.exists()) {
                Swal.fire({
                    title: "Error!",
                    text: "Match already saved",
                    icon: "error",
                });
                return;
            }else{


                if ($('#moved').is(':checked')){
                    matchData.moved = true
                }

                await setDoc(matchDocRef, matchData).then(() => {
                    console.log("Match data saved");
                    $('#teamName').val('');
                    $('#teamName').attr('valid', 'false');
                    $('#teamNumber').val('');
                    $('#match').val('');
                    $('#moved').attr('checked', false);
                    $('#autol1').html('0');
                    $('#autol2').html('0');
                    $('#autol3').html('0');
                    $('#autol4').html('0');
                    $('#auto_net').html('0');
                    $('#auto_processor').html('0');
                    $('#teopl1').html('0');
                    $('#teopl2').html('0');
                    $('#teopl3').html('0');
                    $('#teopl4').html('0');
                    $('#teop_net').html('0');
                    $('#teop_processor').html('0');
                    $('#cage').val('shallow').change();

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
    }else{
        Swal.fire({
            html: '<div id="qrcode" class="align-items-center d-flex justify-content-center" style="min-height:40vh"></div><span>Take a screenshot !<span>',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Back',
            focusConfirm: false, 
            didOpen: () => {
                // QR kodunu oluştur ve "qrcode" div'ine yerleştir
                let temp = matchData
                temp.teamNumber = $('#teamNumber').val();
                let qrCode = new QRCode('qrcode', Object.values(temp).join(','));
            }
        });
    }

}
