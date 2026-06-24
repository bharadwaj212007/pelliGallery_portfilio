import net from "net";

const socket = net.connect(465, "smtp.gmail.com");

socket.on("connect", () => {
    console.log("SMTP reachable");
    socket.destroy();
});

socket.on("error", (err) => {
    console.log("SMTP blocked:", err.message);
});