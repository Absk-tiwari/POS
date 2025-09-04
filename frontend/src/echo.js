import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: "pusher",
    key: process.env.REACT_APP_PUSHER_KEY, // "your-app-key",
    cluster: process.env.REACT_APP_CLUSTER, //"mt1", // same as in Pusher dashboard
    forceTLS: true,
});

window.Echo = echo;

export default echo;
