const express = require('express');
const http = require('https');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

// Enable CORS middleware
app.use(cors())
app.use(function (request, response, next) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Content-type');
    next();
});


app.use(express.json()); // Middleware to parse request body
app.use(express.urlencoded( {extended: false }));



let token = null
let url = null

// Incoming POST request to request a new token, or to receive existing if not expired
app.post
('/', (request, response) =>
{
    //console.log(process.env.clientId)
    //console.log(process.env.clientSecret)
    //console.log(request.body);
    //console.log(request.body.insertNum)
    //response.setHeader('Access-Control-Allow-Origin', 'http://localhost:63342');
    create_token(process.env.clientId, process.env.clientSecret)
        .then(() => {
            let response_body = {
                status: `Token creation success: ${token}`,
                insertID: `${request.body.insertNum}`
            }
            response.send(response_body)
        });
}); // End of app.post


// Incoming post request to upload source image to SIRV
app.post
('/upload', (request, response) =>
{

    console.log(request.body);
    //response.setHeader('Access-Control-Allow-Origin', 'http://localhost:63342');
    //console.log("in the upload", request.body)
    //upload_img(request.body['token'], request.body['url'], request.body['path'], request.body['file'])
    upload_img(token, request.body['url'], request.body['path'], request.body['file'])
        .then(() => {
            let response_body = {
                url: url,
                insertID: request.body.insertNum
            }
            console.log(response_body)
            response.send(response_body)
        });

}); // End of app.post upload
//.then((url) => console.log(url))










// Incoming post request to upload source image to SIRV
app.post
('/uploadV2', (request, response) =>
{
    create_token(process.env.clientId, process.env.clientSecret)
        .then(() => {console.log(token)      });

    console.log(request.body);
    //response.setHeader('Access-Control-Allow-Origin', 'http://localhost:63342');
    //console.log("in the upload", request.body)
    //upload_img(request.body['token'], request.body['url'], request.body['path'], request.body['file'])
    upload_img(token, request.body['url'], request.body['path'], request.body['file'])
        .then(() => {
            let response_body = {
                url: url,
                insertID: request.body.insertNum
            }
            console.log(response_body)
            response.send(response_body)
        });

}); // End of app.post upload














async function upload_img(token, orig_url, path, file) {
    url = await send_request_upload(token, orig_url, path, file)
        .catch(error => console.log(`Caught by .catch ${error}`));
}
function send_request_upload(token, orig_url, path, file) {
    return new Promise((resolve, reject) => {
        var options = {
            "method": "POST",
            "hostname": "api.sirv.com",
            "port": null,
            "path": "/v2/files/fetch",
            "headers": {
                "content-type": "application/json",
                "authorization": `Bearer ${token}`
            }
        };

        let url = orig_url

        var req = http.request(options, function (res) {
            var chunks = [];


            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function () {
                var body = Buffer.concat(chunks);
                //let api_response = body.toString();
                //console.log(api_response);
                //https://pernetyp.sirv.com/CS361_image/my_pic3.png
                resolve(`https://pernetyp.sirv.com${path}${file}`)
            });

            if (res.statusCode >= 400) {
                console.log(`Err on upload req to API:  ${res.statusCode}`);
                reject('Err on upload req to API');
            }
        });

        let the_payload = "[" +
            "{" +
            "\"url\":" +
            `"${orig_url}",` +
            "\"filename\":" +
            `"${path}${file}"` +
            "}" +
            "]"

        req.write(the_payload);
        req.end();

    }); // end of "return new Promise" line
} // end of send_request_upload function definition



async function create_token(ID, secret) {
    token = await send_request(ID, secret);
}
function send_request(ID, secret) {
    return new Promise(resolve => {
        const options = {
            'method': 'POST',
            'hostname': 'api.sirv.com',
            'path': '/v2/token',
            'headers': {
                'content-type': 'application/json'
            }
        };

        const clientId = ID;
        const clientSecret = secret;

        const req = http.request(options, (res) => {
            const chunks = [];

            res.on('data', (chunk) => {
                chunks.push(chunk);
            });

            res.on('end', () => {
                const body = Buffer.concat(chunks);
                const apiResponse = JSON.parse(body.toString());
                //console.log('token:', apiResponse.token);
                resolve(apiResponse.token)

                //console.log('expiresIn:', apiResponse.expiresIn);
                //console.log('scope:', apiResponse.scope);
            });
        });
        req.write(JSON.stringify({
            clientId,
            clientSecret
        }));
        req.end();
    });
}

app.listen(5005, () => console.log(`App is running on port: 5005`))