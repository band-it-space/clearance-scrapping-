export const SHEET_ID = "1o90_r9tc8QO-xI1npfAMD4G7voK6joCmfo6Nmy9vwzE";
export const STORE_NAME = "Kmart";

// Query parameters, API doc: https://docs.constructor.com/reference/browse-browse-results
export const URL = "https://ac.cnstrc.com/browse/group_id"
const KEY = "key_GZTqlLr41FS2p7AY";
const IDENTIFIER = "a01975cb-adf4-446b-9e66-e149777b4579";
const SESSION = "1";
const CLIENT = "ciojs-client-2.64.0";
const PER_PAGE = "200";
const SORT_BY = "numberOfDaysSinceStartDate";
const SORT_ORDER = "ascending";
export const QUERY_PARAMETERS = `c=${CLIENT}&key=${KEY}&i=${IDENTIFIER}&s=${SESSION}&num_results_per_page=${PER_PAGE}&&sort_by=${SORT_BY}&sort_order=${SORT_ORDER}&_dt=${new Date().getTime()}`

// Check all groups: https://ac.cnstrc.com/browse/groups?c=ciojs-client-2.64.0&key=key_GZTqlLr41FS2p7AY&
export const GROUP_IDS = { 
    // "Home & Living Clearance": "0503eca41c526c403c2c5151b9e46d12",
    // "Womens Clearance": "7210f8c99c6122fc4334e2aeb9c0ea33",
    // "Mens Clearance": "f11715d5be7477398a6f85d59e41ddeb",
    // "Kids & Baby Clearance": "facd6e40fc27bc36e53c942a3d2ddffe",
    // "Toys Clearance": "38282fe63e4143e246b625c3b05a5bcc",
    // "Clearance Beauty": "60dfcf43627030f6c2a5d05388d3a4d5",
    // "Sports Clearance": "989fdf88e7abaadbcbf647ddf0923284",
    "Technology Clearance": "0a36e8932a328cb602e747a46969a3d1",
    // "Online Exclusives Clearance": "af58383950ba2147e523d9511df3c203"
};

// Proxy settings https://www.webshare.io
export const USE_PROXY = false;
export const PROXY_PARAMS = {
    protocol: "http",
        host: "p.webshare.io",
        port: 80,
        auth: {
            username: "imfyqfpr-rotate",
            password: "tv3owtzx41sj",
    },
};