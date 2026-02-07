# Postman collection

This folder contains a Postman collection you can run in the Postman app or through CI using Newman.

## What's in `postman-sample-collection.json`

This collection uses two public echo-style services as stable targets:

- **Postman Echo** (`https://postman-echo.com`) for basic request building and response assertions
- **httpbin** (`https://httpbin.org`) for common auth/cookie/header and HTTP behavior scenarios

Examples included:

- **GET sample**: query params, response-time checks, and response validation.
- **POST sample (text)**: send raw text and verify echo response.
- **POST sample (JSON)**: send JSON and verify echoed JSON.
- **Negative-ish JSON**: send invalid JSON and assert it *doesn't* parse (service still returns 200).
- **POST JSON from input file**: load a JSON object from a separate file (Newman iteration data) and POST it.

httpbin scenarios:

- **Basic auth**: demonstrates Basic Auth configuration and validation.
- **Bearer token**: demonstrates `Authorization: Bearer <token>`.
- **Cookies**: demonstrates cookie-setting via redirect/headers.
- **Response headers**: demonstrates asserting custom response headers.
- **Redirects**: demonstrates 302 behavior vs. redirect-following.
- **Gzip**: demonstrates handling compressed responses.
- **Delay**: demonstrates a slow endpoint and response time assertion.
- **Status codes**: demonstrates asserting expected negative statuses (e.g. 404).
- **Streaming**: demonstrates parsing newline-delimited JSON returned from `GET /stream/10`.
- **Anything (data-driven)**: POST to `POST /anything/{anything}` with the path + headers + JSON body defined in an input file, and validate the echoed response against expectations from that same file.

### Variables

The collection defines:

- `baseUrl`: `https://postman-echo.com`
- `source`: `newman-sample-github-collection`
- `httpbinBaseUrl`: `https://httpbin.org`
- `httpbinUser`: `user`
- `httpbinPass`: `passwd`
- `bearerToken`: `my-demo-token`

So you can change hosts/credentials without editing every request.

### Collection-level pre-request script

Adds an `X-Request-Id` header to every request (useful for correlating logs in CI).

## Running via Newman

Run the basic suite:

```bash
npm run test:api
```

### Run with JSON data from a separate file

The request **"Newman: POST request with JSON from iteration data file"** uses `pm.iterationData.toObject()` as the request body.

The sample file is:

- `postman/input/patients.json`

Run the collection once **per item in that file**:

```bash
npm run test:api:data
```

`patients.json` is a JSON array. Each array element becomes one iteration (one row). Whatever fields you put in a row will be sent as JSON.

### Streaming example (curl equivalent)

The request **"httpbin: Stream JSON (10 lines)"** is equivalent to:

```bash
curl -X GET "https://httpbin.org/stream/10" -H "accept: application/json"
```

The response is newline-delimited JSON (NDJSON style). The test verifies it contains 10 JSON objects.

### Anything POST (curl equivalent + data-driven validation)

The request **"httpbin: Anything POST (data-driven: path + headers + json)"** is equivalent to:

```bash
curl -X POST "https://httpbin.org/anything/{anything}" -H "accept: application/json"
```

In this repo it’s **data-driven** using:

- Input + expectations file: `postman/input/anything-cases.json`

Each item provides:

- `anything`: the path segment
- `headers`: headers to send
- `body`: JSON body to send
- `expect`: expected response assertions (status, echoed json, and required headers)

Run just this scenario:

```bash
npm run test:api:anything
```

To override variables at runtime:

```bash
npx newman run postman/postman-sample-collection.json \
  --iteration-data postman/input/anything-cases.json \
  --folder "httpbin: Anything POST (data-driven: path + headers + json)" \
  --env-var httpbinBaseUrl=https://httpbin.org
```

## Notes

- The invalid JSON request is intentionally used to validate parser/error handling. Postman Echo typically returns `200` with `json: null` and `data` containing the raw body.
