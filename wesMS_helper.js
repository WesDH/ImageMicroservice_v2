const clientId = 'M0vtT7yKrvnptKLrnP888opa3Rt';
const clientSecret = 'WQZdQzAXPWNxIYzt/g08jRAr2Fbe/2ueZx3hhRF3gxLuy56T23QbTHRv6+aN0P9tEXhgCj4AwTcA7hC3q8zO9g==';
let token = null;


let service_images = document.querySelectorAll('[service="wesMS"]');

service_images.forEach(element => {

    let URL_concat = element.getAttribute('src');
    element.setAttribute("src", "")
    let tmp_str = ""
    for (let x = 0; x < URL_concat.length; x++)
    {
        if (URL_concat[x] == '?') {
            break
        }
        tmp_str += URL_concat[x]
    }

    // Function to get a base path to use as the image write directory for the API server
    let path_dir = get_path(window.location.hostname, window.location.pathname)
    let file_name = get_file_name(tmp_str)
    let query_str = get_query_string(URL_concat)

    let url = tmp_str
    console.log(tmp_str)


    let xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:5005/", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        ID: clientId,
        secret: clientSecret,
        token: token
    }));
    xhr.onload = function() {
        console.log("HELLO")
        console.log(this.responseText);
        let data = JSON.parse(this.responseText);
        insertImg(data, url, path_dir, file_name, query_str)
        console.log(data);
    }




    // fetch
    // ('http://localhost:5005/',
    //     {
    //         method: 'POST',
    //         headers: {"Content-Type": "application/json"},
    //         body: JSON.stringify
    //         ({
    //             ID: clientId,
    //             secret: clientSecret,
    //             token: token
    //         })
    //
    //     }
    // )
    //     .then(response => response.json())
    //     .then(data => insertImg(data, url, path_dir, file_name, query_str))
    //     .catch(error => console.log(error));


});


// Get the file name and extension from the given URL, used to write the same file name to the API server
function get_file_name(tmp_str) {
    // Slice the end: "/filename.html" off
    let file_name = ""
    let str_length = tmp_str.length
    for (let i = str_length - 1; i > -1; i--) {
        if (tmp_str[i] == '/') {
            break;
        }
        file_name += tmp_str[i]
    }
    file_name = file_name.split("").reverse().join("")
    //console.log(file_name)
    return file_name
}

// Get the query string in the image URL
function get_query_string(file_path) {
    let querys_temp = ""
    let str_length = file_path.length
    for (let i = str_length - 1; i > -1; i--) {
        if (file_path[i] == '?') {
            querys_temp += file_path[i]
            break;
        }
        querys_temp += file_path[i]
    }
    querys_temp = querys_temp.split("").reverse().join("")
    console.log("query string: ", querys_temp)
    return querys_temp
}

// Function to get the base path of the current directory, minus /'s and minus the current file name
function get_path(host, path) {

    // Slice the end: "/filename.html" off
    let path_length = path.length
    for (let i = path_length - 1; i > -1; i--) {
        if (path[i] == '/') {
            //path = path.slice(0, -1);
            break;
        }
        path = path.slice(0, -1);
    }
    //path = path.slice(1, path.length);  // Slice the start "/"
    //console.log(path)
    return path
}


// Take the Serv.com hosted image URL and re-insert into client's webpage via DOM
// If err, leave original image URL unchanged
function insertImg(data, url, path, file_name, query_string) {
    if (token === null && data.token !== null) {
        token = data.token
    }

    console.log("insertImg url: ", url)
    if (data.token !== null) {
        fetch
        ('http://localhost:5005/upload',
            {
                method: 'POST',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify
                ({
                    token: data.token,
                    url: url,
                    path: path,
                    file: file_name
                })

            }
        )
            .then(response => response.json())
            .then(data => insert_img_url(data['url'], query_string))
            .catch(error => console.log("ERROR:", error));

    }

    //console.log("Current Token: ", data['token']);
}


function insert_img_url(sirv_address, query_string) {
    console.log(sirv_address)


    // Grab the original URL, logic below to slice and keep the query string
    let reinsert = document.querySelector('[service="wesMS"]')

    console.log(reinsert)


    reinsert.setAttribute("service","")
    reinsert.setAttribute("src", sirv_address + query_string)
}

// fetch