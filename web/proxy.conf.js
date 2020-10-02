const ROOT_URI = "https://localhost:8082";
// const API_ROOT_URI = "https://dev.goodville.com";
// const API_IDCARDS_URI = "https://dev.goodville.com";

const PROXY_CONFIG = [
    {
        context: ["/api"],
        target: ROOT_URI,
        secure: false,
        changeOrigin: true,
        bypass: function (req, res, proxyOptions) {
            
        }
    }
]

module.exports = PROXY_CONFIG;