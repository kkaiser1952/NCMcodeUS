<?php
    /* Net Control Manager (NCM) - SSE-Compatible Save Handler
     * Based on original save.php with added SSE timestamp support
     * Copyright 2015-2025 Keith Kaiser, WA0TJT
     * Contact: wa0tjt@gmail.com
     */

    // Enable error reporting for debugging during development
    error_reporting(E_ALL);
    ini_set('display_errors', 1);

    // Debug logging
$logFile = fopen('/tmp/save_sse_log.txt', 'a');
function logSave($message) {
    global $logFile;
    fwrite($logFile, date('Y-m-d H:i:s') . ' - ' . $message . "\n");
    fflush($logFile);
}
logSave('save_sse.php called with rawdata: ' . $rawdata);

    function logMessage($message) {
        global $logFile;
        if ($logFile) {
            fwrite($logFile, date('Y-m-d H:i:s') . ' - ' . $message . "\n");
            fflush($logFile);
        }
    }

    logMessage('save_sse.php called');

    // Get the IP address of the person making the changes.
    require_once "getRealIpAddr.php";
	
    function str_replace_first($search, $replace, $subject) {
        $pos = strpos($subject, $search);
            if ($pos !== false) {
                return substr_replace($subject, $replace, $pos, strlen($search));
            }
            return $subject;
    } // end of str_replace_first function
	
    // credentials and grid calculator
    require_once "dbConnectDtls.php";
    require_once "GridSquare.php";
 
    $rawdata = file_get_contents('php://input');
    logMessage("Raw data: $rawdata");
	    
    // explode the rawdata at the ampersign (&)
    $part = (explode("&",$rawdata));
    $part2 = explode("=",$part[1]); 

    $part30	= $part2[0];  // = id  the word 
    $part31 = $part2[1];  

    $part4 = explode("%3A",$part31); // = Array
    $recordID = $part4[1]; 
    
    $column = $part4[0]; 
    
    $value = explode("=",$part[0]); 
    $value = trim($value[1],"+");  
    
    $value = str_replace("+"," ",$value);
    $value = rawurldecode($value);  
    $value = trim($value," ");
    
    logMessage("Column: $column, RecordID: $recordID, Value: $value");
    
    $ipaddress = getRealIpAddr();
    
    $moretogo = 0;
    
    // ALLOW UPDATE TO THESE FIELDS BUT TEST tactical for DELETE don't update for that 
    if ($column == "county"     | $column == "state"     | $column == "grid" | 
        $column == "latitude"   | $column == "longitude" | $column == "district" |
        $column == "tactical" AND $value <> "DELETE" | $column == "team" | $column == 'aprs_call' | $column == "cat" | $column == "section" ) {
            
        if ($column == 'tactical' AND $value != '') {
            $sql = "SELECT ID, netID, callsign, tactical
                      FROM NetLog 
                    WHERE recordID = '$recordID'";
    
            foreach($db_found->query($sql) as $row) {
                $netID = $row['netID'];
                $ID	   = $row['ID'];
                $cs1   = $row['callsign'];
                $tactical  = $row['tactical'];
            }
            
            $sql = "INSERT INTO TimeLog (recordID, ID, netID, callsign, comment, timestamp, ipaddress) 
                    VALUES ('$recordID', '$ID', '$netID', '$cs1', 'Tactical set to: $value', '$open', '$ipaddress')";
        
            $db_found->exec($sql);

        } // end tactical
        
        
        if ($column == "cat") { 
            $column = "TRFK-FOR"; 
            $value = strtoupper($value);
        } // change name of column for report
        
        $sql = "SELECT ID, netID, callsign from NetLog 
                WHERE recordID = '$recordID'";

        foreach($db_found->query($sql) as $row) {
            $netID = $row['netID'];
            $ID	   = $row['ID'];
            $cs1   = $row['callsign'];
        }
        
        $deltaX = "$column Change";
            if($column == "grid")           {$deltaX = 'LOC&#916:Grid: '.$value.' This also changed LAT/LON values';} 
            else if($column == "state")     {$deltaX = 'LOC&#916:State: '.$value;}
            else if($column == "county")    {$deltaX = 'LOC&#916:County: '.$value;} 
            else if($column == "district")  {$deltaX = 'LOC&#916:District: '.$value;}
            else if($column == "latitude")  {$deltaX = 'LOC&#916:LAT: '.$value.' This also changed the grid value';}
            else if($column == "longitude") {$deltaX = 'LOC&#916:LON: '.$value.' This also changed the grid value';}
    
        
        $sql = "INSERT INTO TimeLog (recordID, ID, netID, callsign, comment, timestamp, ipaddress) 
                VALUES ('$recordID', '$ID', '$netID', '$cs1', '$deltaX', '$open', '$ipaddress')";
    
        $db_found->exec($sql); 
        
        if ($column == "TRFK-FOR") {$column = "cat";} // change name back to cat for the rest
    } // End of multi-column
            
    
    if ($column == "active" ) {
        $sql = "SELECT ID, netID, callsign 
                  FROM NetLog 
                 WHERE recordID = '$recordID'";

        foreach($db_found->query($sql) as $row) {
            $netID = $row['netID'];
            $ID	   = $row['ID'];
            $cs1   = $row['callsign'];
        }
        
        // Then we insert the new update into the TimeLog table
        $sql = "INSERT INTO TimeLog (recordID, ID, netID, callsign, comment, timestamp, ipaddress) 
                VALUES ('$recordID', '$ID', '$netID', '$cs1', 'Status change: $value', '$open', '$ipaddress')";
    
        $db_found->exec($sql);
    } // end column = active
    
    
    // Update the timeout value when the active(status) setting is changed
    // Adding the subtraction of timeonduty to the timeonduty value in the SQL below accompanied NOT resetting the timeonduty to zero after someone checks back into the net after being checked out. This allows us to add the previous TOD to the current TOD repetedly, making it much more accurate.
    if ($column == "active" AND ($value == "OUT" OR $value == "Out" OR $value == "BRB" OR $value == "QSY" OR $value == "In-Out")) {
        $to  = now(CONST_USER_TIMEZONE,CONST_SERVER_TIMEZONE,CONST_SERVER_DATEFORMAT); 
            if ($value == "In-Out") {
                //$to ->modify("+01 minutes");
            }
        $sql = "UPDATE NetLog 
                   SET timeout 	 = '$to' 
                  ,timeonduty = (timestampdiff(SECOND, logdate, '$to') + timeonduty)
                  ,status	 = 1
                  ,sse_timestamp = NOW()
                WHERE recordID = $recordID";
    
            $stmt = $db_found->prepare($sql);
            $stmt->execute();
            
        // We already updated sse_timestamp in the query, so set a flag to prevent double update
        $skipFinalUpdate = true;
    } else if ($column == "active" AND ($value == "In")) {
        $to  = now(CONST_USER_TIMEZONE,CONST_SERVER_TIMEZONE,CONST_SERVER_DATEFORMAT); 
        // newopen replaces logdate when a station logs out and then back in again
        $newopen = now(CONST_USER_TIMEZONE,CONST_SERVER_TIMEZONE,CONST_SERVER_DATEFORMAT);
        $sql = "UPDATE NetLog 
                   SET timeout = NULL,
                       logdate ='$newopen',
                       status = 0,
                       sse_timestamp = NOW(),
                       logdate = CASE
                        WHEN pb = 1 AND logdate = 0 THEN '$to'
                        ELSE logdate  /* back to the original time */
                       END
                 WHERE recordID = $recordID";
    
            $stmt = $db_found->prepare($sql);
            $stmt->execute();
            
        // We already updated sse_timestamp in the query, so set a flag to prevent double update
        $skipFinalUpdate = true;
    } // Endof else if column == active
    
                    
    // ================================= //
    // If name conained two names Keith Kaiser for example, this splits off last name and updates Lname in DB
    elseif ($column == 'Fname' and str_word_count("$value") >= 2) { 
        // print_r(str_word_count("$value",1)); 
        // Array ( [0] => Bill [1] => Brown ) Bill Brown
    }
    
    // On screen this is Role
    elseif ($column == 'netcontrol' ) {
        $sql = "SELECT ID, netID, callsign from NetLog 
                WHERE recordID = '$recordID'";

        foreach($db_found->query($sql) as $row) {
            $netID = $row['netID'];
            $ID	   = $row['ID'];
            $cs1   = $row['callsign'];
        }
        
        // Then we insert the new update into the TimeLog table
        if ($value <> "") {
            $Rollcomment = "Role Changed to: $value";
        } else  { // this is not working yet because of checking for != '' in elseif above
            $Rollcomment = "Role Removed";
        }
         
        $sql = "INSERT INTO TimeLog (recordID, ID, netID, callsign, comment, timestamp, ipaddress) 
                VALUES ('$recordID', '$ID', '$netID', '$cs1', '$Rollcomment', '$open', '$ipaddress')";
    
        $db_found->exec($sql);
    } // end elseif column = netcontrol (role)
    
    elseif ($column == 'Mode' ) {
        $sql = "SELECT ID, netID, callsign, recordID, tt
                FROM NetLog 
                WHERE recordID = '$recordID'";

        foreach($db_found->query($sql) as $row) {
            $netID = $row['netID'];
            $ID	   = $row['ID'];
            $cs1   = $row['callsign'];
            $recordID = $row['recordID'];
            $tt		  = $row['tt'];
        } // end elseif column = mode
        
        // Then we insert the new update into the TimeLog table
        $sql = "INSERT INTO TimeLog (recordID, ID, netID, callsign, comment, timestamp, ipaddress) 
                            VALUES ('$recordID', '$ID', '$netID', '$cs1', 'Mode set to: $value', '$open', '$ipaddress')";
    
        $db_found->exec($sql);
    } // End of Mode elseif
    
    elseif ($column == 'traffic' ) {
        $sql = "SELECT ID, netID, callsign from NetLog 
                WHERE recordID = '$recordID'";

        foreach($db_found->query($sql) as $row) {
            $netID = $row['netID'];
            $ID	   = $row['ID'];
            $cs1   = $row['callsign'];
        } // end elseif column = traffic
        
        // Then we insert the new update into the TimeLog table
        $sql = "INSERT INTO TimeLog (recordID, ID, netID, callsign, comment, timestamp, ipaddress) 
                VALUES ('$recordID', '$ID', '$netID', '$cs1', 'Traffic set to: $value', '$open', '$ipaddress')";
    
        $db_found->exec($sql);
    } // End of traffic elseif
    
    elseif ($column == 'band' ) {
        $sql = "SELECT ID, netID, callsign from NetLog 
                WHERE recordID = '$recordID'";

        foreach($db_found->query($sql) as $row) {
            $netID = $row['netID'];
            $ID	   = $row['ID'];
            $cs1   = $row['callsign'];
        } // end elseif column = traffic
        
        // Then we insert the new update into the TimeLog table	 
        $sql = "INSERT INTO TimeLog (recordID, ID, netID, callsign, comment, timestamp, ipaddress) 
                VALUES ('$recordID', '$ID', '$netID', '$cs1', 'Band set to: $value', '$open', '$ipaddress')";
    
        $db_found->exec($sql);
    } // End of Band elseif
    
    ////////////// Update for aprs_call starts here
    elseif ($column == 'aprs_call' AND $value != '') {
        $sql = "SELECT ID, netID, callsign, aprs_call, latitude, longitude
                  FROM NetLog 
                WHERE recordID = '$recordID'";

        foreach($db_found->query($sql) as $row) {
            $netID = $row['netID'];
            $ID	   = $row['ID'];
            $cs1   = $row['callsign'];
            $aprs_call  = $row['aprs_call'];
            $lat = $row['latitude'];
            $lng = $row['longitude'];
        }
            
        // Updated 2024-01-31 to stop using column latlng		
        $sql = "INSERT INTO TimeLog (recordID, ID, netID, callsign, comment, timestamp, latitude, longitude, ipaddress) 
                VALUES ('$recordID', '$ID', '$netID', '$cs1', 'APRS_CALL set to: $value', 
                NOW(), '$lat', '$lng', '$ipaddress')";

        $db_found->exec($sql);

    } ///////////////// End of Update for aprs_call
        
    
    elseif ($column == 'team' AND $value != '') {
        $sql = "SELECT ID, netID, callsign, team
                  FROM NetLog 
                WHERE recordID = '$recordID'";

        foreach($db_found->query($sql) as $row) {
            $netID = $row['netID'];
            $ID	   = $row['ID'];
            $cs1   = $row['callsign'];
            $team  = $row['team'];
        }
        
        $sql = "INSERT INTO TimeLog (recordID, ID, netID, callsign, comment, timestamp, ipaddress) 
                VALUES ('$recordID', '$ID', '$netID', '$cs1', 'Team set to: $value', '$open', '$ipaddress')";
    
        $db_found->exec($sql);

    } // End of team
    
    elseif ($column == 'facility' AND $value != '') {
        $sql = "SELECT ID, netID, callsign 
                  FROM NetLog 
                 WHERE recordID = '$recordID'";
                
        foreach($db_found->query($sql) as $row) {
            $netID = $row['netID'];
            $ID	   = $row['ID'];
            $cs1   = $row['callsign'];
        } // end elseif column = traffic
         
        $sql = "INSERT INTO TimeLog (recordID, ID, netID, callsign, comment, timestamp, ipaddress) 
                VALUES ('$recordID', '$ID', '$netID', '$cs1', 'Facility set to: $value', '$open', '$ipaddress')";
    
        $db_found->exec($sql);
        
    } // End of facility elseif

                
    // Update the TimeLog if comments were added
    elseif ($column == 'comments' AND $value != '') {
       logMessage("Entering comments section. Value: $value");
       try {
           $value = str_replace("'", "''", $value);
           
           $sql = "SELECT ID, netID, callsign, home
                     FROM NetLog 
                   WHERE recordID = :recordID";
           
           logMessage("SQL query: $sql");
           $stmt = $db_found->prepare($sql);
           $stmt->bindParam(':recordID', $recordID, PDO::PARAM_INT);
           $stmt->execute();
           $row = $stmt->fetch(PDO::FETCH_ASSOC);
           
           if (!$row) {
               throw new Exception("No record found for recordID: $recordID");
           }
           
           $netID = $row['netID'];
           $ID    = $row['ID'];
           $cs1   = $row['callsign'];
           $home  = $row['home'];
           
           $deltaX = 'LOC&#916;';
           $Varray = array("@home", "@ home", "@  home", "at home", "gone home", "headed home", "going home", "home");
          
           if (in_array(strtolower($value), $Varray)) {
               logMessage("Home-related comment detected");
               $homeArray = explode(',', $home);
               if (count($homeArray) < 5) {
                   throw new Exception("Invalid home data format");
               }
               
               list($latitude, $longitude, $grid, $county, $state) = $homeArray;
               $value2 = "$deltaX:COM:@home, reset to home coordinates ($home)";
               
               $sql = "UPDATE NetLog 
                          SET latitude = :latitude, longitude = :longitude, 
                              grid = :grid, county = :county, state = :state, w3w = '',
                              delta = 'Y', sse_timestamp = NOW()
                        WHERE recordID = :recordID";
           
               logMessage("Update SQL: $sql");
               $stmt = $db_found->prepare($sql);
               $stmt->bindParam(':latitude', $latitude, PDO::PARAM_STR);
               $stmt->bindParam(':longitude', $longitude, PDO::PARAM_STR);
               $stmt->bindParam(':grid', $grid, PDO::PARAM_STR);
               $stmt->bindParam(':county', $county, PDO::PARAM_STR);
               $stmt->bindParam(':state', $state, PDO::PARAM_STR);
               $stmt->bindParam(':recordID', $recordID, PDO::PARAM_INT);
               $stmt->execute();
               
               // We already updated sse_timestamp in the query, so set a flag to prevent double update
               $skipFinalUpdate = true;
           } else { 
               $value2 = $value; 
           }
           
           $timestamp = date('Y-m-d H:i:s');
           
           $sql = "INSERT INTO TimeLog (recordID, ID, netID, callsign, comment, timestamp, ipaddress) 
                   VALUES (:recordID, :ID, :netID, :callsign, :comment, :timestamp, :ipaddress)";
           
           logMessage("Insert SQL: $sql");
           $stmt = $db_found->prepare($sql);
           $stmt->bindParam(':recordID', $recordID, PDO::PARAM_INT);
           $stmt->bindParam(':ID', $ID, PDO::PARAM_INT);
           $stmt->bindParam(':netID', $netID, PDO::PARAM_INT);
           $stmt->bindParam(':callsign', $cs1, PDO::PARAM_STR);
           $stmt->bindParam(':comment', $value2, PDO::PARAM_STR);
           $stmt->bindParam(':timestamp', $timestamp, PDO::PARAM_STR);
           $stmt->bindParam(':ipaddress', $ipaddress, PDO::PARAM_STR);
           $stmt->execute();
           
           logMessage("Comments section completed successfully");
       } catch (Exception $e) {
           logMessage("Error in save_sse.php comments section: " . $e->getMessage());
           http_response_code(500);
           echo "An error occurred while processing your request: " . $e->getMessage();
           exit;
       }
   } // End comments elseif
    
    
    // This routine is to delete the row if the tactical was changed to DELETE we do this because
    // sometimes deleting with the X at the end of each row doesn't want to work on small screens.
    if ($column == "tactical" AND ($value == "DELETE") ) {
        $dltdTS  = now(CONST_USER_TIMEZONE,CONST_SERVER_TIMEZONE,CONST_SERVER_DATEFORMAT); 
        try {
            // This SQL uses the maximum logdate and the recordID to gather its info
            $CurrentSQL = "SELECT netID, ID, callsign
                             FROM NetLog 
                            WHERE recordID = $recordID";
            foreach($db_found->query($CurrentSQL) as $row) {
                $netID 	  = $row['netID'];
                $id	   	  = $row['ID'];
                $cs1   	  = $row['callsign'];
            }
                
            // This SQL puts the info from NetLog into the TimeLog table
            $TSsql = "INSERT INTO TimeLog (recordID, timestamp, ID, netID, callsign, comment, ipaddress)
                      VALUES ($recordID, '$dltdTS', '$id', '$netID', 'GENCOMM', 'The call $cs1 with this ID was deleted', '$ipaddress')";
                
            $db_found->exec($TSsql);
                
        } catch(PDOException $e) {
            echo $TSsql . "<br>" . $e->getMessage();
        }

        try {
            // This SQL does the actual delete from NetLog
            $sql = "DELETE FROM NetLog WHERE recordID = $recordID";
                
            $stmt = $db_found->prepare($sql);
            $stmt->execute();
            
            echo " DELETED successfully";
            $value = '';
            
            // Force SSE update for this deletion
            $sql = "INSERT INTO NetLog (netID, callsign, comments, sse_timestamp) 
                    VALUES ('$netID', 'DELETED', 'Record $recordID deleted', NOW())";
            $db_found->exec($sql);
            
            $sql = "DELETE FROM NetLog WHERE callsign = 'DELETED' AND comments = 'Record $recordID deleted'";
            $db_found->exec($sql);
            
            // No need for the final update since we're deleting the record
            $skipFinalUpdate = true;
        } catch(PDOException $e) {
            echo $sql . "<br>" . $e->getMessage();
        }
    } // End tactical DELETE handling

    if ($column == 'tactical' and str_word_count("$value") >= 2) { 
        $value = preg_replace('/  /','<br>',$value);
    }
    
    if ($column == 'creds' and str_word_count("$value") >= 2 ) {
        $value = preg_replace('/  /','<br>',$value);  
    }
    
    echo str_replace("+"," ","$value");
    
    // This routine is to update the stations table with Fname, Lname, email or city
    if ($column == 'Fname' | $column == "Lname" | $column == "email" | $column == "creds" | $column == "city" ) {
        // Get the callsign to use for updating the stations 
        $sql = "SELECT callsign
                  FROM NetLog 
                 WHERE recordID = $recordID
                 LIMIT 1";

        $stmt = $db_found->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetch();
        $callsign = $result['callsign'];        

        // Update the stations table for the changed values
        $sql = "UPDATE stations SET $column = '$value' 
                 WHERE callsign = '$callsign'";
        
        $stmt = $db_found->prepare($sql);
        $stmt->execute();
    } // End of adding name and email changes to the stations table	
    
    // Debug logging
$logFile = fopen('/tmp/save_sse_log.txt', 'a');
function logSave($message) {
    global $logFile;
    fwrite($logFile, date('Y-m-d H:i:s') . ' - ' . $message . "\n");
    fflush($logFile);
}

// Enhanced logging for debugging
logSave('==== SAVE OPERATION ====');
logSave('Column: ' . $column . ' | Value: ' . $value . ' | RecordID: ' . $recordID . ' | NetID: ' . (isset($netID) ? $netID : 'N/A'));

// Only perform the final update if not already done
if (!isset($skipFinalUpdate) || $skipFinalUpdate !== true) {
    // Update the NetLog with the new information
    $sql = "UPDATE NetLog SET $column = :val, sse_timestamp = NOW() WHERE recordID = :rec_id";
    
    logSave('Executing SQL: ' . $sql . ' with value: ' . $value . ' and recordID: ' . $recordID);
    
    $stmt = $db_found->prepare($sql);
    $stmt->bindParam(':val', $value, PDO::PARAM_STR);
    $stmt->bindParam(':rec_id', $recordID, PDO::PARAM_INT);
    $result = $stmt->execute();
    
    logSave('Update result: ' . ($result ? 'SUCCESS' : 'FAILED'));
    
    // Verify the update happened
    $verifyStmt = $db_found->prepare("SELECT sse_timestamp, $column FROM NetLog WHERE recordID = :rec_id");
    $verifyStmt->bindParam(':rec_id', $recordID, PDO::PARAM_INT);
    $verifyStmt->execute();
    $verifyRow = $verifyStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($verifyRow) {
        logSave('VERIFICATION - Column "' . $column . '" now = "' . $verifyRow[$column] . '" | New timestamp: ' . $verifyRow['sse_timestamp']);
    } else {
        logSave('VERIFICATION FAILED - Record not found after update!');
    }
    
    // Also log to console from JS by echoing back a script
    echo "<script>
    console.log('UPDATE DETECTED: Cell \"$column\" in row $recordID updated to \"$value\"');
    console.log('Timestamp updated to: " . ($verifyRow ? $verifyRow['sse_timestamp'] : 'UNKNOWN') . "');
    </script>";
} else {
    logSave('Final update skipped as sse_timestamp was already updated');
    
    // Log the skip to console
    echo "<script>
    console.log('UPDATE SKIPPED: Cell \"$column\" in row $recordID - timestamp already updated');
    </script>";
}
?>