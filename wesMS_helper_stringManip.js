const clientId = 'M0vtT7yKrvnptKLrnP888opa3Rt';
const clientSecret = 'WQZdQzAXPWNxIYzt/g08jRAr2Fbe/2ueZx3hhRF3gxLuy56T23QbTHRv6+aN0P9tEXhgCj4AwTcA7hC3q8zO9g==';
let token = null;

let baseURL = "http://web.engr.oregonstate.edu/~havensw/"

let service_images = document.querySelectorAll('[service="wesMS"]');

service_images.forEach(element => {
    let URL_concat = element.getAttribute('src');
    let tmp_str = ""
    for (let x = 0; x < URL_concat.length; x++)
    {
        if (URL_concat[x] == '?') {
            break
        }
        tmp_str += URL_concat[x]
    }

    console.log(tmp_str)

})