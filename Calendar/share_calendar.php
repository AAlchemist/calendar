<?php
    session_start();
    require 'database.php';
    header("Content-Type: application/json");

    $json_str = file_get_contents('php://input');
    $json_obj = json_decode($json_str, true);

    $sharer_id = $_SESSION['userId'];

    $shared_username = $json_obj['shared_username'];
    $shared_userId = -1;

    $stmt = $mysqli->prepare("SELECT user_id FROM users WHERE username = '$shared_username'");
    if(!$stmt){
        echo json_encode(array(
            "success" => false
        ));
        exit;
    }
    if(!$stmt->execute()){
        echo json_encode(array(
            "success" => false,
            "message" => "find id failed!"
        ));
        exit;
    }
    $stmt->bind_result($memberId);
    while($stmt->fetch()){
        $members_id[] = $memberId;
    }
    $stmt->close();
    $shared_userId = $members_id[0];

    $stmt = $mysqli->prepare("INSERT into user_relations (sharer_id, shared_id) values (?, ?)");
    if(!$stmt){
        echo json_encode(array(
            "success" => false
        ));
        exit;
    }

    $stmt->bind_param('ii', $sharer_id, $shared_userId);
    if(!$stmt->execute()){
        echo json_encode(array(
            "success" => false,
            "message" => htmlspecialchars($stmt->error)
        ));
        exit;
    }
    $stmt->close();
?>