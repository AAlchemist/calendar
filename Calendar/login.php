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

    // Check to see if the username and password are valid.  (You learned how to do this in Module 3.)
    if (!preg_match('/^[\w_\.\-]+$/', $username) || !preg_match('/^[\w_\.\-]{6,}$/', $password)) {
        echo json_encode(array(
            "success" => false,
            "message" => "Invalid input (letters, numbers, dots, hyphen and underscores are valid characters. The password should have at least 6 characters.)"
        ));
        exit;
    }
    $userQueryStmt = $mysqli->prepare("select user_id, password from users where username=? limit 1");              
    if (!$userQueryStmt) {
        printf("Statement Prep Failed: %s\n", $mysqli->error);      
        exit;
    }
    $userQueryStmt->bind_param('s', $username);
    $userQueryStmt->execute();
    $userQueryStmt->bind_result($userId, $hashedPassword);
    if ($userQueryStmt->fetch() && password_verify($password, $hashedPassword)) {
        session_start();
        $_SESSION['userId'] = $userId;
        $_SESSION['username'] = $username;
        $_SESSION['token'] = bin2hex(openssl_random_pseudo_bytes(32)); 
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
            "message" => "Incorrect Username or Password"
        ));
        exit;
    }
?>