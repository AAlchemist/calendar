<?php
    session_start();
    header("Content-Type: application/json");
    if (!isset($_SESSION['username'])) {
        echo json_encode(array(
            "success" => false
        ));
        exit;
    }
    else {
        echo json_encode(array(
            "success" => true,
            "username" => $_SESSION['username'],
            "token" => $_SESSION['token']
        ));
        exit;
    }   
?>