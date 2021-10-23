<?php
    session_start();
    header("Content-Type: application/json");

    $json_str = file_get_contents('php://input');
    //This will store the data into an associative array
    $json_obj = json_decode($json_str, true);

    //only support update tag, name, date and time of an event
    $event_id = $json_obj['event_id'];
    $tag = $json_obj['tag'];
    $event_year = $json_obj['event_year'];
    $name = $json_obj['name'];
    $month = $json_obj['month'];
    $day = $json_obj['date'];
    $time = $json_obj['event_time'];
    
    // $token = $json_obj['token'];
    // //csrf detection
    // if(!hash_equals($_SESSION['token'], $token)) {
    //     die("Request forgery detected");
    // }

    require "database.php";
    $stmt = $mysqli->prepare("UPDATE events SET name = ?, tag = ?, event_year = ?, month = ?, date = ?, event_time = ? WHERE event_id = ?");

    if(!$stmt) {
        echo json_encode(array(
            "success" => false
        ));
        exit;
    }

    $stmt->bind_param('siiiisi', $name, $tag, $event_year, $month, $day, $time, $event_id);
    $stmt->execute();
    $stmt->close();

    echo json_encode(array(
        "success" => true
    ));
    exit;
?>