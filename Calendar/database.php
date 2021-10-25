<?php
    // $mysqli = new mysqli('localhost', 'wustl_inst', 'wustl_pass', 'calendar');
    $mysqli = new mysqli('localhost', 'root', '0212', 'calendar');
    if($mysqli->connect_errno) {
        printf("Connection Failed: %s\n", $mysqli->connect_error);
        exit;
    }
?>