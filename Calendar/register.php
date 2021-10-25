<?php
    header("Content-Type: application/json"); // Since we are sending a JSON response here (not an HTML document), set the MIME Type to application/json
    require 'database.php';
    //Because you are posting the data via fetch(), php has to retrieve it elsewhere.
    $json_str = file_get_contents('php://input');
    //This will store the data into an associative array
    $json_obj = json_decode($json_str, true);

    //Variables can be accessed as such:
    $username = $json_obj['username'];
    $password = $json_obj['password'];
    //This is equivalent to what you previously did with $_POST['username'] and $_POST['password']
    if (!preg_match('/^[\w_\.\-]+$/', $username) || !preg_match('/^[\w_\.\-]{6,}$/', $password)) {
        echo json_encode(array(
            "success" => false,
            "message" => "Invalid input (letters, numbers, dots, hyphen and underscores are valid characters. The password should have at least 6 characters.)"
        ));
        exit;
    }
    // Check if the username exists.
    $userQueryStmt = $mysqli->prepare("select user_id from users where username=? limit 1");              
    if (!$userQueryStmt) {
        printf("Statement Prep Failed: %s\n", $mysqli->error);      
        exit;
    }
    $userQueryStmt->bind_param('s', $username);
    $userQueryStmt->execute();
    if (!$userQueryStmt->fetch()) {
        session_start();

        $userInsertStmt = $mysqli->prepare("insert into users (username, password) values (?, ?)");
        if (!$userInsertStmt) {
            printf("Insert statement Prep Failed: %s\n", $mysqli->error);      
            exit;
        }
        // Algorithm + Algorithm Option + Salt + Hashed password.
        $hashed_passwd = password_hash($password, PASSWORD_BCRYPT);
        $userInsertStmt->bind_param('ss', $username, $hashed_passwd);
        $userInsertStmt->execute();
        $userInsertStmt->close();
        $userQueryStmt->close();
        echo json_encode(array(
            "success" => true,
            "message" => "Success!"
        ));
        exit;
    }
    else {
        $userQueryStmt->close();
        echo json_encode(array(
            "success" => false,
            "message" => "The username have been used."
        ));
        exit;
    }
?>