<?php
    session_start();
    require 'database.php';
    header("Content-Type: application/json");

    $json_str = file_get_contents('php://input');
    $json_obj = json_decode($json_str, true);


    $tag = $json_obj['tag'];
    $event_year = $json_obj['event_year'];
    $name = $json_obj['name'];
    $month = $json_obj['month'];
    $day = $json_obj['date'];
    $time = $json_obj['event_time'];
    $is_groupEvent = $json_obj['is_group'];
    //this is an array
    $group_members = $json_obj['group_members'];
    //get userId
    //$user = unserialize($_SESSION['user']);
    //$user_id = $user->getUserId();
    $user_id = 1;

   
    //create a group member string to insert into db
    //add the current user first
    //$groupMem_str = $user->getUserName();
    $groupMem_str = "user1";
    for($i = 0; $i < count($group_members); $i++){
        $groupMem_str = $groupMem_str . ", " . $group_members[$i];
    }
    
    $stmt = $mysqli->prepare("INSERT into events (name, tag, event_year, month, date, is_group, group_members, user_id, event_time) values (?, ?, ?, ?, ?, ?, ?, ?, ?)");

    if(!$stmt){
        echo json_encode(array(
            "success" => false
        ));
        exit;
    }

    $stmt->bind_param('siiiiisis', $name, $tag, $event_year, $month, $day,  $is_groupEvent, $groupMem_str, $user_id, $time);
    
    
    if(!$stmt->execute()){
        echo json_encode(array(
            "success" => false,
            "message" => htmlspecialchars($stmt->error)
        ));
        exit;
    }
    $stmt->close();

    //add the event to group members' calendar
    if($is_groupEvent == 1){
        $members_id = [];
        for($i = 0; $i< count($group_members); $i++){
            $userName = $group_members[$i];
            $stmt = $mysqli->prepare("SELECT user_id FROM users WHERE username = '$userName'");
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
                $members_id[$i] = $memberId;
            }
            $stmt->close();
        }
        for($i = 0; $i < count($group_members); $i++){
            $curUserId = $members_id[$i];
            $stmt = $mysqli->prepare("INSERT into events (name, tag, event_year, month, date, event_time, is_group, group_members, user_id) values (?, ?, ?, ?, ?, ?, ?, ?, ?)");

            if(!$stmt){
                echo json_encode(array(
                    "success" => false
                ));
                exit;
            }

            $stmt->bind_param('siiiisisi', $name, $tag, $event_year, $month, $day, $time, $is_groupEvent, $groupMem_str, $curUserId);
            if(!$stmt->execute()){
                echo json_encode(array(
                    "success" => false,
                    "message" => htmlspecialchars($stmt->error)
                ));
                exit;
            }
            $stmt->close();
        }
    }

    echo json_encode(array(
        "success" => true
    ));
    exit;
?> 