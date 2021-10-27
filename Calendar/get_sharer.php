<?php
    session_start();
    require 'database.php';
    header("Content-Type: application/json");

    $json_str = file_get_contents('php://input');
    $json_obj = json_decode($json_str, true);

    $shared_id = $_SESSION['userId'];
    $token = $json_obj['token'];
    if(!hash_equals($_SESSION['token'], $token)) {
        die("Request forgery detected");
    }
    $sharer_userId = -1;
    $stmt = $mysqli->prepare("SELECT username from users u inner join user_relations ur on u.user_id = ur.sharer_id where shared_id = '$shared_id'");
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
    $stmt->bind_result($sharer_id);
    while($stmt->fetch()){
        $sharer_id_list[] = $sharer_id;
    }
    $stmt->close();

    echo json_encode(array(
        "success" => true,
        "sharer_list" => $sharer_id_list
    ));
    exit;
    $stmt->close();
?>