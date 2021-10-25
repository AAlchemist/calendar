const month_list = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let selected_year, selected_month, selected_date;

function init() {
    const current_date = new Date();
    const current_year = current_date.getFullYear();
    const current_month = current_date.getMonth();
    selected_year = current_year;
    selected_month = current_month;
    // 1. Init year select.
    let select_year = document.getElementById("select_year");
    for (let i = 1901; i <= 2155; ++ i) {
        let year = document.createElement("option");
        year.setAttribute("value", i);
        year.textContent = i;
        if (i == current_year) 
            year.setAttribute("selected", true);
        select_year.appendChild(year);
    }
    // 2. Init month select.
    let select_month = document.getElementById("select_month");
    for (let i = 0; i < month_list.length; ++ i) {
        let month = document.createElement("option");
        month.setAttribute("value", month_list[i]);
        month.textContent = month_list[i];
        if (i == current_month) month.setAttribute("selected", true);
        select_month.appendChild(month);
    }
    // 3. Init calendar
    get_calendar();
    // 4. Check the login status and init the left_bar.

}

function get_calendar() {
    let today = new Date();
    let first_day = new Date(selected_year, selected_month, 1).getDay();
    let last_date = new Date(selected_year, selected_month + 1, 0).getDate();
    let current_block = 1; // 1 ~ 35
    let table_body = document.getElementById("table_body");
    table_body.innerHTML = '';
    for (let i = 0; i < 6; ++ i) {
        let table_row = document.createElement("tr");
        for (let j = 0; j < 7; ++ j) {
            let table_column = document.createElement("td");
            let date_num = document.createElement("span");
            date_num.classList.add("date");
            // TODO fetch events.
            let event = document.createElement("span");
            event.className = "events";
            let div = document.createElement("div");
            div.appendChild(date_num);
            div.appendChild(event);
            table_column.appendChild(div);
            if (current_block > first_day && current_block <= first_day + last_date) {
                date_num.textContent = current_block - first_day;
                if (current_block - first_day == today.getDate() && today.getFullYear() == selected_year && today.getMonth() == selected_month) 
                    date_num.classList.add("today");
                event.textContent = "test event";
            }
            ++ current_block;
            table_row.appendChild(table_column);
            table_body.appendChild(table_row);
        }
    }
    check_date();
}

function check_date() {
    // Find divs in all date blocks.
    let date_blocks = [...document.querySelectorAll('.date_view tbody tr td div')];
    let checked_block = null;
    // Add click events to all divs.
    for (let i = 0; i < date_blocks.length; ++ i) {
        date_blocks[i].addEventListener("click", function(event) {
            if (checked_block) checked_block.classList.remove("active");
            date_blocks[i].classList.add("active");
            checked_block = date_blocks[i];
            selected_date = checked_block.getElementsByClassName("date")[0].textContent;
            console.log(selected_date);
        }, false);
    }
}

function update_calander_view() {
    selected_month = document.getElementById("select_month").selectedIndex;
    let select_year = document.getElementById("select_year");
    let selected_year_index = select_year.selectedIndex;
    selected_year = select_year[selected_year_index].value;
    get_calendar(selected_year, selected_month);
}

function go_today() {   
    const current_date = new Date();
    const current_year = current_date.getFullYear();
    const current_month = current_date.getMonth();
    let year = document.getElementById("select_year");
    year.options[current_year - 1901].selected = true;
    selected_year = current_year;
    let month = document.getElementById("select_month");
    month.options[current_month].selected = true;
    selected_month = current_month;
    update_calander_view();
}



function load_event_page(username) {
    document.getElementById("events").hidden = false;
    document.getElementById("login_register").hidden = true;;
    document.getElementById("greeting").textContent = `Hello, ${username}  `;
    let selected_month = document.getElementById("select_month");
    // Jan: 1, Feb: 2 ...
    let current_month = selected_month.selectedIndex + 1;
    let selected_year = document.getElementById("select_year");
    let selected_year_index = selected_year.selectedIndex;
    let current_year = selected_year[selected_year_index].value;
    fetch("get_events.php", {
        method: "POST",
        body: JSON.stringify({"year": current_year, "month": current_month})
    })
    .then(res => res.json())
    .then(response => console.log('Success:', JSON.stringify(response)))
    .catch(error => console.error('Error:',error))
}

function login(event) {
    const username = document.getElementById("username").value; // Get the username from the form
    const password = document.getElementById("password").value; // Get the password from the form
    
    // Make a URL-encoded string for passing POST data:
    const data = { 'username': username, 'password': password };

    fetch("login.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'content-type': 'application/json' }
        })
        .then(response => response.json())
        .then(
            data => {
                if (data.success) {
                    alert("Welcome! " + username);
                    load_event_page(username);
                }
                else alert(`[ERROR] ${data.message}`)
                
            });
}

function register(event) {
    const username = document.getElementById("new_username").value; // Get the username from the form
    const password = document.getElementById("new_password").value; // Get the password from the form

    // Make a URL-encoded string for passing POST data:
    const data = { 'username': username, 'password': password };

    fetch("register.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'content-type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => alert(data.success ? ("Success! " + username + "has been registered!") : `[ERROR] ${data.message}`));
}

function logout() {
    fetch("logout.php", {
        method: 'POST',
        headers: { 'content-type': 'application/json' }
    })
    .then(function(event) {
        document.getElementById("login_register").hidden = false;
        document.getElementById("events").hidden = true;

    })
    .catch(err => console.error("error!"));
}

document.addEventListener("DOMContentLoaded", init, false);
document.getElementById("login_btn").addEventListener("click", login, false); // Bind the AJAX call to button click
document.getElementById("register_btn").addEventListener("click", register, false);
document.getElementById("select_month").addEventListener("change", update_calander_view, false);
document.getElementById("select_year").addEventListener("change", update_calander_view, false);
document.getElementById("today_btn").addEventListener("click", go_today, false);
document.getElementById("logout_btn").addEventListener("click", logout, false);
