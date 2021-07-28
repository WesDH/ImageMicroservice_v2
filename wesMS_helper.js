/**
 * Author: Wesley Havens
 * Program Title: Wesley's Image Manipulation Microservice "Helper File"
 * Date: July 28th, 2021
 * Description: This helper file is meant to be linked into an HTML file that wishes to use the
 *              image manipulation microservice. This program first grabs all <img> tags that call on
 *              using "Wesley's Micro-service". It then sends a POST request to Wesley's Microservice,
 *              (A Node.Js Server running @ weshavens.info), the Node server handles sending an
 *              API request to SIRV.com, which can host and apply image manipulation.
 *              This helper file receives a RESPONSE from the Node server, then reinserts the new
 *              image URL received from SIRV.com's API back into the HTML file.
 */




// Global Variable Definition(s):
let service_images = []
let token = null

window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
});




// Call microservice once on the static HTML page:
// create_img_array()
// iterate_images()

// Search document for elements calling the microservice and
// create an array of all elements with attribute=value of: service="wesMS"
function create_img_array() {
    service_images = document.querySelectorAll('[service="wesMS"]');
}




/**
 * Observe HTML body and it's children nodes for any element insertions/deletions,
 * Then scan HTML file for image tags calling "wesMS" again.
 * This is to account for dynamically created HTML
 */
const ObserveBody = document.body;
// create a new instance of `MutationObserver` named `observer`,
// passing it a callback function
const observer = new MutationObserver(function() {
    console.log('callback that runs when observer is triggered');
    create_img_array()
    iterate_images()
});
// call `observe()` on that MutationObserver instance,
// passing it the element to observe, and the options object
observer.observe(ObserveBody, {subtree: true, childList: true});




/**
 * Iterate the array of HTML elements wishing to use the Micro-service.
 * Parse the image URL into a form that can be sent as a request to the
 * backend, and then make a POST request to the node server with the
 * parsed URL. If error with parsing the URL, leave the HTML element
 * calling the microservice unchanged.
 */
function iterate_images() {
    let insert_num = 1
    service_images.forEach(element => {

        // URL_concat to equal the value in src="value", this *should* include the full image URL and query string
        let URL_concat = element.getAttribute('src');

        // Now delete the src image, for now in the HTML, to be reinserted, later
        element.setAttribute("src", "")
        element.setAttribute("insert_num", `${insert_num}`)
        let tmp_str = ""
        for (let x = 0; x < URL_concat.length; x++)
        {
            if (URL_concat[x] == '?') {
                break
            } else if (x == (URL_concat.length - 1)) {
                // Handle a src=URL passed with no query string:
                // Thus there would be no manipulation applied to the image, do not continue with making POST request:
                element.setAttribute("src", URL_concat)  // Put original image value back into src attribute
                console.log("No query string detected for image, thus it was not changed:")
                console.log(URL_concat)
                return      // Exit the function
            }
            tmp_str += URL_concat[x]  // tmp_str holds the image url MINUS anything including and after the ? query char
        }

        // Function to get a base path to use as the image write directory for the API server
        let path_dir = get_path(window.location.hostname, window.location.pathname)
        let file_name = get_file_name(tmp_str)
        let query_str = get_query_string(URL_concat)

        let url = tmp_str
        //console.log(tmp_str)

        // Local: http://localhost:5005/
        // Remote: "https://weshavens.info:443/getKey"
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:5005/", true);
        xhr.send(null)
        // xhr.setRequestHeader('Content-Type', 'application/json');
        // xhr.send(JSON.stringify({
        //     ID: clientId,
        //     secret: clientSecret,
        //     token: token
        // }));
        xhr.onload = function() {
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
}


// Helper function for function iterate_images()
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

// Helper function for function iterate_images()
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
    //console.log("query string: ", querys_temp)
    return querys_temp
}

// Helper function for function iterate_images()
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

// Sequential function called if iterate_images() validates the <img> url given
// Take the Serv.com hosted image URL and re-insert into client's webpage via DOM
// If err, leave original image URL unchanged
function insertImg(data, url, path, file_name, query_string) {
    if (token === null && data.token !== null) {
        token = data.token
    }

    // Local: 'http://localhost:5005/upload'
    // Deployed: 'https://weshavens.info:443/upload'
    //console.log("insertImg url: ", url)
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
            .catch(error => {
                console.log("ERROR:", error)
                restore_original_image()
            }
            });

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

// Function to reinsert original, unmodified image in event any errors with response
// received from the Node server.
function restore_original_image() {
    console.log("pending creation")
}