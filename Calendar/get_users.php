<?php
    session_start();
    header("Content-Type: application/json");

    require "database.php";
    $username = $_SESSION['username'];
    $stmt = $mysqli->prepare("SELECT username FROM users WHERE username <> '$username'");
    if(!$stmt){
        echo json_encode(array(
            "success" => false
        ));
        exit;
    }
    if(!$stmt->execute()){
        echo json_encode(array(
            "success" => false,
            "message" => "get user list failed!"
        ));
        exit;
    }
    $stmt->bind_result($user_name);
    while($stmt->fetch()){
        $user_names[] = $user_name;
    }
    $stmt->close();    
    if(count($user_names) < 1){
        echo json_encode(array(
            "success" => false,
            "message" => 'no user found'
        ));
        exit;
    }else{
        echo json_encode(array(
            "success" => true,
            "userList" => $user_names
        ));
        exit;
    }
?>