# GLPI API Client

This is a GLPI API Client written in typescript to interact with GLPI Server using the API endpoints provided.

## Getting started

Install this lib with npm:

```bash
npm install --save glpi-client
```

All parameters used within this lib can be found in the [GLPI API Documentation](https://github.com/glpi-project/glpi/blob/master/apirest.md).

## Usage examples

Creating the object then logging in:

```javascript
const { GlpiClient } = require("glpi-client");

const client = new GlpiClient("http://company.com/apirest.php/");

// With User Token
const api = await client.initSession({
    appToken: "somereallylongapptoken",
    userToken: "somereallylongusertoken"
});

// Or with username and password
const api = await client.initSession({
    appToken: "somereallylongapptoken",
    user: {
        username: "jhon.doe",
        password: "123456"
    }
});

// If you want to auto-relogin, use the third parameter
const api = await client.initSession(
    {
        appToken: "somereallylongapptoken",
        userToken: "somereallylongusertoken"
    },
    true
);
```

After the login, we get an `api` object which is an instance of `GlpiAPI` class that enables us to call other glpi methods as we wish, you can find all methods implemented here in the [GLPI API Documentation](https://github.com/glpi-project/glpi/blob/master/apirest.md).

Every method called returns an `AxiosResponse` object, you can find more about axios [here](https://github.com/axios/axios). Let's get the profiles of the logged user:

```javascript
const { GlpiClient } = require("glpi-client");

const client = new GlpiClient("http://company.com/apirest.php/");

const api = await client.initSession({
    appToken: "somereallylongapptoken",
    userToken: "somereallylongusertoken"
});

const response = await api.getMyProfiles();

const profiles = response.data;

console.log(profiles); // { myprofils: [ {id: 1, name: 'Super-Admin', entities: [Array] } ] }
```

Getting a ticket:

```javascript
const response = await api.getItem("Ticket", 1203, {
    get_hateoas: false
});

const ticket = response.data;

console.log(ticket); // { "id": 71, "entities_id": "Root Entity", "name": "adelaunay-ThinkPad-Edge-E320" ... }
```

In case of an error during the call, an instance of `GlpiResponseException` will be thrown, so if you are using async/await, you can catch it like this:

```javascript
try {
    const api = await client.initSession({
        appToken: "somereallylongapptoken",
        user: {
            username: "wrongusername",
            password: "wrongpassword"
        }
    });
} catch (error) {
    err instanceof GlpiResponseException; // true
    console.log(err.message); // Invalid username or password [...]
}
```

This can also occur when your session token expires, so watch out for 401 statuses:

```javascript
try {
    const response = await api.getItem("Ticket", 1203);
} catch(error) {
    console.log(error.statusCode); // 401
    ... // login again
}
```

## Note

Remember to always logout after you finish using the api:

```javascript
await api.killSession();
```

## Available Objects and methods

### GlpiClient

#### #initSession(auth: IAuthParams): GlpiAPI

### GlpiAPI

#### #killSession()

#### #lostPassword(email: string, passwordForgetToken?: string, password?: string)

#### #getMyProfiles()

#### #getActiveProfile()

#### #changeActiveProfile(profiles_id: number)

#### #getMyEntities(is_recursive: boolean = false)

#### #getActiveEntities()

#### #changeActiveEntities(entities_id: string | number = 'all', is_recursive: boolean = false)

#### #getFullSession()

#### #getGlpiConfig()

#### #getItem(item_type: string, id: number, options: IGetItemParams = {})

#### #getItems(item_type: string, options: IGetItemsParams = {})

#### #getSubitems(item_type: string, id: number, subitem_type: string, options: IGetItemsParams = {})

#### #getMultipleItems(options: IGetMultipleItemsParams)

#### #listSearchOptions(item_type: string, raw?: any)

#### #search(item_type: string, options: ISearchParams = {})

#### #addItem(item_type: string, input: any = {})

#### #updateItem(item_type: string, id: number, input: any = {})

#### #deleteItem(item_type: string, id: number | number[], options: IDeleteItemParams = {})

# License

MIT License

Copyright (c) 2019 Aluísio Rodrigues Amaral

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
