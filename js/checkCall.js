// This javascript function tests the callsign being used to start a new net as to being in a list of callsigns that did not close a previous net.
function checkCall() {
    const cs = $("#callsign").val().trim().toUpperCase();
    const listOfCalls = new Set( ['ah6ez' ]);
    const isCallInSet = listOfCalls.has($("#callsign").val());
    
    console.log('@755 in index.php cs: '+cs+'  listOfCalls: '+listOfCalls+'  isCallInSet:  '+isCallInSet);
    
    // If the callsign starting this net is in the above list then ask for his email to send him a message
    if (!isCallInSet == '') {
        var mail = prompt('Please enter your email address.');
            if (mail == '' || mail == null) {
                alert("Please be sure to close your net when finished. Thank you!");
            } else {

                var str = cs+":"+mail;  //alert(str);
                console.log('@737 str= '+str);
            
                $.ajax({
                    type: 'GET',
                    url: 'addEmailToStations.php',
                    data: {q: str},
                    success: function(response) { 
                        //alert(response);
                } // end success
                }) // end ajax
                } // else 
        // Possible ways to send an email
        // Javascript:  https://smtpjs.com
        // PHP:         https://www.w3schools.com/php/func_mail_mail.asp
        // AJAX:        Put the collected email into his record in the stations table.
    } // End if
} // end checkCall function