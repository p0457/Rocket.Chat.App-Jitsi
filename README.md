# Rocket.Chat.App-Jitsi
Rocket.Chat App for Jitsi

## To run docker build and deploy
`docker build -t rocketchatapp_jitsi . && docker run -it --rm -e URL=YOUR_SERVER -e USERNAME=YOUR_USERNAME -e PASSWORD=YOUR_PASSWORD rocketchatapp_jitsi`