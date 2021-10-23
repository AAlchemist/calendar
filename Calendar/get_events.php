<?php
    session_start();
    header("Content-Type: application/json");

    $json_str = file_get_contents('php://input');
    //This will store the data into an associative array
    $json_obj = json_decode($json_str, true);

    $year = $json_obj['year'];
    $month = $json_obj['month'];
    
    //get userId
    //$user = unserialize($_SESSION['user']);
    //$user_id = $user->getUserId();

    $user_id = 1;
    require "database.php";
    $stmt = $mysqli->prepare("SELECT name, date, tag, is_group , group_members, event_time, created_time FROM events WHERE month = ? and event_year = ? and user_id = ?");
    if(!$stmt){
        echo json_encode(array(
            "success" => false,
            "message" => "query prep failed"
        ));
        exit;
    }

    $days = array();
    $names = array();
    $tags = array();
    $is_groups = array();
    $group_members_str = array();
    $event_times = array();
    $created_times = array();

    $stmt->bind_param('iis', $month, $year, $user_id);
    $stmt->execute();
    $stmt->bind_result($name, $day, $tag, $is_group, $group_members, $event_time, $created_time);
    
    while($stmt-> fetch()){
        $days[] = htmlentities($day);
        $names[] = htmlentities(($name));
        $tags[] = htmlentities($tag);
        $is_groups[] = htmlentities($is_group);
        $group_members_str[] = htmlentities($group_members);
        $event_times[] = htmlentities($event_time);
        $created_times[] = htmlentities($created_time);
    }
    $stmt->close();

    if(count($days) < 1){
        echo json_encode(array(
            "success" => false
        ));
        exit;
    }else{
        echo json_encode(array(
            "success" => true,
            "names" => $names,
            "days" => $days,
            "tags" => $tags,
            "is_groups" => $is_groups,
            "group_members_str" => $group_members_str,
            "event_times" => $event_times,
            "created_times" => $created_times
        ));
        exit;
    }
?>