import  axios from "axios"

axios.post("https://flow.zoho.in/60039403187/flow/webhook/incoming?zapikey=1001.0efbfaef53cf8112b498e184368533ff.06d59893b18a0c5d20803c99f4676172&isdebug=false", {
    prompt: "hi"
}).then(res => {
    console.log(res)
}).catch(err => {
    console.log(err)
})