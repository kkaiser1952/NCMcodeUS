// showActivities.js 
// ++++++++++===

// +++++++++++===
// This file is used in index.php 
// Moved here from netManager.js on 2024-11-25

function showActivities2(str, str2) { 
    var str = str.trim();
	RefreshGenComm();

	// This little loop builds the upper right corner information.
	// In showActivities function:

if (str2) {
    var netcall = str2.slice(0, str2.indexOf(","));   
    //console.log("Before load: netcall =", netcall); // Add this line
    $("#upperRightCorner").load("buildUpperRightCorner.php?call="+str2.split(",",2)[0],   
    );		
					
		 // This routine determins if this net is a Custom net, 
		 // if it is the Name field is swapped for a Category field	
         if ( str2.indexOf("MARS") >= 0 ) { 
             $('#Fname').prop('type','hidden');
             $('#custom').prop('type','text');
             $('#custom').removeClass("hidden");
             $('#custom').attr('placeholder', 'Traffic For:');
            // $('#section').prop('type','text');
         } else { 
             $('#Fname').prop('type','text');
             $('#custom').prop('type','hidden');  
             $('#section').prop('type','hidden');
         }          
} // End if (str2)
	
	// This is the div to update, it changes depending on whose turn it is
	    var thisDiv = 'actLog';
	
	// Hides some div's shows others
	$("#refbutton").removeClass("hidden");
	$("#refrate").removeClass("hidden");   // Added 2018-03-05
	$("#openNets").addClass("hidden");
	$("#time").removeClass("hidden");
	$("#subNets").addClass("hidden");
	$(".newstuff").addClass("hidden");  // Hides the span about this being a new net on indes.php'
	
	// These two don't do anything currently. They were created for the indexPlay.php and control the new
	// class by these names.
	$(".makeaselection").addClass("hidden");
	$("#grad1").addClass("hidden");
	
	
	// Change which bubbles are shown based on if a net is shown or not
	$("#tb").removeClass("tipsbutton");
    $("#tb").addClass("tipsbutton2");
   


	
	// Show or hide some DIV's depending on value of str 
	if (str == '0') {  // Added 2016-12-05  won't ever happen again... i hope
    	console.log(str); 
			$("#closelog").addClass("hidden");
			$("#time").addClass("hidden");
			$(".multiselect").addClass("hidden");
			$("#primeNav").addClass("hidden");
			$("#cb1span").addClass("hidden");
			$("#refbutton").addClass("hidden");
			$("#refrate").addClass("hidden");
	} else {
			$("#closelog").removeClass("hidden");
			$("#time").removeClass("hidden");
			$(".multiselect").removeClass("hidden");
			$("#primeNav").removeClass("hidden");
			
	//		$("#cb1span").removeClass("hidden");
	} // End of else @382
	
	  // Create a new net if requested
      if (str == "newNet()") {
      	newNet(); 	// Is in NetManager-p2.js
      }
      
      // I don't know if this if applies to anything as of 2019-03-22 but the else does...
      if (str == "") {

	      	$("#actLog").html("");
	      	$("#netIDs").html("");
	      	$("#closelog").html("");
	      	$("#cb1").prop("checked",false);
	      
            	return;
      } else { 
         //alert('in an else of showActivities()');
		 	$("#netIDs").html("");
		 	$("#cb1").prop("checked",false);
           
            $.ajax({
               type: "GET",
               url:  "getactivities.php",
               data: {q:str},
               success: function(response) {
                   $('#actLog').html(response);
                  //console.log('@599: '+ response);
                   
                   if ($('#thenetCallsign').length) { // This just tests if it exists
					//dont put anything here
				} else {
				} 
				
				    sorttable.makeSortable(document.getElementById("thisNet"));
						$( document ).ready( CellEditFunction );
						
						 testCookies(netcall);
						 
                         var tz_domain = getCookie("tz_domain"); //alert('@453 '+tz_domain);
                         if ( tz_domain == 'Local' ) { goLocal(); } else { goUTC(); }
               },
               error: function() {
                   console.log('AJAX Error:', status, error);
                   alert('Sorry somethings wrong in NetManager.js @566, try again');
               }
            });
                 
            // This routine checks to see if there are any checked-in stations by looking at the logdate values.
			// If its 0 then its a pre-built yet to be opened
			// Any other value means its open and running
			var ispbStat = $('#pbStat').html();
			 //alert('@570 NM.js ispbStat= '+ispbStat);
			 
            // if (ispbStat == 0) { $("#closelog").addClass('hidden');}
            
            $("#makeNewNet").addClass("hidden");
            $("#csnm").removeClass("hidden");
            $("#cb0").removeClass("hidden");
            $("#forcb1").removeClass("hidden");
            
            if (str == 0) {
	            $(".c1, .c2, .c3").hide();
            }
		            	            		            
      } // End str == "" @577 the else part (I think)    
      
      
     //var tz_domain = sessionStorage.getItem("tz_domain"); console.log(tz_domain);
        //if(tz_domain == 'local') { goLocal(); } else { goUTC(); }
} // end of showactivites function