// circleKoords.js
var circfeqcnt = 0; // Sets a variable to count how many times the circleKoords() function is called

function circleKoords(e) {
     
   circfeqcnt = circfeqcnt + 1; 
        //console.log('circfeqcnt: ' + circfeqcnt);
    
   var circolor = 'blue'; // Default color
    if (circfeqcnt == 2) circolor = 'red';
    else if (circfeqcnt == 3) circolor = 'green';
    else if (circfeqcnt == 4) circolor = 'purple';
    else if (circfeqcnt == 5) circolor = 'orange';
    else if (circfeqcnt >= 6) circolor = 'black';
   
   var LatLng = e.latlng; 
   var lat = e.latlng["lat"]; 
   var lng = e.latlng["lng"]; 
   
        //console.log('circolor: ' + circolor + '  ' +lat+' and '+lng);
   
   var i; var j;
   var r = 1609.34;  // in meters = 1 mile, 4,828.03 meters in 3 miles
   
   //https://jsfiddle.net/3u09g2mf/2/   
   //https://gis.stackexchange.com/questions/240169/leaflet-onclick-add-remove-circles
   var group1 = L.featureGroup(); // Allows us to group the circles for easy removal, but not working
   
   var circleOptions = {
       color: circolor,
       fillOpacity: 0.005 ,
       fillColor: '#69e'
   } // End circleOptions var  
      
   // This routine sets a default number of miles between rings and the number of rings
   // Based on the number of rings selected and marker that was clicked, it calculates 
   // the distance to the furthest corner and returns an appropriate number of rings
   // to draw to reach it, auto magically.
   // Variable dbr is the distance between rings, might be feet or miles
   // Variable maxdist is the calculated distance to the furthest corner marker
   
   var dbr = 5; // Default for miles between circles for general markers
   var maxdist = 0;
   var maxdistr = 0;
   var numberofrings = 1;
   var distancebetween = 0;
   var Lval = 'miles';     
   var marker = lastLayer; 
   
   

    // Use this for Objects
    // Much of this code is thanks to Florian at Falke Design without who it was just over my head 4/30/2021
    
    if(marker.getPopup() && marker.getPopup().getContent().indexOf('OBJ') > -1){  
            // greater then -1 because the substring OBJ is found (if the substring OBJ is found, it returns the index > -1, if not found === -1)
        console.log('@56 content= '+marker.getPopup().getContent());
      //  [Log] @56 content= OBJ:  WA0TJTCT 38.94667,-94.349 The Objects Center Marker (circleKoords.js, line 56)
            

            // Object Markers:  Test only the object markers
            // The distanceTo() function calculates in meters
            // 1 mile = 1609.34 meters.        
        // this is test calculation only because the min distance might point to the wrong marker
        var whoArray   = [];
        var markerName = [];
        var ownerCall  = '';
        var maxdist = 0;
        
        if(marker.getPopup() && marker.getPopup().getContent().indexOf('Objects') > -1){
            
            // whose marker did we find?  This 3 statements work for the middle and the corners
            markerText = marker.getPopup().getContent();    // Everything in the marker
            whoArray   = markerText.split('<br>');          // add markerText words to an array
            markerName = whoArray[1];                       // Get the callsign (I hope)
            //LatLng = 'LatLng('+lat+', '+lng+')';          //     whoArray[2];
            //markerKord = whoArray[2];
            ownerCall  = markerName.slice(0, -2);           // Deletes the number from the call
            padCall    = ownerCall.concat('PAD');
            
            console.log('@80 markerText= '+markerText+' markerName= '+markerName+'  ownerCall= '+ownerCall+'  padCall= '+padCall+'  LatLng= '+LatLng);
// @80 markerName=  WA0TJTCT ownerCall=  WA0TJT padCall=  WA0TJTPAD LatLng= LatLng(39.199768, -94.601061

    //LatLng = L.latLng(lat,lng);  // new from chatGPT 2024-01-14
    
    console.log('@85 objse '+LatLng.distanceTo( objse )); // in meters
    console.log('@86 objsw '+LatLng.distanceTo( objsw ));
    console.log('@87 objne '+LatLng.distanceTo( objne ));
    console.log('@88 objnw '+LatLng.distanceTo( objnw ));
                
          // Find the distance to the furthest flag for this callsign.

          maxdist = Math.max( 
                LatLng.distanceTo( objse ), 
                LatLng.distanceTo( objne ), 
                LatLng.distanceTo( objnw ), 
                LatLng.distanceTo( objsw ))/1609.34; 
             
                console.log('@98 SE= '+se+' Object maxdist= '+maxdist+' from '+markerName+' for '+window[padCall] );
// [Log] @90 SE= LatLng(39.193834, -94.594536) Object maxdist= 1.4032011545894454 from  WA0TJTCT for undefined (circleKoords.js, line 90)

/*  SE corner flag of bread crumb markers
    var WA0TJTob4 = new L.marker(new L.latLng( WA0TJTPAD.getSouthEast() ),{
           contextmenu: true, contextmenuWidth: 140, contextmenuItems: [{ 
           text: 'Click here to add mileage circles', callback: circleKoords}],
           icon: L.icon({iconUrl: bluemarkername , iconSize: [50,50] }),
           title:'ob4'}).addTo(map).bindPopup('OBJ:  WA0TJTSE '+38.94667+','+-94.349+' The Objects SE Corner');
*/
                  
                 
        }    // end of if(marker.getPopup...       
} // end of marker is an object
        else if(!marker.getPopup() || marker.getPopup().getContent().indexOf('OBJ') === -1){ 
            // if the marker has NO popup or the marker has not containing OBJ in the popup
            // General Markers:  Test all the general and object markers for the furthest out
            //alert('in G');
                 
     maxdist = Math.max( 
        LatLng.distanceTo( se ), 
        LatLng.distanceTo( ne ), 
        LatLng.distanceTo( nw ), 
        LatLng.distanceTo( sw ))/1609.34;

        console.log('@123 Station maxdist: '+maxdist+' miles Lval= '+Lval);     
} // end of marker is a station   
        
        
         if (maxdist < 1) { 
             Lval = 'feet';
             maxfeet = maxdist*5280;
             if      (maxdist > 0  && maxdist <= .5)    {dbr = .05;}
             else if (maxdist > .5 && maxdist <= 1)     {dbr = .075;}
                console.log('@132 maxdist= '+maxdist+' Lval= '+Lval);     
         } else {        
        // Set the new calculated distance between markers, 5 is the default dbr     
        if (maxdist > 1  && maxdist <= 2)     {dbr = .75;}
        else if (maxdist > 2  && maxdist <= 10)    {dbr = 1;}
        else if (maxdist > 10 && maxdist <= 50)    {dbr = 5;}
        else if (maxdist > 50 && maxdist <= 500)   {dbr = 25;}
        else if (maxdist > 500 && maxdist <= 750)  {dbr = 50;}
        else if (maxdist > 750 && maxdist <= 1000) {dbr = 75;}
        else if (maxdist > 1000 && maxdist <= 2000) {dbr = 300;}
        else if (maxdist > 2000 && maxdist <= 6000) {dbr = 500;}
        else                                       {dbr = 5;}
                console.log('@144 maxdist= '+maxdist+' Lval= '+Lval);
        }


    distancebetween = prompt('Distance to furthest corner is '+maxdist+" "+Lval+".\n How many "+ Lval+" between circles?", dbr);
   		//if (distancebetween <= 0) {distancebetween = 1;} 
   		//if (distancebetween > 0 && distancebetween <= 10) {distancebetween = 2;}
   		console.log('@151 db: '+distancebetween);
   		
    maxdist = maxdist/distancebetween;
        console.log('@154 distancebetween= '+distancebetween+' maxdist= '+maxdist);
   
    numberofrings = prompt(Math.round(maxdist)+" circles will cover all these objects.\n How many circles do you want to see?", Math.round(maxdist));
   		//if (numberofrings <= 0) {numberofrings = 5;}	
   		
   console.log('@159 numberofrings = '+numberofrings+' round(maxdist): '+Math.round(maxdist,2));	
   		
    
   angle1 = 90;  // mileage boxes going East
   angle2 = 270; // mileage boxes going West
   angle3 = 0;   // degree markers
   
     
    // The actual circles are created here at the var Cname =
    for (i=0 ; i < numberofrings; i++ ) {
         var Cname = 'circle'+i; 
            r = (r * i) + r; 
            r = r*distancebetween;
         var Cname = L.circle([lat, lng], r, circleOptions);
            Cname.addTo(group1); 
          map.addLayer(group1);
          
         // angle1, angle2 puts the mileage markers on the lines p_c1 and p_c2
         angle1 = angle1 + 10;
         angle2 = angle2 + 10;
         
            // i is the number of rings, depending how many have been requested the delta between bears
            // will be adjusted from 15 degrees at the 2nd circle to 5 degrees at the furthest.
            if ( i === 0  ) { //alert(numberofrings);
                for (j=0; j < 360; j+=20) {
                    // j in the icon definition is the degrees 
                    var p_c0 = L.GeometryUtil.destination(L.latLng([lat, lng]),angle3,r);
                    var icon = L.divIcon({ className: 'deg-marger', html: j , iconSize: [40,null] });
                    var marker0 = L.marker(p_c0, { title: 'degrees', icon: icon});
                        marker0.addTo(map);
                            angle3 = angle3 + 20;
                }
            }else if ( i === 5 ) {
                    for (j=0; j < 360; j+=10) {
                    // j in the icon definition is the degrees 
                    var p_c0 = L.GeometryUtil.destination(L.latLng([lat, lng]),angle3,r);
                    var icon = L.divIcon({ className: 'deg-marger', html: j , iconSize: [40,null] });
                    var marker0 = L.marker(p_c0, { title: 'degrees', icon: icon});
                        marker0.addTo(map);
                            angle3 = angle3 + 10;
                }         
            }else if ( i === 2 ) {
                    for (j=0; j < 360; j+=10) {
                    // j in the icon definition is the degrees 
                    var p_c0 = L.GeometryUtil.destination(L.latLng([lat, lng]),angle3,r);
                    var icon = L.divIcon({ className: 'deg-marger', html: j , iconSize: [40,null] });
                    var marker0 = L.marker(p_c0, { title: 'degrees', icon: icon});
                        marker0.addTo(map);
                            angle3 = angle3 + 10;
                }
            }else if ( i === numberofrings-1 ) {
                    for (j=0; j < 360; j+=5) {
                    // j in the icon definition is the degrees 
                    var p_c0 = L.GeometryUtil.destination(L.latLng([lat, lng]),angle3,r);
                    var icon = L.divIcon({ className: 'deg-marger', html: j , iconSize: [40,null] });
                    var marker0 = L.marker(p_c0, { title: 'degrees', icon: icon});
                        marker0.addTo(map);
                            angle3 = angle3 + 5;
                } // End for loop         
            } // end of else if
        
         var p_c1 = L.GeometryUtil.destination(L.latLng([lat, lng]),angle1,r);
         var p_c2 = L.GeometryUtil.destination(L.latLng([lat, lng]),angle2,r);
         //var inMiles = (toFixed(0)/1609.34)*.5;
         var inMiles = Math.round(r.toFixed(0)/1609.34)+' Mi';
         var inFeet  = Math.round((r.toFixed(0)/1609.34)*5280)+' Ft';
         var inKM = Math.round(r.toFixed(0)/1000)+' Km';
         var inM = Math.round((r.toFixed(0)/1000)*1000)+' M';
         
            if(Math.round(r.toFixed(0)/1609.34) < 2) {inMiles = inFeet; inKM = inM;}
        
         // Put mile and km or feet and m on each circle
         var icon = L.divIcon({ className: 'dist-marker-'+circolor, html: inMiles+' <br> '+inKM, iconSize: [60, null] });
         
         var marker = L.marker(p_c1, { title: inMiles+'Miles', icon: icon});
         var marker2 = L.marker(p_c2, { title: inMiles+'Miles', icon: icon});
      
         marker.addTo(map);
         marker2.addTo(map);
         
        // reset r so r calculation above works for each 1 mile step 
        r = 1609.34;     
        var dbr = 1; // Default for miles between circles for general markers
        var maxdist = 1;
    } // end of for loop 
} // end circleKoords function