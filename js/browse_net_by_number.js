// browse_net_by_number.js
// Written: 2022?
// This JS makes it possible to see a closed net by using netID
// This was in NetManager-p2.js moved here for easier access
// Modified: 2024-11-08

function browse_net_by_number(s) {
    //var s = prompt("net ID?"); // get the net number
      if(s) {
            $.ajax({
				type: "GET",
				url: "getkind.php",  
				data: {q: s},
				success: function(html) {
                var remarks = 'Net No: '+s+', '+html;
                $("#remarks").html(remarks);
                $("#remarks").removeClass("hidden");
            },
            error: function() {
                alert('Last Query Failed, try again.');
            }
        });  // end ajax */
                
      } // end if(s)
    
    showActivities(s);
    
        // Hide some elements to prevent play
        $(".ckin1").addClass("hidden");
        $("#closelog").addClass("hidden");
        $("#cs1").addClass("hidden");
        $("#Fname").addClass("hidden");
        $("#newbttn").addClass("hidden");
        $(".tohide").addClass("hidden");
        
        $("#remarks").removeClass("hidden");
        //$("#remarks").html('You are browsing Net No.: '+s+' ');
                      
        // Set this value before the MySQL get the data to prevent editing
        $(".closenet").html('Net Closed');
}