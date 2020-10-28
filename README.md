# Wait for API action

A Github Action to wait for a specific API response to proceed.

This can be useful to wait e.g. for a specific version of an API to deployed or similar.

## Example usage

```yml
uses: mydea/action-wait-for-api@v1
with:
  url: "https://api.example.com/status"
  expected-response-field: "version"
  expected-response-field-value: ${{env.EXPECTED_API_VERSION}}
```  

## Inputs

### `url`

**Required** The full URL to query.

### `method`

**Required** The HTTP method to use. Default `"GET"`.

### `headers`

Optional JSON-string of headers to send along. For example:

```yml
headers: '{"Authorization":"ci"}'
```

### `expected-status`

**Required** The HTTP status which has to be returned to continue. Default `"200"`.

### `expected-response-field`

If set, only continue if the response contains this field. You can use dot-notation to query nested fields, for example:

```json
{
  "user": {
    "name": "Anne"
  }
}
```

Can be queried with `"user.name"`.

### `expected-response-field-value`

If set, the `expected-response-field` must contain this value to continue. Note that due to Github Action restrictions, this can only work with strings, so any value is converted to a string.

### `timeout`

**Required** The max. amount of seconds to wait until to stop trying to reach the API. Default `"300"`.

### `interval`

**Required** The number of seconds to wait between each try to the API. Default `"10"`.

