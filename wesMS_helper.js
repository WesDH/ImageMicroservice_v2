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
let service_images = []  // Array to hold <img> elements that call the micro-service
let URL_concat  // The original image URL we will be attempting to modify


/**
 * Observe HTML body and it's children nodes for any element insertions/deletions,
 * Then scan HTML file for image tags calling "wesMS" again.
 * This is to account for dynamically created HTML
 */
const ObserveBody = document.body;
const observer = new MutationObserver(function() {
    //console.log('callback that runs when observer is triggered');
    create_img_array()
    iterate_images()
});
observer.observe(ObserveBody, {subtree: true, childList: true});



// Search document for elements calling the microservice and
// create an array of all elements with attribute=value of: service="wesMS"
function create_img_array() {
    service_images = document.querySelectorAll('[service="wesMS"]');
}



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
        URL_concat = element.getAttribute('src');

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

        // Local development: http://localhost:5005/
        // Remote deployment: "https://weshavens.info:443/getKey"
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "https://weshavens.info:443/getKey", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({ "insertNum": `${insert_num}`  }));
        xhr.onload = function() {
            let data = JSON.parse(this.responseText);
            insertImg(data, url, path_dir, file_name, query_str)

            console.log("Data received in the get KEY POST req^^");
            console.log(data);
        }
        insert_num += 1;
    });
}

// Helper function for function iterate_images()
// Get the file name and extension from the given URL, used to write the same file name to the API server
function get_file_name(tmp_str) {
    let file_name = ""
    let str_length = tmp_str.length
    for (let i = str_length - 1; i > -1; i--) {
        if (tmp_str[i] == '/') {
            break;
        }
        file_name += tmp_str[i]
    }
    file_name = file_name.split("").reverse().join("")
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
    return querys_temp
}

// Helper function for function iterate_images()
// Function to get the full base path of the current image, removing /'s and .'s
// Used to pass to node server, will be directory remote image will be stored into
function get_path(host, path) {
    let path_temp = ""
    let path_length = path.length
    for (let i = path_length - 1; i > -1; i--) {
        if (path[i] == '/' || path[i] == '.') {
            continue;
        }
        path_temp += path[i]
    }
    path_temp = path_temp.split("").reverse().join("")
    path_temp = '/' + host + path_temp + '/'
    return path_temp
}

// Sequential function called if iterate_images() validates the <img> url given
// Take the Serv.com hosted image URL and re-insert into client's webpage via DOM
// If err, leave original image URL unchanged
function insertImg(data, url, path, file_name, query_string, insert_num) {
    // Local development:  'http://localhost:5005/upload'
    // Deployment address: 'https://weshavens.info:443/upload'
    fetch
    ('https://weshavens.info:443/upload',
        {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify
            ({
                url: url,
                path: path,
                file: file_name,
                insertNum: data.insertID
            })
        }
    )
        .then(response => response.json())
        .then(data => insert_img_url(data['url'], query_string, data['insertID']))
        .catch(error => {
            console.log("ERROR on node/API upload call:", error)
            });
}


function insert_img_url(sirv_address, query_string, insertion_number) {
    console.log("SIRV address response received: " + sirv_address);

    // Iterate the elements and reinsert with the correct insertion ID that was tagged onto the <img>
    document.querySelectorAll('[service="wesMS"]').forEach((element) => {
        //console.log("insertion num " + insertion_number)
        console.log("element insertion num " + element.getAttribute('insert_num'))
        if (element.getAttribute('insert_num') == insertion_number) {

            // Unreference the element so it does not call the microservice again
            element.setAttribute("service","")

            // Handle no SIRV image address received, reinsert the original image in that case
            if (sirv_address == undefined) {
                console.log("undefined URL response received from node server, reinsert original image URL")
                element.setAttribute("src", URL_concat)  // Restore original image URL
                return
            } else {
                // Insert the SIRV image URL and add the query string back:
                element.setAttribute("src", sirv_address + query_string)
            }

        }
    });



}
