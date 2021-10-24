function addEvent(){
    // const eventContent = document.getElementById("eventContent").value;
    // const date = document.getElementById("date").value;
    // const tag = document.getElementById("tag").value;

    //test
    const data = {
        'tag': 1, 
        'event_year': 2021, 
        'name': 'Lab 3',
        'month': 9,
        'date': 30,
        'event_time': '9:00',
        'is_group':1,
        'group_members': ['user2', 'user3']
    };
    
    fetch("add_event.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => console.log(data.success ? "event Added!" : `event not added ${data.message}`))
    .catch(err => console.error("error!"));
    
}

function delEvent(){
    const data = {
        'event_id' : 17
    };
    
    fetch("del_event.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => console.log(data.success ? "event deleted!" : `event not added ${data.message}`))
    .catch(err => console.error("error!"));
}

function edit_event(){
    //only support to update tag, name, date and time of an event
    const data = {
        'event_id' : 27,
        'tag' : 2,
        'event_year': 2021,
        'name': 'Lab 4',
        'month': 4,
        'date': 24,
        'event_time': '10:00'
    };
    
    fetch("edit_event.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => console.log(data.success ? "event edited!" : `event not added ${data.message}`))
    .catch(err => console.error("error!"));
}

function fetch_events(){
    //only support to update tag, name, date and time of an event
    const data = {
        'year': 2021,
        'month': 9
    };
    
    fetch("get_events.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => console.log(data.success ? JSON.stringify(data) : `event not got ${data.message}`))
    .catch(err => console.error("error!"));
}
//JSON.stringify(data) gives output like this format
//{"success":true,"names":["Lab 3","Lab 3"],"days":["30","30"],"tags":["1","1"],"is_groups":["1","1"],"group_members_str":["user1, user2, user3","user1, user2, user3"],
//"event_times":["09:00:00","09:00:00"],"created_times":["2021-10-22 21:28:19","2021-10-22 22:42:37"]}
document.getElementById("add_eventBtn").addEventListener("click", fetch_events, false);