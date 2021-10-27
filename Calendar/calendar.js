const month_list = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let selected_year, selected_month, selected_date = null;
// {day: [events]}
let day_event_map = new Map();
let user_list = new Array();
let token = "";
let current_username = "";

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
    fetch("get_login_user.php", {
        method: 'POST',
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById("events").hidden = false;
            document.getElementById("login_register").hidden = true;
            document.getElementById("greeting").textContent = `Hello, ${data.username}  `;
            current_username = data.username;
        }
    })
    .catch(err => console.error("error!"));
    // 5. Init user list (select group members).
    fetch("get_users.php", {
        method: 'POST',
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            let list = data.userList;
            for (let i = 0; i < list.length; ++ i) 
                user_list.push(list[i]);
            // console.log(user_list);
            let option_html = "";
            for (let i = 0; i < user_list.length; ++ i) {
                option_html += 
                `<option>${user_list[i]}</option>`;
            }
            document.getElementById("select_group_members").innerHTML = option_html;
        }
        else console.log(data.message);
    })
    .catch(err => console.error("error!"));

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
                // event.textContent = "test event";
            }
            ++ current_block;
            table_row.appendChild(table_column);
            table_body.appendChild(table_row);
        }
    }
    check_date();
    get_events();
}

const events  = {
    event_name: null,
    tag: null, 
    is_group: null,
    group_members: null,
    event_time: null
}

function get_events() {
    day_event_map = new Map();
    fetch("get_events.php", {
        method: "POST",
        body: JSON.stringify({"year": selected_year, "month": selected_month + 1, "is_selfCal": 1, "friend_username": null})
    })
    .then(res => res.json())
    .then(response => {
        // console.log(response);
        if (!response.success) console.log(`get events error ! ${response.message}`);
        else {
            let event_count = response.days.length;
            let days = response.days;
            let names = response.names;
            let tags = response.tags;
            let is_groups = response.is_groups;
            let group_members_strs = response.group_members_str;
            let event_times = response.event_times;
            let event_ids = response.event_ids;
            for (let i = 0; i < event_count; ++ i) {
                let event = {event_id: event_ids[i], event_name: names[i], tag: tags[i], is_group: is_groups[i], group_members: group_members_strs[i], event_time: event_times[i]};
                if (!day_event_map.has(days[i])) {
                    day_event_map.set(days[i], [event]);
                }
                else {
                    let temp = day_event_map.get(days[i]);
                    temp.push(event);
                    day_event_map.set(temp);
                }
            }

            if (selected_date != null) get_event_by_date();
        }
    })
    .catch(error => console.error('Error:',error));
}

function get_event_by_date() {
    // console.log(selected_date);
    let event_list = document.getElementById("today_events");
    event_list.innerHTML = ""; // Empty event list.
    if (day_event_map.has(selected_date)) {
        let events = day_event_map.get(selected_date);
        let event_list_html = "";
        for (let i = 0; i < events.length; ++ i) {
            let li = document.createElement("li");
            let span = document.createElement("span");
            span.textContent = events[i].event_name;
            let edit_button = document.createElement("button");
            edit_button.classList.add("edit_button")
            edit_button.textContent = "edit";
            edit_button.addEventListener("click", function(event) {
                edit_button.disabled = true;
                let edit_form_html = `
                <div class="new_event">
                    <input id="event_name_edit" class="event_name" type="text">
                    <div style="height: 20px; margin-bottom: 25px;">
                        <p style="height: 20px; margin-top: 0; ">
                            <input type="checkbox" id="is_group_edit" value="is_group">
                        </p>
                    </div>
                    <div>
                        <input type="time" value="00:00" id="event_time_update" class="event_time"/>
                        <select class="select" id="event_tag_update">
                            <option value="0">work</option>
                            <option value="1">home</option>
                            <option value="2">study</option>
                        </select>
                    </div>
                    <div>
                    <button id="edit_btn" class="add_btn" >Confirm</button>
                    <button id="cancel_btn" class="add_btn" >Cancel</button>
                    </div>
                    
                </div>
                `;
                let option_html = "";
                for (let i = 0; i < user_list.length; ++ i) {
                    option_html += 
                    `<option>${user_list[i]}</option>`;
                }
                
                let edit_div = document.createElement("div");
                edit_div.innerHTML = edit_form_html;
                event_list.insertBefore(edit_div, li);
                document.getElementById("cancel_btn").addEventListener("click", function(event) {
                    event_list.removeChild(edit_div);
                    edit_button.disabled = false;
                }, false);
                document.getElementById("event_name_edit").value = events[i].event_name;
                document.getElementById("event_time_update").value = events[i].event_time;
                document.getElementById("event_tag_update").selectedIndex = events[i].tag;
                document.getElementById("edit_btn").addEventListener("click", function(event) {
                    // event_id: event_ids[i], event_name: names[i], tag: tags[i], is_group: is_groups[i], group_members: group_members_strs[i], event_time: event_times[i]};
                    const data = {
                        'event_id': events[i].event_id, 
                        'tag': document.getElementById("event_tag_update").selectedIndex, 
                        'event_year': selected_year,
                        'name': document.getElementById("event_name_edit").value,
                        'month': selected_month + 1,
                        'date': selected_date,
                        'is_group':document.getElementById("is_group").checked ? 1 : 0,
                        'event_time': document.getElementById("event_time_update").value,
                        'token': token
                    };
                    fetch("edit_event.php", {
                        method: 'POST',
                        body: JSON.stringify(data),
                        headers: { 'content-type': 'application/json' }
                    })
                    .then(response => response.json())
                    .then(data => function(event) {
                        event_list.removeChild(edit_div);
                        get_events();
                    })
                    .catch(err => console.error("error!"));
                }, false);
            }, false)
            let delete_button = document.createElement("button");
            delete_button.classList.add("delete_button");
            delete_button.textContent = "delete";
            delete_button.addEventListener("click", function(event) {
                const data = {
                    'event_id': events[i].event_id, 
                    'token': token, 
                };
                fetch("del_event.php", {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: { 'content-type': 'application/json' }
                })
                .then(response => response.json())
                .then(data => console.log(data.success ? "event deleted!" : `error: ${data.message}`))
                .catch(err => console.error("error!"));
                get_events();
            }, false);
            li.appendChild(span);
            li.appendChild(edit_button);
            li.appendChild(delete_button);
            li.appendChild(document.createElement("br"));
            // time
            let info_div = document.createElement("div");
            info_div.classList.add("time_div");
            let time_div_span = document.createElement("span");
            time_div_span.textContent = events[i].event_time;
            info_div.appendChild(time_div_span);
            let users_span = document.createElement("span");
            users_span.setAttribute("style", "padding-left: 5px");
            if (events[i].is_group == "1")
                users_span.textContent = "Group members: " + current_username + "," + events[i].group_members;
            else users_span.textContent = current_username;
            info_div.appendChild(users_span);
            li.appendChild(info_div);
            event_list.appendChild(li);
        }
    }
    
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
            document.getElementById("current_date").textContent = `${selected_year}-${selected_month + 1}-${selected_date}`;
            document.getElementById("eventList").hidden = false;
        }, false);
        date_blocks[i].addEventListener("click", get_event_by_date, false);
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



// function load_event_page(username) {
//     document.getElementById("events").hidden = false;
//     document.getElementById("login_register").hidden = true;;
//     document.getElementById("greeting").textContent = `Hello, ${username}  `;
//     let selected_month = document.getElementById("select_month");
//     // Jan: 1, Feb: 2 ...
//     let current_month = selected_month.selectedIndex + 1;
//     let selected_year = document.getElementById("select_year");
//     let selected_year_index = selected_year.selectedIndex;
//     let current_year = selected_year[selected_year_index].value;
//     fetch("get_events.php", {
//         method: "POST",
//         body: JSON.stringify({"year": current_year, "month": current_month})
//     })
//     .then(res => res.json())
//     .then(response => console.log('Success:', JSON.stringify(response)))
//     .catch(error => console.error('Error:',error))
// }

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
                    // alert("Welcome! " + username);
                    // load_event_page(username);
                    document.getElementById("events").hidden = false;
                    document.getElementById("login_register").hidden = true;
                    document.getElementById("greeting").textContent = `Hello, ${username}  `;
                    token = data.token;
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

function set_group() {
    let is_group_checkbox = document.getElementById("is_group");
    let select_group_members_selecter = document.getElementById("select_group_members");
    if (is_group_checkbox.checked) select_group_members_selecter.disabled = false;
    else select_group_members_selecter.disabled = true;
}

function save_event() {
    let name = document.getElementById("event_name").value;
    let tag = document.getElementById("event_tag").selectedIndex;
    let event_year = selected_year;
    let month = selected_month + 1; // starts from 0
    let date = selected_date;
    let event_time = document.getElementById("event_time").value;
    let is_group = document.getElementById("is_group").checked ? 1 : 0;
    let group_members = new Array();
    let group_members_select = document.getElementById("select_group_members");
    for (let i = 0; i < group_members_select.length; ++ i) 
        if (group_members_select.options[i].selected) 
            group_members.push(group_members_select.options[i].text);
    const data = {
        'tag': tag, 
        'event_year': event_year, 
        'name': name,
        'month': month,
        'date': date,
        'event_time': event_time,
        'is_group':is_group,
        'group_members': group_members
    };
    fetch("add_event.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        alert(data.success ? "event Added!" : `event not added ${data.message}`)
        document.getElementById("event_name").value = "";
        document.getElementById("is_group").checked = false;
        document.getElementById("select_group_members").disabled = true;
        get_events();
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
document.getElementById("is_group").addEventListener("change", set_group, false);
document.getElementById("add_btn").addEventListener("click", save_event, false);